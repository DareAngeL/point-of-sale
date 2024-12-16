import { Id, toast } from "react-toastify";
import { useService } from "./reportHooks";
import { useAppDispatch, useAppSelector } from "../store/store";
import { io } from "socket.io-client";
import {
  generateRobinsonMallFile,
  generateStaLuciaMallFile,
} from "../store/actions/zreading.action";
import { useRef } from "react";

export const useGenerateMallFiles = () => {
  const { getData } = useService();
  const { syspar, mallHookUp } = useAppSelector((state) => state.masterfile);
  const appDispatch = useAppDispatch();

  const noConnToastId = useRef<Id>();

  // const reGenerateMallFiles = async (dateFrom: string, dateTo: string) => {

  const reGenerateMallFiles = async (
    dateFrom: string,
    dateTo: string,

    onGenerating: (date: string) => void,
    onComplete: () => void
  ) => {
    await getData(
      `posfile/grandtotal?from=${dateFrom}&to=${dateTo}`,
      {},
      async (res: any) => {
        // await getData(
        //   "posfile/filter",
        //   {
        //     batchnum: batchnum,
        //     _sortby: "trndte:asc,recid:asc",
        //     _limit: 1,
        //     _includes: "trndte,logtim",
        //   },
        //   async (res: any) => {
        //     let params = {
        //       trndte: res.data[0].trndte,
        //       batchnum: batchnum,
        //     };
        //     if (syspar.data[0].robinson === 1) {
        //       params = {
        //         ...params,
        //         ...{ resend_ftp_rlc: 1 },
        //       };
        //     }
        //   }
        // );

        for (const data of res.data) {
          onGenerating(data.trndte);
          await generateMallFiles({
            trndte: data.trndte,
            batchnum: data.batchnum,
            hourly: "",
            time1: "",
            time2: "",
          });
        }

        if (res.data.length === 0) {
          toast.error("No data found", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 2000,
            hideProgressBar: true,
          });
        }

        onComplete();
      }
    );
  };

  const reGenerateHoursMallFiles = async (
    date: string,
    onGenerating: (date: string) => void,
    onComplete: () => void
  ) => {
    await getData(`posfile/hourly?date=${date}`, {}, async (res: any) => {
      for (const data of res.data) {
        onGenerating(data.trndte);
        await generateMallFiles({
          trndte: data.trndte,
          batchnum: data.batchnum,
          hourly: "hourly",
          time1: data.timestart,
          time2: data.timeend,
        });
      }

      if (res.data.length === 0) {
        toast.error("No data found", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 2000,
          hideProgressBar: true,
        });
      }
      onComplete();
    });
  };

  const generateMallFiles = async (
    params: object,
    onGenerate?: (loadingTxt: string) => void,
    onComplete?: (success: boolean) => void
  ) => {
    const toastId = "wazzup";
    try {
      if (syspar.data[0].active_mall !== 0) {
        switch (mallHookUp.data?.mallname) {
          case "Robinsons":
            {
              onGenerate?.("Sending sales file to RLC server...");
              console.log("paramsparamsparams", params);

              // Call api for robinson
              const generateRob = (await appDispatch(
                generateRobinsonMallFile(params)
              )) as any;

              if (generateRob.payload) {
                const { status: statusCode } = generateRob.payload as any;
                toast.dismiss(noConnToastId.current);

                if (statusCode == 200) {
                  toast.success("Sales file successfully sent to RLC server", {
                    toastId: toastId,
                    position: toast.POSITION.TOP_CENTER,
                    autoClose: 2000,
                    hideProgressBar: true,
                  });
                  return onComplete?.(true);
                } else {
                  toast.error(
                    "Sales file is not sent to RLC server. Please contact your POS Vendor",
                    {
                      toastId: toastId,
                      position: toast.POSITION.TOP_CENTER,
                      autoClose: 2000,
                      hideProgressBar: true,
                    }
                  );
                  return onComplete?.(false);
                }
              } else {
                toast.dismiss(noConnToastId.current);
                if (generateRob.error.message.includes("code 503")) {
                  noConnToastId.current = toast.loading(
                    "Retrying to send unsent files... Please check your internet connection.",
                    {
                      position: toast.POSITION.TOP_CENTER,
                      autoClose: 2000,
                      hideProgressBar: true,
                    }
                  );

                  await generateMallFiles(params, onGenerate, onComplete);
                  return;
                }

                toast.error(
                  "Sales file is not sent to RLC server. Please contact your POS Vendor",
                  {
                    toastId: toastId,
                    position: toast.POSITION.TOP_CENTER,
                    autoClose: 2000,
                    hideProgressBar: true,
                  }
                );
                return onComplete?.(false);
              }
            }
            break;
          case "Sta. Lucia": {
            onGenerate?.("Saving file to Sta. Lucia server...");

            const generateStaLucia = await appDispatch(
              generateStaLuciaMallFile(params)
            );

            const { status: sc } = generateStaLucia.payload as any;

            if (sc == 200) {
              toast.success("Successfully Saved to Sta. Lucia.", {
                toastId: toastId,
                position: toast.POSITION.TOP_CENTER,
                autoClose: 2000,
                hideProgressBar: true,
              });

              return onComplete?.(true);
            } else {
              toast.error("Error in saving, please contact your manufacturer", {
                toastId: toastId,
                position: toast.POSITION.TOP_CENTER,
              });

              return onComplete?.(false);
            }
          }

          default:
            onGenerate?.(
              `Saving file to ${mallHookUp.data?.mallname} server...`
            );
        }
      }

      const socket = io("http://localhost:5902", {
        transports: ["websocket"],
      });

      await new Promise<void>((resolve) => {
        socket.once("connect", () => {
          console.log("Connected to server");
          socket.emit("ftpsend", {
            zread: 1,
            ...params,
          });
        });

        socket.once("connect_error", (error: any) => {
          console.error("Socket connection failed:", error);
          onComplete?.(false);
          // toast.dismiss(loading);
          toast.error("Socket connection error.", {
            toastId: toastId,
            autoClose: 2000,
            position: "top-center",
            hideProgressBar: true,
          });
          resolve(); // Reject the promise if there's a connection error
        });

        socket.once("responseData", (data: any) => {
          console.log("Respoonse Data", data);

          // Handle the received data as needed
          if (data && data.status === "SUCCESS") {
            onComplete?.(true);

            toast.success(
              data.content || "Text file successfully sent to server",
              {
                toastId: toastId,
                hideProgressBar: true,
                position: "top-center",
                autoClose: 5000,
              }
            );
          } else {
            onComplete?.(false);
            console.error(
              "Error sending sales file to server: data is undefined"
            );

            toast.info("Mallhookup Generated", {
              toastId: toastId,
              hideProgressBar: true,
              position: "top-center",
              autoClose: 10000,
            });
          }
          setTimeout(() => {
            toast.dismiss();
          }, 3000);
          resolve(); // Resolve the promise to proceed to the next iteration
        });
      });
    } catch (error) {
      onComplete?.(false);
      console.error("Error sending sales file to server:", error);

      toast.error(
        "Sales file is not sent to server. Please contact your POS provider.",
        {
          toastId: toastId,
          hideProgressBar: true,
          position: "top-center",
          autoClose: 10000,
        }
      );
      // toast.dismiss(loading);
    }
  };

  const generateSMCoinsAranetaMallFilesPerTransaction = (params: object) => {
    console.log("params SM Coins", params);

    try {
      if (
        mallHookUp.data?.mallname.toLocaleLowerCase().includes("sm coins") ||
        mallHookUp.data?.mallname.toLocaleLowerCase() === "araneta"
      ) {
        const socket = io("http://localhost:5902", {
          transports: ["websocket"],
        });

        new Promise<boolean>((resolve, reject) => {
          socket.once("connect", () => {
            console.log("Connected to server", { ...params });
            socket.emit("ftpsend", {
              ...params,
            });
          });

          socket.once("connect_error", (error: any) => {
            console.error("Socket connection failed:", error);
            // toast.dismiss(loading);
            toast.error("Socket connection error.", {
              autoClose: 2000,
              position: "top-center",
              hideProgressBar: true,
            });
            reject("Socket connection error."); // Reject the promise if there's a connection error
          });

          socket.once("responseData", (data: any) => {
            // Handle the received data as needed
            if (data && data.status === "SUCCESS") {
              toast.success("Text file successfully sent to server", {
                hideProgressBar: true,
                position: "top-center",
                autoClose: 5000,
              });

              resolve(true);
            } else {
              console.error(
                "Error sending sales file to server: data is undefined"
              );
              toast.error(
                "Sales file is not sent to server. Please contact your POS provider.",
                {
                  hideProgressBar: true,
                  position: "top-center",
                  autoClose: 10000,
                }
              );

              reject("Error sending sales file to server: data is undefined");
            }

            resolve(false);
          });
        });
      }
    } catch (error) {
      console.error("Error sending sales file to server:", error);
      toast.error(
        "Sales file is not sent to server. Please contact your POS provider.",
        {
          hideProgressBar: true,
          position: "top-center",
          autoClose: 10000,
        }
      );

      return false;
    }
  };

  const getHookedMall = () => {
    return syspar.data[0].active_mall !== 0;
  };

  return {
    reGenerateMallFiles,
    reGenerateHoursMallFiles,
    generateMallFiles,
    generateSMCoinsAranetaMallFilesPerTransaction,
    getHookedMall,
  };
};
