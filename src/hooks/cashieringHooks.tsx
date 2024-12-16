import {useCallback, useContext, useState} from "react";
import {useChangeNameModal, useModal} from "./modalHooks";
import {useAppDispatch, useAppSelector} from "../store/store";
import {useService} from "./serviceHooks";
import {CashieringModel} from "../models/cashiering";
import {setHeader} from "../reducer/masterfileSlice";
import {CashieringContext} from "../pages/transaction/cashiering/modal/CashieringModal";
import {toast} from "react-toastify";
import {CashieringTransactType} from "../pages/transaction/cashiering/cashieringEnums";
import {setCashDeclarationTotal} from "../reducer/transactionSlice";
import {setPrinting} from "../reducer/printoutSlice";
import qz from "qz-tray";
import {KEYUTIL, KJUR, stob64, hextorstr} from "jsrsasign";
import {privateKey, certificate} from "../data/printingCerts";
// import {useXZReading} from "./reportHooks";
import moment from "moment";
import {usePDFBuilder} from "../common/pdf/PDFBuilder";
import {PDFCanvas, PDFOptions} from "../common/pdf/PDFBuilderInterface";
import {helperFixName} from "../helper/transaction";
import {formatNumberWithCommasAndDecimals} from "../helper/NumberFormat";
import {useUserActivityLog} from "./useractivitylogHooks";
import {METHODS, MODULES} from "../enums/activitylogs";
import {
  convertToPDF,
  // savePdf
} from "../helper/PdfHelper";
import {useOrderingPrintout} from "../pages/transaction/ordering/hooks/orderingPrintoutHooks";
import {cashieringReceiptPrintout} from "./printer/cashieringReceipt";
import {resetLoading} from "../reducer/transactionSlice";
import { getHeader } from "../store/actions/printout.action";
import { getSinglePrinterStation } from "../store/actions/printerStation.action";
import { PrinterStationModel } from "../models/printerstation";
/**
 * Use this function to handle the cashiering functionality
 */
export function useCashiering() {
  const [inputValue, setInputValue] = useState<string>("0");
  const [openWarningModal, setOpenWarningModal] = useState<boolean>(false);

  const {dispatch} = useModal();
  const {modalNameDispatch} = useChangeNameModal();
  const {saveInputValue} = useContext(CashieringContext);
  const {onSubmitData} = useServiceCashiering();

  const openReasonModal = (trantype: CashieringTransactType) => {
    saveInputValue({input: inputValue, trantype: trantype}); // use to pass the input value to the reason modal
    modalNameDispatch("Add Reason");
    dispatch(); // opens the reason modal
  };

  /**
   * Erases the last character of the input value
   * @returns the modified input value
   */
  const eraseLastInput = () => {
    if (inputValue.length === 1) return setInputValue("0");

    if (inputValue.slice(-1) === ".")
      return setInputValue(inputValue.slice(0, -2));

    setInputValue(inputValue.slice(0, -1));
  };

  /**
   * Use this function to change the input value
   * @param data the data to be added to the input value
   * @returns the modified input value
   */
  const changeInput = (data: string) => {
    if (data.includes(".") && inputValue.includes(".")) {
      return;
    }

    if (inputValue === "0" && data !== ".") {
      setInputValue(data);
      return;
    }

    setInputValue(inputValue + data);
  };

  /**
   * Use this function to clear the input value
   */
  const clearInput = () => {
    setInputValue("0");
  };

  /**
   * Saves the input value
   * @param trantype - current (e.g. "CASHIN") - will be used for the fields in the database
   */
  const saveInput = (trantype: CashieringTransactType, cb?: () => void) => {
    if (
      trantype === CashieringTransactType.CASHIN ||
      trantype === CashieringTransactType.CASHOUT
    ) {
      if (parseFloat(inputValue) === 0) {
        toast.error("Please enter an amount", {
          hideProgressBar: true,
          position: 'top-center',
          autoClose: 1500,
        });
  
        return;
      }

      dispatch(); // closes the cashiering modal
      openReasonModal(trantype);
      return;
    } else {
      dispatch(); // closes the cashiering modal
      onSubmitData(
        {
          input: inputValue,
          trantype: trantype,
        },
        () => {
          cb && cb();
        }
      );
      return;
    }
  };

  return {
    inputValue,
    openWarningModal,
    setOpenWarningModal,
    changeInput,
    clearInput,
    eraseLastInput,
    saveInput,
  };
}

