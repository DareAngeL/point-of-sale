import { Key, useState } from "react";
import { ModalTransferByDate } from "./modals/ModalTransferByDate";
import {
  Paper,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
} from "@mui/material";
import { PosfileModel } from "../../../models/posfile";
import moment from "moment";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { toast } from "react-toastify";
import { getCentralServerDir } from "../../../store/actions/central.action";
import { TransferTransactionModal } from "./modals/TransferTransactionModal";
import { useAutoSalesTranTableInitialization } from "./hooks/initialization";
import { useAutoSalesTranTableInputHandler } from "./hooks/inputHandler";
import { useTheme } from "../../../hooks/theme";
import { transferFilesToCentral } from "../../../store/actions/utilities/automationofsales.action";
import { TransferringModal } from "./modals/TransferringModal";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { DateRange } from "./components/DateRange";

interface AutoTransferProps {
  sysparData: any;
  scrollableDivRef: React.RefObject<HTMLDivElement>;
}

export function AutoTransfer(props: AutoTransferProps) {
  const { ButtonStyled, theme } = useTheme();

  const [allLoadedData, setAllLoadedData] = useState<any>([]);
  const [isTransferByDate, setIsTransferByDate] = useState(false);
  const [isTransferringSales, setIsTransferringSales] = useState(false);
  // const [transferSelectedDoc, setTransferSelectedDoc] = useState(false);
  const [arrayCheck, setArrayCheck] = useState<any>({});
  const [isConfirmation, setIsConfirmation] = useState(false);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [docnumValue, setDocnumValue] = useState<string[]>([]);
  
  const { syspar, header } = useAppSelector((state) => state.masterfile);
  const appDispatch = useAppDispatch();

  const { getSalesTransactions, onDateChange, socketMsg } = useAutoSalesTranTableInitialization(setAllLoadedData, setDocnumValue, setArrayCheck, props.scrollableDivRef);
  const { onChangeCheck, onClickTransfer, selectAll } = useAutoSalesTranTableInputHandler(
    setIsTransferByDate,
    setIsConfirmation,
    setModalTitle,
    setDocnumValue,
    setArrayCheck,
    allLoadedData,
    arrayCheck
  );

  const transferTransaction = async (docnum: string[]) => {
    setIsTransferringSales(true);
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

      if (result.payload) {
        const filterDocument: string[] = docnum;

        const transferFileResult = await appDispatch(transferFilesToCentral({
          comcde: result.payload.comcde,
          docnums: filterDocument,
          centralPath: result.payload.central_path
        }));

        if (transferFileResult.payload.success) {
          toast.success(`Succesfully Transferred (${docnum})`, {
            hideProgressBar: true,
            position: 'top-center',
            autoClose: 1500,
          });
          setIsConfirmation(false);
          setDocnumValue([]);
          getSalesTransactions();
        } else {
          toast.error(`Failed to transfer (${docnum})`, {
            hideProgressBar: true,
            position: 'top-center',
            autoClose: 1500,
          });
        }

        // await getData(
        //   "gettransferfile",
        //   {
        //     comcde: result.payload.comcde,
        //     docnums: filterDocument,
        //   },
        //   async (result1) => {
            
        //   }
        // );
      }

      setIsTransferringSales(false);
    } catch (error: any) {
      setIsTransferringSales(false);
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
  };

  const handleOnExpandSpecReq = (recid: string) => {
    setAllLoadedData((prev: any) => {
      return prev.map((d: any) => {
        if (d.recid === recid) {
          return {
            ...d,
            expandSpecReq: !d.expandSpecReq,
          };
        }
        return d;
      });
    });
  }

  return (
    <>
      {console.log(arrayCheck)}
      {isConfirmation && (
        <TransferTransactionModal
          modalTitle={modalTitle}
          onNo={() => {
            setIsConfirmation(false);
            setDocnumValue([]);
          }}
          onYes={() => transferTransaction(docnumValue)}
        />
      )}

      {isTransferByDate ? (
        <ModalTransferByDate
          setIsTransferringSales={setIsTransferringSales}
          setIsTransferByDate={setIsTransferByDate}
          getSalesTransactions={getSalesTransactions}
        />
      ) : (
        <></>
      )}

      <TransferringModal open={isTransferringSales} msg={socketMsg} />

      <div className="overflow-auto relative justify-items-center mx-auto mt-[1rem]">
        {props.sysparData?.activateautotransfer === 0 ? (
          <>
            <div>
              <ButtonStyled $color={theme.primarycolor}
                type="button"
                onClick={() => onClickTransfer("selected")}
                className="px-4 py-2 rounded my-5 mx-[7px]"
              >
                Transfer Selected Transactions
              </ButtonStyled>

              <ButtonStyled $color={theme.primarycolor}
                type="button"
                onClick={() => onClickTransfer("date")}
                className="px-4 py-2 rounded my-5 mx-[7px]"
              >
                Transfer Transactions by Date
              </ButtonStyled>
            </div>
          </>
        ) : (
          <></>
        )}

        <div className="flex flex-col border border-black p-5">
          <DateRange onDatePicked={onDateChange} />
          <p><span className="font-bold">NOTE:</span> Date End will be auto generated by selecting Date Start and it will be end of the month</p>
        </div>

        <TableContainer component={Paper}>
          <Table>
            <TableHead className="border border-solid border-t border-[#d0d0d0] bg-[#2f3c48] sticky top-[0] left-[0] right-[0]">
              <TableRow>
                {props.sysparData?.activateautotransfer === 0 ? (
                  <TableCell
                    style={{ minWidth: 70, color: "#FFF", fontWeight: "bold" }}
                    align="left"
                  >
                    <input
                      type="checkbox"
                      name={"selectall"}
                      id={"selectall"}
                      className="me-1 bg-white border text-black sm:text-lg rounded-lg focus:ring-primary-600 focus:border-primary-600 block p-2.5 w-[1rem] h-6 cursor-pointer"
                      onChange={(e) => selectAll(e.target.checked)}
                      checked={arrayCheck["selectall"]}
                      value={arrayCheck["selectall"]}
                    />
                  </TableCell>
                ) : (
                  <></>
                )}
                <TableCell
                  style={{ color: "#FFF", fontWeight: "bold" }}
                  align="left"
                >
                  Document Number
                </TableCell>
                <TableCell
                  style={{ color: "#FFF", fontWeight: "bold" }}
                  align="left"
                >
                  User
                </TableCell>
                <TableCell
                  style={{ color: "#FFF", fontWeight: "bold" }}
                  align="left"
                >
                  Date
                </TableCell>
                <TableCell
                  style={{ color: "#FFF", fontWeight: "bold" }}
                  align="center"
                >
                  Upload Status
                </TableCell>

                {props.sysparData?.activateautotransfer === 0 ? (
                  <TableCell
                    style={{ color: "#FFF", fontWeight: "bold" }}
                    align="center"
                  >
                    Action
                  </TableCell>
                ) : (
                  <></>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {allLoadedData.map((row: PosfileModel | any, index: Key) => (
                <>
                  <TableRow key={row.recid}>
                    {props.sysparData?.activateautotransfer === 0 ? (
                      <TableCell align="center">
                        <input
                          key={index}
                          type="checkbox"
                          name={arrayCheck[row?.recid as string]}
                          id={arrayCheck[row?.recid as string]}
                          className="me-1 bg-white border text-black sm:text-lg rounded-lg focus:ring-primary-600 focus:border-primary-600 block p-2.5 w-[1rem] h-6 cursor-pointer"
                          onChange={(e) =>
                            onChangeCheck(row.recid as string, e.target.checked)
                          }
                          checked={arrayCheck[row?.recid as string]?.checked}
                          value={arrayCheck[row?.recid as string]?.checked}
                          disabled={arrayCheck[row?.recid as string].disable}
                        />
                      </TableCell>
                    ) : (
                      <></>
                    )}
                    <TableCell>{row.docnum} {!row.docnum.includes('POS-') && `(${row.itmcde})`}</TableCell>
                    <TableCell>{row.cashier}</TableCell>
                    <TableCell>
                      {moment(row.trndte).format("MM-DD-YYYY")}
                    </TableCell>
                    <TableCell
                      style={{
                        color:
                          !row.trnsfrdte && !row.trnsfrtime ? "red" : "green",
                      }}
                      align="center"
                    >
                      {!row.trnsfrdte && !row.trnsfrtime
                        ? "Pending"
                        : "Success"}
                    </TableCell>

                    {props.sysparData?.activateautotransfer === 0 ? 
                      !row.trnsfrdte && !row.trnsfrtime ?
                      ( 
                        <TableCell align="center">
                          <ButtonStyled $color={theme.primarycolor}
                            type="button"
                            onClick={() => {
                              setIsConfirmation(true);
                              setDocnumValue([row.docnum as string]);
                              setModalTitle(
                                `Are you sure you want to transfer (${row.docnum})?`
                              );
                            }}
                            disabled={
                              !row.trnsfrdte && !row.trnsfrtime ? false : true
                            }
                            className={`px-4 py-2 rounded my-5 mx-[7px] ${
                              !row.trnsfrdte && !row.trnsfrtime
                                ? "cursor-pointer"
                                : "cursor-not-allowed"
                            }`}
                          >
                            Transfer Transactions
                          </ButtonStyled>
                        </TableCell>
                      ) : (
                        <TableCell align="center">
                          <button className="bg-gray-300 p-2 px-4 rounded cursor-not-allowed">Transfer Transactions</button>
                        </TableCell>
                      ) : (<></>)}
                  </TableRow>

                  {row.orderitemmodifierfiles.length > 0 && (
                    <TableRow>
                      <TableCell padding="none" colSpan={6}>
                        <div className="rounded p-1 ps-5 hover:bg-slate-100 active:bg-slate-200 hover:cursor-pointer transition-colors" onClick={() => handleOnExpandSpecReq(row.recid)}>
                          <div className="flex items-center">
                            {row.expandSpecReq ? (
                              <UpOutlined />
                            ) : (
                              <DownOutlined />
                            )}
                            <p className="mx-2">Special Request(s)/Remark(s)</p>
                          </div>
                          
                          {row.expandSpecReq && (
                            <div className="ms-10">
                              {row.orderitemmodifierfiles?.map((d: any) => (
                                <li>{d.modcde}</li>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  );
}
