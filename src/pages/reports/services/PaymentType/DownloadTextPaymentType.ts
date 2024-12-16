import moment from "moment";
import { numberFormat } from "../../../../helper/NumberFormat";

export async function DownloadTextPaymentType(
  reportData: any,
  formValue: any,
  header: any
) {
  const reportTitle = "Payment Type";
  let dataFile = "";
  dataFile += `${header.data[0].business1}\n`;
  dataFile += `${reportTitle}\n`;
  dataFile += `Date From: ${moment(formValue?.dateFrom).format(
    "MM-DD-YYYY"
  )} To ${moment(formValue?.dateTo).format("MM-DD-YYYY")}\n`;
  dataFile += `Date Printed: ${moment().format("MM-DD-YYYY")}\n`;

  dataFile += `\n`;
  dataFile += `ORDOCNUM`;
  dataFile += `\tDATE`;
  dataFile += `\tTIME`;
  dataFile += `\tPAYMENT TYPE`;
  dataFile += `\tAMOUNT`;
  dataFile += `\tCASHIER`;
  dataFile += `\n`;

  let totalAmount = 0;
  for (const xdata_val of Object.values(reportData["detailed"])) {
    const record: any = xdata_val;
    dataFile += `${record["ordocnum"]}`;
    dataFile += `\t${record["date"]}`;
    dataFile += `\t${record["time"]}`;
    dataFile += `\t${record["paymentType"]}`;
    dataFile += `\t${numberFormat(record["amount"], 2)}`;
    dataFile += `\t${record["cashier"].toUpperCase()}`;
    dataFile += `\n`;

    totalAmount += record["amount"];
  }

  dataFile += `\t\t\tTotal`;
  dataFile += `\t${numberFormat(totalAmount, 2)}`;
  dataFile += `\n`;

  dataFile += `PAYMENT TYPE`;
  dataFile += `\tAMOUNT`;
  dataFile += `\n`;

  totalAmount = 0;
  for (const xdata_val of Object.values(reportData["summary"])) {
    let record: any = xdata_val;

    dataFile += `${record["paymentType"]}`;
    dataFile += `\t${numberFormat(record["amount"], 2)}`;
    dataFile += `\n`;

    totalAmount += record["amount"];
  }

  dataFile += `Total`;
  dataFile += `\t${numberFormat(totalAmount, 2)}`;
  dataFile += `\n`;

  return dataFile;
}