export function useCashDeclaration() {
  const actionDispatch = useAppDispatch();
  const {onSubmitData} = useServiceCashiering();
  const {cashDeclarationTotal} = useAppSelector((state) => state.transaction);
  const [openWarningModal, setOpenWarningModal] = useState<boolean>(false);

  const handleSaveTotal = () => {
    // api call
    return new Promise((resolve) => {
      onSubmitData(
        {
          input: cashDeclarationTotal,
          trantype: CashieringTransactType.CASH_DECLARATION,
        },
        () => resolve(true)
        // undefined,
        // denom
      );
      setTimeout(() => {
        actionDispatch(setCashDeclarationTotal());
      }, 1500);

      // if (cashDeclarationTotal === 0) {
      //   toast.error("Please enter an amount", {
      //     hideProgressBar: true,
      //     position: 'top-center',
      //     autoClose: 1500,
      //   });

      //   reject("Please enter an amount");
      // } else {
        
      // }
    });
  };

  const handleClearTotal = () => {
    actionDispatch(setCashDeclarationTotal());
  };

  return {
    handleSaveTotal,
    handleClearTotal,
    setOpenWarningModal,
    openWarningModal,
  };
}

/**
 * Use this function to transact with the API for the cashiering
 */
export function useServiceCashiering() {
  const apiPath = "posfile";
  const {putData} = useService<CashieringModel>(apiPath);
  const header = useAppSelector((state) => state.masterfile.header);
  const syspar = useAppSelector((state) => state.masterfile.syspar);
  const {account} = useAppSelector((state) => state.account);
  // const {handlePrint} = useXZReading();
  const dispatch = useAppDispatch();
  // const {
  //   // generatePrintout,
  //   generateCashieringPrintOut,
  // } = useCashieringPrintout();
  const selector = useAppSelector((state) => state);

  const {generateOrderingReceipt} = useOrderingPrintout();
  const {postActivity} = useUserActivityLog();

  /**
   * Use this function to retrieve the header for use in the cashiering
   */
  const init = useCallback(async () => {
    if (!header.isLoaded) {
      const _header = await dispatch(getHeader());

      dispatch(setHeader(_header.payload));
    }
    dispatch(resetLoading());
  }, []);

  /**
   * Submit the data to the API
   * @param inputValues {input: the input value, trantype: the transaction type (e.g. "CASHIN/CASHOUT/CASHFUND/DECLARATION") - will be used for "itmcde" & "postrntyp" field in the database}
   * @param reason (optional) the reason for the transaction
   */

  // const {cashDeclarationTotal} = useAppSelector((state) => state.transaction);

  const onSubmitData = (
    inputValues: {input: string | number; trantype: string},
    onSuccess?: () => void
    // reason?: string,
    // denom?: any
  ) => {
    const input =
      typeof inputValues.input === "string"
        ? parseFloat(inputValues.input)
        : inputValues.input;

    const data = {
      cashier: account.data?.usrcde,
      docnum: syspar.data[0].posdocnum,
      billdocnum: syspar.data[0].billdocnum,
      extprc: input,
      itmcde: inputValues.trantype,
      logtim: moment().format("HH:mm:ss.SSS"),
      postrmno: header.data[0].postrmno,
      postrntyp: inputValues.trantype,
      trndte: moment().format("YYYY-MM-DD"),
      brhcde: header.data[0].brhcde,
      trnstat: 1,
      bnkcde: header.data[0].bnkcde,
    } as unknown as CashieringModel;

    console.log("here", data);

    if (!apiPath) {
      toast.error("API path is not yet defined!", {
        hideProgressBar: true,
        position: 'top-center',
      });
      return;
    }

    const toastLoading = toast.loading("Uploading", {
      toastId: "uploading",
      position: 'top-center',
      hideProgressBar: true,
    });

    putData("", data, async (model, error) => {
      toast.dismiss(toastLoading);
      console.log(model);

      if (error) {
        toast.error("Something went wrong. Unable to transact.", {
          hideProgressBar: true,
          position: 'top-center',
          autoClose: 1500,
        });

        console.error(error);
      } else {
        toast.success("Transaction Success", {
          hideProgressBar: true,
          position: 'top-center',
          autoClose: 1500,
        });

        onSuccess && onSuccess();
        //#region activity logging
        switch (inputValues.trantype) {
          case CashieringTransactType.CASHIN:
            postActivity({
              method: METHODS.CREATE,
              module: MODULES.CASHIN,
              remarks: `Cash In: ${input}`,
            });
            break;
          case CashieringTransactType.CASHOUT:
            postActivity({
              method: METHODS.CREATE,
              module: MODULES.CASHOUT,
              remarks: `Cash Out: ${input}`,
            });
            break;
          case CashieringTransactType.CASH_DECLARATION:
            postActivity({
              method: METHODS.CREATE,
              module: MODULES.CASHDECLARATION,
              remarks: `Cash Declaration: ${input}`,
            });
            break;
          case CashieringTransactType.CASHFUND:
            postActivity({
              method: METHODS.CREATE,
              module: MODULES.CASHFUND,
              remarks: `Cash Fund: ${input}`,
            });
            break;
        }
        //#endregion activity logging
        //

        // generateCashieringPrintOut("cashiering-receipt");
        // printing upon save
        await generateOrderingReceipt(
          "cashiering-receipt",
          cashieringReceiptPrintout(selector, input),
          undefined, 2
        );
      }
    });
  };

  return {
    init,
    onSubmitData,
  };
}

