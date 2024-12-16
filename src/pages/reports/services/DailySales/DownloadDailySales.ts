import moment from "moment";
import { numberFormat } from "../../../../helper/NumberFormat";

export async function DownloadTextDailySales(
  reportData: any,
  formValue: any,
  company: any
) {
  let dataFile = "";
  const dtefrom = moment(formValue.dateFrom).format("MM-DD-YYYY");
  const dteto = moment(formValue.dateTo).format("MM-DD-YYYY");
  const datePrinted = moment().format("MM-DD-YYYY");
  let count = 0;

  let less_post_void = 0,
    less_post_refund = 0,
    less_disc = 0,
    less_serv_charge = 0,
    less_vat_adj = 0,
    total_vat_sales = 0,
    total_non_vat_sales = 0,
    total_numtrans = 0,
    total_numpax = 0,
    total_quantity = 0,
    cashsales = 0,
    otherpayments = 0,
    beg_cash = 0,
    exp_cash = 0,
    pos_cash = 0,
    end_cash = 0,
    shortover = 0,
    gross_sales = 0,
    net_sales = 0;

  dataFile += `${company.data[0].comdsc}\n`;
  dataFile += `Daily Sales Report\n`;
  dataFile += `Date From: ${dtefrom} To: ${dteto}\n`;
  dataFile += `Date Printed: ${datePrinted}\n`;
  dataFile += `\n\n`;
  for (let index = 0; index < reportData.length; index++) {
    const val = reportData[index];

    less_post_void += Number(val.sales_summary.less_post_void);
    less_post_refund += Number(val.sales_summary.less_post_refund);
    less_disc += Number(val.sales_summary.less_disc);
    less_serv_charge += Number(val.sales_summary.less_serv_charge);
    less_vat_adj += Number(val.sales_summary.less_vat_adj);
    total_vat_sales += Number(val.sales_summary.total_vat_sales);
    total_non_vat_sales += Number(val.sales_summary.total_non_vat_sales);
    total_numtrans += Number(val.sales_summary.total_numtrans);
    total_numpax += Number(val.sales_summary.total_numpax);
    total_quantity += Number(val.sales_summary.total_quantity);
    cashsales += Number(val.cash_tran_summ.cash.cashsales);
    otherpayments += Number(val.otherpayments);
    beg_cash += Number(val.cash_tran_summ.beg_cash);
    exp_cash += Number(val.cash_tran_summ.exp_cash);
    pos_cash += Number(val.cash_tran_summ.pos_cash);
    end_cash += Number(val.cash_tran_summ.end_cash);
    shortover += Number(val.cash_tran_summ.shortover);
    net_sales += Number(val.sales_summary.net_sales);
    gross_sales += Number(val.sales_summary.gross_sales);

    dataFile += `\t\t${moment(val.date).format("MM-DD-YYYY")}\n`;
    dataFile += `Beginning  OR`;
    dataFile += `\t\t${val.docnum_summ.beg_or}\n`;
    dataFile += `Ending  OR`;
    dataFile += `\t\t${val.docnum_summ.end_or}\n`;
    dataFile += `Less Post Refund`;
    dataFile += `\t\t${numberFormat(
      Number(val.sales_summary.less_post_refund),
      2
    )}\n`;
    dataFile += `Less Post Void`;
    dataFile += `\t\t${numberFormat(
      Number(val.sales_summary.less_post_void),
      2
    )}\n`;
    dataFile += `Less Discounts`;
    dataFile += `\t\t${numberFormat(Number(val.sales_summary.less_disc), 2)}\n`;
    dataFile += `Less Service Charge`;
    dataFile += `\t\t${numberFormat(
      Number(val.sales_summary.less_serv_charge),
      2
    )}\n`;
    dataFile += `Less VAT Adj`;
    dataFile += `\t\t${numberFormat(
      Number(val.sales_summary.less_vat_adj),
      2
    )}\n`;
    dataFile += `Total VAT Sales`;
    dataFile += `\t\t${numberFormat(
      Number(val.sales_summary.total_vat_sales),
      2
    )}\n`;
    dataFile += `Total Non VAT Sales`;
    dataFile += `\t\t${numberFormat(
      Number(val.sales_summary.total_non_vat_sales),
      2
    )}\n`;
    dataFile += `Total No. Of Transaction`;
    dataFile += `\t\t${numberFormat(
      Number(val.sales_summary.total_numtrans),
      0
    )}\n`;
    dataFile += `Total No. Of PAX`;
    dataFile += `\t\t${numberFormat(
      Number(val.sales_summary.total_numpax),
      0
    )}\n`;
    dataFile += `Total Qty`;
    dataFile += `\t\t${numberFormat(
      Number(val.sales_summary.total_quantity),
      0
    )}\n`;
    dataFile += `Cash`;
    dataFile += `\t\t${numberFormat(
      Number(val.cash_tran_summ.cash.cashsales),
      2
    )}\n`;
    dataFile += `Other MOP`;
    dataFile += `\t\t${numberFormat(Number(val.otherpayments), 2)}\n`;
    dataFile += `Cash Fund`;
    dataFile += `\t\t${numberFormat(Number(val.cash_tran_summ.beg_cash), 2)}\n`;
    dataFile += `Cash In Drawer`;
    dataFile += `\t\t${numberFormat(Number(val.cash_tran_summ.exp_cash), 2)}\n`;
    dataFile += `POS Cash`;
    dataFile += `\t\t${numberFormat(Number(val.cash_tran_summ.pos_cash), 2)}\n`;
    dataFile += `Declaration`;
    dataFile += `\t\t${numberFormat(Number(val.cash_tran_summ.end_cash), 2)}\n`;
    dataFile += `Short/Over`;
    dataFile += `\t\t${numberFormat(
      Number(val.cash_tran_summ.shortover),
      2
    )}\n`;
    dataFile += `Net Sales`;
    dataFile += `\t\t${numberFormat(Number(val.sales_summary.net_sales), 2)}\n`;
    dataFile += `Gross Sales`;
    dataFile += `\t\t${numberFormat(
      Number(val.sales_summary.gross_sales),
      2
    )}\n`;
    dataFile += `\n\n`;
    count++;
  }
  dataFile += `Grand Total Sales Report\n`;
  dataFile += `Date from`;
  dataFile += `\t\t${dtefrom}\n`;
  dataFile += `Date to`;
  dataFile += `\t\t${dteto}\n\n`;
  dataFile += `Less Post Refund`;
  dataFile += `\t\t${numberFormat(less_post_refund, 2)}\n`;
  dataFile += `Less Post Void`;
  dataFile += `\t\t${numberFormat(less_post_void, 2)}\n`;
  dataFile += `Less Discounts`;
  dataFile += `\t\t${numberFormat(less_disc, 2)}\n`;
  dataFile += `Less Service Charge`;
  dataFile += `\t\t${numberFormat(less_serv_charge, 2)}\n`;
  dataFile += `Less VAT Adj`;
  dataFile += `\t\t${numberFormat(less_vat_adj, 2)}\n`;
  dataFile += `Total VAT Sales`;
  dataFile += `\t\t${numberFormat(total_vat_sales, 2)}\n`;
  dataFile += `Total Non VAT Sales`;
  dataFile += `\t\t${numberFormat(total_non_vat_sales, 2)}\n`;
  dataFile += `Total No. Of Transaction`;
  dataFile += `\t\t${numberFormat(total_numtrans, 0, false)}\n`;
  dataFile += `Total No. Of PAX`;
  dataFile += `\t\t${numberFormat(total_numpax, 0, false)}\n`;
  dataFile += `Total Qty`;
  dataFile += `\t\t${numberFormat(total_quantity, 0)}\n`;
  dataFile += `Cash`;
  dataFile += `\t\t${numberFormat(cashsales, 2)}\n`;
  dataFile += `Other MOP`;
  dataFile += `\t\t${numberFormat(otherpayments, 2)}\n`;
  dataFile += `Cash Fund`;
  dataFile += `\t\t${numberFormat(beg_cash, 2)}\n`;
  dataFile += `Cash In Drawer`;
  dataFile += `\t\t${numberFormat(exp_cash, 2)}\n`;
  dataFile += `POS Cash`;
  dataFile += `\t\t${numberFormat(pos_cash, 2)}\n`;
  dataFile += `Declaration`;
  dataFile += `\t\t${numberFormat(end_cash, 2)}\n`;
  dataFile += `Short/Over`;
  dataFile += `\t\t${numberFormat(shortover, 2)}\n`;
  dataFile += `Net Sales`;
  dataFile += `\t\t${numberFormat(net_sales, 2)}\n`;
  dataFile += `Gross Sales`;
  dataFile += `\t\t${numberFormat(gross_sales, 2)}\n`;
  dataFile += `\n\n`;

  return dataFile;
}
