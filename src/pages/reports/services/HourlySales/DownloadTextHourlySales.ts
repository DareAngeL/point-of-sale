import { numberFormat } from "../../../../helper/NumberFormat";

export async function DownloadTextHourlySales(
  reportData: any,
  formValue: any,
  masterFiles: any
) {
  let GrandQty = 0,
    GrandAmnt = 0,
    GrandVatadj = 0,
    GrandDiscount = 0,
    GrandTotal = 0,
    GrandTC = 0;

  const reportTitle = "Hourly Sales";
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
  dataFile += `\t\tQTY\tAMOUNT\tVAT ADJ\tDISCOUNT\tTOTAL AMNT\tTC\n`;

  for (const [keyHour, arrayHours] of Object.entries(reportData)) {
    if (
      (keyHour === "00:00 - 00:59" && !formValue?.time0) ||
      (keyHour === "01:00 - 01:59" && !formValue?.time1) ||
      (keyHour === "02:00 - 02:59" && !formValue?.time2) ||
      (keyHour === "03:00 - 03:59" && !formValue?.time3) ||
      (keyHour === "04:00 - 04:59" && !formValue?.time4) ||
      (keyHour === "05:00 - 05:59" && !formValue?.time5) ||
      (keyHour === "06:00 - 06:59" && !formValue?.time6) ||
      (keyHour === "07:00 - 07:59" && !formValue?.time7) ||
      (keyHour === "08:00 - 08:59" && !formValue?.time8) ||
      (keyHour === "09:00 - 09:59" && !formValue?.time9) ||
      (keyHour === "10:00 - 10:59" && !formValue?.time10) ||
      (keyHour === "11:00 - 11:59" && !formValue?.time11) ||
      (keyHour === "12:00 - 12:59" && !formValue?.time12) ||
      (keyHour === "13:00 - 13:59" && !formValue?.time13) ||
      (keyHour === "14:00 - 14:59" && !formValue?.time14) ||
      (keyHour === "15:00 - 15:59" && !formValue?.time15) ||
      (keyHour === "16:00 - 16:59" && !formValue?.time16) ||
      (keyHour === "17:00 - 17:59" && !formValue?.time17) ||
      (keyHour === "18:00 - 18:59" && !formValue?.time18) ||
      (keyHour === "19:00 - 19:59" && !formValue?.time19) ||
      (keyHour === "20:00 - 20:59" && !formValue?.time20) ||
      (keyHour === "21:00 - 21:59" && !formValue?.time21) ||
      (keyHour === "22:00 - 22:59" && !formValue?.time22) ||
      (keyHour === "23:00 - 23:59" && !formValue?.time23)
    ) {
      continue;
    }
    const xarrayHours: any = arrayHours;
    dataFile += `${keyHour}\n`;
    for (const [keyOrderType, arrayOrderType] of Object.entries(xarrayHours)) {
      const xarrayOrderType: any = arrayOrderType;
      dataFile += `\t${
        masterFiles.dineType.find((e: any) => e.postypcde === keyOrderType)
          .postypdsc
      }`;
      dataFile += `\t${numberFormat(xarrayOrderType["qty"], 2)}`;
      dataFile += `\t${numberFormat(xarrayOrderType["amt"], 2)}`;
      dataFile += `\t${numberFormat(xarrayOrderType["vatadj"], 2)}`;
      dataFile += `\t${numberFormat(xarrayOrderType["discount"], 2)}`;
      dataFile += `\t${numberFormat(xarrayOrderType["totalamt"], 2)}`;
      dataFile += `\t${numberFormat(xarrayOrderType["tc"], 2)}`;
      dataFile += `\n`;

      GrandQty += parseFloat(xarrayOrderType["qty"]);
      GrandAmnt += parseFloat(xarrayOrderType["amt"]);
      GrandVatadj += parseFloat(xarrayOrderType["vatadj"]);
      GrandDiscount += parseFloat(xarrayOrderType["discount"]);
      GrandTotal += parseFloat(xarrayOrderType["totalamt"]);
      GrandTC += parseFloat(xarrayOrderType["tc"]);
    }
  }
  dataFile += `\n\nGRANDTOTAL\t`;
  dataFile += `\t${numberFormat(GrandQty, 2)}`;
  dataFile += `\t${numberFormat(GrandAmnt, 2)}`;
  dataFile += `\t${numberFormat(GrandVatadj, 2)}`;
  dataFile += `\t${numberFormat(GrandDiscount, 2)}`;
  dataFile += `\t${numberFormat(GrandTotal, 2)}`;
  dataFile += `\t${numberFormat(GrandTC, 2)}`;
  dataFile += `\n`;

  return dataFile;
}
