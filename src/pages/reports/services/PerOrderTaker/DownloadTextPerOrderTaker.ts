import moment from "moment";
import { numberFormat } from "../../../../helper/NumberFormat";

export async function DownloadTextPerOrderTaker(
  reportData: any,
  formValue: any,
  header: any
) {
  let subQty = 0,
    subAmnt = 0;

  let GrandQty = 0,
    GrandAmnt = 0;

  const reportTitle = "Report per Order Taker / Item";
  let dataFile = "";
  dataFile += `${header.data[0].business1}\n`;
  dataFile += `${reportTitle} (${formValue?.detailedSumOption})\n`;
  dataFile += `Date Covered: ${moment(formValue?.dateFrom).format(
    "MM-DD-YYYY"
  )} to ${moment(formValue?.dateTo).format("MM-DD-YYYY")}\n`;
  dataFile += `Date Generated: ${moment().format("MM-DD-YYYY")}`;
  dataFile += `\n\n`;
  dataFile += `Date\t\tOrder Type\tItem Desc.\tUnit Price\tQty\tAmount\n`;

  for (const order of reportData) {
    dataFile += `${order.usrcde.toUpperCase()}\n`;
    if (order.orders.length > 0) {
      for (const res of order.orders) {
        if (formValue?.detailedSumOption === "detailed") {
          dataFile += `${new Date(res.trndte + " " + res.logtim)
            .toLocaleString()
            .replace(/\//g, "-")}`;
        } else {
          dataFile += `${moment(order.trndte, "YYYY-MM-DD").format(
            "MM-DD-YYYY"
          )}`;
        }

        if (res.itmqty == 0) {
          continue;
        }
        dataFile += `\t\t${order.ordertyp}`;
        dataFile += `\t${res.itemfile ? res.itemfile.itmdsc : res.itmdsc}`;
        dataFile += `\t${numberFormat(res.untprc, 2)}`;
        dataFile += `\t${numberFormat(res.itmqty, 0)}`;
        dataFile += `\t${numberFormat(res.extprc, 2)}`;
        dataFile += `\n`;

        subQty += res.itmqty;
        subAmnt += res.extprc;

        GrandQty += res.itmqty;
        GrandAmnt += res.extprc;
      }
    }
    dataFile += `\nSubtotal`;
    dataFile += `\t\t\t\t`;
    dataFile += `\t${numberFormat(subQty, 2)}`;
    dataFile += `\t${numberFormat(subAmnt, 2)}`;
    dataFile += `\n\n`;
  }
  dataFile += `Grandtotal`;
  dataFile += `\t\t\t\t`;
  dataFile += `\t${numberFormat(GrandQty, 2)}`;
  dataFile += `\t${numberFormat(GrandAmnt, 2)}`;

  return dataFile;
}
