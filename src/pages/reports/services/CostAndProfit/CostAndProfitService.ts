import { useService } from "../../../../hooks/reportHooks";
import { discountComputation } from "../ManagerReportService";
import * as _ from "lodash";
import { PosfileModel } from "../../../../models/posfile";

export async function CostAndProfitService(
  posData: PosfileModel,
  formValue: any
) {
  const { getData } = useService<any>();

  let groupedByItem: any = [];
  let arrayItems: any = [];
  let arrayPOSItems: any = [];
  let returnData: any = [];

  groupedByItem = _.groupBy(posData, "itemfile.itmdsc");
  arrayPOSItems = [];
  let xcount_cost = 1;
  for (const [keyItem, valueItem] of Object.entries(groupedByItem)) {
    // this.socketService.emit(
    //   "managersreport_emit",
    //   `<b>Cost and Profit</b><br> Generating ${xcount_cost} of ${
    //     Object.entries(groupedByItem).length
    //   }`
    // );
    xcount_cost++;
    const xvalueItem: any = valueItem;
    for (const xdata_val of Object.values(xvalueItem)) {
      let record: any = xdata_val;
      let discount = 0;
      let x_regdiscount = 0;
      await discountComputation(record).then((res) => {
        discount += res.xscpwddisc + res.xgovdiscount;
        x_regdiscount += res.x_regdiscount;
      });

      const refund = await getData(
        "posfile/filter",
        {
          ordocnum: record.ordocnum,
          orderitmid: record.orderitmid,
          itmcde: record.itmcde,
          refund: 1,
          postrntyp: "ITEM",
          trndte: record.trndte,
        },
        () => {}
      );
      if (refund.data.length > 0) {
        refund.data.map(async (resRefund: any) => {
          let refundDiscount = 0;
          let refundRegDisc = 0;

          record.itmqty = record.itmqty - resRefund.refundqty;
          record.groext = record.groext - resRefund.groext;
          record.extprc = record.extprc - resRefund.extprc;

          await discountComputation(resRefund).then((res) => {
            refundDiscount += res.xscpwddisc + res.xgovdiscount;
            refundRegDisc += res.x_regdiscount;
          });

          record.lessvat = record.lessvat - resRefund.lessvat;
          discount = discount - refundDiscount;
          x_regdiscount = x_regdiscount - refundRegDisc;
        });
      }

      if (record.itmqty == 0) {
        continue;
      }

      arrayPOSItems.push({
        itmdsc: keyItem,
        cost: record.itemfile.untcst,
        qty: record.itmqty,
        vatadj: record.lessvat,
        discount: discount,
        regdiscount: x_regdiscount,
        amount: record.groext,
        total: record.extprc,
        postypcde: record.postypcde,
      });
    }
  }
  if (formValue?.dineType && formValue?.dineType.length > 0) {
    let groupedByPostyp = _.groupBy(arrayPOSItems, "postypcde");
    let x = 1;
    for (const [keyDine, arrDine] of Object.entries(groupedByPostyp)) {
      // this.socketService.emit(
      //   "managersreport_emit",
      //   `<b>Cost and Profit</b><br> Finishing ${(
      //     (x / Object.entries(groupedByPostyp).length) *
      //     100
      //   ).toFixed(2)}%`
      // );
      x++;
      groupedByItem = _.groupBy(arrDine, "itmdsc");
      arrayItems = [];
      for (const [keyItem, arrItems] of Object.entries(groupedByItem)) {
        let qty = 0;
        let amount = 0;
        let vatadj = 0;
        let discount = 0;
        let regdiscount = 0;
        let total = 0;
        let cost;

        const xarrItems: any = arrItems;
        for (const xdata_val of Object.values(xarrItems)) {
          let record: any = xdata_val;
          qty += parseFloat(record.qty);
          amount += parseFloat(record.amount);
          vatadj += parseFloat(record.vatadj);
          discount += parseFloat(record.discount);
          regdiscount += parseFloat(record.regdiscount);
          total += parseFloat(record.total);
          cost = parseFloat(record.cost);
        }
        arrayItems.push({
          itmdsc: keyItem,
          cost: cost,
          qty: qty,
          vatadj: vatadj,
          discount: discount,
          regdiscount: regdiscount,
          amount: amount,
          total: total,
        });
      }
      arrayItems.sort((a: any, b: any) => {
        return a.itmdsc < b.itmdsc ? -1 : 1;
      });
      returnData = {
        ...returnData,
        ...{
          [keyDine]: arrayItems,
        },
      };
    }
  } else {
    groupedByItem = _.groupBy(arrayPOSItems, "itmdsc");
    arrayItems = [];
    let x = 1;
    for (const [keyItem, arrItems] of Object.entries(groupedByItem)) {
      // this.socketService.emit(
      //   "managersreport_emit",
      //   `<b>Cost and Profit</b><br> Finishing ${(
      //     (x / Object.entries(groupedByItem).length) *
      //     100
      //   ).toFixed(2)}%`
      // );
      x++;
      let qty = 0;
      let amount = 0;
      let vatadj = 0;
      let discount = 0;
      let regdiscount = 0;
      let total = 0;
      let cost;
      const xarrItems: any = arrItems;
      for (const xdata_val of Object.values(xarrItems)) {
        let record: any = xdata_val;
        qty += parseFloat(record.qty);
        amount += parseFloat(record.amount);
        vatadj += parseFloat(record.vatadj);
        discount += parseFloat(record.discount);
        regdiscount += parseFloat(record.regdiscount);
        total += parseFloat(record.total);
        cost = parseFloat(record.cost);
      }
      arrayItems.push({
        itmdsc: keyItem,
        cost: cost,
        qty: qty,
        vatadj: vatadj,
        discount: discount,
        regdiscount: regdiscount,
        amount: amount,
        total: total,
      });
    }
    arrayItems.sort((a: any, b: any) => {
      return a.itmdsc < b.itmdsc ? -1 : 1;
    });

    returnData = arrayItems;
  }

  return returnData;
}
