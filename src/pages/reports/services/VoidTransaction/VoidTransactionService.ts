import moment from "moment";
import * as _ from "lodash";
import { PosfileModel } from "../../../../models/posfile";

export async function VoidTransactionService(
  posData: PosfileModel,
  transactions: any
) {
  let groupedByDay: any = [];
  let returnData: any = [];
  groupedByDay = _.sortBy(posData, ["trndte", "logtim"]);

  let xcount_voidtran = 1;
  for (const record of groupedByDay) {
    // this.socketService.emit("managersreport_emit", `<b>Void Transaction</b><br> Generating ${((xcount_voidtran/(groupedByDay.length))*100).toFixed(2)}%`);
    xcount_voidtran++;
    const takeouttranfile = transactions.data.find(
      (e: any) => e.ordercde === record.ordercde
    );

    let index = returnData.findIndex(
      (e: any) => e.ordocnum === record.ordocnum
    );
    if (index > -1) {
      returnData[index].groext +=
        record.postrntyp === "SERVICE CHARGE" ? record.groext : record.groext;
      returnData[index].extprc +=
        record.postrntyp === "SERVICE CHARGE" ? 0 : record.extprc;
    } else {
      returnData.push({
        trndte: moment(record.trndte).format("MM-DD-YYYY"),
        logtim: moment(record.trndte + " " + record.logtim).format("LTS"),
        ordocnum: record.ordocnum,
        groext:
          record.postrntyp === "SERVICE CHARGE" ? record.groext : record.groext,
        extprc: record.postrntyp === "SERVICE CHARGE" ? 0 : record.extprc,
        voidreason: record.voidreason,
        tablecde: takeouttranfile.cusdsc,
      });
    }
  }

  return returnData;
}
