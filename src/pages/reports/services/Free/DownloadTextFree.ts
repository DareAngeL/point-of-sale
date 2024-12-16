import { numberFormat } from "../../../../helper/NumberFormat";

export async function DownloadTextFree(reportData: any, masterFiles: any) {
  let subQty = 0,
    subAmnt = 0,
    subTotal = 0;

  let GrandQty = 0,
    GrandAmnt = 0,
    GrandTotal = 0;

  let finalQty = 0,
    finalAmnt = 0,
    finalTotal = 0;

  const reportTitle = "Free Items/Transactions";
  let dataFile = "";
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

  for (const [keyDate, arrayDate] of Object.entries(reportData["detailed"])) {
    const xarrayDate: any = arrayDate;
    dataFile += `${keyDate}\n`;
    for (const [keyFreeReason, arrayFreeReason] of Object.entries(xarrayDate)) {
      const xarrayFreeReason: any = arrayFreeReason;
      dataFile += `\t${keyFreeReason}\n`;
      for (const xdata_val of Object.values(xarrayFreeReason)) {
        const record: any = xdata_val;
        dataFile += `\t\t${record["itmdsc"]}`;
        dataFile += `\t\t\t`;
        dataFile += `\t${numberFormat(record["amount"], 2)}`;
        dataFile += `\t${numberFormat(record["qty"], 2)}`;
        dataFile += `\t${numberFormat(record["total"], 2)}`;
        dataFile += `\n`;
        subQty += record["qty"];
        subAmnt += record["amount"];
        subTotal += record["total"];
        GrandQty += record["qty"];
        GrandAmnt += record["amount"];
        GrandTotal += record["total"];
        finalQty += record["qty"];
        finalAmnt += record["amount"];
        finalTotal += record["total"];
      }
      dataFile += `\t${keyFreeReason}`;
      dataFile += `\t\t\t\t`;
      dataFile += `\t${numberFormat(subAmnt, 2)}`;
      dataFile += `\t${numberFormat(subQty, 2)}`;
      dataFile += `\t${numberFormat(subTotal, 2)}`;
      dataFile += `\n\n`;
      subQty = 0;
      subAmnt = 0;
      subTotal = 0;
    }
    dataFile += `${keyDate}`;
    dataFile += `\t\t\t\t\t`;
    dataFile += `\t${numberFormat(finalAmnt, 2)}`;
    dataFile += `\t${numberFormat(finalQty, 2)}`;
    dataFile += `\t${numberFormat(finalTotal, 2)}`;
    dataFile += `\n\n`;
    finalQty = 0;
    finalAmnt = 0;
    finalTotal = 0;
  }
  dataFile += `GRANDTOTAL`;
  dataFile += `\t\t\t\t\t`;
  dataFile += `\t${numberFormat(GrandAmnt, 2)}`;
  dataFile += `\t${numberFormat(GrandQty, 2)}`;
  dataFile += `\t${numberFormat(GrandTotal, 2)}`;
  dataFile += `\n\n\n`;

  GrandQty = 0;
  GrandAmnt = 0;
  GrandTotal = 0;

  for (const [keyFreeReason, arrayFreeReason] of Object.entries(
    reportData["summary"]
  )) {
    const xarrayFreeReason: any = arrayFreeReason;
    dataFile += `${keyFreeReason}\n`;
    for (const [keyDate, arrayDate] of Object.entries(xarrayFreeReason)) {
      const xarrayDate: any = arrayDate;
      dataFile += `\t${keyDate}\n`;
      for (const xdata_val of Object.values(xarrayDate)) {
        const record: any = xdata_val;
        dataFile += `\t\t${record["ordocnum"]}`;
        dataFile += `\t\t\t`;
        dataFile += `\t${numberFormat(record["amount"], 2)}`;
        dataFile += `\t${numberFormat(record["qty"], 2)}`;
        dataFile += `\t${numberFormat(record["total"], 2)}`;
        dataFile += `\n`;
        subQty += record["qty"];
        subAmnt += record["amount"];
        subTotal += record["total"];
        GrandQty += record["qty"];
        GrandAmnt += record["amount"];
        GrandTotal += record["total"];
        finalQty += record["qty"];
        finalAmnt += record["amount"];
        finalTotal += record["total"];
      }
      dataFile += `\t${keyDate}`;
      dataFile += `\t\t\t\t`;
      dataFile += `\t${numberFormat(subAmnt, 2)}`;
      dataFile += `\t${numberFormat(subQty, 2)}`;
      dataFile += `\t${numberFormat(subTotal, 2)}`;
      dataFile += `\n\n`;
      subQty = 0;
      subAmnt = 0;
      subTotal = 0;
    }
    dataFile += `${keyFreeReason}`;
    dataFile += `\t\t\t\t\t`;
    dataFile += `\t${numberFormat(finalAmnt, 2)}`;
    dataFile += `\t${numberFormat(finalQty, 2)}`;
    dataFile += `\t${numberFormat(finalTotal, 2)}`;
    dataFile += `\n\n`;
    finalQty = 0;
    finalAmnt = 0;
    finalTotal = 0;
  }
  dataFile += `GRANDTOTAL`;
  dataFile += `\t\t\t\t\t`;
  dataFile += `\t${numberFormat(GrandAmnt, 2)}`;
  dataFile += `\t${numberFormat(GrandQty, 2)}`;
  dataFile += `\t${numberFormat(GrandTotal, 2)}`;
  dataFile += `\n\n\n`;

  return dataFile;
}
