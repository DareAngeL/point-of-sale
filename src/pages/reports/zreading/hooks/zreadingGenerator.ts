/* eslint-disable @typescript-eslint/no-explicit-any */
import moment from "moment";
import { ZReadingFileTypes } from "../../common/FileTypeSelection";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import { autoTransfer, generateGrandtotal, generateZReading } from "../../../../store/actions/zreading.action";
import { objToQueryStr } from "../../../../helper/StringHelper";
import { useGenerateMallFiles } from "../../../../hooks/generateMallHookUp";
import { toast } from "react-toastify";
import { useZReadingReport } from "../zreadingreport/zreadingReport";
import { useUserActivityLog } from "../../../../hooks/useractivitylogHooks";
import { METHODS, MODULES } from "../../../../enums/activitylogs";
import { getLastTransaction, getNonZReadData, getRemainingZread } from "../../../../store/actions/posfile.action";
import { removeXButton as removeModalXButton } from "../../../../reducer/modalSlice";
import { setNoEOD } from "../../../../reducer/transactionSlice";
import { useNavigate } from "react-router";
import { getCentralServerDir } from "../../../../store/actions/central.action";
import { useBackUpData } from "../../../../hooks/backupData";
import { GeneratingType } from "../ZReading";


export function useZReadingGenerator(
  allLoadedData: any[], 
  setActiveDate: React.Dispatch<React.SetStateAction<any>>, 
  dispatchModal: () => void, 
  setGenerating: React.Dispatch<React.SetStateAction<GeneratingType>>, 
  switchToProcessing: () => void,
  switchToFileTypeSelection: () => void,
) {

  const { account, transaction, masterfile } = useAppSelector((state) => state);
  const { handleBackupData } = useBackUpData();
  const { account: accountData } = account;
  const { noEOD: noEODState } = transaction
  const { header, syspar } = masterfile

  const appDispatch = useAppDispatch();
  const Navigate = useNavigate();

  const { generateMallFiles, getHookedMall } = useGenerateMallFiles();
  const { saveReports } = useZReadingReport();
  const { postActivity } = useUserActivityLog();

  const createZReadQuery = (zreadData: any, noEOD?: { date: string }) => {
    const date = moment().format("YYYY-MM-DD");
    const time = moment().format("HH:mm:ss.SSS");
    const bNum = "Z" + moment().format("YYYYMMDDHHmmss");

    return objToQueryStr({
      cashier: accountData.data?.usrcde || "",
      extprc: zreadData.end_sales,
      postrmno: header.data[0].postrmno as unknown as number,
      brhcde: header.data[0].brhcde as string,
      date: noEOD ? noEOD.date : date,
      time: time,
      batchnum: bNum,
      noEOD: !noEOD
    })
  };

  const isProcessing = (bool: boolean) => {
    if (bool) {
      appDispatch(removeModalXButton(true));
      switchToProcessing();
    } else {
      appDispatch(removeModalXButton(false));
    }
  };

  const startGenerating = async (selectedFileTypes: ZReadingFileTypes[]) => {

    if (allLoadedData.length > 0) {

      setGenerating((prev) => {
        return {
          ...prev,
          zreading: {
            ...prev.zreading,
            isGenerating: true,
          },
          backupDB: {
            ...prev.backupDB,
            triggerBackup: true,
          }
        }
      })
      
      // setGenerating({
      //   zreading: {
      //     isGenerating: true,
      //     isError: false,
      //   },
      //   receipt: {
      //     isPreparing: false,
      //     isGenerating: true,
      //     isError: false,
      //   },
      // });

    

      isProcessing(true);
      setActiveDate(moment(allLoadedData[0].trndte).format("YYYY-MM-DD"))
      await generate(selectedFileTypes, moment(allLoadedData[0].trndte).format("MMM-DD-YYYY"), undefined, true);
      // closes modal
      setTimeout(() => {
        appDispatch(removeModalXButton(false));
        dispatchModal();
        Navigate(-1);
      }, 1000);
    } else {
      if (noEODState.NOEOD) {
        generateNoEOD(selectedFileTypes);
      }
    }

    appDispatch(getRemainingZread());
  }

  const generate = async (
    selectedFileTypes: ZReadingFileTypes[],
    date?: string,
    noEOD?: { date: string },
    triggerBackup?: boolean
  ) => {
    // GENERATE Z-READING

    const generatedZReading = await appDispatch(
      generateZReading(objToQueryStr({
        // cashier: accountData.data?.usrcde || "",
        range: true,
        datefrom: noEOD ? noEOD.date : allLoadedData[0].trndte,
        dateto: noEOD ? noEOD.date : allLoadedData[allLoadedData.length - 1].trndte,
      }))
    );

    // if error
    if (!generatedZReading.payload) {
      isProcessing(false);
      switchToFileTypeSelection();

      setGenerating((prev) => {
        return {
          ...prev,
          zreading: {
            isGenerating: false,
            isError: true,
          },
        }
      })

      // setGenerating({
      //   zreading: {
      //     isGenerating: false,
      //     isError: true,
      //   },
      //   receipt: {
      //     isPreparing: false,
      //     isGenerating: false,
      //     isError: true,
      //   },
      // });

      return;
    }

    const zreadQuery = createZReadQuery(generatedZReading.payload[0], noEOD);

    const generatedGrandtotal = await appDispatch(generateGrandtotal({
      query: zreadQuery,
      data: {}
    }))

    if (!generatedGrandtotal.payload) {
      isProcessing(false);
      switchToFileTypeSelection();

      setGenerating((prev) => {
        return {
          ...prev,
          zreading: {
            isGenerating: false,
            isError: true,
          },
        }
      })

      // setGenerating({
      //   zreading: {
      //     isGenerating: false,
      //     isError: true,
      //   },
      //   receipt: {
      //     isPreparing: false,
      //     isGenerating: false,
      //     isError: true,
      //   },
      // });

      return;
    }
    // set isProcessing to true

    // setGenerating({
    //   zreading: {
    //     isGenerating: false,
    //     isError: false,
    //   },
    //   receipt: {
    //     isPreparing: true,
    //     isGenerating: true,
    //     isError: false,
    //   },
    // });

    // BACKUP DB
    if (triggerBackup) {
      setGenerating((prev) => {
        return {
          ...prev,
          zreading: {
            isGenerating: false,
            isError: false,
          },
          backupDB: {
            ...prev.backupDB,
            isGenerating: true,
            isError: false,
          },
        }
      })
      const backuped = await handleBackupData();
      setGenerating((prev) => {
        return {
          ...prev,
          backupDB: {
            ...prev.backupDB,
            isGenerating: false,
            isError: !backuped,
          },
        }
      })
    }

    // IF THERE'S HOOKED MALL
    if (getHookedMall()) {
      setGenerating((prev) => {
        return {
          ...prev,
          mallhookup: {
            ...prev.mallhookup,
            isGenerating: true,
          },
        }
      })

      await generateMallFiles({ 
        trndte: (generatedGrandtotal as any).payload.trndte,
        batchnum: (generatedGrandtotal as any).payload.batchnum,
      }, (loadingTxt) => {
        setGenerating((prev) => {
          return {
            ...prev,
            mallhookup: {
              ...prev.mallhookup,
              loadingTxt,
              isError: false,
            },
          }
        })  
      }, (success) => {
        setGenerating((prev) => {
          return {
            ...prev,
            mallhookup: {
              loadingTxt: "",
              isGenerating: false,
              isError: !success,
            },
          }
        })
      });  
    }

    if (isCentralTransfer()) {
      setGenerating((prev) => {
        return {
          ...prev,
          zreading: {
            isGenerating: false,
            isError: false,
          },
          transferCentralFile: {
            isGenerating: true,
            isError: false,
          },
        }
      })
      const isCentralTransferSuccess = await centralTransferFile();
      setGenerating((prev) => {
        return {
          ...prev,
          transferCentralFile: {
            isGenerating: false,
            isError: !isCentralTransferSuccess,
          },
        }
      })
    }

    // set isProcessing to false
    // setGenerating({
    //   zreading: {
    //     isGenerating: false,
    //     isError: false,
    //   },
    //   receipt: {
    //     isPreparing: false,
    //     isGenerating: true,
    //     isError: false,
    //   },
    // });

    setGenerating((prev) => {
      return {
        ...prev,
        zreading: {
          isGenerating: false,
          isError: false,
        },
        receipt: {
          isPreparing: true,
          isGenerating: true,
          isError: false,
        },
      }
    })

    // // GENERATE REPORTS & SAVE TO LOCAL
    // await saveReports(zreadData, selectedFileTypes, date ? date : moment(noEOD?.date).format("MMM-DD-YYYY"));
    await saveReports(
      generatedZReading.payload[0],
      selectedFileTypes,
      false,
      date ? date : moment(noEOD?.date).format("MMM-DD-YYYY"),
      async (isSuccess) => {
        setGenerating((prev) => {
          return {
            ...prev,
            receipt: {
              ...prev.receipt,
              isGenerating: false,
              isError: !isSuccess,
            },
          }
        })
        // setGenerating({
        //   zreading: {
        //     isGenerating: false,
        //     isError: false,
        //   },
        //   receipt: {
        //     isPreparing: false,
        //     isGenerating: false,
        //     isError: !isSuccess,
        //   },
        // });

        // LOG THE ACTIVITY
        postActivity({
          method: METHODS.PRINT,
          module: MODULES.ZREADING,
          remarks: `PRINT ZREADING:\n${
            allLoadedData.length > 1
              ? `Generate Z-Reading of:\n${
                  allLoadedData[0] ? allLoadedData[0].trndte : noEODState.from
                } to ${
                  allLoadedData[0] ? allLoadedData[allLoadedData.length - 1].trndte : noEODState.to
                }`
              : `Generate Z-Reading of ${
                  allLoadedData[0] ? allLoadedData[0].trndte : noEODState.from
                } ?`
          }`,
        });
      }
    );

    appDispatch(getNonZReadData());
    appDispatch(getLastTransaction());
  };

  const generateNoEOD = async (selectedFileTypes: ZReadingFileTypes[]) => {
    const dateFrom = moment(noEODState.from);
    const dateTo = moment(noEODState.to);

    const dateFromMos = dateFrom.get("month");
    const dateToMos = dateTo.get("month");

    let prevMosGapDays;
    let currentMosGapDays;

    if (dateFromMos !== dateToMos) {
      prevMosGapDays = dateFrom.daysInMonth() - dateFrom.get("date");
      currentMosGapDays = dateTo.get("date");
    }

    const noEODFromDay = dateFrom.get("date");
    let noEODToDay = prevMosGapDays ? dateFrom.get("date") + prevMosGapDays : dateTo.get("date");

    let isNextMos = false;
    for (let i = noEODFromDay; i <= noEODToDay;) {
      const date = (prevMosGapDays && isNextMos ? dateTo : dateFrom).set("date", i).format("YYYY-MM-DD");
      setActiveDate(date);

      // setGenerating({
      //   zreading: {
      //     isGenerating: true,
      //     isError: false,
      //   },
      //   receipt: {
      //     isPreparing: false,
      //     isGenerating: true,
      //     isError: false,
      //   },
      // });
      isProcessing(true);

      if (i === noEODToDay) {
        setGenerating((prev) => {
          return {
            ...prev,
            backupDB: {
              ...prev.backupDB,
              triggerBackup: true,
            }
          }
        })
      }

      await generate(selectedFileTypes, undefined, { date }, i === noEODToDay);

      if (prevMosGapDays && currentMosGapDays && !isNextMos && i === noEODToDay) {
        i = 1;
        noEODToDay = currentMosGapDays;
        isNextMos = true;
        continue;
      } else {
        i++;
      }
    }
    // closes modal
    setTimeout(() => {
      appDispatch(setNoEOD({ NOEOD: false, from: "", to: "" }));
      appDispatch(removeModalXButton(false));
      dispatchModal();
      Navigate(-1);
    }, 1500);
  };

  const centralTransferFile = async () => {
    if (isCentralTransfer()) {
      // const loading = toast.loading(
      //   "Transferring remaining transaction(s) to central ...", {
      //     position: 'top-center',
      //   }
      // );
      try {
        const serverprotocol = syspar.data[0].serverprotocol;
        const serveripaddress = syspar.data[0].serveripaddress;
        const serverport = syspar.data[0].serverport;

        const result = await appDispatch(getCentralServerDir({
          url: `${serverprotocol}://${serveripaddress}:${serverport}/api/getserverdir`,
          opts: {
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "*",
              "Access-Control-Allow-Headers": "X-Total-Count",
              // "Content-Length": Buffer.byteLength(
              //   JSON.stringify({ connect: "connect" })
              // ),
            },
            params: { brhcde: header.data[0].brhcde },
          }
        }));

        console.log(result);

        if (result.payload) {
          const transferResult = await appDispatch(autoTransfer());
          if (!transferResult.payload.success) {
            toast.error(transferResult.payload.message, {
              hideProgressBar: true,
              position: 'top-center',
              autoClose: 1500,
            });
            return false;
          } else {
            toast.success("Successfully transferred transaction(s)", {
              hideProgressBar: true,
              position: 'top-center',
              autoClose: 1500,
            });
            return true;
          }
          // toast.dismiss(loading);
        }
      } catch (error: any) {
        if (error.code == "EPROTO") {
          // WRONG PROTOCOL (HTTP or HTTPS)
          toast.error(
            "Unable to connect to server due to <b>incorrect protocol</b>.",
            {
              hideProgressBar: true,
              position: 'top-center',
              autoClose: 1500,
            }
          );
        } else if (error.code == "ENETUNREACH") {
          // NO INTERNET
          toast.error(
            "Unable to connect to server due to <b>no internet connection</b>.",
            {
              hideProgressBar: true,
              position: 'top-center',
              autoClose: 1500,
            }
          );
        } else if (error.code == "ENOTFOUND") {
          // ERROR IN IP ADDRESS
          toast.error(
            "Unable to connect to server due to <b>incorrect ip address</b>.",
            {
              hideProgressBar: true,
              position: 'top-center',
              autoClose: 1500,
            }
          );
        } else if (error.code == "ERR_SOCKET_BAD_PORT") {
          // ERROR IN PORT
          toast.error(
            "Unable to connect to server due to <b>incorrect port</b>.",
            {
              hideProgressBar: true,
              position: 'top-center',
              autoClose: 1500,
            }
          );
        } else if (error.code == "ECONNREFUSED") {
          toast.error("Connection is being refuse by the server.", {
            hideProgressBar: true,
            position: 'top-center',
            autoClose: 1500,
          });
        } else if (error.code == "ETIMEDOUT") {
          toast.error("Connection timeout.", {
            hideProgressBar: true,
            position: 'top-center',
            autoClose: 1500,
          });
        } else {
          toast.error("Something went wrong.", {
            hideProgressBar: true,
            position: 'top-center',
            autoClose: 1500,
          });
        }
      }
      return false;
      // toast.dismiss(loading);
    }
  };

  const isCentralTransfer = () => {
    return syspar.data[0].activateautotransfer === 1 && syspar.data[0].withtracc === 1 && syspar.data[0].trnsfrmod !== 'TIME'
  }

  return {
    startGenerating,
  }
}
