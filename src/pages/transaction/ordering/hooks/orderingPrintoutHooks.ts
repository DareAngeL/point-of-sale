import {convertToPDF, saveAsPdf, viewPdf} from "../../../../helper/PdfHelper";
import {usePrintReceipt} from "../../../../hooks/cashieringHooks";
import { PrinterStationModel } from "../../../../models/printerstation";

export function useOrderingPrintout() {
  const {handlePrintReceipt, handleStickerPrintout, handleOrderTicketReceipt, inializePrinter} = usePrintReceipt();

  inializePrinter();

  const generateOrderingPrintout = (id?: string) => {
    let docu = null;

    if (id) {
      docu = document.getElementById(id);
      // docu && handlePrintReceipt(docu, (docu.offsetHeight / 3.78 + 30 || 0), undefined, "", "pdf");
    }

    saveAsPdf(docu);
  };

  const generateOrderTicketReceipt = async (
    locationCode: string,
    id?: string,
    content?: any[],
    cb?: (isSuccess: boolean) => void,
    copies?: number
  ) => {
    let docu = null;

    if (id) docu = document.getElementById(id);
    const pdf = await convertToPDF(docu);

    pdf &&
      docu &&
      (await handleOrderTicketReceipt(locationCode, "pdf", cb, content, copies));

    return pdf;
  };

  const generateOrderingReceipt = async (
    id?: string,
    content?: any[],
    cb?: (isSuccess: boolean) => void,
    copies?: number
  ) => {
    let docu = null;

    if (id) docu = document.getElementById(id);
    const pdf = await convertToPDF(docu);

    pdf &&
      docu &&
      (await handlePrintReceipt("pdf", cb, content, copies));

    return pdf;
  };

  // this will be used when printing receipt for the payment done in ordering
  const generatePaymentReceipt = async (
    id?: string,
    content?: any[],
    cb?: (isSuccess: boolean) => void,
    copies?: number
  ) => {
    let docu = null;

    if (id) docu = document.getElementById(id);
    const pdf = await convertToPDF(docu);

    pdf &&
      docu &&
      (await handlePrintReceipt("", cb, content, copies));

    return pdf;
  };

  const generateStickerPrintout = async (content?: any[], printerstation?: PrinterStationModel, cb?: (isSuccess: boolean) => void) => {
    await handleStickerPrintout(content, printerstation, cb);
  }

  const viewPdfOrderingReceipt = (id?: string) => {
    let docu = null;

    if (id) {
      docu = document.getElementById(id);
      // docu && handlePrintReceipt(docu, (docu.offsetHeight / 3.78 + 30 || 0), undefined, "", "pdf");
    }
    viewPdf(docu);
  };

  return {
    generateOrderingPrintout,
    generateOrderingReceipt,
    generatePaymentReceipt,
    generateStickerPrintout,
    viewPdfOrderingReceipt,
    generateOrderTicketReceipt,
  };
}
