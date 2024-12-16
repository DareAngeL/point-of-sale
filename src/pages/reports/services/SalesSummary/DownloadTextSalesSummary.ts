import moment from "moment";

export async function DownloadTextSalesSummary(
  reportData: any,
  formValue: any,
  company: any
) {
  let dataFile = "";
  const dtefrom = moment(formValue.dateFrom).format("MM-DD-YYYY");
  const dteto = moment(formValue.dateTo).format("MM-DD-YYYY");
  const datePrinted = moment().format("MM-DD-YYYY");
  let count = 0;

  dataFile += `${company.data[0].comdsc}\n`;
  dataFile += `Sales Summary Report\n`;
  dataFile += `Date From: ${dtefrom} To: ${dteto}\n`;
  dataFile += `Date Printed: ${datePrinted}\n`;
  dataFile += `\n\n`;
  dataFile += `Date\t`;
  dataFile += `Beginning  OR\t`;
  dataFile += `Ending  OR\t`;
  dataFile += `Grand Accum. Sales Ending Balance\t`;
  dataFile += `Grand Accum. Sales Begining Balance\t`;
  dataFile += `Gross Sales for the Day\t`;
  dataFile += `Sales Issued with Manual SI/OR (per RR-16-2018)\t`;
  dataFile += `Gross Sales From POS\t`;
  dataFile += `VATable Sales\t`;
  dataFile += `NON-VATable Sales\t`;
  dataFile += `VAT Amount\t`;
  dataFile += `VAT-Exempt Sales\t`;
  dataFile += `Zero Rated Sales\t`;
  dataFile += `Service Charge\t`;
  dataFile += `Other Discount\t`;
  dataFile += `Senior\t`;
  dataFile += `PWD\t`;
  dataFile += `Service Charge Discount\t`;
  dataFile += `Returns/Refunds\t`;
  dataFile += `Void/Cancelled\t`;
  dataFile += `Total Deductions\t`;
  dataFile += `VAT on Special Discounts\t`;
  dataFile += `VAT on Returns\t`;
  dataFile += `Others\t`;
  dataFile += `Total VAT Adj.\t`;
  dataFile += `VAT Payable\t`;
  dataFile += `Net Sales\t`;
  dataFile += `Other Income\t`;
  dataFile += `Sales Overrun / Overflow\t`;
  dataFile += `Total Net Sales\t`;
  dataFile += `Reset Counter\t`;
  dataFile += `Z-Counter\t`;
  dataFile += `Remarks`;
  dataFile += `\n`;
  let gross_sales = 0,
    total_vat_sales = 0,
    total_non_vat_sales = 0,
    vat_amount = 0,
    total_vat_exempt = 0,
    less_serv_charge = 0,
    xgrand_other_discount = 0,
    xgrand_senior = 0,
    xgrand_pwd = 0,
    serv_charge_disc = 0,
    less_post_void = 0,
    less_post_refund = 0,
    xgrand_total_deduction = 0,
    less_vat_adj = 0,
    net_sales = 0,
    cash_in = 0,
    shortover = 0;

  for (let index = 0; index < reportData.length; index++) {
    const val = reportData[index];
    gross_sales += Number(val.sales_summary.gross_sales);
    total_vat_sales += Number(val.sales_summary.total_vat_sales);
    total_non_vat_sales += Number(val.sales_summary.total_non_vat_sales);
    vat_amount += Number(val.sales_summary.vat_amount);
    total_vat_exempt += Number(val.sales_summary.total_vat_exempt);
    less_serv_charge += Number(val.sales_summary.less_serv_charge);
    val.discounts.forEach((disc: any) => {
      if (disc.discde === "Senior") {
        xgrand_senior += disc.amtdis;
      } else if (disc.discde === "PWD") {
        xgrand_pwd += disc.amtdis;
      } else {
        xgrand_other_discount += disc.amtdis;
      }
    });
    serv_charge_disc += Number(val.sales_summary.serv_charge_disc);
    less_post_void += Number(val.sales_summary.less_post_void);
    less_post_refund += Number(val.sales_summary.less_post_refund);
    let xsubtotal_deduction =
      val.sales_summary.less_disc +
      val.sales_summary.less_post_void +
      val.sales_summary.less_serv_charge +
      val.sales_summary.less_vat_adj;
    xgrand_total_deduction += Number(xsubtotal_deduction);
    less_vat_adj += Number(val.sales_summary.less_vat_adj);
    net_sales += Number(val.sales_summary.net_sales);
    cash_in += Number(val.cash_tran_summ.cash_in);
    shortover += Number(val.cash_tran_summ.shortover);
    dataFile += `${moment(val.date, "YYYY-MM-DD").format("MM-DD-YYYY")}\t`;
    dataFile += `${val.docnum_summ.beg_or}\t`;
    dataFile += `${val.docnum_summ.end_or}\t`;
    dataFile += `${val.sales_summary.gt.gt}\t`;
    dataFile += `${val.sales_summary.gt.old_gt}\t`;
    dataFile += `${val.sales_summary.gross_sales}\t`;
    dataFile += `0\t`;
    dataFile += `${val.sales_summary.gross_sales}\t`;
    dataFile += `${val.sales_summary.total_vat_sales}\t`;
    dataFile += `${val.sales_summary.total_non_vat_sales}\t`;
    dataFile += `${val.sales_summary.vat_amount}\t`;
    dataFile += `${val.sales_summary.total_vat_exempt}\t`;
    dataFile += `0.00\t`;
    dataFile += `${val.sales_summary.less_serv_charge}\t`;

    let xsenior = 0;
    let xpwd = 0;
    let xother_discount = 0;
    val.discounts.forEach((disc: any) => {
      if (disc.discde === "Senior") {
        xsenior += disc.amtdis;
      } else if (disc.discde === "PWD") {
        xpwd += disc.amtdis;
      } else {
        xother_discount += disc.amtdis;
      }
    });
    dataFile += `${xother_discount}\t`;
    dataFile += `${xsenior}\t`;
    dataFile += `${xpwd}\t`;
    dataFile += `${val.sales_summary.serv_charge_disc}\t`;
    dataFile += `${val.sales_summary.less_post_refund}\t`;
    dataFile += `${val.sales_summary.less_post_void}\t`;
    let xtotal_deduction =
      val.sales_summary.less_disc +
      val.sales_summary.less_post_void +
      val.sales_summary.less_serv_charge +
      val.sales_summary.less_vat_adj;
    dataFile += `${xtotal_deduction}\t`;
    dataFile += `0.00\t`;
    dataFile += `0.00\t`;
    dataFile += `0.00\t`;
    dataFile += `${val.sales_summary.less_vat_adj}\t`;
    dataFile += `0.00\t`;
    dataFile += `${val.sales_summary.net_sales}\t`;
    dataFile += `${val.cash_tran_summ.cash_in}\t`;
    dataFile += `${val.cash_tran_summ.shortover}\t`;
    dataFile += `${val.sales_summary.net_sales + val.cash_tran_summ.cash_in}\t`;
    dataFile += `0\t`;
    dataFile += `${val.sales_summary.gt.z_counter}\t`;
    dataFile += ``;
    dataFile += `\n`;
    count++;
  }

  dataFile += `\n`;
  dataFile += `\n`;
  dataFile += `GRAND TOTAL\t`;
  dataFile += `N/A\t`;
  dataFile += `N/A\t`;
  dataFile += `N/A\t`;
  dataFile += `N/A\t`;
  dataFile += `${gross_sales}\t`;
  dataFile += `0\t`;
  dataFile += `${gross_sales}\t`;
  dataFile += `${total_vat_sales}\t`;
  dataFile += `${total_non_vat_sales}\t`;
  dataFile += `${vat_amount}\t`;
  dataFile += `${total_vat_exempt}\t`;
  dataFile += `0.00\t`;
  dataFile += `${less_serv_charge}\t`;
  dataFile += `${xgrand_other_discount}\t`;
  dataFile += `${xgrand_senior}\t`;
  dataFile += `${xgrand_pwd}\t`;
  dataFile += `${serv_charge_disc}\t`;
  dataFile += `${less_post_refund}\t`;
  dataFile += `${less_post_void}\t`;
  dataFile += `${xgrand_total_deduction}\t`;
  dataFile += `0.00\t`;
  dataFile += `0.00\t`;
  dataFile += `0.00\t`;
  dataFile += `${less_vat_adj}\t`;
  dataFile += `0.00\t`;
  dataFile += `${net_sales}\t`;
  dataFile += `${cash_in}\t`;
  dataFile += `${shortover}\t`;
  dataFile += `${net_sales + cash_in}\t`;
  dataFile += `0\t`;
  dataFile += `N/A\t`;
  dataFile += ``;
  dataFile += `\n`;

  return dataFile;
}
