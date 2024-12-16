import moment from "moment";
import {ActivityLog} from "../../../models/activitylog";
import {truncateString} from "../../../helper/StringHelper";
let arrayColumn: number[] = [];
arrayColumn[1] = 10;
arrayColumn[2] = arrayColumn[1] + 15;
arrayColumn[3] = arrayColumn[2] + 25;
arrayColumn[4] = arrayColumn[3] + 40;
arrayColumn[5] = arrayColumn[4] + 40;
arrayColumn[6] = arrayColumn[5] + 10;

export const PrintHeader = (
  jspdf: any,
  TOP: number,
  comdsc: string,
  numPages: number,
  formValue: any
) => {
  // Create Footer
  jspdf.setFontSize(8);
  jspdf.text(`Page ${numPages}`, 150, 205, {align: "center"});

  const dateFrom = formValue.dateFrom
    ? moment(formValue.dateFrom).format("MM-DD-YYYY")
    : "__-__-____";
  const dateTo = formValue.dateTo
    ? moment(formValue.dateTo).format("MM-DD-YYYY")
    : "__-__-____";

  jspdf.setFont("NotoSansCJktc-Regular", "normal");
  jspdf.setFontSize(15);
  jspdf.text(comdsc, arrayColumn[1], TOP);
  jspdf.setFontSize(12);
  TOP += 5;
  jspdf.text("Audit Trail", arrayColumn[1], TOP);
  TOP += 4;
  jspdf.setFontSize(10);
  jspdf.text(`Date From: ${dateFrom} To: ${dateTo}`, arrayColumn[1], TOP);
  TOP += 4;
  jspdf.text(
    `Date Printed: ${moment().format("MM-DD-YYYY")}`,
    arrayColumn[1],
    TOP
  );
  TOP += 4;
  jspdf.line(10, TOP, 290, TOP);
  TOP += 4;
  jspdf.text("Tran. #", arrayColumn[1], TOP);
  jspdf.text("Username", arrayColumn[2], TOP);
  jspdf.text("Date/Time", arrayColumn[3], TOP);
  jspdf.text("Module", arrayColumn[4], TOP);
  // jspdf.text('Method', arrayColumn[5], TOP);
  jspdf.text("Remarks", arrayColumn[6], TOP);
  TOP += 2;
  jspdf.line(10, TOP, 290, TOP);

  return {
    jspdf: jspdf,
    TOP: TOP,
  };
};

export const PrintDetail = (
  jspdf: any,
  TOP: number,
  comdsc: string,
  numPages: number,
  formValue: any,
  reportData: any
) => {
  TOP += 10;

  reportData.map(async (xaudit: ActivityLog) => {
    // console.log(xaudit.remarks, xaudit.module);
    // if (xaudit?.remarks && xaudit.remarks.length >= 100) {
    //   console.log("greater than 100");
    // } else {
    //   console.log("no");
    // }

    jspdf.text(`${xaudit.recid}`, arrayColumn[1], TOP);
    jspdf.text(`${xaudit.usrname}`, arrayColumn[2], TOP);
    jspdf.text(
      `${moment(xaudit.trndte).format("MM-DD-YYYY, hh:mm A")}`,
      arrayColumn[3],
      TOP
    );
    jspdf.text(`${xaudit.module}`, arrayColumn[4], TOP);
    jspdf.text(`${truncateString(xaudit?.remarks, 70)}`, arrayColumn[6], TOP);
    TOP += 6;
    if (TOP > 200) {
      jspdf.addPage();
      numPages++;
      TOP = 10;
      PrintHeader(jspdf, TOP, comdsc, numPages, formValue);
      TOP += 28;
    }
  });

  return jspdf;
};

export const jsPdfToPrint = (
  data: any | undefined,
  extension: string,
  reportType: string,
  formValue: any
) => {
  if (extension !== "pdf") {
    dyanmicDownloadByHtmlTag({
      fileName: `${reportType}_${moment().format(
        "MMDDYYYYHHmmss"
      )}.${extension}`,
      text: data,
    });
  } else {
    if (formValue?.repOptionSave) {
      data.save(`${reportType}_${moment().format("MMDDYYYYHHmmss")}`);
    }
    if (formValue?.repOptionView) {
      window.open(URL.createObjectURL(data.output("blob")), "_blank");
    }
  }
};

export const dyanmicDownloadByHtmlTag = (arg: {
  fileName: string;
  text: string;
}) => {
  const element = document.createElement("a");
  const fileType =
    arg.fileName.indexOf(".json") > -1 ? "text/json" : "text/plain";
  element.setAttribute(
    "href",
    `data:${fileType};charset=utf-8,${encodeURIComponent(arg.text)}`
  );
  element.setAttribute("download", arg.fileName);

  var event = new MouseEvent("click");
  element.dispatchEvent(event);
};
