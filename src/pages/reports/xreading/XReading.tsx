import React, {useEffect, useState} from "react";
import {RadioButton} from "../../../common/form/RadioButton";
import {Checkbox} from "../../../common/form/Checkbox";
import {Selection} from "../../../common/form/Selection";
import {useAppSelector, useAppDispatch} from "../../../store/store";
import {toast} from "react-toastify";
import {useNavigate} from "react-router";
import {useModal} from "../../../hooks/modalHooks";
import {
  convertText,
  convertCSV,
  // downloadBase64AsPDF,
  // fixBase64String,
  formatDataForReceipt,
} from "../../../helper/FileConversion";
import PrintReport from "./PrintReport";
import ReactDOMServer from "react-dom/server";
import {templateData} from "../../../data/reportsList";
import {useXZReading} from "../../../hooks/reportHooks";
import {useXReadingReport} from "./xreadingReport";
import moment from "moment";
import {useUserActivityLog} from "../../../hooks/useractivitylogHooks";
import {METHODS, MODULES} from "../../../enums/activitylogs";
import {xReadingReceiptPrintout} from "../../../hooks/printer/xReadingReceiptHook";
import { getCashiers, getXRead } from "../../../store/actions/posfile.action";
import { formatTimeTo12Hour } from "../../../helper/Date";
// import XReadPrint from "./receipt/XReadPrint";

