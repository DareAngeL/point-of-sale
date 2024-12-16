import moment from "moment";
import { numberFormat } from "../../../../helper/NumberFormat";
import { PrintHeader } from "../PrintHeader";

export async function PrintSalesSummary(
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
    vat_exempt_net = 0,
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
      val.sales_summary.less_post_refund +
      val.sales_summary.less_serv_charge +
      val.sales_summary.less_vat_adj;
    xgrand_total_deduction += Number(xsubtotal_deduction);
    less_vat_adj += Number(val.sales_summary.less_vat_adj);
    net_sales += Number(val.sales_summary.net_sales);
    vat_exempt_net += Number(val.sales_summary.vat_exempt_net);
    cash_in += Number(val.cash_tran_summ.cash_in);
    shortover += Number(val.cash_tran_summ.shortover);

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
      numberFormat(val.sales_summary.gt.gt, 2),
      arrayColumn[column],
      initPrint.TOP + 15,
      { align: "right" }
    );
    jspdf.text(
      numberFormat(val.sales_summary.gt.old_gt, 2),
      arrayColumn[column],
      initPrint.TOP + 20,
      { align: "right" }
    );
    jspdf.text(
      numberFormat(val.sales_summary.gross_sales, 2),
      arrayColumn[column],
      initPrint.TOP + 25,
      { align: "right" }
    );
    jspdf.text(numberFormat(0, 2), arrayColumn[column], initPrint.TOP + 30, {
      align: "right",
    });
    jspdf.text(
      numberFormat(val.sales_summary.gross_sales, 2),
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
      numberFormat(val.sales_summary.vat_amount, 2),
      arrayColumn[column],
      initPrint.TOP + 50,
      { align: "right" }
    );
    jspdf.text(
      numberFormat(val.sales_summary.total_vat_exempt, 2),
      arrayColumn[column],
      initPrint.TOP + 55,
      { align: "right" }
    );
    jspdf.text(numberFormat(0, 2), arrayColumn[column], initPrint.TOP + 60, {
      align: "right",
    });
    jspdf.text(
      numberFormat(val.sales_summary.less_serv_charge, 2),
      arrayColumn[column],
      initPrint.TOP + 65,
      { align: "right" }
    );
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
    jspdf.text(
      numberFormat(xother_discount, 2),
      arrayColumn[column],
      initPrint.TOP + 70,
      {
        align: "right",
      }
    );
    jspdf.text(
      numberFormat(xsenior, 2),
      arrayColumn[column],
      initPrint.TOP + 75,
      {
        align: "right",
      }
    );
    jspdf.text(numberFormat(xpwd, 2), arrayColumn[column], initPrint.TOP + 80, {
      align: "right",
    });
    jspdf.text(
      numberFormat(val.sales_summary.serv_charge_disc, 2),
      arrayColumn[column],
      initPrint.TOP + 85,
      { align: "right" }
    );
    jspdf.text(
      numberFormat(val.sales_summary.less_post_refund, 2),
      arrayColumn[column],
      initPrint.TOP + 90,
      { align: "right" }
    );
    jspdf.text(
      numberFormat(val.sales_summary.less_post_void, 2),
      arrayColumn[column],
      initPrint.TOP + 95,
      { align: "right" }
    );
    let xtotal_deduction =
      val.sales_summary.less_disc +
      val.sales_summary.less_post_void +
      val.sales_summary.less_post_refund +
      val.sales_summary.less_serv_charge +
      val.sales_summary.less_vat_adj;
    jspdf.text(
      numberFormat(xtotal_deduction, 2),
      arrayColumn[column],
      initPrint.TOP + 100,
      {
        align: "right",
      }
    );
    jspdf.text(
      numberFormat(0, 2), // VAT on Special Discounts
      arrayColumn[column],
      initPrint.TOP + 105,
      { align: "right" }
    );
    jspdf.text(
      numberFormat(0, 2), // VAT on Returns
      arrayColumn[column],
      initPrint.TOP + 110,
      { align: "right" }
    );
    jspdf.text(
      numberFormat(0, 2), // Others
      arrayColumn[column],
      initPrint.TOP + 115,
      { align: "right" }
    );
    jspdf.text(
      numberFormat(val.sales_summary.less_vat_adj, 2),
      arrayColumn[column],
      initPrint.TOP + 120,
      { align: "right" }
    );
    jspdf.text(
      numberFormat(0, 2), // VAT Payable
      arrayColumn[column],
      initPrint.TOP + 125,
      { align: "right" }
    );
    jspdf.text(
      numberFormat(val.sales_summary.net_sales, 2),
      arrayColumn[column],
      initPrint.TOP + 130,
      { align: "right" }
    );
    jspdf.text(
      numberFormat(val.sales_summary.vat_exempt_net, 2),
      arrayColumn[column],
      initPrint.TOP + 135,
      { align: "right" }
    );
    jspdf.text(
      numberFormat(val.cash_tran_summ.cash_in, 2),
      arrayColumn[column],
      initPrint.TOP + 140,
      { align: "right" }
    );
    jspdf.text(
      numberFormat(val.cash_tran_summ.shortover, 2),
      arrayColumn[column],
      initPrint.TOP + 145,
      { align: "right" }
    );
    jspdf.text(
      numberFormat(val.sales_summary.net_sales + val.cash_tran_summ.cash_in, 2), // net sales + other income
      arrayColumn[column],
      initPrint.TOP + 150,
      { align: "right" }
    );
    jspdf.text(
      numberFormat(0, 2), // Reset Counter
      arrayColumn[column],
      initPrint.TOP + 155,
      { align: "right" }
    );
    jspdf.text(
      numberFormat(val.sales_summary.gt.z_counter, 2),
      arrayColumn[column],
      initPrint.TOP + 160,
      { align: "right" }
    );
    jspdf.text("", arrayColumn[column], initPrint.TOP + 165, {
      align: "right",
    });
    column++;
  }

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
  jspdf.text("N/A", arrayColumn[column], initPrint.TOP + 15, {
    align: "right",
  });
  jspdf.text("N/A", arrayColumn[column], initPrint.TOP + 20, {
    align: "right",
  });
  jspdf.text(
    numberFormat(gross_sales, 2),
    arrayColumn[column],
    initPrint.TOP + 25,
    {
      align: "right",
    }
  );
  jspdf.text(numberFormat(0, 2), arrayColumn[column], initPrint.TOP + 30, {
    align: "right",
  });
  jspdf.text(
    numberFormat(gross_sales, 2),
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
    numberFormat(vat_amount, 2),
    arrayColumn[column],
    initPrint.TOP + 50,
    {
      align: "right",
    }
  );
  jspdf.text(
    numberFormat(total_vat_exempt, 2),
    arrayColumn[column],
    initPrint.TOP + 55,
    {
      align: "right",
    }
  );
  jspdf.text(numberFormat(0, 2), arrayColumn[column], initPrint.TOP + 60, {
    align: "right",
  });
  jspdf.text(
    numberFormat(less_serv_charge, 2),
    arrayColumn[column],
    initPrint.TOP + 65,
    {
      align: "right",
    }
  );
  jspdf.text(
    numberFormat(xgrand_other_discount, 2),
    arrayColumn[column],
    initPrint.TOP + 70,
    { align: "right" }
  );
  jspdf.text(
    numberFormat(xgrand_senior, 2),
    arrayColumn[column],
    initPrint.TOP + 75,
    {
      align: "right",
    }
  );
  jspdf.text(
    numberFormat(xgrand_pwd, 2),
    arrayColumn[column],
    initPrint.TOP + 80,
    {
      align: "right",
    }
  );
  jspdf.text(
    numberFormat(serv_charge_disc, 2),
    arrayColumn[column],
    initPrint.TOP + 85,
    {
      align: "right",
    }
  );
  jspdf.text(
    numberFormat(less_post_refund, 2),
    arrayColumn[column],
    initPrint.TOP + 90,
    {
      align: "right",
    }
  );
  jspdf.text(
    numberFormat(less_post_void, 2),
    arrayColumn[column],
    initPrint.TOP + 95,
    {
      align: "right",
    }
  );
  jspdf.text(
    numberFormat(xgrand_total_deduction, 2),
    arrayColumn[column],
    initPrint.TOP + 100,
    { align: "right" }
  );
  jspdf.text(
    numberFormat(0, 2), // VAT on Special Discounts
    arrayColumn[column],
    initPrint.TOP + 105,
    { align: "right" }
  );
  jspdf.text(
    numberFormat(0, 2), // VAT on Returns
    arrayColumn[column],
    initPrint.TOP + 110,
    { align: "right" }
  );
  jspdf.text(
    numberFormat(0, 2), // Others
    arrayColumn[column],
    initPrint.TOP + 115,
    { align: "right" }
  );
  jspdf.text(
    numberFormat(less_vat_adj, 2),
    arrayColumn[column],
    initPrint.TOP + 120,
    {
      align: "right",
    }
  );
  jspdf.text(
    numberFormat(0, 2), // VAT Payable
    arrayColumn[column],
    initPrint.TOP + 125,
    { align: "right" }
  );
  jspdf.text(
    numberFormat(net_sales, 2),
    arrayColumn[column],
    initPrint.TOP + 130,
    {
      align: "right",
    }
  );
  jspdf.text(
    numberFormat(vat_exempt_net, 2),
    arrayColumn[column],
    initPrint.TOP + 135,
    {
      align: "right",
    }
  );
  jspdf.text(
    numberFormat(cash_in, 2),
    arrayColumn[column],
    initPrint.TOP + 140,
    {
      align: "right",
    }
  );
  jspdf.text(
    numberFormat(shortover, 2),
    arrayColumn[column],
    initPrint.TOP + 145,
    {
      align: "right",
    }
  );
  jspdf.text(
    numberFormat(net_sales, 2 + cash_in), // net sales + other income
    arrayColumn[column],
    initPrint.TOP + 150,
    { align: "right" }
  );
  jspdf.text(
    numberFormat(0, 2), // Reset Counter
    arrayColumn[column],
    initPrint.TOP + 155,
    { align: "right" }
  );
  jspdf.text("N/A", arrayColumn[column], initPrint.TOP + 160, {
    align: "right",
  });
  jspdf.text("", arrayColumn[column], initPrint.TOP + 165, { align: "right" });

  return jspdf;
}
