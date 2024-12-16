import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Checkbox } from "../../../common/form/Checkbox";
import { ButtonForm } from "../../../common/form/ButtonForm";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { useCentral } from "../../../hooks/centralHooks";
import { useService } from "../../../hooks/reportHooks";
import { centralMasterfilesArr } from "../../../data/centraldata";
import { RadioButton } from "../../../common/form/RadioButton";
import { CustomModal } from "../../../common/modal/CustomModal";
import { Spin } from "antd";
import { useWebSocket } from "../../../hooks/socketHooks";
import { useModal } from "../../../hooks/modalHooks";
import { getCentralServerDir } from "../../../store/actions/central.action";
import { CheckOutlined, SyncOutlined } from "@ant-design/icons";

export function DownloadAndSyncMasterFile() {
  const { header, syspar } = useAppSelector((state) => state.masterfile);
  const appDispatch = useAppDispatch();
  const { dispatch: dispatchModal } = useModal();
  const { getData } = useService<any>();
  const { UnSyncMasterfiles, isChecking, checkMasterFileLOG, getCentralMasterfileLog, content } = useCentral();

  const isSynced = useCallback((name: string) => {
    if (content.length === 0) return true;

    return content.find((c: string) => {
      return c.replace(/ /g, '').toLowerCase().includes(name)
    }) ? false: true
  }, [content]);

  const [selections, setSelections] = useState<any>({
    itemclass: [!isSynced("itemclass"), "Item Classification"],
    itemsubclass: [!isSynced("itemsubclass"), "Item Subclassification"],
    item: [!isSynced("item"), "Items"],
    dinetype: [!isSynced("dinetype"), "Dine Type"],
    pricelist: [!isSynced("pricelist"), "Price List"],
    // tenant: true,
    discount: [!isSynced("discount"), "Discount"],
    memc: [!isSynced("memc"), "MEMC"],
    cardtype: [!isSynced("cardtype"), "Card Type"], 
    otherpayment: [!isSynced("otherpayment"), "Other Payment"],
  });
  
  const { listen } = useWebSocket();

  const [tableList, setTableList] = useState<string[]>(centralMasterfilesArr.filter((e: any) => !isSynced(e)));
  const [selectAll, setSelectAll] = useState<any>(content.length !== 0); // [true, false]
  const [selectedProcess, setSelectedProcess] = useState<any>("dl_sync"); // ["dl", "sync", "dl_sync"
  const [onProcessing, setOnProcessing] = useState<any>({
    processing: false,
    title: "",
    dsc: ""
  });

  useEffect(() => {
    listen.onmessage((message) => {
      const msg = JSON.parse(message.data as string);
      const isDL = msg[2] === 'dl';

      setOnProcessing((prev: any) => (
        {
          ...prev,
          title: `${isDL?'Downloading':'Syncing'} ${selections[msg[0]][1]}`,
          dsc: `${msg[1]}`
        }
      ))
    })
  }, []);

  const handleInputChange = ({
    target: { name, checked },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setSelections((prev: any) => ({
      ...prev,
      [name]: [checked, selections[name][1]],
    }));
    if (checked) {
      tableList.push(name);
    } else {
      setTableList(tableList.filter((e: any) => e !== name));
    }
  };

  const onSelectedProcess = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedProcess(e.target.value);
  }

  const onSelectAll = () => {
    const isSelectAll = !selectAll;
    setSelectAll(isSelectAll);
    setSelections((prev: any) => {
      const newS = {...prev};
      for (const key in newS) {
        const found = content.find((c: string) => c.replace(/ /g, '').toLowerCase().includes(key))
        if (!found) continue;

        newS[key] = [isSelectAll, newS[key][1]];
      }

      return newS;
    });

    if (!isSelectAll) {
      setTableList([]);
    } else {
      setTableList(centralMasterfilesArr.filter((e: any) => !isSynced(e)));
    }
  }

  const getServerDir = async () => {
    try {
      const serverprotocol = syspar.data[0].serverprotocol;
      const serveripaddress = syspar.data[0].serveripaddress;
      const serverport = syspar.data[0].serverport;

      return await appDispatch(getCentralServerDir({
        url: `${serverprotocol}://${serveripaddress}:${serverport}/api/getserverdir`,
        opts: {
          headers: {
            // Etong option pwede mo to lagyan ng token para hindi pwedeng ma access agad yung central server
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
            autoClose: 1500,
            position: 'top-center',
          }
        );
      } else if (error.code == "ERR_SOCKET_BAD_PORT") {
        // ERROR IN PORT
        toast.error(
          "Unable to connect to server due to <b>incorrect port</b>.",
          {
            hideProgressBar: true,
            autoClose: 1500,
            position: 'top-center',
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
          autoClose: 1500,
          position: 'top-center',
        });
      } else {
        toast.error("Something went wrong.", {
          hideProgressBar: true,
          position: 'top-center',
          autoClose: 1500,
        });
      }

      return null;
    }
  }

  const onDownload = async (masterPath: any, onComplete?: () => void) => {
    await getData(
      "downloadmasterfile",
      {
        masterpath: masterPath,
        masterfile: tableList,
        sync: UnSyncMasterfiles,
      },
      async (res) => {
        if (res.data.success) {
          const filesNotFound = res.data.filesNotFound;
          const filesDownloaded = res.data.filesDownloaded;

          if (filesDownloaded === 0) {
            setOnProcessing({
              processing: false,
              title: "",
              dsc: ""
            })

            toast.info("No files downloaded. Please check if you have synced already.", {
              hideProgressBar: true,
              position: 'top-center',
              autoClose: 3000
            });
            return;
          }

          if (filesNotFound && filesNotFound.length > 0) {

            let notFoundStr = 'The following paths are not found:\n';
            for (const path of filesNotFound) {
              notFoundStr += `* ${path}\n`
            }

            toast.info(notFoundStr, {
              hideProgressBar: true,
              autoClose: 20000,
              position: 'top-center',
            })
          }
        } else {
          setOnProcessing({
            processing: false,
            title: "",
            dsc: ""
          })

          toast.error(res.data.msg, {
            hideProgressBar: true,
            position: 'top-center',
            autoClose: 3000
          })
          return; // return becuz downloading didn't complete
        }

        onComplete && onComplete();
      }
    );
  }

  const onSync = async (onComplete: () => void) => {
    await getData(
      "syncmasterfile",
      {
        masterfile: tableList,
      },
      async (res) => {
        if (res.data.success) {
          if (res.data.filesFound === 0) {
            toast.info("Nothing to sync", {
              hideProgressBar: true,
              autoClose: 2000,
              position: 'top-center',
            });
          } else {
            toast.success("Successfully Sync Master File", {
              hideProgressBar: true,
              autoClose: 3000,
              position: 'top-center',
            });

            const { result } = await getCentralMasterfileLog();
            await checkMasterFileLOG(result.payload);

            // set the selection to false if its true
            setSelections((prev: any) => {
              const newS = {...prev};
              for (const key in newS) {
                newS[key] = [false, newS[key][1]];
              }
              return newS;
            });
            setTableList([]);

            if (centralMasterfilesArr.filter((e: any) => !isSynced(e)).length === tableList.length) {
              dispatchModal();
            }
          }
        } else {
          toast.error("Something went wrong when syncing", {
            hideProgressBar: true,
            autoClose: 2000,
            position: 'top-center',
          });
        }

        onComplete();
      }
    );
  }

  const onProceed = async () => {
    if (content.length === 0) {
      toast.info("All masterfiles have already synced.", {
        hideProgressBar: true,
        position: 'top-center',
        autoClose: 2000
      });
      return;
    }

    if (tableList.length === 0) {
      toast.error("Please select at least one masterfile.", {
        hideProgressBar: true,
        position: 'top-center',
        autoClose: 2000
      });
      return;
    }

    setOnProcessing({
      processing: true,
      title: "Connecting",
      dsc: "Connecting to central server..."
    });
    const serverDir = await getServerDir();

    switch (selectedProcess) {
      case "dl":
        if (serverDir && serverDir.payload) {
          setOnProcessing({
            processing: true,
            title: "Preparing Download",
            dsc: "Preparing for download. Please wait..."
          })
          onDownload(serverDir.payload.master_path, () => {
            // on download complete
            setOnProcessing({
              processing: false,
              title: "",
              dsc: ""
            })
            toast.success("Successfully Downloaded Master File", {
              hideProgressBar: true,
              position: 'top-center',
              autoClose: 2000,
            });
          })
        }
        break;
      case "sync":
        if (serverDir && serverDir.payload) {
          setOnProcessing({
            processing: true,
            title: "Syncing",
            dsc: "Preparing for syncing. Please wait..."
          });

          onSync(() => {
            // on complete syncing
            setOnProcessing({
              processing: false,
              title: "",
              dsc: ""
            });
          });
        }
        break;
      case "dl_sync":
        if (serverDir && serverDir.payload) {
          setOnProcessing({
            processing: true,
            title: "Downloading",
            dsc: "Preparing for download. Please wait..."
          });

          onDownload(serverDir.payload.master_path, () => {
            // on downloading complete
            setOnProcessing({
              processing: true,
              title: "Syncing",
              dsc: "Syncing the masterfiles. Please wait..."
            })
            onSync(() => {
              setOnProcessing({
                processing: false,
                title: "",
                dsc: ""
              });
            });
          })
        }
        break;
    }
  };

  if (isChecking) {
    return (
      <div className="flex h-[400px] justify-center items-center">
        <Spin />
        <p className="ms-5">Checking... Please wait...</p>
      </div>
    )
  }

  return (
    <>
      {onProcessing.processing && (
        <CustomModal 
          modalName={onProcessing.title} 
          maxHeight={""}
          height={60}
        >
          <div className="flex">
            <Spin className="mx-3" />
            <p>{onProcessing.dsc}</p>
          </div>
        </CustomModal>
      )}
      <div>
        <div>
          <span className="text-[gray]">NOTE: </span>
          <span className="text-[14px]">
            Price List will only take effect on its effective date
          </span>
        </div>

        <div className="shadow-2xl p-[10px]">
          <label>Select the following master file(s) to sync:</label>

          <Checkbox 
            checked={selectAll} 
            id={"select-all"} 
            name={"select-all"} 
            description={"Select All"}
            className="border-b-[8px]"
            handleInputChange={onSelectAll}
            disabled={content.length === 0}
          />

          <div className="flex items-center">
            <Checkbox
              description="Item Classifications"
              name="itemclass"
              id="itemclass"
              value={selections.itemclass[0]}
              checked={selections.itemclass[0]}
              handleInputChange={handleInputChange}
              disabled={isSynced("itemclass")}
            />
            {isSynced("itemclass") ? (
              <div className="ms-auto flex p-[3px] text-white rounded bg-green-500 justify-center items-center">
                <CheckOutlined/>
                <span className="text-[12px] ms-1">Synced</span>
              </div>
            ) : (
              <div className="ms-auto flex p-[3px] text-white rounded bg-gray-500 justify-center items-center">
                <SyncOutlined />
                <span className="text-[12px] ms-1">Not Synced</span>
              </div>
            )}
          </div>

          <div className="flex items-center">
            <Checkbox
              description="Item Subclassifications"
              name="itemsubclass"
              id="itemsubclass"
              value={selections.itemsubclass[0]}
              checked={selections.itemsubclass[0]}
              handleInputChange={handleInputChange}
              disabled={isSynced("itemsubclass")}
            />
            {isSynced("itemsubclass") ? (
              <div className="ms-auto flex p-[3px] text-white rounded bg-green-500 justify-center items-center">
                <CheckOutlined/>
                <span className="text-[12px] ms-1">Synced</span>
              </div>
            ) : (
              <div className="ms-auto flex p-[3px] text-white rounded bg-gray-500 justify-center items-center">
                <SyncOutlined />
                <span className="text-[12px] ms-1">Not Synced</span>
              </div>
            )}
          </div>

          <div className="flex items-center">
            <Checkbox
              description="Items"
              name="item"
              id="item"
              value={selections.item[0]}
              checked={selections.item[0]}
              handleInputChange={handleInputChange}
              disabled={isSynced("item")}
            />
            {isSynced("item") ? (
              <div className="ms-auto flex p-[3px] text-white rounded bg-green-500 justify-center items-center">
                <CheckOutlined/>
                <span className="text-[12px] ms-1">Synced</span>
              </div>
            ) : (
              <div className="ms-auto flex p-[3px] text-white rounded bg-gray-500 justify-center items-center">
                <SyncOutlined />
                <span className="text-[12px] ms-1">Not Synced</span>
              </div>
            )}
          </div>

          <div className="flex items-center">
            <Checkbox
              description="Dine Type"
              name="dinetype"
              id="dinetype"
              value={selections.dinetype[0]}
              checked={selections.dinetype[0]}
              handleInputChange={handleInputChange}
              disabled={isSynced("dinetype")}
            />
            {isSynced("dinetype") ? (
              <div className="ms-auto flex p-[3px] text-white rounded bg-green-500 justify-center items-center">
                <CheckOutlined/>
                <span className="text-[12px] ms-1">Synced</span>
              </div>
            ) : (
              <div className="ms-auto flex p-[3px] text-white rounded bg-gray-500 justify-center items-center">
                <SyncOutlined />
                <span className="text-[12px] ms-1">Not Synced</span>
              </div>
            )}
          </div>

          <div className="flex items-center">
            <Checkbox
              description="Pricelist"
              name="pricelist"
              id="pricelist"
              value={selections.pricelist[0]}
              checked={selections.pricelist[0]}
              handleInputChange={handleInputChange}
              disabled={isSynced("pricelist")}
            />
            {isSynced("pricelist") ? (
              <div className="ms-auto flex p-[3px] text-white rounded bg-green-500 justify-center items-center">
                <CheckOutlined/>
                <span className="text-[12px] ms-1">Synced</span>
              </div>
            ) : (
              <div className="ms-auto flex p-[3px] text-white rounded bg-gray-500 justify-center items-center">
                <SyncOutlined />
                <span className="text-[12px] ms-1">Not Synced</span>
              </div>
            )}
          </div>

          <div className="flex items-center">
            <Checkbox
              description="Discount"
              name="discount"
              id="discount"
              value={selections.discount[0]}
              checked={selections.discount[0]}
              handleInputChange={handleInputChange}
              disabled={isSynced("discount")}
            />
            {isSynced("discount") ? (
              <div className="ms-auto flex p-[3px] text-white rounded bg-green-500 justify-center items-center">
                <CheckOutlined/>
                <span className="text-[12px] ms-1">Synced</span>
              </div>
            ) : (
              <div className="ms-auto flex p-[3px] text-white rounded bg-gray-500 justify-center items-center">
                <SyncOutlined />
                <span className="text-[12px] ms-1">Not Synced</span>
              </div>
            )}
          </div>

          <div className="flex items-center">
            <Checkbox
              description="MEMC"
              name="memc"
              id="memc"
              value={selections.memc[0]}
              checked={selections.memc[0]}
              handleInputChange={handleInputChange}
              disabled={isSynced("memc")}
            />
            {isSynced("memc") ? (
              <div className="ms-auto flex p-[3px] text-white rounded bg-green-500 justify-center items-center">
                <CheckOutlined/>
                <span className="text-[12px] ms-1">Synced</span>
              </div>
            ) : (
              <div className="ms-auto flex p-[3px] text-white rounded bg-gray-500 justify-center items-center">
                <SyncOutlined />
                <span className="text-[12px] ms-1">Not Synced</span>
              </div>
            )}
          </div>

          <div className="flex items-center">
            <Checkbox
              description="Card Type"
              name="cardtype"
              id="cardtype"
              value={selections.cardtype[0]}
              checked={selections.cardtype[0]}
              handleInputChange={handleInputChange}
              disabled={isSynced("cardtype")}
            />
            {isSynced("cardtype") ? (
              <div className="ms-auto flex p-[3px] text-white rounded bg-green-500 justify-center items-center">
                <CheckOutlined/>
                <span className="text-[12px] ms-1">Synced</span>
              </div>
            ) : (
              <div className="ms-auto flex p-[3px] text-white rounded bg-gray-500 justify-center items-center">
                <SyncOutlined />
                <span className="text-[12px] ms-1">Not Synced</span>
              </div>
            )}
          </div>

          <div className="flex items-center">
            <Checkbox
              description="Other Payment"
              name="otherpayment"
              id="otherpayment"
              value={selections.otherpayment[0]}
              checked={selections.otherpayment[0]}
              handleInputChange={handleInputChange}
              disabled={isSynced("otherpaymenttype")}
            />
            {isSynced("otherpaymenttype") ? (
              <div className="ms-auto flex p-[3px] text-white rounded bg-green-500 justify-center items-center">
                <CheckOutlined/>
                <span className="text-[12px] ms-1">Synced</span>
              </div>
            ) : (
              <div className="ms-auto flex p-[3px] text-white rounded bg-gray-500 justify-center items-center">
                <SyncOutlined />
                <span className="text-[12px] ms-1">Not Synced</span>
              </div>
            )}
          </div>
        </div>

        <ButtonForm
          data={selections}
          formName=""
          okBtnTxt="Proceed"
          onOkBtnClick={onProceed}
          isActivated={true}
        >
          <div className="sticky bottom-0 translate-y-[1.5rem]">
            <RadioButton 
              name={""}
              isLandscape
              radioDatas={[
                {
                  id: "dl",
                  name: "Download Only",
                  value: "dl"
                },
                {
                  id: "sync",
                  name: "Sync Only",
                  value: "sync"
                },
                {
                  id: "dl_sync",
                  name: "Download and Sync",
                  value: "dl_sync"
                }
              ]}
              value={selectedProcess} 
              description={""} 
              handleInputChange={onSelectedProcess}   
            />
          </div>
        </ButtonForm>
      </div>
    </>
  );
}
