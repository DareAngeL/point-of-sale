import { numberFormat } from "../../../../helper/NumberFormat";

export async function DownloadTextDailyDineType(
  reportData: any,
  masterFiles: any
) {
  const reportTitle = "Sales Report Dine Type";
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
  dataFile += `\t\tQTY\tAMOUNT\tVAT ADJ\tDISCOUNT\tTOTAL AMNT\n`;

  let subQty = 0,
    subAmnt = 0,
    subVatadj = 0,
    subDiscount = 0,
    subTotal = 0;
  let GrandQty = 0,
    GrandAmnt = 0,
    GrandVatadj = 0,
    GrandDiscount = 0,
    GrandTotal = 0;

  for (const [keyDineType, arrayDineType] of Object.entries(reportData)) {
    const xarrayDineType: any = arrayDineType;
    dataFile += `${keyDineType === "DINEIN" ? "DINE IN" : "TAKE OUT"}\n`;
    for (const xdata_val of Object.values(xarrayDineType)) {
      const item: any = xdata_val;
      dataFile += `\t${item["itmdsc"]}`;
      dataFile += `\t${numberFormat(item["qty"], 2)}`;
      dataFile += `\t${numberFormat(item["amount"], 2)}`;
      dataFile += `\t${numberFormat(item["vatadj"], 2)}`;
      dataFile += `\t${numberFormat(item["discount"], 2)}`;
      dataFile += `\t${numberFormat(item["total"], 2)}`;
      dataFile += `\n`;
      subQty += item["qty"];
      subAmnt += item["amount"];
      subVatadj += item["vatadj"];
      subDiscount += item["discount"];
      subTotal += item["total"];
      GrandQty += item["qty"];
      GrandAmnt += item["amount"];
      GrandVatadj += item["vatadj"];
      GrandDiscount += item["discount"];
      GrandTotal += item["total"];
    }
    dataFile += `\n\tSUBTOTAL`;
    dataFile += `\t${numberFormat(subQty, 2)}`;
    dataFile += `\t${numberFormat(subAmnt, 2)}`;
    dataFile += `\t${numberFormat(subVatadj, 2)}`;
    dataFile += `\t${numberFormat(subDiscount, 2)}`;
    dataFile += `\t${numberFormat(subTotal, 2)}`;
    dataFile += `\n`;
    subQty = 0;
    subAmnt = 0;
    subVatadj = 0;
    subDiscount = 0;
    subTotal = 0;
  }
  dataFile += `\n\nGRANDTOTAL\t`;
  dataFile += `\t${numberFormat(GrandQty, 2)}`;
  dataFile += `\t${numberFormat(GrandAmnt, 2)}`;
  dataFile += `\t${numberFormat(GrandVatadj, 2)}`;
  dataFile += `\t${numberFormat(GrandDiscount, 2)}`;
  dataFile += `\t${numberFormat(GrandTotal, 2)}`;
  dataFile += `\n`;

  return dataFile;
}
