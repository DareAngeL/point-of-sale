import React, { useEffect, useState } from "react";
import { ButtonForm } from "../../../../common/form/ButtonForm";
import { InputDateV2 } from "../../../../common/form/InputDate";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import moment from "moment";
import { getSysPar } from "../../../../store/actions/systemParameters.action";
import { getCentralServerDir } from "../../../../store/actions/central.action";
import { getAutoOfSalesTransactionAPI, transferFilesToCentral } from "../../../../store/actions/utilities/automationofsales.action";

interface ModalTransferByDateProps {
  setIsTransferByDate: (props: boolean) => void;
  setIsTransferringSales: (value: React.SetStateAction<boolean>) => void;
  getSalesTransactions: () => void;
}

export function ModalTransferByDate(props: ModalTransferByDateProps) {
  const [data, setData] = useState<{datefrom: string|undefined; dateto: string|undefined}>({ datefrom: undefined, dateto: undefined });
  const { syspar, header } = useAppSelector((state) => state.masterfile);
  const appDispatch = useAppDispatch();

  const handleInputChange = (name: string, value: string) => {
    setData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (data.datefrom !== undefined && data.dateto !== undefined) {
      if ((data.datefrom||'') > (data.dateto||'')) {
        toast.error("Date FROM is greater than Date TO", {
          hideProgressBar: true,
          position: 'top-center',
          autoClose: 1500,
        });
      } else {

        const result = await appDispatch(getAutoOfSalesTransactionAPI({
          trndte: `and:[gte=${data.datefrom.replaceAll('/', '-')},lte=${data.dateto.replaceAll('/', '-')}]`, 
          trnsfrdte: "eqv2:null",
          trnsfrtime: "eqv2:null",
          trnstat: 1,
          _groupby: "docnum",
          _sortby: "trnsfrdte,docnum",
        }));

        if (result.payload.length === 0) {
          toast.error(
            `No pending transaction(s) found from ${moment(
              data.datefrom
            ).format("MM-DD-YYYY")} to ${moment(data.dateto).format(
              "MM-DD-YYYY"
            )}`,
            {
              hideProgressBar: true,
              position: 'top-center',
              autoClose: 1500,
            }
          );
        } else if (
          result.payload.length > syspar.data[0] &&
          syspar.data[0].transferlimit
        ) {
          toast.error(
            `Too many request data transfer from ${moment(
              data.datefrom
            ).format("MM-DD-YYYY")} to ${moment(data.dateto).format(
              "MM-DD-YYYY"
            )}`,
            {
              hideProgressBar: true,
              position: 'top-center',
              autoClose: 1500,
            }
          );
        } else {
          props.setIsTransferringSales(true);
          try {
            const serverprotocol = syspar.data[0].serverprotocol;
            const serveripaddress = syspar.data[0].serveripaddress;
            const serverport = syspar.data[0].serverport;

            const resultCentral = await appDispatch(getCentralServerDir({
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
            }))

            if (resultCentral.payload) {
              const filterDocument: string[] = [];
              result.payload.filter((posres: any) => {
                filterDocument.push(posres.docnum);
              });

              const transferFileResult = await appDispatch(transferFilesToCentral({
                comcde: resultCentral.payload.comcde,
                docnums: filterDocument,
                centralPath: resultCentral.payload.central_path
              }));
      
              if (transferFileResult.payload.success) {
                toast.success(`Succesfully Transferred (${filterDocument})`, {
                  hideProgressBar: true,
                  position: 'top-center',
                  autoClose: 1500,
                });

                props.setIsTransferByDate(false);
                props.getSalesTransactions();
              } else {
                toast.error(`Failed to transfer (${filterDocument})`, {
                  hideProgressBar: true,
                  position: 'top-center',
                  autoClose: 1500,
                });
              }

              props.setIsTransferringSales(false);
            }
          } catch (error: any) {
            if (error.code == "EPROTO") {
              // WRONG PROTOCOL (HTTP or HTTPS)
              toast.error(
                "Unable to connect to server due to <b>incorrect protocol</b>.",
                {
                  hideProgressBar: true,
                  autoClose: 1500,
                  position: 'top-center',
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
              console.error(error);
              toast.error("Something went wrong.", {
                hideProgressBar: true,
                position: 'top-center',
                autoClose: 1500,
              });
            }

            props.setIsTransferringSales(false);
          }
        }
      }
    } else {
      toast.error("Date FROM and Date TO are required", {
        hideProgressBar: true,
        position: 'top-center',
        autoClose: 1500,
      });
    }
  };

  useEffect(() => {
    if (!syspar.isLoaded) {
      appDispatch(getSysPar());
    }
  }, []);

  return (
    <>
      <div className="absolute w-full h-full z-20">
        <div className="flex justify-center items-center bg-black/75 center h-full w-full z-30">
          <div className="rounded bg-white shadow-lg flex flex-col">
            <div className="font-montserrat px-8 py-5 border-b border-[#adacac] font-bold">
              <div>Date Range</div>
            </div>

            <div className="max-h-[700px] min-w-[350px] max-w-[350px] my-5 px-10 font-montserrat overflow-y-auto overflow-x-hidden relative w-auto self-center">
              <form id="tbd-form" onSubmit={handleSubmit}>
                <InputDateV2
                  description="Date From"
                  name="datefrom"
                  id="datefrom"
                  value={data.datefrom}
                  handleInputChange={handleInputChange}
                />

                <InputDateV2
                  description="Date To"
                  name="dateto"
                  id="dateto"
                  value={data.dateto}
                  handleInputChange={handleInputChange}
                />
              </form>

              <ButtonForm
                formName="tbd-form"
                cancelBtnTxt="Cancel"
                onCancelBtnClick={() => props.setIsTransferByDate(false)}
                okBtnTxt="Confirm"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
