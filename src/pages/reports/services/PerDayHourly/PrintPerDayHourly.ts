import {numberFormat} from "../../../../helper/NumberFormat";
import {PrintFooter} from "../PrintFooter";
import {PrintHeader} from "../PrintHeader";

export async function PrintPerDayHourly(
  jspdf: any,
  reportType: string,
  formValue: any,
  reportData: any,
  initPrint: any,
  masterFiles: any
) {
  console.log("pinasa");
  console.log(reportData);
  console.log(formValue);
  console.log(masterFiles);

  let arrayColumn: any = [];
  let pageBreak = 0;

  arrayColumn[0] = initPrint.LEFT;
  arrayColumn[1] = arrayColumn[0] + 60;
  arrayColumn[2] = arrayColumn[1] + 50;
  arrayColumn[3] = arrayColumn[2];
  arrayColumn[4] = arrayColumn[3] + 50;
  arrayColumn[5] = arrayColumn[4] + 50;
  arrayColumn[6] = arrayColumn[5] + 50;
  arrayColumn[7] = arrayColumn[6] + 60;

  const lineLength = 340;

  let grandTotalNumTrans = 0;
  let grandTotalSales = 0;
  let grandTotalServiceCharge = 0;
  let grandTotalVatAdj = 0;
  let grandTotalSCPWDDisc = 0;
  let grandTotalRegDisc = 0;
  let grandTotalItemSales = 0;

  if (formValue?.dineType && formValue?.dineType.length > 0) {
    console.log("rep: ", reportData);
    

    for (const [keyDine, arrayDine] of Object.entries(reportData)) {
      jspdf.setFont("NotoSansCJKtc-Regular", "bold");
      jspdf.text(
        masterFiles.dineType.find((e: any) => e.postypcde === keyDine)
          .postypdsc,
        arrayColumn[0],
        initPrint.TOP,
        "left"
      );
      initPrint.TOP += 5;
      let dineTotalNumTrans = 0; //
      let dineTotalSales = 0; //
      let dineTotalServiceCharge = 0;
      let dineTotalVatAdj = 0; //
      let dineTotalSCPWDDisc = 0; //
      let dineTotalRegDisc = 0; //
      let dineTotalItemSales = 0; //
      const xarrayDine: any = arrayDine;
      for (const [keyDay, arrayDays] of Object.entries(xarrayDine)) {
        if (
          (keyDay === "Sunday" && !formValue?.day0) ||
          (keyDay === "Monday" && !formValue?.day1) ||
          (keyDay === "Tuesday" && !formValue?.day2) ||
          (keyDay === "Wednesday" && !formValue?.day3) ||
          (keyDay === "Thursday" && !formValue?.day4) ||
          (keyDay === "Friday" && !formValue?.day5) ||
          (keyDay === "Saturday" && !formValue?.day6)
        ) {
          console.log("Key", keyDay);
          // continue;
        }

        jspdf.setFont("NotoSansCJKtc-Regular", "bold");
        jspdf.text(keyDay, arrayColumn[0] + 5, initPrint.TOP, "left");

        let subTotalNumTrans = 0;
        let subTotalSales = 0;
        let subTotalServiceCharge = 0;
        let subTotalVatAdj = 0;
        let subTotalSCPWDDisc = 0;
        let subTotalRegDisc = 0;
        let subTotalItemSales = 0;
        const xarrayDays: any = arrayDays;

        for (const [keyHour, xarrayHours] of Object.entries(xarrayDays)) {
          const arrayHours: any = xarrayHours;
          if (keyHour === "daycount") {
            console.log("daycount");
            jspdf.text(
              numberFormat(arrayHours, 0, false),
              arrayColumn[1],
              initPrint.TOP,
              "right"
            );
            initPrint.TOP += 5;
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
            jspdf.text(keyHour, arrayColumn[0] + 5, initPrint.TOP, "left");
            jspdf.text(
              numberFormat(arrayHours["numtrans"], 0, false),
              arrayColumn[1],
              initPrint.TOP,
              "right"
            );
            jspdf.text(
              numberFormat(arrayHours["totalsales"], 2),
              arrayColumn[2],
              initPrint.TOP,
              "right"
            );
            jspdf.text(
              numberFormat(arrayHours["vatadj"], 2),
              arrayColumn[4],
              initPrint.TOP,
              "right"
            );
            jspdf.text(
              numberFormat(arrayHours["scpwddisc"], 2),
              arrayColumn[5],
              initPrint.TOP,
              "right"
            );
            jspdf.text(
              numberFormat(arrayHours["regdisc"], 2),
              arrayColumn[6],
              initPrint.TOP,
              "right"
            );
            jspdf.text(
              numberFormat(arrayHours["totalitemsales"], 2),
              arrayColumn[7],
              initPrint.TOP,
              "right"
            );

            subTotalNumTrans += arrayHours["numtrans"];

            subTotalSales += parseFloat(arrayHours["totalsales"]);
            subTotalServiceCharge += parseFloat(arrayHours["servicecharge"]);
            subTotalVatAdj += parseFloat(arrayHours["vatadj"]);
            subTotalSCPWDDisc += parseFloat(arrayHours["scpwddisc"]);
            subTotalRegDisc += parseFloat(arrayHours["regdisc"]);
            subTotalItemSales += parseFloat(arrayHours["totalitemsales"]);

            dineTotalNumTrans += arrayHours["numtrans"];
            dineTotalSales += parseFloat(arrayHours["totalsales"]);
            dineTotalServiceCharge += parseFloat(arrayHours["servicecharge"]);
            dineTotalVatAdj += parseFloat(arrayHours["vatadj"]);
            dineTotalSCPWDDisc += parseFloat(arrayHours["scpwddisc"]);
            dineTotalRegDisc += parseFloat(arrayHours["regdisc"]);
            dineTotalItemSales += parseFloat(arrayHours["totalitemsales"]);

            grandTotalNumTrans += arrayHours["numtrans"];
            grandTotalSales += parseFloat(arrayHours["totalsales"]);
            grandTotalServiceCharge += parseFloat(arrayHours["servicecharge"]);
            grandTotalVatAdj += parseFloat(arrayHours["vatadj"]);
            grandTotalSCPWDDisc += parseFloat(arrayHours["scpwddisc"]);
            grandTotalRegDisc += parseFloat(arrayHours["regdisc"]);
            grandTotalItemSales += parseFloat(arrayHours["totalitemsales"]);

            initPrint.TOP += 5;

            pageBreak =
              initPrint.reportSetup.orientation === "portrait"
                ? initPrint.reportSetup.format === "Letter"
                  ? 280
                  : 300
                : 195;
            if (initPrint.TOP > pageBreak) {
              initPrint.TOP = 10;
              jspdf.addPage();
              await PrintHeader(
                jspdf,
                reportType,
                formValue,
                initPrint,
                masterFiles
              );
              await PrintFooter(
                jspdf,
                initPrint.reportSetup,
                initPrint.totalPagesExp
              );
            }
          }
        }

        jspdf.line(10, initPrint.TOP, lineLength, initPrint.TOP);
        initPrint.TOP += 3;
        jspdf.setFont("NotoSansCJKtc-Regular", "bold");

        jspdf.text(keyDay, arrayColumn[0] + 5, initPrint.TOP, "left");
        jspdf.text(
          numberFormat(subTotalNumTrans, 0, false),
          arrayColumn[1],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(subTotalSales, 2),
          arrayColumn[2],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(subTotalVatAdj, 2),
          arrayColumn[4],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(subTotalSCPWDDisc, 2),
          arrayColumn[5],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(subTotalRegDisc, 2),
          arrayColumn[6],
          initPrint.TOP,
          "right"
        );
        jspdf.text(
          numberFormat(subTotalItemSales, 2),
          arrayColumn[7],
          initPrint.TOP,
          "right"
        );

        initPrint.TOP += 8;
      }

      jspdf.line(10, initPrint.TOP, lineLength, initPrint.TOP);
      initPrint.TOP += 3;
      jspdf.setFont("NotoSansCJKtc-Regular", "bold");

      jspdf.text(
        masterFiles.dineType.find((e: any) => e.postypcde === keyDine)
          .postypdsc,
        arrayColumn[0],
        initPrint.TOP,
        "left"
      );
      jspdf.text(
        numberFormat(dineTotalNumTrans, 0, false),
        arrayColumn[1],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(dineTotalSales, 2),
        arrayColumn[2],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(dineTotalVatAdj, 2),
        arrayColumn[4],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(dineTotalSCPWDDisc, 2),
        arrayColumn[5],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(dineTotalRegDisc, 2),
        arrayColumn[6],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(dineTotalItemSales, 2),
        arrayColumn[7],
        initPrint.TOP,
        "right"
      );

      initPrint.TOP += 15;
    }

    pageBreak =
      initPrint.reportSetup.orientation === "portrait"
        ? initPrint.reportSetup.format === "Letter"
          ? 280
          : 300
        : 195;
    if (initPrint.TOP > pageBreak) {
      initPrint.TOP = 10;
      jspdf.addPage();
      await PrintHeader(
        jspdf,
        reportType,
        formValue,
        initPrint,
        masterFiles
      );
      await PrintFooter(
        jspdf,
        initPrint.reportSetup,
        initPrint.totalPagesExp
      );
    }
  } else {
    console.log("xarray: ", reportData);

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
        console.log("KeyDine", keyDay);
        // continue;
      }

      jspdf.setFont("NotoSansCJKtc-Regular", "bold");
      jspdf.text(keyDay, arrayColumn[0], initPrint.TOP, "left");

      let subTotalNumTrans = 0;
      let subTotalSales = 0;
      let subTotalServiceCharge = 0;
      let subTotalVatAdj = 0;
      let subTotalSCPWDDisc = 0;
      let subTotalRegDisc = 0;
      let subTotalItemSales = 0;
      const xarrayDays: any = arrayDays;

      for (const [keyHour, xarrayHours] of Object.entries(xarrayDays)) {
        const arrayHours: any = xarrayHours;

        console.log("hourssss: ", arrayHours);

        if (keyHour === "daycount") {
          jspdf.text(
            numberFormat(arrayHours, 0, false),
            arrayColumn[1],
            initPrint.TOP,
            "right"
          );
          initPrint.TOP += 5;
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
          jspdf.text(keyHour, arrayColumn[0] + 5, initPrint.TOP, "left");
          jspdf.text(
            numberFormat(arrayHours["numtrans"], 0, false),
            arrayColumn[1],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(arrayHours["totalsales"], 2),
            arrayColumn[2],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(arrayHours["vatadj"], 2),
            arrayColumn[4],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(arrayHours["scpwddisc"], 2),
            arrayColumn[5],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(arrayHours["regdisc"], 2),
            arrayColumn[6],
            initPrint.TOP,
            "right"
          );
          jspdf.text(
            numberFormat(arrayHours["totalitemsales"], 2),
            arrayColumn[7],
            initPrint.TOP,
            "right"
          );

          subTotalNumTrans += parseFloat(arrayHours["numtrans"]);
          subTotalSales += parseFloat(arrayHours["totalsales"]);
          subTotalServiceCharge += parseFloat(arrayHours["servicecharge"]);
          subTotalVatAdj += parseFloat(arrayHours["vatadj"]);
          subTotalSCPWDDisc += parseFloat(arrayHours["scpwddisc"]);
          subTotalRegDisc += parseFloat(arrayHours["regdisc"]);
          subTotalItemSales += parseFloat(arrayHours["totalitemsales"]);

          grandTotalNumTrans += parseFloat(arrayHours["numtrans"]);
          grandTotalSales += parseFloat(arrayHours["totalsales"]);

          grandTotalServiceCharge += parseFloat(arrayHours["servicecharge"]);
          grandTotalVatAdj += parseFloat(arrayHours["vatadj"]);
          grandTotalSCPWDDisc += parseFloat(arrayHours["scpwddisc"]);
          grandTotalRegDisc += parseFloat(arrayHours["regdisc"]);
          grandTotalItemSales += parseFloat(arrayHours["totalitemsales"]);

          console.log("logxx: ", grandTotalSales);
          console.log("logxx2: ", arrayHours["totalsales"]);

          initPrint.TOP += 5;

          pageBreak =
            initPrint.reportSetup.orientation === "portrait"
              ? initPrint.reportSetup.format === "Letter"
                ? 280
                : 300
              : 195;
          if (initPrint.TOP > pageBreak) {
            initPrint.TOP = 10;
            jspdf.addPage();
            await PrintHeader(
              jspdf,
              reportType,
              formValue,
              initPrint,
              masterFiles
            );
            await PrintFooter(
              jspdf,
              initPrint.reportSetup,
              initPrint.totalPagesExp
            );
          }
        }
      }

      jspdf.line(10, initPrint.TOP, lineLength, initPrint.TOP);
      initPrint.TOP += 3;
      jspdf.setFont("NotoSansCJKtc-Regular", "bold");

      jspdf.text(keyDay, arrayColumn[0], initPrint.TOP, "left");
      jspdf.text(
        numberFormat(subTotalNumTrans, 0, false),
        arrayColumn[1],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(subTotalSales, 2),
        arrayColumn[2],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(subTotalVatAdj, 2),
        arrayColumn[4],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(subTotalSCPWDDisc, 2),
        arrayColumn[5],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(subTotalRegDisc, 2),
        arrayColumn[6],
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        numberFormat(subTotalItemSales, 2),
        arrayColumn[7],
        initPrint.TOP,
        "right"
      );

      initPrint.TOP += 8;
    }
  }

  jspdf.line(10, initPrint.TOP, lineLength, initPrint.TOP);
  initPrint.TOP += 3;
  jspdf.setFont("NotoSansCJKtc-Regular", "bold");
  // GRAND TOTAL
  jspdf.text("GRANDTOTAL", arrayColumn[0], initPrint.TOP, "left");
  jspdf.text(
    numberFormat(grandTotalNumTrans, 0, false),
    arrayColumn[1],
    initPrint.TOP,
    "right"
  );
  jspdf.text(
    numberFormat(grandTotalSales, 2),
    arrayColumn[2],
    initPrint.TOP,
    "right"
  );
  jspdf.text(
    numberFormat(grandTotalVatAdj, 2),
    arrayColumn[4],
    initPrint.TOP,
    "right"
  );
  jspdf.text(
    numberFormat(grandTotalSCPWDDisc, 2),
    arrayColumn[5],
    initPrint.TOP,
    "right"
  );
  jspdf.text(
    numberFormat(grandTotalRegDisc, 2),
    arrayColumn[6],
    initPrint.TOP,
    "right"
  );
  jspdf.text(
    numberFormat(grandTotalItemSales, 2),
    arrayColumn[7],
    initPrint.TOP,
    "right"
  );

  if (typeof jspdf.putTotalPages === "function") {
    jspdf.putTotalPages(initPrint.totalPagesExp);
  }

  return jspdf;
}
