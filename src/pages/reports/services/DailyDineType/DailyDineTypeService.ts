import {useService} from "../../../../hooks/reportHooks";
import {discountComputation} from "../ManagerReportService";
import * as _ from "lodash";
import {PosfileModel} from "../../../../models/posfile";

export async function DailyDineTypeService(
  posData: PosfileModel[],
  formValue: any,
  masterFiles: any
) {
  const {getData} = useService<any>();

  let groupedByItem: any = [];
  let arrayItems: any = [];
  let returnData: any = [];
  let groupedByOrderType: any = [];

  groupedByItem = _.groupBy(
    posData, //.filter((item) => item.itmcomtyp === null),
    "itemfile.itmdsc"
  );
  arrayItems = [];
  let xcountdaily = 1;
  for (const [keyItem, valueItem] of Object.entries(groupedByItem)) {
    // this.socketService.emit(
    //   "managersreport_emit",
    //   `<b>Daily Dine Type</b><br> Finishing ${(
    //     (xcountdaily / Object.entries(groupedByItem).length) *
    //     100
    //   ).toFixed(2)}%`
    // );
    xcountdaily++;
    const xvalueItem: any = valueItem;
    for (const xdata_val of Object.values(xvalueItem)) {
      let record: any = xdata_val;
      let discount = 0;
      let xscpwddisc = 0;

      await discountComputation(record).then((res) => {
        discount += res.xscpwddisc + res.x_regdiscount + res.xgovdiscount;
        xscpwddisc += res.xscpwddisc;
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
          let refundScpwddisc = 0;

          record.itmqty = record.itmqty - resRefund.refundqty;
          record.groext = record.groext - resRefund.groext;
          record.extprc = record.extprc - resRefund.extprc;
          record.netvatamt = record.netvatamt - resRefund.netvatamt;

          await discountComputation(resRefund).then((res) => {
            refundDiscount +=
              res.xscpwddisc + res.x_regdiscount + res.xgovdiscount;
            refundScpwddisc += res.xscpwddisc;
          });

          record.lessvat = record.lessvat - resRefund.lessvat;
          record.vatexempt = record.vatexempt - resRefund.vatexempt;
          discount = discount - refundDiscount;
          xscpwddisc = xscpwddisc - refundScpwddisc;
        });
      }

      if (record.itmqty == 0) {
        continue;
      }
      arrayItems.push({
        itmdsc: keyItem,
        ordertyp: record.ordertyp,
        qty: parseFloat(record.itmqty),
        amount: parseFloat(record.groext),
        vatadj: parseFloat(record.lessvat),
        discount: discount,
        total: parseFloat(record.extprc),
        xvatamount: parseFloat(record.vatamt),
        xvatable: parseFloat(record.netvatamt),
        xvatexempt: parseFloat(record.vatexempt),
        xvatexempt_disc: parseFloat(record.vatexempt) - discount,
        vat_exempt_net: parseFloat(record.vatexempt) - xscpwddisc + parseFloat(record.netvatamt),
        dinetype: record.postypcde,
        dinetypedsc:
          formValue?.dineType && formValue?.dineType.length > 0
            ? masterFiles.dineType.find(
                (e: any) => e.postypcde === record.postypcde
              ).postypdsc
            : "",
      });

      console.log("arrItems", arrayItems);      
    }
  }

  if (formValue?.dineType && formValue?.dineType.length > 0) {
    groupedByOrderType = _.sortBy(arrayItems, "dinetypedsc");
    groupedByOrderType = _.groupBy(groupedByOrderType, "dinetype");
    let x = 1;
    for (const [keyOrderType, arrOrderType] of Object.entries(
      groupedByOrderType
    )) {
      // this.socketService.emit(
      //   "managersreport_emit",
      //   `<b>Daily Dine Type</b><br> Finishing ${(
      //     (x / Object.entries(groupedByOrderType).length) *
      //     100
      //   ).toFixed(2)}%`
      // );
      x++;
      arrayItems = [];
      const xarrOrderType: any = arrOrderType;
      groupedByItem = _.groupBy(xarrOrderType, "itmdsc");
      for (const [keyItem, arrItems] of Object.entries(groupedByItem)) {
        let qty = 0;
        let amount = 0;
        let vatadj = 0;
        let discount = 0;
        let total = 0;
        let xvatable = 0;
        let xvatamount = 0;
        let xvatexempt = 0;
        let xvatexempt_disc = 0;
        let vat_exempt_net = 0;
        const xarrItems: any = arrItems;
        for (const xdata_val of Object.values(xarrItems)) {
          let record: any = xdata_val;
          qty += record.qty;
          amount += record.amount;
          total += record.total;
          vatadj += record.vatadj;
          discount += record.discount;
          xvatable += record.xvatable;
          xvatamount += record.xvatamount;
          xvatexempt += record.xvatexempt;
          vat_exempt_net += record.vat_exempt_net;
          xvatexempt_disc += record.xvatexempt_disc;
        }
        arrayItems.push({
          itmdsc: keyItem,
          qty: qty,
          amount: amount,
          vatadj: vatadj,
          discount: discount,
          total: total,
          xvatable: xvatable,
          xvatamount: xvatamount,
          xvatexempt: xvatexempt,
          vat_exempt_net: vat_exempt_net,
          xvatexempt_disc: xvatexempt_disc,
        });

        arrayItems.sort((a: any, b: any) => {
          return a.itmdsc < b.itmdsc ? -1 : 1;
        });
      }
      returnData = {
        ...returnData,
        ...{
          [keyOrderType]: arrayItems,
        },
      };
    }
  } else {
    groupedByOrderType = _.sortBy(arrayItems, "ordertyp");
    groupedByOrderType = _.groupBy(groupedByOrderType, "ordertyp");
    let x = 1;
    for (const [keyOrderType, arrOrderType] of Object.entries(
      groupedByOrderType
    )) {
      // this.socketService.emit(
      //   "managersreport_emit",
      //   `<b>Daily Dine Type</b><br> Finishing ${(
      //     (x / Object.entries(groupedByOrderType).length) *
      //     100
      //   ).toFixed(2)}%`
      // );
      x++;
      arrayItems = [];
      const xarrOrderType: any = arrOrderType;
      groupedByItem = _.groupBy(xarrOrderType, "itmdsc");
      for (const [keyItem, arrItems] of Object.entries(groupedByItem)) {
        let qty = 0;
        let amount = 0;
        let vatadj = 0;
        let discount = 0;
        let total = 0;
        let xvatable = 0;
        let xvatamount = 0;
        let xvatexempt = 0;
        let xvatexempt_disc = 0;
        let vat_exempt_net = 0;
        const xarrItems: any = arrItems;
        for (const xdata_val of Object.values(xarrItems)) {
          let record: any = xdata_val;
          qty += record.qty;
          amount += record.amount;
          total += record.total;
          vatadj += record.vatadj;
          discount += record.discount;
          xvatable += record.xvatable;
          xvatamount += record.xvatamount;
          xvatexempt += record.xvatexempt;
          vat_exempt_net += record.vat_exempt_net;
          xvatexempt_disc += record.xvatexempt_disc;
        }
        arrayItems.push({
          itmdsc: keyItem,
          qty: qty,
          amount: amount,
          vatadj: vatadj,
          discount: discount,
          total: total,
          xvatable: xvatable,
          xvatamount: xvatamount,
          xvatexempt: xvatexempt,
          vat_exempt_net: vat_exempt_net,
          xvatexempt_disc: xvatexempt_disc,
        });

        arrayItems.sort((a: any, b: any) => {
          return a.itmdsc < b.itmdsc ? -1 : 1;
        });
      }
      returnData = {
        ...returnData,
        ...{
          [keyOrderType]: arrayItems,
        },
      };
    }
  }

  return returnData;
}
