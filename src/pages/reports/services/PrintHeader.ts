import moment from "moment";
import {PaperFormat} from "../enums/report";

export async function PrintHeader(
  jspdf: any,
  repType: string,
  formValue: any,
  initPrint: any,
  masterFiles: any
) {
  const arrayColumn = [];
  (initPrint.LEFT = 10), (initPrint.TOP = 10);

  jspdf.setFont("NotoSansCJKtc-Regular", "bold");
  jspdf.setFontSize(12);
  switch (repType) {
    case "PERORDERTAKER":
      (initPrint.LEFT = 30), (initPrint.TOP = 30);

      arrayColumn[1] = initPrint.LEFT;
      arrayColumn[2] = 170;
      arrayColumn[3] = 270;
      arrayColumn[4] = 450;
      arrayColumn[5] = 505;
      arrayColumn[6] = 582;

      jspdf.setFontSize(12);
      jspdf.setFont("NotoSansCJKtc-Regular", "bold");
      jspdf.text(
        `${masterFiles.company.comdsc}`,
        arrayColumn[1],
        initPrint.TOP
      );
      initPrint.TOP += 10;
      jspdf.setFontSize(9);
      jspdf.setFont("NotoSansCJKtc-Regular", "bold");
      jspdf.text(
        `Report per Order Taker / Item (${formValue?.detailedSumOption})`,
        arrayColumn[1],
        initPrint.TOP
      );
      initPrint.TOP += 10;
      jspdf.setFontSize(8);
      jspdf.setFont("NotoSansCJKtc-Regular", "normal");
      jspdf.text(
        `Date From: ${moment(formValue?.dateFrom).format(
          "MM-DD-YYYY"
        )} To: ${moment(formValue?.dateTo).format("MM-DD-YYYY")}`,
        arrayColumn[1],
        initPrint.TOP
      );
      initPrint.TOP += 10;
      jspdf.text(
        `Date Printed: ${moment().format("MM-DD-YYYY")}`,
        arrayColumn[1],
        initPrint.TOP
      );

      initPrint.TOP += 10;
      jspdf.line(arrayColumn[1], initPrint.TOP, arrayColumn[6], initPrint.TOP);
      initPrint.TOP += 10;
      jspdf.setFont("NotoSansCJKtc-Regular", "bold");
      jspdf.text("Date", arrayColumn[1], initPrint.TOP);
      jspdf.text("Order Type", arrayColumn[2], initPrint.TOP);
      jspdf.text("Item Desc.", arrayColumn[3], initPrint.TOP);
      jspdf.text("Unit Price", arrayColumn[4], initPrint.TOP, {
        align: "right",
      });
      jspdf.text("Qty", arrayColumn[5], initPrint.TOP, {align: "right"});
      jspdf.text("Amount", arrayColumn[6], initPrint.TOP, {align: "right"});
      initPrint.TOP += 5;
      jspdf.line(arrayColumn[1], initPrint.TOP, arrayColumn[6], initPrint.TOP);

      return {
        jspdf: jspdf,
        LEFT: initPrint.LEFT,
        TOP: initPrint.TOP,
      };
    case "MONTHLY":
      let month = "";

      if (formValue?.selectmonth === "01") {
        month = "January";
      } else if (formValue?.selectmonth === "02") {
        month = "February";
      } else if (formValue?.selectmonth === "03") {
        month = "March";
      } else if (formValue?.selectmonth === "04") {
        month = "April";
      } else if (formValue?.selectmonth === "05") {
        month = "May";
      } else if (formValue?.selectmonth === "06") {
        month = "June";
      } else if (formValue?.selectmonth === "07") {
        month = "July";
      } else if (formValue?.selectmonth === "08") {
        month = "August";
      } else if (formValue?.selectmonth === "09") {
        month = "September";
      } else if (formValue?.selectmonth === "10") {
        month = "October";
      } else if (formValue?.selectmonth === "11") {
        month = "November";
      } else if (formValue?.selectmonth === "12") {
        month = "December";
      }

      jspdf.setFontSize(9);
      jspdf.text(
        "Name of Store",
        initPrint.LEFT + 160,
        initPrint.TOP,
        "center"
      );
      initPrint.TOP += 5;
      jspdf.text(
        "Monthly Sales Report",
        initPrint.LEFT + 160,
        initPrint.TOP,
        "center"
      );
      initPrint.TOP += 5;
      jspdf.text(
        `For the Period of ${month}, ${formValue?.selectyear}`,
        initPrint.LEFT + 160,
        initPrint.TOP,
        "center"
      );
      break;
    case "ESALES":
      jspdf.text("E-Sales Report", initPrint.LEFT, initPrint.TOP);
      initPrint.TOP += 5;
      jspdf.text(
        `TIN #: ${masterFiles.header.tin}`,
        initPrint.LEFT,
        initPrint.TOP
      );
      jspdf.text(
        `MONTH OF: ${moment(formValue?.dateFrom).format("MM")}`,
        initPrint.LEFT + 150,
        initPrint.TOP
      );
      initPrint.TOP += 5;
      jspdf.text(
        `MIN #: ${masterFiles.header.machineno}`,
        initPrint.LEFT,
        initPrint.TOP
      );
      jspdf.text(
        `YEAR OF: ${moment(formValue?.dateFrom).format("YYYY")}`,
        initPrint.LEFT + 150,
        initPrint.TOP
      );
      initPrint.TOP += 5;
      const branch =
        masterFiles.header.tin &&
        masterFiles.header.tin.toString().split("-")[3].length > 3
          ? masterFiles.header.tin.toString().split("-")[3]
          : `${masterFiles.header.tin?.toString().split("-")[3]}0`;
      jspdf.text(`BRANCH: ${branch}`, initPrint.LEFT, initPrint.TOP);
      initPrint.TOP += 5;
      break;
    case "DAILYSALES":
      arrayColumn[1] = initPrint.LEFT;
      arrayColumn[2] = 100;
      arrayColumn[3] = 150;
      arrayColumn[4] = 200;
      arrayColumn[5] = 250;
      arrayColumn[6] = 300;

      jspdf.setFontSize(10);
      jspdf.setFont("NotoSansCJKtc-Regular", "bold");
      jspdf.text(masterFiles.company.comdsc, 10, initPrint.TOP);
      jspdf.setFontSize(8);
      jspdf.setFont("NotoSansCJKtc-Regular", "normal");
      initPrint.TOP += 5;
      jspdf.setFontSize(9);
      jspdf.setFont("NotoSansCJKtc-Regular", "bold");
      jspdf.text("Daily Sales Report", 10, initPrint.TOP);
      initPrint.TOP += 5;
      jspdf.setFontSize(8);
      jspdf.setFont("NotoSansCJKtc-Regular", "normal");
      jspdf.text(
        `Date From: ${moment(formValue.dateFrom).format(
          "MM-DD-YYYY"
        )} To: ${moment(formValue.dateTo).format("MM-DD-YYYY")}`,
        10,
        initPrint.TOP
      );
      initPrint.TOP += 5;
      jspdf.text(
        `Date Printed: ${moment().format("MM-DD-YYYY")}`,
        10,
        initPrint.TOP
      );
      initPrint.TOP += 5;
      jspdf.line(10, initPrint.TOP, 345, initPrint.TOP); // horizontal line
      initPrint.TOP += 10;
      jspdf.setFontSize(8);
      jspdf.setFont("NotoSansCJKtc-Regular", "bold");

      jspdf.text("Beginning OR", arrayColumn[1], initPrint.TOP + 5);
      jspdf.text("Ending OR", arrayColumn[1], initPrint.TOP + 10);
      jspdf.text("Less Post Refund", arrayColumn[1], initPrint.TOP + 15, {
        align: "left",
      });
      jspdf.text("Less Post Void", arrayColumn[1], initPrint.TOP + 20, {
        align: "left",
      });
      jspdf.text("Less Discounts", arrayColumn[1], initPrint.TOP + 25, {
        align: "left",
      });
      jspdf.text("Less Service Charge", arrayColumn[1], initPrint.TOP + 30, {
        align: "left",
      });
      jspdf.text("Less VAT Adj", arrayColumn[1], initPrint.TOP + 35, {
        align: "left",
      });
      jspdf.text("Total VAT Sales", arrayColumn[1], initPrint.TOP + 40, {
        align: "left",
      });
      jspdf.text("Total Non VAT Sales", arrayColumn[1], initPrint.TOP + 45, {
        align: "left",
      });
      jspdf.text(
        "Total No. Of Transaction",
        arrayColumn[1],
        initPrint.TOP + 50,
        {
          align: "left",
        }
      );
      jspdf.text("Total No. Of PAX", arrayColumn[1], initPrint.TOP + 55, {
        align: "left",
      });
      jspdf.text("Total Qty", arrayColumn[1], initPrint.TOP + 60, {
        align: "left",
      });
      jspdf.text("Cash", arrayColumn[1], initPrint.TOP + 65, {align: "left"});
      jspdf.text("Other MOP", arrayColumn[1], initPrint.TOP + 70, {
        align: "left",
      });
      jspdf.text("Cash Fund", arrayColumn[1], initPrint.TOP + 75, {
        align: "left",
      });
      jspdf.text("Cash In Drawer", arrayColumn[1], initPrint.TOP + 80, {
        align: "left",
      });
      jspdf.text("POS Cash", arrayColumn[1], initPrint.TOP + 85, {
        align: "left",
      });
      jspdf.text("Declaration", arrayColumn[1], initPrint.TOP + 90, {
        align: "left",
      });
      jspdf.text("Short/Over", arrayColumn[1], initPrint.TOP + 95, {
        align: "left",
      });
      jspdf.text("Net Sales", arrayColumn[1], initPrint.TOP + 100, {
        align: "left",
      });
      jspdf.text("Gross Sales", arrayColumn[1], initPrint.TOP + 105, {
        align: "left",
      });
      jspdf.setFont("NotoSansCJKtc-Regular", "normal");

      return {
        jspdf: jspdf,
        LEFT: initPrint.LEFT,
        TOP: initPrint.TOP,
      };
    case "SALESSUMMARY":
      arrayColumn[1] = initPrint.LEFT;
      arrayColumn[2] = 100;
      arrayColumn[3] = 150;
      arrayColumn[4] = 200;
      arrayColumn[5] = 250;
      arrayColumn[6] = 300;

      jspdf.setFontSize(10);
      jspdf.setFont("NotoSansCJKtc-Regular", "bold");
      jspdf.text(masterFiles.company.comdsc, 10, initPrint.TOP);
      jspdf.setFontSize(8);
      jspdf.setFont("NotoSansCJKtc-Regular", "normal");

      // Create Header
      initPrint.TOP += 5;
      jspdf.setFontSize(9);
      jspdf.setFont("NotoSansCJKtc-Regular", "bold");
      jspdf.text("Sales Summary Report", 10, initPrint.TOP);
      initPrint.TOP += 5;
      jspdf.setFontSize(8);
      jspdf.setFont("NotoSansCJKtc-Regular", "normal");
      jspdf.text(
        `Date From: ${moment(formValue.dateFrom).format(
          "MM-DD-YYYY"
        )} To: ${moment(formValue.dateTo).format("MM-DD-YYYY")}`,
        10,
        initPrint.TOP
      );
      initPrint.TOP += 5;
      jspdf.text(
        `Date Printed: ${moment().format("MM-DD-YYYY")}`,
        10,
        initPrint.TOP
      );
      initPrint.TOP += 1;
      jspdf.line(10, initPrint.TOP, 345, initPrint.TOP);
      initPrint.TOP += 4;

      jspdf.setFontSize(8);
      jspdf.setFont("NotoSansCJKtc-Regular", "bold");

      jspdf.text("Beginning OR", arrayColumn[1], initPrint.TOP + 5);
      jspdf.text("Ending OR", arrayColumn[1], initPrint.TOP + 10);
      jspdf.text(
        "Grand Accum. Sales Ending Balance",
        arrayColumn[1],
        initPrint.TOP + 15,
        {
          align: "left",
        }
      );
      jspdf.text(
        "Grand Accum. Sales Begining Balance",
        arrayColumn[1],
        initPrint.TOP + 20,
        {
          align: "left",
        }
      );
      jspdf.text(
        "Gross Sales for the Day",
        arrayColumn[1],
        initPrint.TOP + 25,
        {
          align: "left",
        }
      );
      jspdf.text(
        "Sales Issued with Manual SI/OR (per RR-16-2018)",
        arrayColumn[1],
        initPrint.TOP + 30,
        {align: "left"}
      );
      jspdf.text("Gross Sales From POS", arrayColumn[1], initPrint.TOP + 35, {
        align: "left",
      });
      jspdf.text("VATable Sales", arrayColumn[1], initPrint.TOP + 40, {
        align: "left",
      });
      jspdf.text("NON-VATable Sales", arrayColumn[1], initPrint.TOP + 45, {
        align: "left",
      });
      jspdf.text("VAT Amount", arrayColumn[1], initPrint.TOP + 50, {
        align: "left",
      });
      jspdf.text("VAT-Exempt Sales", arrayColumn[1], initPrint.TOP + 55, {
        align: "left",
      });
      jspdf.text("Zero Rated Sales", arrayColumn[1], initPrint.TOP + 60, {
        align: "left",
      });
      jspdf.text("Service Charge", arrayColumn[1], initPrint.TOP + 65, {
        align: "left",
      });
      jspdf.text("Other Discount", arrayColumn[1], initPrint.TOP + 70, {
        align: "left",
      });
      jspdf.text("Senior", arrayColumn[1], initPrint.TOP + 75, {
        align: "left",
      });
      jspdf.text("PWD", arrayColumn[1], initPrint.TOP + 80, {align: "left"});
      jspdf.text(
        "Service Charge Discount",
        arrayColumn[1],
        initPrint.TOP + 85,
        {
          align: "left",
        }
      );
      jspdf.text("Returns/Refunds", arrayColumn[1], initPrint.TOP + 90, {
        align: "left",
      });
      jspdf.text("Void/Cancelled", arrayColumn[1], initPrint.TOP + 95, {
        align: "left",
      });
      jspdf.text("Total Deductions", arrayColumn[1], initPrint.TOP + 100, {
        align: "left",
      });
      jspdf.text(
        "VAT on Special Discounts",
        arrayColumn[1],
        initPrint.TOP + 105,
        {
          align: "left",
        }
      );
      jspdf.text("VAT on Returns", arrayColumn[1], initPrint.TOP + 110, {
        align: "left",
      });
      jspdf.text("Others", arrayColumn[1], initPrint.TOP + 115, {
        align: "left",
      });
      jspdf.text("Total VAT Adj.", arrayColumn[1], initPrint.TOP + 120, {
        align: "left",
      });
      jspdf.text("VAT Payable", arrayColumn[1], initPrint.TOP + 125, {
        align: "left",
      });
      jspdf.text("Net Sales w/ VAT", arrayColumn[1], initPrint.TOP + 130, {
        align: "left",
      });
      jspdf.text("Net Sales w/o VAT", arrayColumn[1], initPrint.TOP + 135, {
        align: "left",
      });
      jspdf.text("Other Income", arrayColumn[1], initPrint.TOP + 140, {
        align: "left",
      });
      jspdf.text(
        "Sales Overrun / Overflow",
        arrayColumn[1],
        initPrint.TOP + 145,
        {
          align: "left",
        }
      );
      jspdf.text("Total Net Sales", arrayColumn[1], initPrint.TOP + 150, {
        align: "left",
      });
      jspdf.text("Reset Counter", arrayColumn[1], initPrint.TOP + 155, {
        align: "left",
      });
      jspdf.text("Z-Counter", arrayColumn[1], initPrint.TOP + 160, {
        align: "left",
      });
      jspdf.text("Remarks", arrayColumn[1], initPrint.TOP + 165, {
        align: "left",
      });
      jspdf.setFont("NotoSansCJKtc-Regular", "normal");
      return {
        jspdf: jspdf,
        LEFT: initPrint.LEFT,
        TOP: initPrint.TOP,
      };
    case "PAYMENTTYPE":
      jspdf.text(masterFiles.header.business1, initPrint.LEFT, initPrint.TOP);
      initPrint.TOP += 5;
      jspdf.text("Payment Report", initPrint.LEFT, initPrint.TOP);
      initPrint.TOP += 5;
      jspdf.text(
        `Date From: ${moment(formValue?.dateFrom).format(
          "MM-DD-YYYY"
        )} To ${moment(formValue?.dateTo).format("MM-DD-YYYY")}`,
        initPrint.LEFT,
        initPrint.TOP
      );
      initPrint.TOP += 5;
      jspdf.text(
        "Date Printed: " + moment().format("MM-DD-YYYY"),
        initPrint.LEFT,
        initPrint.TOP
      );
      break;
    case "PAYMENTBYDINE":
      jspdf.text(masterFiles.header.business1, initPrint.LEFT, initPrint.TOP);
      initPrint.TOP += 5;
      jspdf.text("Payment By Dine Type Report", initPrint.LEFT, initPrint.TOP);
      initPrint.TOP += 5;
      jspdf.text(
        `Date From: ${moment(formValue?.dateFrom).format(
          "MM-DD-YYYY"
        )} To ${moment(formValue?.dateTo).format("MM-DD-YYYY")}`,
        initPrint.LEFT,
        initPrint.TOP
      );
      initPrint.TOP += 5;
      jspdf.text(
        "Date Printed: " + moment().format("MM-DD-YYYY"),
        initPrint.LEFT,
        initPrint.TOP
      );
      break;
    case "ATHLETEDISCOUNT":
      jspdf.text(masterFiles.header.taxpayer, 170, initPrint.TOP, "center");
      initPrint.TOP += 5;
      jspdf.setFontSize(8);

      jspdf.text(
        `${masterFiles.header.address1}, ${masterFiles.header.address2}, ${masterFiles.header.address3}`,
        170,
        initPrint.TOP,
        "center"
      );
      initPrint.TOP += 5;

      jspdf.text(masterFiles.header.tin, 170, initPrint.TOP, "center");
      initPrint.TOP += 5;

      jspdf.text(
        `${masterFiles.footer.supname} ${localStorage.getItem("version")} ${
          masterFiles.footer.dateissued
        }`,
        initPrint.LEFT,
        initPrint.TOP
      );
      initPrint.TOP += 5;

      jspdf.text(
        `Serial No. : ${masterFiles.header.serialno}`,
        initPrint.LEFT,
        initPrint.TOP
      );
      initPrint.TOP += 5;

      jspdf.text(
        `MIN: ${masterFiles.header.machineno}`,
        initPrint.LEFT,
        initPrint.TOP
      );
      initPrint.TOP += 5;
      jspdf.text(
        `POS Terminal No. : ${masterFiles.header.postrmno.toString()}`,
        initPrint.LEFT,
        initPrint.TOP
      );
      initPrint.TOP += 5;
      break;
    case "SENIOR":
      jspdf.setFontSize(10);
      jspdf.text(masterFiles.header.taxpayer, 170, initPrint.TOP, "center");
      initPrint.TOP += 5;
      jspdf.text(masterFiles.header.address1, 170, initPrint.TOP, "center");
      initPrint.TOP += 5;
      jspdf.text(masterFiles.header.tin, 170, initPrint.TOP, "center");
      initPrint.TOP += 10;
      jspdf.text(
        "Software Name and Version No. plus Release No./Release Date: ",
        initPrint.LEFT,
        initPrint.TOP
      );
      initPrint.TOP += 5;
      jspdf.text(
        "Serial No.: " + masterFiles.header.serialno,
        initPrint.LEFT,
        initPrint.TOP
      );
      initPrint.TOP += 5;
      jspdf.text(
        "Machine Identification Number: " + masterFiles.header.machineno,
        initPrint.LEFT,
        initPrint.TOP
      );
      initPrint.TOP += 5;
      jspdf.text(
        "POS Terminal No.: " + masterFiles.header.postrmno,
        initPrint.LEFT,
        initPrint.TOP
      );
      initPrint.TOP += 5;
      jspdf.text(
        "Date and Time Generated: " +
          moment().format("MM-DD-YYYY | hh:mm:ss A"),
        initPrint.LEFT,
        initPrint.TOP
      );
      initPrint.TOP += 5;
      jspdf.text(
        "User ID: " + masterFiles.header.tenantid,
        initPrint.LEFT,
        initPrint.TOP
      );
      initPrint.TOP += 5;
      jspdf.text(
        "Senior Citizen Sales Book/Report",
        170,
        initPrint.TOP,
        "center"
      );
      break;
    case "PWD":
      jspdf.setFontSize(10);
      jspdf.text(masterFiles.header.taxpayer, 170, initPrint.TOP, "center");
      initPrint.TOP += 5;
      jspdf.text(masterFiles.header.address1, 170, initPrint.TOP, "center");
      initPrint.TOP += 5;
      jspdf.text(masterFiles.header.tin, 170, initPrint.TOP, "center");
      initPrint.TOP += 10;
      jspdf.text(
        "Software Name and Version No. plus Release No./Release Date: ",
        initPrint.LEFT,
        initPrint.TOP
      );
      initPrint.TOP += 5;
      jspdf.text(
        "Serial No.: " + masterFiles.header.serialno,
        initPrint.LEFT,
        initPrint.TOP
      );
      initPrint.TOP += 5;
      jspdf.text(
        "Machine Identification Number: " + masterFiles.header.machineno,
        initPrint.LEFT,
        initPrint.TOP
      );
      initPrint.TOP += 5;
      jspdf.text(
        "POS Terminal No.: " + masterFiles.header.postrmno,
        initPrint.LEFT,
        initPrint.TOP
      );
      initPrint.TOP += 5;
      jspdf.text(
        "Date and Time Generated: " +
          moment().format("MM-DD-YYYY | hh:mm:ss A"),
        initPrint.LEFT,
        initPrint.TOP
      );
      initPrint.TOP += 5;
      jspdf.text(
        "User ID: " + masterFiles.header.tenantid,
        initPrint.LEFT,
        initPrint.TOP
      );
      initPrint.TOP += 5;
      jspdf.text(
        "Persons with Disability Sales Book/Report",
        170,
        initPrint.TOP,
        "center"
      );
      break;
    default:
      jspdf.text(masterFiles.header.business1, initPrint.LEFT, initPrint.TOP);
      initPrint.TOP += 5;
      jspdf.setFontSize(8);
      if (masterFiles.header.business2) {
        jspdf.text(masterFiles.header.business2, initPrint.LEFT, initPrint.TOP);
        initPrint.TOP += 5;
      }
      if (masterFiles.header.business3) {
        jspdf.text(masterFiles.header.business3, initPrint.LEFT, initPrint.TOP);
        initPrint.TOP += 5;
      }
      jspdf.text(masterFiles.header.address1, initPrint.LEFT, initPrint.TOP);
      initPrint.TOP += 5;
      if (masterFiles.header.address2) {
        jspdf.text(masterFiles.header.address2, initPrint.LEFT, initPrint.TOP);
        initPrint.TOP += 5;
      }
      if (masterFiles.header.address3) {
        jspdf.text(masterFiles.header.address3, initPrint.LEFT, initPrint.TOP);
        initPrint.TOP += 5;
      }
      jspdf.text(
        `Date Covered: ${moment(formValue?.dateFrom).format(
          "MM-DD-YYYY"
        )} to ${moment(formValue?.dateTo).format("MM-DD-YYYY")}`,
        initPrint.LEFT,
        initPrint.TOP
      );
      initPrint.TOP += 5;

      jspdf.text(
        "Date Printed : " + moment().format("MM-DD-YYYY"),
        initPrint.LEFT,
        initPrint.TOP
      );
      break;
  }

  if (masterFiles.syspar.ortigas !== 1 && repType !== "MONTHLY") {
    initPrint.TOP += 5;
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
  } else {
    initPrint.TOP += 5;
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
  }

  jspdf.setFontSize(10);
  jspdf.setFont("NotoSansCJKtc-Regular", "bold");
  switch (repType) {
    case "ITEMIZED":
      jspdf.text(
        "Sales Report per Day / Category / Sub-Category",
        170,
        initPrint.TOP,
        "center"
      );
      initPrint.TOP += 5;
      break;
    case "CLASSANDSUBCLASS":
      jspdf.text(
        "Sales Report per Category / Sub-Category",
        170,
        initPrint.TOP,
        "center"
      );
      initPrint.TOP += 5;
      break;
    case "DAILYDINETYPE":
      jspdf.text("Sales Report Dine Type", 100, initPrint.TOP, "center");
      break;
    case "HOURLYSALES":
      jspdf.text("Hourly Sales", 100, initPrint.TOP, "center");
      break;
    case "FREE":
      jspdf.text("Free Items / Transactions", 100, initPrint.TOP, "center");
      break;
    case "VOIDITEMS":
      jspdf.text("Void Items", 100, initPrint.TOP, "center");
      break;
    case "VOIDTRANSACTIONS":
      jspdf.text("Post Void Transactions", 100, initPrint.TOP, "center");
      break;
    case "REFUNDTRANSACTIONS":
    case "REFUNDBYPAYMENT":
    case "REFUNDBYDATE":
      jspdf.text("Post Refund Transactions", 100, initPrint.TOP, "center");
      break;
    case "PERDAYHOURLY":
      jspdf.text("Sales Report per Day / Hour", 150, initPrint.TOP, "center");
      break;
    case "COSTANDPROFIT":
      jspdf.text(
        "COST AND PROFIT ANALYSIS BY ITEM",
        150,
        initPrint.TOP,
        "center"
      );
      break;
  }

  initPrint.TOP += 10;

  switch (repType) {
    case "ITEMIZED":
    case "CLASSANDSUBCLASS":
      arrayColumn[0] = initPrint.LEFT;
      arrayColumn[1] = arrayColumn[0] + 75;
      arrayColumn[2] = arrayColumn[1] + 23;
      arrayColumn[3] = arrayColumn[2];
      arrayColumn[4] = arrayColumn[3] + 27;
      arrayColumn[5] = arrayColumn[4] + 27;
      arrayColumn[6] = arrayColumn[5] + 27;
      arrayColumn[7] = arrayColumn[6] + 30;
      arrayColumn[8] = arrayColumn[7] + 30;
      arrayColumn[9] = arrayColumn[8] + 30;
      arrayColumn[10] = arrayColumn[9] + 30;
      arrayColumn[11] = arrayColumn[10] + 30;

      jspdf.text("GROSS", arrayColumn[1], initPrint.TOP, "right");
      jspdf.text("QTY", arrayColumn[2], initPrint.TOP, "right");
      jspdf.text("VAT ADJ", arrayColumn[4], initPrint.TOP, "right");
      jspdf.text("DISCOUNT", arrayColumn[5], initPrint.TOP, "right");
      jspdf.text("VAT EXEMPT", arrayColumn[6], initPrint.TOP - 5, "right");
      jspdf.text("SALES", arrayColumn[6], initPrint.TOP, "right");
      jspdf.text("VAT EXEMPT", arrayColumn[7], initPrint.TOP - 5, "right");
      jspdf.text("LESS DISC", arrayColumn[7], initPrint.TOP, "right");
      jspdf.text("VATABLE", arrayColumn[8], initPrint.TOP - 5, "right");
      jspdf.text("SALES", arrayColumn[8], initPrint.TOP, "right");
      jspdf.text("VAT", arrayColumn[9], initPrint.TOP - 5, "right");
      jspdf.text("AMOUNT", arrayColumn[9], initPrint.TOP, "right");
      jspdf.text("NET SALES", arrayColumn[10], initPrint.TOP - 5, "right");
      jspdf.text("W VAT", arrayColumn[10], initPrint.TOP, "right");
      jspdf.text("NET SALES", arrayColumn[11], initPrint.TOP - 5, "right");
      jspdf.text("W/O VAT", arrayColumn[11], initPrint.TOP, "right");
      initPrint.TOP += 2;
      break;
    case "DAILYDINETYPE":
      arrayColumn[0] = initPrint.LEFT;
      arrayColumn[1] = arrayColumn[0] + 70;
      arrayColumn[2] = arrayColumn[1] + 30;
      arrayColumn[3] = arrayColumn[2];
      arrayColumn[4] = arrayColumn[3] + 30;
      arrayColumn[5] = arrayColumn[4] + 30;
      arrayColumn[6] = arrayColumn[5] + 30;

      jspdf.text("QTY", arrayColumn[1], initPrint.TOP, "right");
      jspdf.text("AMOUNT", arrayColumn[2], initPrint.TOP, "right");
      jspdf.text("VAT ADJ", arrayColumn[4], initPrint.TOP, "right");
      jspdf.text("DISCOUNT", arrayColumn[5], initPrint.TOP, "right");
      jspdf.text("TOTAL AMT", arrayColumn[6], initPrint.TOP, "right");
      break;
    case "HOURLYSALES":
      arrayColumn[0] = initPrint.LEFT;
      arrayColumn[1] = arrayColumn[0] + 55;
      arrayColumn[2] = arrayColumn[1] + 30;
      arrayColumn[3] = arrayColumn[2];
      arrayColumn[4] = arrayColumn[3] + 30;
      arrayColumn[5] = arrayColumn[4] + 30;
      arrayColumn[6] = arrayColumn[5] + 30;
      arrayColumn[7] = arrayColumn[6] + 15;

      jspdf.text("QTY", arrayColumn[1], initPrint.TOP, "right");
      jspdf.text("AMOUNT", arrayColumn[2], initPrint.TOP, "right");
      jspdf.text("VAT ADJ", arrayColumn[4], initPrint.TOP, "right");
      jspdf.text("DISCOUNT", arrayColumn[5], initPrint.TOP, "right");
      jspdf.text("TOTAL AMT", arrayColumn[6], initPrint.TOP, "right");
      jspdf.text("TC", arrayColumn[7], initPrint.TOP, "right");
      break;
    case "FREE":
      arrayColumn[0] = initPrint.LEFT;
      arrayColumn[1] = arrayColumn[0] + 140;
      arrayColumn[2] = arrayColumn[1] + 25;
      arrayColumn[3] = arrayColumn[2] + 25;

      jspdf.text("AMOUNT", arrayColumn[1], initPrint.TOP, "right");
      jspdf.text("QTY", arrayColumn[2], initPrint.TOP, "right");
      jspdf.text("TOTAL", arrayColumn[3], initPrint.TOP, "right");
      break;
    case "VOIDTRANSACTIONS":
      arrayColumn[0] = initPrint.LEFT;
      arrayColumn[1] = arrayColumn[0] + 40;
      arrayColumn[2] = arrayColumn[1] + 25;
      arrayColumn[3] = arrayColumn[2] + 55;
      arrayColumn[4] = arrayColumn[3] + 25;
      arrayColumn[5] = arrayColumn[4] + 5;

      jspdf.text("Date/Time", arrayColumn[0], initPrint.TOP, "left");
      jspdf.text("Table", arrayColumn[1], initPrint.TOP, "left");
      jspdf.text("OR #", arrayColumn[2], initPrint.TOP, "left");
      jspdf.text("Gross", arrayColumn[3], initPrint.TOP, "right");
      jspdf.text("Net", arrayColumn[4], initPrint.TOP, "right");
      jspdf.text("Reason", arrayColumn[5], initPrint.TOP, "left");
      break;
    case "REFUNDTRANSACTIONS":
      arrayColumn[0] = initPrint.LEFT;
      arrayColumn[1] = arrayColumn[0] + 50;
      arrayColumn[2] = arrayColumn[1] + 50;
      arrayColumn[3] = arrayColumn[2] + 35;
      arrayColumn[4] = arrayColumn[3] + 65;
      arrayColumn[5] = arrayColumn[4] + 35;
      arrayColumn[6] = arrayColumn[5] + 15;

      jspdf.text("Refund. Date/Time", arrayColumn[0], initPrint.TOP, "left");
      jspdf.text("Tran. Date/Time", arrayColumn[1], initPrint.TOP, "left");
      jspdf.text("Customer", arrayColumn[2], initPrint.TOP, "left");
      jspdf.text("OR #", arrayColumn[3], initPrint.TOP, "left");
      jspdf.text("Gross", arrayColumn[4], initPrint.TOP, "right");
      jspdf.text("Net", arrayColumn[5], initPrint.TOP, "right");
      jspdf.text("Reason", arrayColumn[6], initPrint.TOP, "left");
      break;
    case "REFUNDBYPAYMENT":
    case "REFUNDBYDATE":
      jspdf.setFontSize(11);

      arrayColumn[0] = initPrint.LEFT;
      arrayColumn[1] = arrayColumn[0] + 50;
      arrayColumn[2] = arrayColumn[1] + 50;
      arrayColumn[3] = arrayColumn[2] + 35;
      arrayColumn[4] = arrayColumn[3] + 65;
      arrayColumn[5] = arrayColumn[4] + 35;
      arrayColumn[6] = arrayColumn[5] + 25;
      arrayColumn[7] = arrayColumn[6] + 30;
      arrayColumn[8] = arrayColumn[7] + 25;

      jspdf.text("Refund. Date/Time", arrayColumn[0], initPrint.TOP, "left");
      jspdf.text("Tran. Date/Time", arrayColumn[1], initPrint.TOP, "left");
      jspdf.text("Customer", arrayColumn[2], initPrint.TOP, "left");
      jspdf.text("OR #", arrayColumn[3], initPrint.TOP, "left");
      jspdf.text("OR Amount", arrayColumn[4], initPrint.TOP, "right");
      jspdf.text("Refund Amount", arrayColumn[5], initPrint.TOP, "right");
      jspdf.text("Reason", arrayColumn[6], initPrint.TOP, "left");
      jspdf.text("Payment", arrayColumn[7], initPrint.TOP, "left");
      jspdf.text("Cashier", arrayColumn[8], initPrint.TOP, "left");

      break;
    case "PERDAYHOURLY":
      arrayColumn[0] = initPrint.LEFT;
      arrayColumn[1] = arrayColumn[0] + 60;
      arrayColumn[2] = arrayColumn[1] + 50;
      arrayColumn[3] = arrayColumn[2];
      arrayColumn[4] = arrayColumn[3] + 50;
      arrayColumn[5] = arrayColumn[4] + 50;
      arrayColumn[6] = arrayColumn[5] + 50;
      arrayColumn[7] = arrayColumn[6] + 60;

      jspdf.text("DAY TYPE", arrayColumn[0], initPrint.TOP, "left");
      jspdf.text("# OF TRANS", arrayColumn[1], initPrint.TOP, "right");
      jspdf.text("TOTAL SALES", arrayColumn[2], initPrint.TOP, "right");
      jspdf.text("(-) VAT ADJ", arrayColumn[4], initPrint.TOP, "right");
      jspdf.text("(-) GOV", arrayColumn[5], initPrint.TOP, "right");
      jspdf.text("(-) REG", arrayColumn[6], initPrint.TOP, "right");
      jspdf.text("TOTAL ITEMS", arrayColumn[7], initPrint.TOP, "right");

      initPrint.TOP += 5;
      jspdf.text("CHARGE", arrayColumn[3], initPrint.TOP, "right");
      jspdf.text("DISCOUNT", arrayColumn[5], initPrint.TOP, "right");
      jspdf.text("DISCOUNT", arrayColumn[6], initPrint.TOP, "right");
      jspdf.text("SALES AMOUNT", arrayColumn[7], initPrint.TOP, "right");
      break;
    case "COSTANDPROFIT":
      jspdf.setFontSize(10);

      arrayColumn[0] = initPrint.LEFT;
      arrayColumn[1] = arrayColumn[0] + 70;
      arrayColumn[2] = arrayColumn[1] + 27;
      arrayColumn[3] = arrayColumn[2];
      arrayColumn[4] = arrayColumn[3] + 27;
      arrayColumn[5] = arrayColumn[4] + 27;
      arrayColumn[6] = arrayColumn[5] + 27;
      arrayColumn[7] = arrayColumn[6] + 32;
      arrayColumn[8] = arrayColumn[7] + 32;
      arrayColumn[9] = arrayColumn[8] + 27;
      arrayColumn[10] = arrayColumn[9] + 27;
      arrayColumn[11] = arrayColumn[10] + 27;

      jspdf.text("ITEMS", arrayColumn[0], initPrint.TOP, "left");
      jspdf.text("QTY", arrayColumn[1], initPrint.TOP, "right");
      jspdf.text("TOTAL SALES", arrayColumn[2], initPrint.TOP, "right");
      jspdf.text("(-) VAT ADJ", arrayColumn[4], initPrint.TOP, "right");
      jspdf.text("(-) GOV", arrayColumn[5], initPrint.TOP, "right");
      jspdf.text("(-) REG", arrayColumn[6], initPrint.TOP, "right");
      jspdf.text("TOTAL ITEMS", arrayColumn[7], initPrint.TOP, "right");
      jspdf.text("AVERAGE", arrayColumn[8], initPrint.TOP, "right");
      jspdf.text("COST", arrayColumn[9], initPrint.TOP, "right");
      jspdf.text("AVE. PROFIT", arrayColumn[10], initPrint.TOP, "right");
      jspdf.text("% PROFIT", arrayColumn[11], initPrint.TOP, "right");

      initPrint.TOP += 5;
      jspdf.text("DISCOUNT", arrayColumn[5], initPrint.TOP, "right");
      jspdf.text("DISCOUNT", arrayColumn[6], initPrint.TOP, "right");
      jspdf.text("SALES AMOUNT", arrayColumn[7], initPrint.TOP, "right");
      jspdf.text("SALES AMOUNT", arrayColumn[8], initPrint.TOP, "right");
      break;
    case "ESALES":
      jspdf.setFontSize(9);

      arrayColumn[0] = initPrint.LEFT;
      arrayColumn[1] = arrayColumn[0] + 50;
      arrayColumn[2] = arrayColumn[1];
      arrayColumn[3] = arrayColumn[2] + 25;
      arrayColumn[4] = arrayColumn[3] + 25;
      arrayColumn[5] = arrayColumn[4] + 25;
      arrayColumn[6] = arrayColumn[5] + 27.5;
      arrayColumn[7] = arrayColumn[6] + 22.5;
      arrayColumn[8] = arrayColumn[7] + 25;
      arrayColumn[9] = arrayColumn[8] + 27.5;
      arrayColumn[10] = arrayColumn[9] + 27.5;
      arrayColumn[11] = arrayColumn[10] + 10;
      arrayColumn[12] = arrayColumn[11] + 37.5;

      jspdf.text("DATE", arrayColumn[0], initPrint.TOP, "left");
      jspdf.text("TOTAL DAILY", arrayColumn[1], initPrint.TOP, "right");
      jspdf.text("(-) VAT ADJ", arrayColumn[3], initPrint.TOP, "right");
      jspdf.text("(-) GOV", arrayColumn[4], initPrint.TOP, "right");
      jspdf.text("(-) OTHER", arrayColumn[5], initPrint.TOP, "right");
      jspdf.text("TOTAL SALES", arrayColumn[6], initPrint.TOP, "right");
      jspdf.text("VATABLE", arrayColumn[7], initPrint.TOP, "right");
      jspdf.text("VAT", arrayColumn[8], initPrint.TOP, "right");
      jspdf.text("VAT ZERO", arrayColumn[9], initPrint.TOP, "right");
      jspdf.text("VAT EXEMPT", arrayColumn[10], initPrint.TOP, "right");
      jspdf.text("BEG. OR", arrayColumn[11], initPrint.TOP, "left");
      jspdf.text("END OR", arrayColumn[12], initPrint.TOP, "left");

      initPrint.TOP += 5;
      jspdf.text("GROSS SALES", arrayColumn[1], initPrint.TOP, "right");
      jspdf.text("DISCOUNT", arrayColumn[4], initPrint.TOP, "right");
      jspdf.text("DISCOUNT", arrayColumn[5], initPrint.TOP, "right");
      jspdf.text("SALES", arrayColumn[7], initPrint.TOP, "right");
      jspdf.text("RATED SALES", arrayColumn[9], initPrint.TOP, "right");
      jspdf.text("SALES", arrayColumn[10], initPrint.TOP, "right");
      break;
    case "MONTHLY":
      jspdf.setFont("NotoSansCJKtc-Regular", "normal");
      jspdf.setFontSize(6);

      initPrint.TOP -= 5;
      arrayColumn[0] = initPrint.LEFT - 3;
      arrayColumn[1] = arrayColumn[0] + 35;
      arrayColumn[2] = arrayColumn[1];
      arrayColumn[3] = arrayColumn[2] + 60;
      arrayColumn[4] = arrayColumn[3] + 120;
      arrayColumn[5] = arrayColumn[4] + 50;
      arrayColumn[6] = arrayColumn[5] + 27.5;
      arrayColumn[7] = arrayColumn[6] + 22.5;

      jspdf.text("DATE", arrayColumn[0], initPrint.TOP, "left");
      jspdf.text("GROSS SALES", arrayColumn[1], initPrint.TOP, "right");
      jspdf.text(
        "VATABLE DISCOUNTS",
        arrayColumn[3] + 22,
        initPrint.TOP,
        "right"
      );
      jspdf.text(
        "NON-VATABLE DISCOUNTS",
        arrayColumn[4],
        initPrint.TOP,
        "right"
      );
      jspdf.text("OTHER TAXES", arrayColumn[5], initPrint.TOP, "right");
      jspdf.text("VAT AMOUNT", arrayColumn[6], initPrint.TOP, "right");
      jspdf.text("NET SALES", arrayColumn[7], initPrint.TOP, "right");

      // 2nd row
      // VAT
      jspdf.text("VATABLE", arrayColumn[1] - 22, (initPrint.TOP += 5), "left");
      jspdf.text("NON-VATABLE", arrayColumn[1] - 3, initPrint.TOP, "left");
      jspdf.text("Service/", arrayColumn[3] - 40, initPrint.TOP, "left");
      jspdf.text("Approved", arrayColumn[3] - 25, initPrint.TOP, "left");
      jspdf.text("Gift", arrayColumn[3] - 10, initPrint.TOP, "left");
      jspdf.text("Returned/", arrayColumn[3], initPrint.TOP, "left");
      jspdf.text("Disability", arrayColumn[3] + 15, initPrint.TOP, "left");
      jspdf.text("Promo", arrayColumn[3] + 30, initPrint.TOP, "left");
      jspdf.text("Without", arrayColumn[3] + 45, initPrint.TOP, "left");

      // NON VAT
      jspdf.text("Senior", arrayColumn[4] - 57, initPrint.TOP, "left");
      jspdf.text("Service/", arrayColumn[4] - 42, initPrint.TOP, "left");
      jspdf.text("Employee", arrayColumn[4] - 27, initPrint.TOP, "left");
      jspdf.text("Returned", arrayColumn[4] - 12, initPrint.TOP, "left");
      jspdf.text("Promo", arrayColumn[4] + 2, initPrint.TOP, "left");
      jspdf.text("Without", arrayColumn[4] + 17, initPrint.TOP, "left");

      // 3rd row
      // VAT
      jspdf.text("Delivery", arrayColumn[3] - 40, (initPrint.TOP += 3), "left");
      jspdf.text("Customer", arrayColumn[3] - 25, initPrint.TOP, "left");
      jspdf.text("Cert.", arrayColumn[3] - 10, initPrint.TOP, "left");
      jspdf.text("Refund/Void", arrayColumn[3], initPrint.TOP, "left");
      jspdf.text("Discount", arrayColumn[3] + 30, initPrint.TOP, "left");
      jspdf.text("Approval", arrayColumn[3] + 45, initPrint.TOP, "left");

      // NON VAT
      jspdf.text("Citizen", arrayColumn[4] - 57, initPrint.TOP, "left");
      jspdf.text("Delivery", arrayColumn[4] - 42, initPrint.TOP, "left");
      jspdf.text("Customer", arrayColumn[4] - 27, initPrint.TOP, "left");
      jspdf.text("Refund/Void", arrayColumn[4] - 12, initPrint.TOP, "left");
      jspdf.text("Discount", arrayColumn[4] + 2, initPrint.TOP, "left");
      jspdf.text("Approval", arrayColumn[4] + 17, initPrint.TOP, "left");

      initPrint.TOP += 5;
      jspdf.line(
        10,
        initPrint.TOP,
        initPrint.reportSetup.orientation === "portrait"
          ? 205
          : initPrint.reportSetup.format === PaperFormat.Letter
          ? 285
          : 320,
        initPrint.TOP
      );

      break;
    case "PAYMENTTYPE":
      initPrint.TOP -= 10;
      arrayColumn[0] = initPrint.LEFT;
      arrayColumn[1] = arrayColumn[0] + 40;
      arrayColumn[2] = arrayColumn[1] + 25;
      arrayColumn[3] = arrayColumn[2] + 25;
      arrayColumn[4] = arrayColumn[3] + 60;
      arrayColumn[5] = arrayColumn[4] + 7;

      jspdf.text("ORDOCNUM", arrayColumn[0], initPrint.TOP, "left");
      jspdf.text("DATE", arrayColumn[1], initPrint.TOP, "left");
      jspdf.text("TIME", arrayColumn[2], initPrint.TOP, "left");
      jspdf.text("PAYMENT TYPE", arrayColumn[3], initPrint.TOP, "left");
      jspdf.text("AMOUNT", arrayColumn[4], initPrint.TOP, "right");
      jspdf.text("CASHIER", arrayColumn[5], initPrint.TOP, "left");

      initPrint.TOP += 5;
      jspdf.line(
        10,
        initPrint.TOP,
        initPrint.reportSetup.orientation === "portrait"
          ? 205
          : initPrint.reportSetup.format === PaperFormat.Letter
          ? 285
          : 320,
        initPrint.TOP
      );
      break;
  }

  initPrint.TOP += 5;

  return {
    jspdf: jspdf,
    LEFT: initPrint.LEFT,
    TOP: initPrint.TOP,
  };
}
