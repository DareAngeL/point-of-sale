import * as _ from "lodash";
import moment from "moment";

export async function ESalesService(posData: any) {
  let groupedByDay: any = [];
  let returnData: any = [];

  groupedByDay = _.sortBy(posData.result, "trndte");
  groupedByDay = _.groupBy(groupedByDay, "trndte");
  let xcount_esales = 1;

  for (const [dayValue] of Object.entries(groupedByDay)) {
    let arrDay: any = dayValue;
    // this.socketService.emit(
    //   "managersreport_emit",
    //   `<b>E-Sales</b><br> Generating ${(
    //     (xcount_esales / Object.entries(groupedByDay).length) *
    //     100
    //   ).toFixed(2)}%`
    // );
    xcount_esales++;

    returnData.push({
      date: moment(arrDay[0].trndte).format("DD"),
      grossSales: posData.grossSales,
      serviceCharge: posData.serviceCharge,
      vatAdj: posData.vatAdj,
      scpwdDiscount: posData.scpwdDiscount,
      govDiscount: posData.govDiscount,
      regDiscount: posData.regDiscount,
      totalSales: posData.totalSales,
      vatableSales: posData.vatableSales,
      vatAmount: posData.vatAmount,
      vatExemptSales: posData.vatExemptSales,
      vatZeroRated: posData.vatZeroRated,
      begOR: posData.begOR,
      endOR: posData.endOR,
    });
  }

  return returnData;
}
