import moment from "moment";
import { numberFormat } from "../../../../helper/NumberFormat";
import { PrintHeader } from "../PrintHeader";

export async function PrintDailySales(
  jspdf: any,
  reportType: string,
  formValue: any,
  reportData: any,
  initPrint: any,
  masterFiles: any
) {
  let arrayColumn: any = [];
  let pageNum = 1;
  let column = 2;
  arrayColumn[1] = initPrint.LEFT;
  arrayColumn[2] = 100;
  arrayColumn[3] = 150;
  arrayColumn[4] = 200;
  arrayColumn[5] = 250;
  arrayColumn[6] = 300;

  // Create Footer
  jspdf.setFontSize(8);
  jspdf.text(`Page ${pageNum}`, 165, 200, { align: "center" });

  jspdf.setFont("NotoSansCJKtc-Regular", "normal");

  let post_void = 0,
    post_refund = 0,
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

  for (let index = 0; index < reportData.length; index++) {
    const val = reportData[index];
    console.log("val", val);
    post_refund += Number(val.sales_summary.less_post_refund);
    post_void += Number(val.sales_summary.less_post_void);
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
    if (column > 6) {
      column = 2;
      jspdf.addPage();
      pageNum++;
      initPrint.TOP = 10;
      await PrintHeader(jspdf, reportType, formValue, initPrint, masterFiles);

      jspdf.setFontSize(8);
      jspdf.text(`Page ${pageNum}`, 165, 200, { align: "center" });
    }
    jspdf.setFont("NotoSansCJKtc-Regular", "bold");
    jspdf.text(
      moment(val.date).format("MM-DD-YYYY"),
      arrayColumn[column],
      initPrint.TOP,
      {
        align: "right",
      }
    );
    jspdf.setFont("NotoSansCJKtc-Regular", "normal");
    jspdf.text(val.docnum_summ.beg_or, arrayColumn[column], initPrint.TOP + 5, {
      align: "right",
    });
    jspdf.text(
      val.docnum_summ.end_or,
      arrayColumn[column],
      initPrint.TOP + 10,
      {
        align: "right",
      }
    );
    jspdf.text(
      numberFormat(val.sales_summary.less_post_refund, 2),
      arrayColumn[column],
      initPrint.TOP + 15,
      { align: "right" }
    );
    jspdf.text(
      numberFormat(val.sales_summary.less_post_void, 2),
      arrayColumn[column],
      initPrint.TOP + 20,
      { align: "right" }
    );
    jspdf.text(
      numberFormat(val.sales_summary.less_disc, 2),
      arrayColumn[column],
      initPrint.TOP + 25,
      { align: "right" }
    );
    jspdf.text(
      numberFormat(val.sales_summary.less_serv_charge, 2),
      arrayColumn[column],
      initPrint.TOP + 30,
      { align: "right" }
    );
    jspdf.text(
      numberFormat(val.sales_summary.less_vat_adj, 2),
      arrayColumn[column],
      initPrint.TOP + 35,
      { align: "right" }
    );
    jspdf.text(
      numberFormat(val.sales_summary.total_vat_sales, 2),
      arrayColumn[column],
      initPrint.TOP + 40,
      { align: "right" }
    );
    jspdf.text(
      numberFormat(val.sales_summary.total_non_vat_sales, 2),
      arrayColumn[column],
      initPrint.TOP + 45,
      { align: "right" }
    );
    jspdf.text(
      numberFormat(val.sales_summary.total_numtrans, 0, false),
      arrayColumn[column],
      initPrint.TOP + 50,
      { align: "right" }
    );
    jspdf.text(
      numberFormat(val.sales_summary.total_numpax, 0, false),
      arrayColumn[column],
      initPrint.TOP + 55,
      { align: "right" }
    );
    jspdf.text(
      numberFormat(val.sales_summary.total_quantity, 0),
      arrayColumn[column],
      initPrint.TOP + 60,
      { align: "right" }
    );
    jspdf.text(
      numberFormat(val.cash_tran_summ.cash.cashsales, 2),
      arrayColumn[column],
      initPrint.TOP + 65,
      { align: "right" }
    );
    jspdf.text(
      numberFormat(val.otherpayments, 2),
      arrayColumn[column],
      initPrint.TOP + 70,
      {
        align: "right",
      }
    );
    jspdf.text(
      numberFormat(val.cash_tran_summ.beg_cash, 2),
      arrayColumn[column],
      initPrint.TOP + 75,
      { align: "right" }
    );
    jspdf.text(
      numberFormat(val.cash_tran_summ.exp_cash, 2),
      arrayColumn[column],
      initPrint.TOP + 80,
      { align: "right" }
    );
    jspdf.text(
      numberFormat(val.cash_tran_summ.pos_cash, 2),
      arrayColumn[column],
      initPrint.TOP + 85,
      { align: "right" }
    );
    jspdf.text(
      numberFormat(val.cash_tran_summ.end_cash, 2),
      arrayColumn[column],
      initPrint.TOP + 90,
      { align: "right" }
    );
    jspdf.text(
      numberFormat(val.cash_tran_summ.shortover, 2),
      arrayColumn[column],
      initPrint.TOP + 95,
      { align: "right" }
    );
    jspdf.text(
      numberFormat(val.sales_summary.net_sales, 2),
      arrayColumn[column],
      initPrint.TOP + 100,
      { align: "right" }
    );
    jspdf.text(
      numberFormat(val.sales_summary.gross_sales, 2),
      arrayColumn[column],
      initPrint.TOP + 105,
      { align: "right" }
    );
    // totalGross += val.sales_summary.gross_sales;
    column++;
  }
  if (column > 6) {
    column = 2;
    jspdf.addPage();
    pageNum++;
    initPrint.TOP = 10;
    PrintHeader(jspdf, reportType, formValue, initPrint, masterFiles);
  }
  jspdf.setFont("NotoSansCJKtc-Regular", "bold");
  jspdf.text("GRAND TOTAL", arrayColumn[column], initPrint.TOP, {
    align: "right",
  });
  jspdf.setFont("NotoSansCJKtc-Regular", "normal");
  jspdf.text("N/A", arrayColumn[column], initPrint.TOP + 5, {
    align: "right",
  });
  jspdf.text("N/A", arrayColumn[column], initPrint.TOP + 10, {
    align: "right",
  });
  jspdf.text(
    numberFormat(post_void, 2),
    arrayColumn[column],
    initPrint.TOP + 15,
    {
      align: "right",
    }
  );
  jspdf.text(
    numberFormat(post_void, 2),
    arrayColumn[column],
    initPrint.TOP + 20,
    {
      align: "right",
    }
  );
  jspdf.text(
    numberFormat(less_disc, 2),
    arrayColumn[column],
    initPrint.TOP + 25,
    {
      align: "right",
    }
  );
  jspdf.text(
    numberFormat(less_serv_charge, 2),
    arrayColumn[column],
    initPrint.TOP + 30,
    {
      align: "right",
    }
  );
  jspdf.text(
    numberFormat(less_vat_adj, 2),
    arrayColumn[column],
    initPrint.TOP + 35,
    {
      align: "right",
    }
  );
  jspdf.text(
    numberFormat(total_vat_sales, 2),
    arrayColumn[column],
    initPrint.TOP + 40,
    {
      align: "right",
    }
  );
  jspdf.text(
    numberFormat(total_non_vat_sales, 2),
    arrayColumn[column],
    initPrint.TOP + 45,
    {
      align: "right",
    }
  );
  jspdf.text(
    total_numtrans.toString(),
    arrayColumn[column],
    initPrint.TOP + 50,
    {
      align: "right",
    }
  );
  jspdf.text(total_numpax.toString(), arrayColumn[column], initPrint.TOP + 55, {
    align: "right",
  });
  jspdf.text(
    total_quantity.toFixed(0).toString(),
    arrayColumn[column],
    initPrint.TOP + 60,
    {
      align: "right",
    }
  );
  jspdf.text(
    numberFormat(cashsales, 2),
    arrayColumn[column],
    initPrint.TOP + 65,
    {
      align: "right",
    }
  );
  jspdf.text(
    numberFormat(otherpayments, 2),
    arrayColumn[column],
    initPrint.TOP + 70,
    {
      align: "right",
    }
  );
  jspdf.text(
    numberFormat(beg_cash, 2),
    arrayColumn[column],
    initPrint.TOP + 75,
    {
      align: "right",
    }
  );
  jspdf.text(
    numberFormat(exp_cash, 2),
    arrayColumn[column],
    initPrint.TOP + 80,
    {
      align: "right",
    }
  );
  jspdf.text(
    numberFormat(pos_cash, 2),
    arrayColumn[column],
    initPrint.TOP + 85,
    {
      align: "right",
    }
  );
  jspdf.text(
    numberFormat(end_cash, 2),
    arrayColumn[column],
    initPrint.TOP + 90,
    {
      align: "right",
    }
  );
  jspdf.text(
    numberFormat(shortover, 2),
    arrayColumn[column],
    initPrint.TOP + 95,
    {
      align: "right",
    }
  );
  jspdf.text(
    numberFormat(net_sales, 2),
    arrayColumn[column],
    initPrint.TOP + 100,
    {
      align: "right",
    }
  );
  jspdf.text(
    numberFormat(gross_sales, 2),
    arrayColumn[column],
    initPrint.TOP + 105,
    {
      align: "right",
    }
  );

  return jspdf;
}
