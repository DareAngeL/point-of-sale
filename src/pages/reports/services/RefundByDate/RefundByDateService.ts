import moment from "moment";
import * as _ from "lodash";
import {PosfileModel} from "../../../../models/posfile";

export async function RefundByDateService(
  posData: PosfileModel,
  transactions: any
) {
  let groupedByDay: any = [];
  let returnData: any = [];
  groupedByDay = _.sortBy(posData, ["trndte", "logtim"]);

  let xcount_ref = 1;

  for (const record of groupedByDay) {
    // this.socketService.emit(
    //   "managersreport_emit",
    //   `<b>Refund Transaction</b><br> Generating ${(
    //     (xcount_ref / groupedByDay.length) *
    //     100
    //   ).toFixed(2)}%`
    // );
    xcount_ref++;

    const takeouttranfile = transactions.data.find(
      (e: any) => e.ordercde === record.ordercde
    );

    console.log("si record", record);

    console.log("who?", takeouttranfile);

    let index = returnData.findIndex(
      (e: any) =>
        e.ordocnum === record.ordocnum &&
        e.trndte === moment(record.trndte).format("MM-DD-YYYY") &&
        e.refundreason === record.refundreason
    );
    if (index > -1) {
      returnData[index].groext += parseFloat(record.groext);
      returnData[index].extprc += parseFloat(record.extprc);
    } else {
      console.log("ricord", record);
      console.log(returnData);
      returnData.push({
        trndte: moment(record.trndte).format("MM-DD-YYYY"),
        logtim: moment(record.trndte + " " + record.logtim).format("LTS"),
        refunddte: moment(record.refunddte).format("MM-DD-YYYY"),
        refundlogtim: moment(
          record.refunddte + " " + record.refundlogtim
        ).format("LTS"),
        ordocnum: record.ordocnum,
        groext: parseFloat(record.groext),
        extprc: parseFloat(record.extprc),
        refundreason: record.refundreason,
        tablecde:
          takeouttranfile.length > 0 ? takeouttranfile[0].cusdsc : "WALK-IN",
        itmcde: record.itmcde,
        cashier: record.cashier,
      });
    }
  }

  console.log("final flash", returnData);
  return returnData;
}
