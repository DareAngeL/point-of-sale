import {numberFormat} from "../../../../helper/NumberFormat";

export async function DownloadTextPerDayHourly(
  reportData: any,
  formValue: any,
  masterFiles: any
) {
  let subQty = 0,
    subAmnt = 0,
    subVatadj = 0,
    subRegDiscount = 0,
    subScDiscount = 0,
    subTotal = 0;
  let GrandQty = 0,
    GrandAmnt = 0,
    GrandVatadj = 0,
    GrandRegDiscount = 0,
    GrandScDiscount = 0,
    GrandTotal = 0;

  const reportTitle = "Sales Report per Day / Hour";
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
  dataFile += `Day Type\t\t# of Trans\tTotal Sales Charge\tVat Adj\tSC/PWD Discount\tReg Discount\tTotal Items Sales Amount\n`;

  for (const [keyDay, arrayDays] of Object.entries(reportData)) {
    if (
      (keyDay === "Sunday" && !formValue?.day0) ||
      (keyDay === "Monday" && !formValue?.day1) ||
      (keyDay === "Tuesday" && !formValue?.day2) ||
      (keyDay === "Wednesday" && !formValue?.day3) ||
      (keyDay === "Thursday" && !formValue?.day4) ||
      (keyDay === "Friday" && !formValue?.day5) ||
      (keyDay === "Saturday" && !formValue?.day6)
    ) {
      continue;
    }
    const xarrayDays: any = arrayDays;
    dataFile += `${keyDay}`;
    for (const [keyHour, xarrayHours] of Object.entries(xarrayDays)) {
      const arrayHours: any = xarrayHours;
      if (keyHour === "datelist") {
        if (arrayHours) {
          dataFile += `\t${arrayHours.substring(0, arrayHours.length - 1)}\n`;
        }
      } else if (keyHour === "daycount") {
        dataFile += `\t\t${arrayHours}\n`;
      } else if (
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
      } else {
        dataFile += `\t${keyHour}`;
        dataFile += `\t${arrayHours["numtrans"]}`;
        dataFile += `\t${numberFormat(arrayHours["totalsales"], 2)}`;
        dataFile += `\t${numberFormat(arrayHours["vatadj"], 2)}`;
        dataFile += `\t${numberFormat(arrayHours["scpwddisc"], 2)}`;
        dataFile += `\t${numberFormat(arrayHours["regdisc"], 2)}`;
        dataFile += `\t${numberFormat(arrayHours["totalitemsales"], 2)}`;
        dataFile += `\n`;
        subQty += arrayHours["numtrans"];
        subAmnt += arrayHours["totalsales"];
        subVatadj += arrayHours["vatadj"];
        subScDiscount += arrayHours["scpwddisc"];
        subRegDiscount += arrayHours["regdisc"];
        subTotal += arrayHours["totalitemsales"];
        GrandQty += arrayHours["numtrans"];
        GrandAmnt += arrayHours["totalsales"];
        GrandVatadj += arrayHours["vatadj"];
        GrandScDiscount += arrayHours["scpwddisc"];
        GrandRegDiscount += arrayHours["regdisc"];
        GrandTotal += arrayHours["totalitemsales"];
      }
    }
    dataFile += `\t${keyDay}`;
    dataFile += `\t${numberFormat(subQty, 2)}`;
    dataFile += `\t${numberFormat(subAmnt, 2)}`;
    dataFile += `\t${numberFormat(subVatadj, 2)}`;
    dataFile += `\t${numberFormat(subScDiscount, 2)}`;
    dataFile += `\t${numberFormat(subRegDiscount, 2)}`;
    dataFile += `\t${numberFormat(subTotal, 2)}`;
    dataFile += `\n\n`;

    subQty = 0;
    subAmnt = 0;
    subVatadj = 0;
    subScDiscount = 0;
    subRegDiscount = 0;
    subTotal = 0;
  }
  dataFile += `GrandTotal\t`;
  dataFile += `\t${numberFormat(GrandQty, 2)}`;
  dataFile += `\t${numberFormat(GrandAmnt, 2)}`;
  dataFile += `\t${numberFormat(GrandVatadj, 2)}`;
  dataFile += `\t${numberFormat(GrandScDiscount, 2)}`;
  dataFile += `\t${numberFormat(GrandRegDiscount, 2)}`;
  dataFile += `\t${numberFormat(GrandTotal, 2)}`;

  return dataFile;
}
