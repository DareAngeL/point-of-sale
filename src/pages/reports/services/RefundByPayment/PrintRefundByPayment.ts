import {numberFormat} from "../../../../helper/NumberFormat";
import {PaperFormat} from "../../enums/report";
import {PrintFooter} from "../PrintFooter";
import {PrintHeader} from "../PrintHeader";
// import {__} from "lodash";
import _ from "lodash";

export async function PrintRefundByPayment(
  jspdf: any,
  reportType: string,
  formValue: any,
  reportData: any,
  initPrint: any,
  masterFiles: any
) {
  let arrayColumn: any = [];
  let pageBreak = 0;
  let itmcdeList: string[] = [];

  arrayColumn[0] = initPrint.LEFT;
  arrayColumn[1] = arrayColumn[0] + 50;
  arrayColumn[2] = arrayColumn[1] + 50;
  arrayColumn[3] = arrayColumn[2] + 35;
  arrayColumn[4] = arrayColumn[3] + 65;
  arrayColumn[5] = arrayColumn[4] + 35;
  arrayColumn[6] = arrayColumn[5] + 25;
  arrayColumn[7] = arrayColumn[6] + 30;
  arrayColumn[8] = arrayColumn[7] + 25;

  let grandRefTotalNet = 0;
  let grandRefTotalGross = 0;

  //subtotals

  const sortedData: any = _.groupBy(reportData, "itmcde");

  for (const recordList of Object.values(sortedData) as any[]) {
    for (const [index, record] of recordList.entries()) {
      let trimText = "";
      let tablecde = record["tablecde"];
      console.log("to bago");
      console.log(record["tablecde"]);
      console.log(record);
      if (jspdf.getTextWidth(tablecde.toString()) >= 23) {
        for (let cntChar = 0; cntChar < tablecde.toString().length; cntChar++) {
          if (Math.ceil(jspdf.getTextWidth(trimText.toString()) + 3) >= 23) {
            tablecde = `${trimText}...`;
            break;
          } else {
            trimText += tablecde[cntChar];
          }
        }
      }
      trimText = "";
      let refundreason = record["refundreason"] ? record["refundreason"] : "";
      if (jspdf.getTextWidth(refundreason.toString()) >= 45) {
        for (
          let cntChar = 0;
          cntChar < refundreason.toString().length;
          cntChar++
        ) {
          if (Math.ceil(jspdf.getTextWidth(trimText.toString()) + 3) >= 45) {
            refundreason = `${trimText}...`;
            break;
          } else {
            trimText += refundreason[cntChar];
          }
        }
      }
      //   group indicator
      if (!itmcdeList.includes(record["itmcde"])) {
        itmcdeList.push(record["itmcde"]);
        initPrint.TOP += 2;
        jspdf.setFont("NotoSansCJKtc-Regular", "bold");
        jspdf.setFontSize(11);
        jspdf.text(record["itmcde"], arrayColumn[0], initPrint.TOP, "left");
        initPrint.TOP += 5;
        jspdf.setFont("NotoSansCJKtc-Regular", "normal");
        jspdf.setFontSize(10);
      }

      // contents
      jspdf.text(
        `${record["trndte"]} ${record["logtim"]}`,
        arrayColumn[0],
        initPrint.TOP,
        "left"
      );
      jspdf.text(
        `${record["refunddte"]} ${record["refundlogtim"]}`,
        arrayColumn[1],
        initPrint.TOP,
        "left"
      );
      jspdf.text(tablecde, arrayColumn[2], initPrint.TOP, "left");
      jspdf.text(record["ordocnum"], arrayColumn[3], initPrint.TOP, "left");
      jspdf.text(
        numberFormat(record["groext"], 2),
        arrayColumn[4],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(record["extprc"], 2),
        arrayColumn[5],
        initPrint.TOP,
        "right"
      );
      jspdf.text(refundreason, arrayColumn[6], initPrint.TOP, "left");
      jspdf.text(record["itmcde"], arrayColumn[7], initPrint.TOP, "left");
      jspdf.text(record["cashier"], arrayColumn[8], initPrint.TOP, "left");
      grandRefTotalNet += parseFloat(record["extprc"]);
      grandRefTotalGross += parseFloat(record["groext"]);
      initPrint.TOP += 5;
      pageBreak =
        initPrint.reportSetup.orientation === "portrait"
          ? initPrint.reportSetup.format === "Letter"
            ? 260
            : 280
          : 195;

      if (index === recordList.length - 1) {
        //   subtotal
        const totalExtprc = recordList.reduce(
          (acc: number, record: any) => acc + record?.extprc,
          0
        );
        const totalGroext = recordList.reduce(
          (acc: number, record: any) => acc + record.groext,
          0
        );

        jspdf.line(
          10,
          initPrint.TOP,
          initPrint.reportSetup.orientation === "portrait"
            ? 205
            : initPrint.reportSetup.format === PaperFormat.Letter
            ? 285
            : 340,
          initPrint.TOP
        );

        initPrint.TOP += 5;

        jspdf.setFont("NotoSansCJKtc-Regular", "bold");
        jspdf.text("SUBTOTAL", arrayColumn[0], initPrint.TOP, "left");
        jspdf.text(
          numberFormat(totalGroext, 2),
          arrayColumn[4],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(totalExtprc, 2),
          arrayColumn[5],
          initPrint.TOP,
          "right"
        );

        initPrint.TOP += 5;
      }

      if (initPrint.TOP > pageBreak) {
        initPrint.TOP = 10;
        jspdf.addPage();
        await PrintHeader(jspdf, reportType, formValue, initPrint, masterFiles);
        await PrintFooter(
          jspdf,
          initPrint.reportSetup,
          initPrint.totalPagesExp
        );
      }
    }
  }

  jspdf.line(
    10,
    initPrint.TOP,
    initPrint.reportSetup.orientation === "portrait"
      ? 205
      : initPrint.reportSetup.format === PaperFormat.Letter
      ? 285
      : 340,
    initPrint.TOP
  );

  initPrint.TOP += 3;
  jspdf.setFont("NotoSansCJKtc-Regular", "bold");

  jspdf.text("GRANDTOTAL", arrayColumn[0], initPrint.TOP, "left");
  jspdf.text(
    numberFormat(grandRefTotalGross, 2),
    arrayColumn[4],
    initPrint.TOP,
    "right"
  );
  jspdf.text(
    numberFormat(grandRefTotalNet, 2),
    arrayColumn[5],
    initPrint.TOP,
    "right"
  );

  initPrint.TOP += 10;
  jspdf.text("SUMMARY", arrayColumn[0], initPrint.TOP, "left");
  initPrint.TOP += 5;

  for (const recordList of Object.entries(sortedData) as any[]) {
    console.log(recordList);

    const totalExtprc = recordList[1].reduce(
      (acc: number, record: any) => acc + record.extprc,
      0
    );

    jspdf.text(recordList[0], arrayColumn[0], initPrint.TOP, "left");
    jspdf.setFont("NotoSansCJKtc-Regular", "bold");
    jspdf.text(
      numberFormat(totalExtprc, 2),
      arrayColumn[1],
      initPrint.TOP,
      "right"
    );
    initPrint.TOP += 5;
  }
  initPrint.TOP += 3;

  jspdf.text("Total", arrayColumn[0], initPrint.TOP, "left");
  jspdf.text(
    numberFormat(grandRefTotalNet, 2),
    arrayColumn[1],
    initPrint.TOP,
    "right"
  );

  if (typeof jspdf.putTotalPages === "function") {
    jspdf.putTotalPages(initPrint.totalPagesExp);
  }

  return jspdf;
}
