import {useState} from "react";
import {ApiService} from "../services";
import {useNavigate, useLocation} from "react-router";
import {useModal} from "./modalHooks";
import {setFileType} from "../reducer/reportSlice";
import {useAppDispatch} from "../store/store";
import {usePrintReceipt} from "./cashieringHooks";
import {fixBase64String} from "../helper/FileConversion";
import {convertToPDF, saveAsPdf, viewPdf} from "../helper/PdfHelper";
import moment from "moment";

export function useReports<T>() {
  const [formValue, setFormValue] = useState<T>();

  const onChangeData = (
    name: string,
    value: string,
    checked?: boolean,
    type?: string
  ) => {
    setFormValue(
      (prev) =>
        ({
          ...prev,
          [name]: type == "checkbox" ? checked : value,
        } as T)
    );
  };

  return {
    formValue,
    onChangeData,
    setFormValue,
  };
}

export function useService<T>() {
  const getData = async (
    url: string,
    data: object | undefined,
    cb: (data: T | null, error: Error | null) => void
  ) => {
    let promise = null;

    try {
      promise = (await ApiService.getAll(`${url}`, {params: data})) as T;
      cb(promise, null);
    } catch (err) {
      console.log(err);
      const error = new Error(err as string);
      cb(null, error);
    }

    return promise;
  };

  const postData = async (
    url: string,
    data: T,
    cb: (data: T | null, error: Error | null) => void
  ) => {
    let promise = null;

    try {
      promise = (await ApiService.post(`${url}`, data)) as T;
      cb(promise, null);
    } catch (err) {
      const error = new Error(err as string);
      cb(null, error);
    }
  };

  return {getData, postData};
}

export function useXZReading() {
  const navigate = useNavigate();
  const currentPage = useLocation();
  const {dispatch} = useModal();
  const actionDispatch = useAppDispatch();
  const {inializePrinter, handlePrintReceipt} = usePrintReceipt();

  const handleViewFile = () => {
    navigate(`${currentPage.pathname}/fileView`);

    dispatch();
  };

  const handleSetType = (fileType: string) => {
    actionDispatch(setFileType({fileType}));
  };

  const handlePrint = async (
    printMessage: string | undefined,
    fileType: "pdf" | "html",
    data: any, // on generate report add this -> return pdf.output("datauristring"); - and remove the open blob then call the generate and put it in variable
    cb?: (isSuccess: boolean) => void
  ) => {
    try {
      if (fileType === "html") {
        inializePrinter();
        await handlePrintReceipt(printMessage, cb);
      } else {
        fixBase64String(data);
        inializePrinter();
        await handlePrintReceipt(printMessage, cb);
      }
    } catch (error) {
      console.error("Error converting HTML to PDF:", error);
    }
  };

  // for printing receipts
  const generateXReadingPrintOut = async (id: string, content?: any[]) => {
    // printing
    let docus = null;

    if (id) docus = document.getElementById(id);
    const pdf = await convertToPDF(docus);
    console.log("xxx", docus);
    if (docus) {
      console.log("pareeeh", docus.offsetHeight / 3.78 + 30, docus.offsetWidth);
      console.log("height", docus.offsetHeight);
      console.log("width", docus.offsetWidth);
      console.log("xxx", docus);
      console.log("total", (docus.offsetHeight / 3.78 + 30) / 25.4);
    }

    pdf &&
      docus &&
      (await handlePrintReceipt("pdf", undefined, content));

    // for testing to view the file
    // let docu = null;
    // if (id) {
    //   docu = document.getElementById(id);
    //   // docu && handlePrintReceipt(docu, (docu.offsetHeight / 3.78 + 30 || 0), undefined, "", "pdf");
    // }
    // saveAsPdf(docu, 'testing-view.pdf');
  };

  const generatePDFFile = (id: string) => {
    // for testing to view the file
    let docu = null;
    if (id) {
      docu = document.getElementById(id);
      // docu && handlePrintReceipt(docu, (docu.offsetHeight / 3.78 + 30 || 0), undefined, "", "pdf");
    }
    saveAsPdf(docu, `X-READING ${moment().format("YYYY-MM-DD")}`);
  };

  const viewPdfOrderingReceipt = (id?: string) => {
    let docu = null;

    if (id) {
      docu = document.getElementById(id);
      // docu && handlePrintReceipt(docu, (docu.offsetHeight / 3.78 + 30 || 0), undefined, "", "pdf");
    }
    viewPdf(docu);
  };

  return {
    handleViewFile,
    handleSetType,
    handlePrint,
    generateXReadingPrintOut,
    generatePDFFile,
    viewPdfOrderingReceipt,
  };
}