export function XReading() {
  const appDispatch = useAppDispatch();
  const {postActivity} = useUserActivityLog();
  const {
    // generateReport
  } = useXReadingReport();
  const {dispatch} = useModal();
  const selector = useAppSelector((state) => state);
  const {header, syspar} = useAppSelector((state) => state.masterfile);
  const {cashiers, xReading} = useAppSelector((state) => state.report);

  const {
    // handleViewFile,
    handleSetType,
    handlePrint,
    generateXReadingPrintOut,
    generatePDFFile,
    viewPdfOrderingReceipt,
  } = useXZReading();
  // const {cashDeclared} = useAppSelector((state) => state.transaction);
  const {lastTransaction} = useAppSelector((state) => state.transaction);
  const [mode, setMode] = useState<string>("DETAILED");
  const [cashier, setCashier] = useState<string | undefined>(undefined);
  const [checkboxState, setCheckboxState] = useState({
    pdf: false,
    csv: false,
    textfile: false,
  });
  const navigate = useNavigate();
  const _header = header.data[0];
  const _xreading = xReading.data[0];

  useEffect(() => {
    appDispatch(getCashiers());
  }, []);

  useEffect(() => {
    if (!cashier) return;
    appDispatch(getXRead({usrname: cashier}));
  }, [cashier]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target;
    setMode(value);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const {value} = e.target;
    setCashier(value);
  };
  const handleCheckboxChange = (e: any) => {
    const {name, checked} = e.target;
    handleSetType(name);
    console.log(name);
    setCheckboxState({
      ...checkboxState,
      [name]: checked,
    });
  };

  // handles all button actions view-save-print
  const handleButton = async (btnType: string) => {
    if (!cashier) {
      toast.error("Please select a cashier.", {
        hideProgressBar: true,
        position: 'top-center',
      });
    } else if (
      !checkboxState.csv &&
      !checkboxState.pdf &&
      !checkboxState.textfile
    ) {
      toast.error("Please select a Report File.", {
        hideProgressBar: true,
        position: 'top-center',
      });
    } else {
      switch (btnType) {
        case "SAVE":
          if (checkboxState.textfile) {
            const fileName = `X-Reading-TextFile-${moment().format(
              "MMM-DD-YYYY"
            )}`;
            convertText(formatDataForReceipt(_header, _xreading), fileName);
            postActivity({
              method: METHODS.DOWNLOAD,
              module: MODULES.XREADING,
              remarks: `DOWNLOADED:\nX-READING-TEXT-FILE-${moment().format(
                "MMM-DD-YYYY"
              )}`,
            });
          }
          if (checkboxState.pdf) {
            // const xReadPDFReport = generateReport(
            //   {
            //     header: {
            //       business1: _header.business1 as string,
            //       business2: _header.business2 as string,
            //       business3: _header.business3 as string,
            //       tin: (_header.chknonvat === 0 ? true : false)
            //         ? "VAT Reg."
            //         : "NON-VAT Reg." + ` TIN- ${_header.tin}`,
            //       address1: _header.address1 as string,
            //       address2: _header.address2 as string,
            //       address3: _header.address3 as string,
            //       machserlno: `MIN#: ${_header.machineno} SN#: ${_header.serialno}`,
            //       title: "X-READING",
            //       date: moment().format("MMM-DD-YYYY"),
            //     },
            //     datetime: moment().format("MMM-DD-YYYY hh:mm:ss A"),
            //     cashier: `${_xreading.cashier}`,
            //     sales_data: [
            //       {
            //         label: "Gross Sales",
            //         value: _xreading.sales_summ.gross_sales.toFixed(2),
            //       },
            //       {
            //         label: "Less Paid Void",
            //         value: _xreading.sales_summ.less_post_void.toFixed(2),
            //       },
            //       {
            //         label: "Less Paid Refund",
            //         value: _xreading.sales_summ.less_post_refund.toFixed(2),
            //       },
            //       {
            //         label: "Less Discount",
            //         value: _xreading.sales_summ.less_disc.toFixed(2),
            //       },
            //       {
            //         label: "Less Service Charge",
            //         value: _xreading.sales_summ.less_serv_charge.toFixed(2),
            //       },
            //       {
            //         label: "Less VAT Adj",
            //         value: _xreading.sales_summ.less_vat_adj.toFixed(2),
            //       },
            //       {
            //         label: "Net Sales WVAT",
            //         value: _xreading.sales_summ.net_sales.toFixed(2),
            //       },
            //       {
            //         label: "Net Sales W/O Vat",
            //         value: _xreading.sales_summ.total_non_vat_sales.toFixed(2),
            //       },
            //       {
            //         label: "Total Vat Sales",
            //         value: _xreading.sales_summ.total_vat_sales.toFixed(2),
            //       },
            //       {
            //         label: "Total Vat Amount",
            //         value: _xreading.sales_summ.vat_amount.toFixed(2),
            //       },
            //       {
            //         label: "Local Tax 0%",
            //         value: _xreading.sales_summ.localtax.toFixed(2),
            //       },
            //       {
            //         label: "Local Vat Exempt",
            //         value: _xreading.sales_summ.total_vat_exempt.toFixed(2),
            //       },
            //       {
            //         label: "Total # of Transaction",
            //         value: _xreading.sales_summ.total_numtrans.toFixed(2),
            //       },
            //       {
            //         label: "Total # of Pax",
            //         value: _xreading.sales_summ.total_numpax.toFixed(2),
            //       },
            //       {
            //         label: "Total Quantity",
            //         value: _xreading.sales_summ.total_quantity.toFixed(2),
            //       },
            //     ],
            //     discounts_data: _xreading.discounts.map(
            //       (disc: {discde: any; qty: any; amtdis: number}) => {
            //         return {
            //           label: disc.discde,
            //           qty: disc.qty,
            //           value: disc.amtdis.toFixed(2),
            //         };
            //       }
            //     ),
            //     cash_data: [
            //       {
            //         label: "CASH",
            //         qty: _xreading.cash_tran_summ.cash.qty,
            //         value: _xreading.cash_tran_summ.cash.cashsales.toFixed(2),
            //       },
            //     ],
            //     all_cash_data: [
            //       {
            //         label: "CASH FUND",
            //         value: _xreading.cash_tran_summ.cashfund.toFixed(2),
            //       },
            //       {
            //         label: "CASH IN",
            //         value: _xreading.cash_tran_summ.cash_in.toFixed(2),
            //       },
            //       {
            //         label: "CASH OUT",
            //         value: _xreading.cash_tran_summ.cash_out.toFixed(2),
            //       },
            //       {
            //         label: "CASH IN DRAWER",
            //         value: _xreading.cash_tran_summ.end_cash.toFixed(2),
            //       },
            //       {
            //         label: "POS CASH",
            //         value: _xreading.cash_tran_summ.pos_cash.toFixed(2),
            //       },
            //       {
            //         label: "DECLARATION",
            //         value: _xreading.cash_tran_summ.exp_cash.toFixed(2),
            //       },
            //       {
            //         label: "SHORT/OVER",
            //         value: _xreading.cash_tran_summ.shortover.toFixed(2),
            //       },
            //       {
            //         label: "EXCESS",
            //         value: _xreading.cash_tran_summ.excess.toFixed(2),
            //       },
            //     ],
            //     card_sales_data: _xreading.card_sales.map(
            //       (card: {
            //         cardtype: string;
            //         cardList: {
            //           amount: number;
            //           cardclass: string;
            //           qty: number;
            //         }[];
            //       }) => {
            //         return {
            //           label: card.cardtype,
            //           subLbls: card.cardList,
            //           qty: 0,
            //           value: "",
            //         };
            //       }
            //     ),
            //     other_sales_data: _xreading.othermop.map(
            //       (mop: {
            //         paymenttype: any;
            //         qty: any;
            //         amount: any;
            //         excess: any;
            //       }) => {
            //         return {
            //           label: mop.paymenttype,
            //           qty: parseInt(mop.qty),
            //           value: parseFloat(mop.amount).toFixed(2),
            //         };
            //       }
            //     ),
            //     itemized_sales_data: [
            //       {label: "RED IT", qty: 1, value: "1000.00"},
            //       {label: "BLUE IT", qty: 2, value: "1000.00"},
            //       {label: "GREEN IT", qty: 10, value: "1000.00"},
            //     ],
            //     category_sales_data: [
            //       {label: "FOOD", qty: 1, value: "1000.00"},
            //       {label: "DRINKS", qty: 2, value: "1000.00"},
            //       {label: "DESSERT", qty: 10, value: "1000.00"},
            //     ],
            //     sales_by_dine_type_data: [
            //       {label: "DINE IN", qty: 1, value: "1000.00"},
            //       {
            //         label: "TAKE OUT",
            //         qty: 2,
            //         value: "1000.00",
            //         // isSubData: true,
            //       },
            //       {label: "DELIVERY", qty: 10, value: "1000.00"},
            //     ],
            //     summary_data: [
            //       {label: "Gross Sales", value: "1000.00"},
            //       {label: "Less Post Void", value: "1000.00"},
            //       {label: "Less Post Refund", value: "1000.00"},
            //       {label: "Less Discount", value: "1000.00"},
            //       {label: "Less Service Charge", value: "1000.00"},
            //       {label: "Less VAT Adj", value: "1000.00"},
            //       {label: "Net Sales W VAT", value: "1000.00"},
            //       {label: "Net Sales W/O VAT", value: "1000.00"},
            //       {label: "Total VAT Sales", value: "1000.00"},
            //       {label: "VAT Amount", value: "1000.00"},
            //       {label: "LOCAL TAX 0%", value: "1000.00"},
            //       {label: "Total VAT Exempt", value: "1000.00"},
            //       {label: "Total # of Transaction", value: "1000.00"},
            //       {label: "Total # of PAX", value: "1000.00"},
            //       {label: "Total Quantity", value: "1000.00"},
            //       {label: "Average Sales", value: "1000.00"},
            //     ],
            //     void_data: [
            //       {label: "Beginning Void", value: "1000.00"},
            //       {label: "Ending Void", value: "1000.00"},
            //     ],
            //     post_refund_data: [
            //       {
            //         label: "Beginning OR",
            //         value: _xreading.docnum_summ.beg_or || "",
            //       },
            //       {
            //         label: "Ending OR",
            //         value: _xreading.docnum_summ.end_or || "",
            //       },
            //       {
            //         label: "Ending of Cashier's Report",
            //         value: "",
            //       },
            //     ],
            //   },
            //   false,
            //   "pdf"
            // );

            // const xReadBase64String = fixBase64String(xReadPDFReport as string);
            // downloadBase64AsPDF(
            // xReadBase64String,
            // `X-Reading-PDF-${moment().format("MMM-DD-YYYY")}`
            // );
            generatePDFFile("xread-reciept");
            postActivity({
              method: METHODS.PRINT,
              module: MODULES.XREADING,
              remarks: `PRINTED:\nX-READING-PDF-FILE-${moment().format(
                "MMM-DD-YYYY"
              )}`,
            });
          }
          if (checkboxState.csv) {
            const fileName = `X-Reading-CSV-${moment().format("MMM-DD-YYYY")}`;
            convertCSV(formatDataForReceipt(_header, _xreading), fileName);
            postActivity({
              method: METHODS.DOWNLOAD,
              module: MODULES.XREADING,
              remarks: `DOWNLOADED:\nX-READING-CSV-FILE-${moment().format(
                "MMM-DD-YYYY"
              )}`,
            });
          }
          toast.success("File Saved!", {
            hideProgressBar: true,
            position: 'top-center',
          });
          return;
        case "PRINT":
          if (mode === "SUMMARY") {
            toast.error("Print is not available in Summary.", {
              hideProgressBar: true,
              position: 'top-center',
            });
          } else {
            if (
              (checkboxState.csv && checkboxState.pdf) ||
              (checkboxState.pdf && checkboxState.textfile) ||
              (checkboxState.csv && checkboxState.textfile)
            ) {
              toast.error("Cannot print multiple files.", {
                hideProgressBar: true,
                position: 'top-center',
                autoClose: 1500,
              });
            } else {
              if (checkboxState.pdf) {
                generateXReadingPrintOut(
                  "xread-reciept",
                  xReadingReceiptPrintout(selector)
                );
                postActivity({
                  method: METHODS.PRINT,
                  module: MODULES.XREADING,
                  remarks: `PRINTED:\nX-READING-PDF-FILE-${moment().format(
                    "MMM-DD-YYYY"
                  )}`,
                });
              }
              if (checkboxState.textfile) {
                console.log(templateData);

                const htmlContent = ReactDOMServer.renderToString(
                  <PrintReport
                    isText={true}
                    header={_header}
                    data={formatDataForReceipt(_header, _xreading)}
                  />
                );
                handlePrint("PDF PRINTED", "html", htmlContent);
                postActivity({
                  method: METHODS.PRINT,
                  module: MODULES.XREADING,
                  remarks: `PRINTED:\nX-READING-TEXT-FILE-${moment().format(
                    "MMM-DD-YYYY"
                  )}`,
                });
              }
              if (checkboxState.csv) {
                const htmlContent = ReactDOMServer.renderToString(
                  <PrintReport
                    isCSV={true}
                    header={_header}
                    data={formatDataForReceipt(_header, _xreading)}
                  />
                );
                handlePrint("PDF PRINTED", "html", htmlContent);
                postActivity({
                  method: METHODS.PRINT,
                  module: MODULES.XREADING,
                  remarks: `PRINTED:\nX-READING-CSV-FILE-${moment().format(
                    "MMM-DD-YYYY"
                  )}`,
                });
              }
            }
          }
          // do print
          return;
        case "VIEW":
          if (
            (checkboxState.csv && checkboxState.pdf) ||
            (checkboxState.pdf && checkboxState.textfile) ||
            (checkboxState.csv && checkboxState.textfile)
          ) {
            toast.error("Cannot view multiple files.", {
              hideProgressBar: true,
              position: 'top-center',
              autoClose: 1500,
            });
          } else {
            // handleViewFile();

            if (checkboxState.pdf) {
              viewPdfOrderingReceipt("xread-reciept");
            } else if (checkboxState.csv) {
              viewPdfOrderingReceipt("xread-reciept-csv");
            } else {
              viewPdfOrderingReceipt("xread-reciept-text");
            }

            postActivity({
              method: METHODS.READ,
              module: MODULES.XREADING,
              remarks: `READ:\nX-READING-${moment().format("MMM-DD-YYYY")}`,
            });
          }
          return;
        default:
          break;
      }
    }
  };

  if (lastTransaction.trntyp !== "DECLARATION" && lastTransaction.trntyp !== "GRANDTOTAL") {
    return (
      <div className="flex flex-col align-center justify-center text-center">
        <h3 className="text-red-500 font-bold">
          Cash Declaration has not been performed!
        </h3>
        <button
          onClick={() => {
            dispatch();
            navigate("/pages/cashiering");
          }}
          type="button"
          className="px-4 py-2 rounded border border-solid border-blue-500 hover:bg-blue-500 hover:text-white my-5 mx-3"
        >
          GO TO CASH DECLARATION
        </button>
      </div>
    );
  }

  if (lastTransaction.trntyp === "GRANDTOTAL") {
    return (
      <div className="flex flex-col align-center justify-center text-center">
        <p className="font text-[16px] p-1 mb-2">
          Transaction is lock until next operation at {formatTimeTo12Hour(syspar.data[0].timestart || "00:00:00")}.
        </p>
      </div>
    )
  }

  if (!cashiers.isLoaded) {
    return <h1>Loading....</h1>;
  }

  return (
    <>
      <div className="x-reading flex flex-col gap-4">
        <div className="flex justify-between border p-4 rounded-lg">
          <RadioButton
            name="DETAILED"
            id="detailed"
            radioDatas={[
              {name: "DETAILED", id: "detailed-1", value: "DETAILED"},
            ]}
            handleInputChange={handleInputChange}
            value={mode}
            description=""
          />
          <RadioButton
            name="summary"
            id="summary"
            radioDatas={[{name: "SUMMARY", id: "summary-1", value: "SUMMARY"}]}
            handleInputChange={handleInputChange}
            value={mode}
            description=""
          />
        </div>
        <div className="grid grid-cols-2 border p-4 rounded-lg">
          <div className="col-span-2 flex items-center">
            <p>Select Cashier</p>
          </div>
          <div className="col-span-2 flex items-center">
            <Selection
              value={cashier}
              name="cashier"
              id="cashier"
              keyValuePair={cashiers.data ? cashiers.data : []}
              handleSelectChange={handleSelectChange}
              description=""
              isWidthFull={true}
              className="w-full"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 border p-4 rounded-lg">
          <div className="col-span-4 flex items-center">
            <p>Report File:</p>
          </div>
          <div className="col-span-1 flex items-center">
            <Checkbox
              handleInputChange={handleCheckboxChange}
              checked={checkboxState.pdf}
              id={"pdf"}
              name={"pdf"}
              description={"PDF"}
              className="flex gap-4"
            />
          </div>
          <div className="col-span-1 flex items-center">
            <Checkbox
              handleInputChange={handleCheckboxChange}
              checked={checkboxState.csv}
              id={"csv"}
              name={"csv"}
              description={"CSV File"}
              className="flex gap-4"
            />
          </div>
          <div className="col-span-1 flex items-center">
            <Checkbox
              handleInputChange={handleCheckboxChange}
              checked={checkboxState.textfile}
              id={"textfile"}
              name={"textfile"}
              description={"Text File"}
              className="flex gap-4"
            />
          </div>
        </div>

        <div className="flex justify-evenly  rounded-lg">
          <button
            onClick={() => handleButton("VIEW")}
            type="button"
            className="px-4 py-2 rounded border border-solid border-blue-500 hover:bg-blue-500 hover:text-white my-5 mx-3"
          >
            View
          </button>
          <button
            onClick={() => handleButton("SAVE")}
            type="button"
            className="px-4 py-2 rounded border border-solid border-green-500 hover:bg-green-500 hover:text-white my-5 mx-3"
          >
            Save
          </button>

          <button
            onClick={() => handleButton("PRINT")}
            type="button"
            className="px-4 py-2 rounded border border-solid border-slate-500 hover:bg-slate-500 hover:text-white my-5 mx-3"
          >
            Print
          </button>
        </div>
      </div>

      {/* <div className="absolute top-0 right-0 -z-10 h-full w-[450px] bg-white opacity-[0] ">
        <XReadPrint />
      </div> */}
      {/* <div className="fixed top-0 right-0 -z-10  w-[100%] bg-white opacity-[0] "> */}
      {/* </div> */}
    </>
  );
}