export function usePrintReceipt() {
  const appDispatch = useAppDispatch();

  const handlePrintingOnSave = (bool: boolean) => {
    appDispatch(setPrinting(bool));
  };

  const inializePrinter = () => {

    qz.security.setCertificatePromise(function (resolve: any) {
      resolve(certificate);
    });

    try {
      
      qz.security.setSignatureAlgorithm("SHA512"); // Since 2.1
    } catch (error) {
      console.log(error);
    }
    qz.security.setSignaturePromise(function (toSign: any) {
      return function (resolve: any, reject: any) {
        try {
          const pk = KEYUTIL.getKey(privateKey);
          const sig = new KJUR.crypto.Signature({alg: "SHA1withRSA"});
          sig.init(pk);
          sig.updateString(toSign);
          const hex = sig.sign();
          console.log("DEBUG: \n\n" + stob64(hextorstr(hex)));
          resolve(stob64(hextorstr(hex)));
        } catch (err) {
          console.error(err);
          reject(err);
        }
      };
    });
  };

  const qzPrint = async (
    printer: string | null | undefined, 
    content: any,
    copies?: number,
    message?: string,
    configOpts?: any,
    cb?: (isSuccess: boolean) => void
  ) => {
    try {

      if (!qz.websocket.isActive()) {
        await qz.websocket.connect();
        // const config = qz.configs.create("PDF");
      }

      const printerlang = localStorage.getItem("lst_conf_printer_language");

      const opts = configOpts || {copies: copies || 1 };
      if (printerlang) opts['encoding'] = printerlang;

      const printers = await qz.printers.find(printer);
      console.log("printer:", printers);
      const config = qz.configs.create(printer, opts);
      
      await qz.print(config, content);

      if (message) {
        toast.success(message, {
          hideProgressBar: true,
          position: 'top-center',
          autoClose: 1500,
        });
      }
      cb && cb(true);
      appDispatch(setPrinting(false));
      // return await qz.websocket.disconnect();
    } catch (err) {
      console.error(err);
      toast.error(`Printer: ${printer || ''} Not Found`, {
        hideProgressBar: true,
        position: 'top-center',
        autoClose: 1500,
      });
      appDispatch(setPrinting(false));
      cb && cb(false);
      // return await qz.websocket.disconnect();
    }
  }

  /** Prints the sticker printout */
  const handleStickerPrintout = async (content: any, printerStation?: PrinterStationModel, cb?: (isSuccess: boolean) => void) => {
    let printer;
    let stckWidth =  0;
    let stckHeight = 0;

    if (printerStation) {
      printer = printerStation.printername;
      stckWidth = printerStation.stckwidth;
      stckHeight = printerStation.stckheight;
    }

    await qzPrint(printer, content, undefined, undefined, {copies: 1, width: stckWidth, height: stckHeight}, cb);
  }

  /** Prints to the main printer */
  const handlePrintReceipt = async (
    message?: string,
    cb?: (isSuccess: boolean) => void,
    content?: any[],
    copies?: number
  ) => {

    const printer = localStorage.getItem("lst_conf_printer_name");
    await qzPrint(printer, content, copies, message, undefined, cb);
  };

  /** Prints the order ticket receipt */
  const handleOrderTicketReceipt = async (
    locationCode: string,
    message?: string,
    cb?: (isSuccess: boolean) => void,
    content?: any[],
    copies?: number,
  ) => {
    const printer = await appDispatch(getSinglePrinterStation(locationCode));
    if (printer.meta.requestStatus === "fulfilled" && printer.payload) {
      await qzPrint(printer.payload.printername, content, copies, message, undefined, cb);
    }

    console.error("error: cashieringHook.ts:453: UNABLE TO FIND LOCATION CODE");
  };

  return {
    inializePrinter,
    handlePrintReceipt,
    handleStickerPrintout,
    handleOrderTicketReceipt,
    handlePrintingOnSave,
  };
}

