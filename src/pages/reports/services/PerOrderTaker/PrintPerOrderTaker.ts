import moment from "moment";
import {numberFormat} from "../../../../helper/NumberFormat";
import {PrintHeader} from "../PrintHeader";
import {useService} from "../../../../hooks/reportHooks";

export async function PrintPerOrderTaker(
  jspdf: any,
  reportType: string,
  formValue: any,
  reportData: any,
  initPrint: any,
  masterFiles: any
) {
  const {getData} = useService<any>();
  let arrayColumn: any = [];
  let pageNum = 1;
  let subtotalQty = 0;
  let subtotalAmt = 0;
  let grandtotalAmt = 0;
  let grandtotalQty = 0;
  console.log("LOOK HERE");
  console.log(formValue);
  console.log(reportData);
  console.log(masterFiles);

  arrayColumn[1] = initPrint.LEFT;
  arrayColumn[2] = 170;
  arrayColumn[3] = 270;
  arrayColumn[4] = 450;
  arrayColumn[5] = 505;
  arrayColumn[6] = 582;

  jspdf.setFont("NotoSansCJKtc-Regular", "bold");
  jspdf.text(`PAGE ${pageNum}`, arrayColumn[3], 782);
  jspdf.setFont("NotoSansCJKtc-Regular", "normal");

  for (const order of reportData) {
    if (order.orders.length > 0) {
      initPrint.TOP += 15;
      jspdf.setFont("NotoSansCJKtc-Regular", "bold");
      jspdf.text(order.usrcde.toUpperCase(), arrayColumn[1], initPrint.TOP);
      jspdf.setFont("NotoSansCJKtc-Regular", "normal");

      for (const res of order.orders) {
        initPrint.TOP += 10;
        if (formValue?.detailedSumOption === "detailed") {
          jspdf.text(
            new Date(res.trndte + " " + res.logtim)
              .toLocaleString()
              .replace(/\//g, "-"),
            arrayColumn[1],
            initPrint.TOP
          );
        } else {
          jspdf.text(
            moment(order.trndte, "YYYY-MM-DD").format("MM-DD-YYYY"),
            arrayColumn[1],
            initPrint.TOP
          );
        }

        const refund = await getData(
          "posfile/filter",
          {
            ordocnum: res.ordocnum,
            orderitmid: res.orderitmid,
            itmcde: res.itmcde,
            refund: 1,
            postrntyp: "ITEM",
            trndte: res.trndte,
          },
          () => {}
        );
        if (refund.data.length > 0) {
          refund.data.map(async (resRefund: any) => {
            res.itmqty = res.itmqty - resRefund.refundqty;
            res.extprc = res.extprc - resRefund.extprc;
          });
        }

        if (res.itmqty == 0) {
          continue;
        }
        jspdf.text(order.ordertyp, arrayColumn[2], initPrint.TOP);
        jspdf.text(
          res.itemfile ? res.itemfile.itmdsc : res.itmdsc,
          arrayColumn[3],
          initPrint.TOP
        );
        jspdf.text(numberFormat(res.untprc, 2), arrayColumn[4], initPrint.TOP, {
          align: "right",
        });
        jspdf.text(numberFormat(res.itmqty, 0), arrayColumn[5], initPrint.TOP, {
          align: "right",
        });
        jspdf.text(numberFormat(res.extprc, 2), arrayColumn[6], initPrint.TOP, {
          align: "right",
        });

        subtotalQty += parseFloat(res.itmqty);
        subtotalAmt += parseFloat(res.extprc);
        if (initPrint.TOP > 760) {
          initPrint.TOP = 30;
          jspdf.addPage();
          await PrintHeader(
            jspdf,
            reportType,
            formValue,
            initPrint,
            masterFiles
          );
          initPrint.TOP += 5;
          pageNum++;
          jspdf.setFont("NotoSansCJKtc-Regular", "bold");
          jspdf.text(`PAGE ${pageNum}`, arrayColumn[3], 782);
          jspdf.setFont("NotoSansCJKtc-Regular", "normal");
        }
      }
      initPrint.TOP += 10;
      jspdf.line(arrayColumn[1], initPrint.TOP, arrayColumn[6], initPrint.TOP);
      initPrint.TOP += 10;
      jspdf.setFont("NotoSansCJKtc-Regular", "bold");
      jspdf.text("Sub-Total", arrayColumn[1], initPrint.TOP);
      jspdf.text(numberFormat(subtotalQty, 0), arrayColumn[5], initPrint.TOP, {
        align: "right",
      });
      jspdf.text(numberFormat(subtotalAmt, 2), arrayColumn[6], initPrint.TOP, {
        align: "right",
      });
      jspdf.setFont("NotoSansCJKtc-Regular", "normal");
    }

    grandtotalAmt += subtotalAmt;
    grandtotalQty += subtotalQty;
    subtotalQty = 0;
    subtotalAmt = 0;
  }

  initPrint.TOP += 15;
  jspdf.line(arrayColumn[1], initPrint.TOP, arrayColumn[6], initPrint.TOP);
  initPrint.TOP += 10;
  jspdf.setFont("NotoSansCJKtc-Regular", "bold");
  jspdf.text("Grand Total", arrayColumn[1], initPrint.TOP);
  jspdf.text(numberFormat(grandtotalQty, 0), arrayColumn[5], initPrint.TOP, {
    align: "right",
  });
  jspdf.text(numberFormat(grandtotalAmt, 2), arrayColumn[6], initPrint.TOP, {
    align: "right",
  });

  return jspdf;
}
