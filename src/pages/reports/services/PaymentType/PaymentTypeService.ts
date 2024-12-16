import * as _ from "lodash";
import {PosfileModel} from "../../../../models/posfile";
import moment from "moment";

export async function PaymentTypeService(posData: PosfileModel) {
  let returnData: any = [];
  let arrayPaymentType = [];
  let sortByOrDocNo = [];

  sortByOrDocNo = _.sortBy(posData, "ordocnum");
  let xcountPaymentType = 1;
  for (const xdata_val of Object.values(sortByOrDocNo)) {
    // this.socketService.emit("managersreport_emit", `<b>Payment Type</b><br> Generating Detailed ${(( xcountPaymentType / (Object.values(sortByOrDocNo).length)) * 100).toFixed(2)}%`);
    xcountPaymentType++;

    let record: any = xdata_val;

    var time = record.logtim.toString(); // your input
    time = time.split(":"); // convert to array

    // fetch
    var hours = Number(time[0]);
    var minutes = Number(time[1]);

    // calculate
    var timeValue;

    if (hours > 0 && hours <= 12) {
      timeValue = "" + hours;
    } else if (hours > 12) {
      timeValue = "" + (hours - 12);
    } else if (hours == 0) {
      timeValue = "12";
    }

    timeValue += minutes < 10 ? ":0" + minutes : ":" + minutes; // get minutes
    timeValue += hours >= 12 ? " PM" : " AM"; // get AM/PM

    arrayPaymentType.push({
      ordocnum: record.ordocnum,
      date: moment(record.trndte).format("MM/DD/YYYY"),
      time: timeValue,
      paymentType:
        record.itmcde !== "CARD"
          ? record.itmcde === "GIFT"
            ? "GIFT CHECK"
            : record.itmcde
          : record.cardclass,
      amount: record.extprc,
      refund: record.refund,
      cashier: record.cashier,
    });
  }

  returnData = {
    detailed: arrayPaymentType,
  };

  arrayPaymentType = [];
  xcountPaymentType = 1;

  for (const xdata_val of Object.values(posData)) {
    // this.socketService.emit(
    //   "managersreport_emit",
    //   `<b>Payment Type</b><br> Generating Summarized ${(
    //     (xcountPaymentType / Object.entries(posfile).length) *
    //     100
    //   ).toFixed(2)}%`
    // );
    xcountPaymentType++;

    let record: any = xdata_val;
    const xpaymentType =
      record.itmcde !== "CARD"
        ? record.itmcde === "GIFT"
          ? "GIFT CHECK"
          : record.itmcde
        : record.cardclass;

    if (arrayPaymentType[xpaymentType] !== undefined) {
      if (record.refund === 1) {
        arrayPaymentType[xpaymentType] -= parseFloat(record.extprc);
        continue;
      }
      
      arrayPaymentType[xpaymentType] += parseFloat(record.extprc);
    } else {
      if (record.refund === 1) {
        arrayPaymentType[xpaymentType] = -parseFloat(record.extprc);
        continue;
      }
      
      arrayPaymentType[xpaymentType] = parseFloat(record.extprc);
    }
  }

  let arrSummarized = [];
  for (const [keyPaymentType, valuePaymentType] of Object.entries(
    arrayPaymentType
  ).sort()) {
    arrSummarized.push({
      paymentType: keyPaymentType,
      amount: valuePaymentType,
    });
  }

  returnData = {
    ...returnData,
    ...{
      summary: arrSummarized,
    },
  };

  return returnData;
}
