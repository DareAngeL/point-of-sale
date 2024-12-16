import { numberFormat } from "../../../../helper/NumberFormat";

export async function DownloadTextClassAndSubClass(
  reportData: any,
  formValue: any,
  masterFiles: any
) {
  const reportTitle = "Sales Report per Category / Sub-Category";
  let dataFile = "";
  dataFile += `${masterFiles.header.business1}\n`;
  if (masterFiles.header.business2) {
    dataFile += `${masterFiles.header.business2}\n`;
  }
  if (masterFiles.header.business3) {
    dataFile += `${masterFiles.header.business3}\n`;
  }
  dataFile += `${masterFiles.header.address1}\n`;
  if (masterFiles.header.address2) {
    dataFile += `${masterFiles.header.address2}\n`;
  }
  if (masterFiles.header.address3) {
    dataFile += `${masterFiles.header.address3}\n`;
  }
  dataFile += `\n\t\t\t${reportTitle}\n\n`;

  let xgrantotalFooter = "GRANDTOTAL";
  let grandTotalQtyTotal = 0;
  let grandTotalAmtTotal = 0;
  let grandTotal = 0;
  let grandTotalDiscount = 0;
  let grandTotalVatadj = 0;
  let grandTotalVatable = 0;
  let grandTotalVatamount = 0;
  let grandTotalVatexempt = 0;
  let grandTotalVateNet = 0;
  let grandTotalVatexemptLessDisc = 0;

  if (formValue?.dineType && formValue?.dineType.length > 0) {
    dataFile += `\t\t\tQTY\tAMOUNT\tVAT ADJ\tDISCOUNT\tVAT EXEMPT SALES\tVAT EXEMPT LESS DISC\tVATABLE SALES\tVAT AMOUNT\tNET SALES W/ VAT\tNET SALES W/O VAT\n`;
    for (const [keyDine, arrayDine] of Object.entries(reportData)) {
      const xarrayDine: any = arrayDine;
      dataFile += `${
        masterFiles.dineType.find((e: any) => e.postypcde === keyDine).postypdsc
      }\n`;
      let dinetypeQtyTotal = 0;
      let dinetypeAmtTotal = 0;
      let dinetypeTotal = 0;
      let dinetypeDiscount = 0;
      let dinetypeVatadj = 0;
      let dinetypeVatable = 0;
      let dinetypeVatamount = 0;
      let dinetypeVatexempt = 0;
      let dinetypeVateNet = 0;
      let dinetypeVatexemptLessDisc = 0;
      for (const [keyClass, arrayClass] of Object.entries(xarrayDine)) {
        const xarrayClass: any = arrayClass;
        dataFile += `\t${keyClass}\n`;
        let classQtyTotal = 0;
        let classAmtTotal = 0;
        let classTotal = 0;
        let classDiscount = 0;
        let classVatadj = 0;
        let classVatable = 0;
        let classVatamount = 0;
        let classVatexempt = 0;
        let classVateNet = 0;
        let classVatexemptLessDisc = 0;
        for (const xdata_val of Object.values(xarrayClass)) {
          const item: any = xdata_val;
          dataFile += `\t\t${item["itemsubclasscde"]}`;
          dataFile += `\t${numberFormat(item["qty"], 2)}`;
          dataFile += `\t${numberFormat(item["amount"], 2)}`;
          dataFile += `\t${numberFormat(item["vatadj"], 2)}`;
          dataFile += `\t${numberFormat(item["discount"], 2)}`;
          dataFile += `\t${numberFormat(item["xvatexempt"], 2)}`;
          dataFile += `\t${numberFormat(item["xvatexempt_less_disc"], 2)}`;
          dataFile += `\t${numberFormat(item["xvatable"], 2)}`;
          dataFile += `\t${numberFormat(item["xvatamount"], 2)}`;
          dataFile += `\t${numberFormat(item["total"], 2)}`;
          dataFile += `\t${numberFormat(item["vat_exempt_net"], 2)}`;
          dataFile += `\n`;
          classQtyTotal += item["qty"];
          classAmtTotal += item["amount"];
          classTotal += item["total"];
          classDiscount += item["discount"];
          classVatadj += item["vatadj"];
          classVatable += item["xvatable"];
          classVatamount += item["xvatamount"];
          classVatexempt += item["xvatexempt"];
          classVateNet += item["vat_exempt_net"];
          classVatexemptLessDisc += item["xvatexempt_less_disc"];

          dinetypeQtyTotal += item["qty"];
          dinetypeAmtTotal += item["amount"];
          dinetypeTotal += item["total"];
          dinetypeDiscount += item["discount"];
          dinetypeVatadj += item["vatadj"];
          dinetypeVatable += item["xvatable"];
          dinetypeVatamount += item["xvatamount"];
          dinetypeVatexempt += item["xvatexempt"];
          dinetypeVateNet += item["vat_exempt_net"];
          dinetypeVatexemptLessDisc += item["xvatexempt_less_disc"];

          grandTotalQtyTotal += item["qty"];
          grandTotalAmtTotal += item["amount"];
          grandTotal += item["total"];
          grandTotalDiscount += item["discount"];
          grandTotalVatadj += item["vatadj"];
          grandTotalVatable += item["xvatable"];
          grandTotalVatamount += item["xvatamount"];
          grandTotalVatexempt += item["xvatexempt"];
          grandTotalVateNet += item["vat_exempt_net"];
          grandTotalVatexemptLessDisc += item["xvatexempt_less_disc"];
        }
        dataFile += `\t${keyClass}\t`;
        dataFile += `\t${numberFormat(classQtyTotal, 2)}`;
        dataFile += `\t${numberFormat(classAmtTotal, 2)}`;
        dataFile += `\t${numberFormat(classVatadj, 2)}`;
        dataFile += `\t${numberFormat(classDiscount, 2)}`;
        dataFile += `\t${numberFormat(classVatexempt, 2)}`;
        dataFile += `\t${numberFormat(classVatexemptLessDisc, 2)}`;
        dataFile += `\t${numberFormat(classVatamount, 2)}`;
        dataFile += `\t${numberFormat(classVatable, 2)}`;
        dataFile += `\t${numberFormat(classTotal, 2)}`;
        dataFile += `\t${numberFormat(classVateNet, 2)}`;
        dataFile += `\n`;
      }
      dataFile += `${
        masterFiles.dineType.find((e: any) => e.postypcde === keyDine).postypdsc
      }\t\t`;
      dataFile += `\t${numberFormat(dinetypeQtyTotal, 2)}`;
      dataFile += `\t${numberFormat(dinetypeAmtTotal, 2)}`;
      dataFile += `\t${numberFormat(dinetypeVatadj, 2)}`;
      dataFile += `\t${numberFormat(dinetypeDiscount, 2)}`;
      dataFile += `\t${numberFormat(dinetypeVatexempt, 2)}`;
      dataFile += `\t${numberFormat(dinetypeVatexemptLessDisc, 2)}`;
      dataFile += `\t${numberFormat(dinetypeVatamount, 2)}`;
      dataFile += `\t${numberFormat(dinetypeVatable, 2)}`;
      dataFile += `\t${numberFormat(dinetypeTotal, 2)}`;
      dataFile += `\t${numberFormat(dinetypeVateNet, 2)}`;
      dataFile += `\n`;
    }

    xgrantotalFooter = `\n\nGRANDTOTAL\t\t\t`;
  } else {
    dataFile += `\t\tQTY\tAMOUNT\tVAT ADJ\tDISCOUNT\tVAT EXEMPT SALES\tVAT EXEMPT LESS DISC\tVATABLE SALES\tVAT AMOUNT\tNET SALES W/ VAT\tNET SALES W/O VAT\n`;

    for (const [keyClass, arrayClass] of Object.entries(reportData)) {
      const xarrayClass: any = arrayClass;
      dataFile += `${keyClass}\n`;
      let classQtyTotal = 0;
      let classAmtTotal = 0;
      let classTotal = 0;
      let classDiscount = 0;
      let classVatadj = 0;
      let classVatable = 0;
      let classVatamount = 0;
      let classVatexempt = 0;
      let classVateNet = 0;
      let classVatexemptLessDisc = 0;
      for (const xdata_val of Object.values(xarrayClass)) {
        const item: any = xdata_val;
        dataFile += `\t${item["itemsubclasscde"]}`;
        dataFile += `\t${numberFormat(item["qty"], 2)}`;
        dataFile += `\t${numberFormat(item["amount"], 2)}`;
        dataFile += `\t${numberFormat(item["vatadj"], 2)}`;
        dataFile += `\t${numberFormat(item["discount"], 2)}`;
        dataFile += `\t${numberFormat(item["xvatexempt"], 2)}`;
        dataFile += `\t${numberFormat(item["xvatexempt_less_disc"], 2)}`;
        dataFile += `\t${numberFormat(item["xvatable"], 2)}`;
        dataFile += `\t${numberFormat(item["xvatamount"], 2)}`;
        dataFile += `\t${numberFormat(item["total"], 2)}`;
        dataFile += `\t${numberFormat(item["vat_exempt_net"], 2)}`;
        dataFile += `\n`;
        classQtyTotal += item["qty"];
        classAmtTotal += item["amount"];
        classTotal += item["total"];
        classDiscount += item["discount"];
        classVatadj += item["vatadj"];
        classVatable += item["xvatable"];
        classVatamount += item["xvatamount"];
        classVatexempt += item["xvatexempt"];
        classVateNet += item["vat_exempt_net"];
        classVatexemptLessDisc += item["xvatexempt_less_disc"];

        grandTotalQtyTotal += item["qty"];
        grandTotalAmtTotal += item["amount"];
        grandTotal += item["total"];
        grandTotalDiscount += item["discount"];
        grandTotalVatadj += item["vatadj"];
        grandTotalVatable += item["xvatable"];
        grandTotalVatamount += item["xvatamount"];
        grandTotalVatexempt += item["xvatexempt"];
        grandTotalVateNet += item["vat_exempt_net"];
        grandTotalVatexemptLessDisc += item["xvatexempt_less_disc"];
      }
      dataFile += `${keyClass}\t`;
      dataFile += `\t${numberFormat(classQtyTotal, 2)}`;
      dataFile += `\t${numberFormat(classAmtTotal, 2)}`;
      dataFile += `\t${numberFormat(classVatadj, 2)}`;
      dataFile += `\t${numberFormat(classDiscount, 2)}`;
      dataFile += `\t${numberFormat(classVatexempt, 2)}`;
      dataFile += `\t${numberFormat(classVatexemptLessDisc, 2)}`;
      dataFile += `\t${numberFormat(classVatamount, 2)}`;
      dataFile += `\t${numberFormat(classVatable, 2)}`;
      dataFile += `\t${numberFormat(classTotal, 2)}`;
      dataFile += `\t${numberFormat(classVateNet, 2)}`;
      dataFile += `\n`;
    }

    xgrantotalFooter = `\n\nGRANDTOTAL\t\t`;
  }

  dataFile += xgrantotalFooter;
  dataFile += `\t${numberFormat(grandTotalQtyTotal, 2)}`;
  dataFile += `\t${numberFormat(grandTotalAmtTotal, 2)}`;
  dataFile += `\t${numberFormat(grandTotalVatadj, 2)}`;
  dataFile += `\t${numberFormat(grandTotalDiscount, 2)}`;
  dataFile += `\t${numberFormat(grandTotalVatexempt, 2)}`;
  dataFile += `\t${numberFormat(grandTotalVatexemptLessDisc, 2)}`;
  dataFile += `\t${numberFormat(grandTotalVatamount, 2)}`;
  dataFile += `\t${numberFormat(grandTotalVatable, 2)}`;
  dataFile += `\t${numberFormat(grandTotal, 2)}`;
  dataFile += `\t${numberFormat(grandTotalVateNet, 2)}`;

  return dataFile;
}
