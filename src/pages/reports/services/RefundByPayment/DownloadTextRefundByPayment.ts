import {numberFormat} from "../../../../helper/NumberFormat";

export async function DownloadTextRefundByPayment(
  reportData: any,
  masterFiles: any
) {
  let GrandAmnt = 0,
    GrandTotal = 0;

  const reportTitle = "Post Refund Transactions";
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
  dataFile += `Tran. Date/Time\tRefund. Date/Time\tCustomer\tOR#\tGross\tNet\tReason\tPayment\tCashier\n`;

  for (const record of reportData) {
    dataFile += `${record["trndte"]} ${record["logtim"]}`;
    dataFile += `${record["refunddte"]} ${record["refundlogtim"]}`;
    dataFile += `\t${record["tablecde"]}`;
    dataFile += `\t${record["ordocnum"]}`;
    dataFile += `\t${numberFormat(record["groext"], 2)}`;
    dataFile += `\t${numberFormat(record["extprc"], 2)}`;
    dataFile += `\t${record["refundreason"]}`;
    dataFile += `\t${record["itmcde"]}`;
    dataFile += `\t${record["cashier"]}`;
    dataFile += `\n`;
    GrandAmnt += record["groext"];
    GrandTotal += record["extprc"];
  }
  dataFile += `\nGRANDTOTAL`;
  dataFile += `\t\t`;
  dataFile += `\t${numberFormat(GrandAmnt, 2)}`;
  dataFile += `\t${numberFormat(GrandTotal, 2)}`;

  return dataFile;
}