export const openDrawer = async (content: any) => {

  if (!qz.websocket.isActive()) {
    await qz.websocket.connect();
  }

  // const printers = await qz.printers.find("CODESOFT PL-330H (Copy 3)");
  const printer = localStorage.getItem("lst_conf_printer_name");

  const config = qz.configs.create(printer, {
    copies: 1,
  });

  console.log("resibo", content);
  
  await qz.print(config, content);

}

export interface CashieringPrintoutData {
  header: any;
  date: string;
  data: any;
  reason?: string;
  denom?: any;
  cashDecTotal?: any;
}

export function useCashieringPrintout() {
  const {buildPDF} = usePDFBuilder();
  const {handlePrintReceipt} = usePrintReceipt();

  const pdfOptions: PDFOptions = {
    orientation: "portrait",
    format: "letter",
    showHeaderEveryPage: false,
    margin: {
      top: 30,
      bottom: 30,
      left: 150,
      right: 150,
    },
    fontSize: 10,
  };

  let pdfBase64 = "";

  const generatePrintout = (printoutData: CashieringPrintoutData) => {
    const {data, header, reason, date, denom} = printoutData;
    const {cashier, itmcde, extprc} = data;
    const {
      address1,
      address2,
      address3,
      business1,
      business2,
      business3,
      tin,
      serialno,
      machineno,
    } = header;

    buildPDF(pdfOptions, (canvas: PDFCanvas) => {
      canvas.createHeader(() => {
        canvas.createText([
          {
            text: business1,
            fontSize: 12,
            fontWeight: "bold",
            align: "center",
          },
          {
            text: business2,
            fontSize: 12,
            fontWeight: "bold",
            align: "center",
          },
          {
            text: business3,
            fontSize: 12,
            fontWeight: "bold",
            align: "center",
          },
          {
            text: tin,
            fontSize: 12,
            fontWeight: "bold",
            align: "center",
          },
          {
            text: address1,
            fontSize: 12,
            fontWeight: "bold",
            align: "center",
          },
          {
            text: address2,
            fontSize: 12,
            fontWeight: "bold",
            align: "center",
          },
          {
            text: address3,
            fontSize: 12,
            fontWeight: "bold",
            align: "center",
          },
          {
            text: `MIN#${machineno} SN#${serialno}`,
            fontSize: 12,
            fontWeight: "bold",
            align: "center",
          },
        ]);

        // header.createHorizontalLine({width: "full_width", style: "dashed"});
      });
      canvas.createSpace(1);
      canvas.createHorizontalLine({width: "full_width", style: "dashed"});
      canvas.createSpace(1);
      canvas.createText([
        {
          text: helperFixName(itmcde) as string,
          fontSize: 14,
          fontWeight: "bold",
          align: "center",
        },
      ]);
      canvas.createText([
        {
          text: date,
          fontSize: 12,
          fontWeight: "normal",
          align: "center",
        },
      ]);
      canvas.createSpace(1);

      canvas.createHorizontalLine({width: "full_width", style: "dashed"});
      canvas.createSpace(1);

      canvas.createText([
        {
          text: `CASHIER: ${cashier}`,
          fontSize: 12,
          fontWeight: "normal",
          align: "left",
        },
      ]);
      canvas.createSpace(1);
      canvas.createText([
        {
          text: `CASHIER: ${cashier}`,
          fontSize: 12,
          fontWeight: "normal",
          align: "left",
        },
      ]);

      // content
      canvas.createHorizontalLine({width: "full_width", style: "dashed"});
      canvas.createSpace(1);

      // cash declaration
      if (denom) {
        canvas.createText([
          {
            text: "Denom Summary",
            fontSize: 12,
            fontWeight: "normal",
            align: "left",
          },
        ]);
        canvas.createSpace(1);

        denom.map((item: any) => {
          const {value, quantity, total} = item;
          // return header.createInlineTexts({
          //   text: [
          //     `${value} x ${quantity}`,
          //     `${formatNumberWithCommasAndDecimals(total)}`,
          //   ],
          //   align: "left",
          //   fontWeight: "normal",
          //   lineItemsAlign: "justify",
          //   fontSize: 12,
          //   // txtSpacing: 20,
          // });
          canvas.createText([
            {
              text: `${value} x ${quantity}`,
              fontSize: 9,
              fontWeight: "normal",
              align: "left",
            },
          ]);
          canvas.createText([
            {
              text: `${formatNumberWithCommasAndDecimals(total)}`,
              fontSize: 9,
              fontWeight: "normal",
              align: "right",
            },
          ]);
        });
        canvas.createSpace(1);

        // total
        canvas.createText([
          {
            text: "TOTAL",
            fontSize: 12,
            fontWeight: "normal",
            align: "left",
          },
        ]);
        canvas.createText([
          {
            text: `${formatNumberWithCommasAndDecimals(extprc)}`,
            fontSize: 12,
            fontWeight: "normal",
            align: "right",
          },
        ]);
      } else {
        // total
        canvas.createText([
          {
            text: "TOTAL",
            fontSize: 12,
            fontWeight: "normal",
            align: "left",
          },
        ]);
        canvas.createText([
          {
            text: `${formatNumberWithCommasAndDecimals(extprc)}`,
            fontSize: 12,
            fontWeight: "normal",
            align: "right",
          },
        ]);
      }

      // for cash in and out
      if (reason) {
        canvas.createSpace(4);
        canvas.createText([
          {
            text: `Reason: ${reason}`,
            fontSize: 12,
            fontWeight: "normal",
            align: "left",
          },
        ]);
      }
      canvas.createSpace(4);

      canvas.createHorizontalLine({width: "full_width", style: "dashed"});
      canvas.createSpace(4);

      // signatures
      canvas.createHorizontalLine({
        width: 100,
        style: "solid",
        align: "center",
      });
      canvas.createText([
        {
          text: "Cashier's Signature",
          fontSize: 12,
          fontWeight: "normal",
          align: "center",
        },
      ]);
      canvas.createSpace(4);

      canvas.createHorizontalLine({
        width: 100,
        style: "solid",
        align: "center",
      });
      canvas.createText([
        {
          text: `Supervisor's Signature`,
          fontSize: 12,
          fontWeight: "normal",
          align: "center",
        },
      ]);
      canvas.createSpace(3);
      canvas.createHorizontalLine({width: "full_width", style: "dashed"});

      canvas.close();
      // canvas.print?.();
      pdfBase64 = canvas.getPDFBase64();
    });
    return pdfBase64;
  };

  // new
  const generateCashieringPrintOut = async (id: string) => {
    let docu = null;
    if (id) docu = document.getElementById(id);
    const pdf = await convertToPDF(docu);
    
    pdf &&
      docu &&
      (await handlePrintReceipt(""));
    // for testing to view the file
    // let docu = null;
    // if (id) {
    //   docu = document.getElementById(id);
    //   // docu && handlePrintReceipt(docu, (docu.offsetHeight / 3.78 + 30 || 0), undefined, "", "pdf");
    // }
    // savePdf(docu);
  };

  return {
    generatePrintout,
    generateCashieringPrintOut,
  };
}
