import moment from "moment";
import { useService } from "../../../../hooks/reportHooks";
import { discountComputation } from "../ManagerReportService";
import * as _ from "lodash";
import { PosfileModel } from "../../../../models/posfile";
import { numberFormat } from "../../../../helper/NumberFormat";

export async function ClassAndSubClassService(
  posData: PosfileModel,
  formValue: any,
  masterFiles: any
) {
  const { getData } = useService<any>();

  let groupedByItem: any = [];
  let groupedByClass: any = [];
  let groupedBySubClass: any = [];
  let arrayItems: any = [];
  let arrayClass: any = [];
  let arraySubClass: any = [];
  let returnData: any = [];
  let groupedByDinetype: any = [];
  const xnonvat = masterFiles.header.chknonvat;

  groupedByItem = _.groupBy(posData, "itemfile.itmdsc");
  arrayItems = [];
  let xcount_class = 1;
  for (const [keyItem, valueItem] of Object.entries(groupedByItem)) {
    // this.socketService.emit("managersreport_emit", `<b>Class and Subclass</b><br> Generating ${((xcount_class/(Object.entries(groupedByItem).length))*100).toFixed(2)}%`);
    xcount_class++;

    const xvalueItem: any = valueItem;
    for (const xdata_val of Object.values(xvalueItem)) {
      const record: any = xdata_val;
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
        itmclacde: record.itemfile.itemclassfile.itmclacde,
        itmcladsc: record.itemfile.itemclassfile.itmcladsc,
        itemsubclasscde: record.itemfile.itemsubclassfile.itemsubclasscde,
        itemsubclassdsc: record.itemfile.itemsubclassfile.itemsubclassdsc,
        day: moment(record.trndte).format("dddd"),
        qty: parseFloat(record.itmqty),
        amount: parseFloat(record.groext),
        discount: discount,
        vatadj: parseFloat(record.lessvat),
        total: xnonvat === 0 ? parseFloat(record.extprc) : 0,
        xvatexempt: parseFloat(record.vatexempt),
        xvatable: parseFloat(record.netvatamt),
        xvatexempt_less_disc: parseFloat(record.vatexempt) - xscpwddisc,
        vat_exempt_net:
          xnonvat === 0
            ? parseFloat(record.vatexempt) - xscpwddisc + parseFloat(record.netvatamt)
            : parseFloat(record.vatexempt) - discount + parseFloat(record.netvatamt),
        xvatamount: parseFloat(record.vatamt),
        dinetype: record.postypcde,
        dinetypedsc:
          formValue?.dineType && formValue?.dineType.length > 0
            ? masterFiles.dineType.find(
                (e: any) => e.postypcde === record.postypcde
              ).postypdsc
            : "",
      });
    }
  }

  if (formValue?.dineType && formValue?.dineType.length > 0) {
    groupedByDinetype = _.sortBy(arrayItems, "dinetypedsc");
    groupedByDinetype = _.groupBy(groupedByDinetype, "dinetype");
    let x = 1;
    for (const [keyDine, arrDine] of Object.entries(groupedByDinetype)) {
      const xarrDine: any = arrDine;
      // this.socketService.emit(
      //   "managersreport_emit",
      //   `<b>Class and Subclass</b><br> Finishing ${(
      //     (x / Object.entries(groupedByDinetype).length) *
      //     100
      //   ).toFixed(2)}%`
      // );
      x++;
      arrayClass = [];

      groupedByClass = _.sortBy(xarrDine, "itmcladsc");
      groupedByClass = _.groupBy(groupedByClass, "itmcladsc");
      for (const [keyClass, arrClass] of Object.entries(groupedByClass)) {
        const xarrClass: any = arrClass;
        arraySubClass = [];
        groupedBySubClass = _.sortBy(xarrClass, "itemsubclassdsc");
        groupedBySubClass = _.groupBy(groupedBySubClass, "itemsubclassdsc");
        for (const [keySubClass, arrSubClass] of Object.entries(
          groupedBySubClass
        )) {
          const xarrSubClass: any = arrSubClass;
          arrayItems = [];
          let qty = 0;
          let amount = 0;
          let vatadj = 0;
          let discount = 0;
          let total = 0;
          let vat_exempt_net = 0;
          let xvatable = 0;
          let xvatexempt = 0;
          let xvatexempt_less_disc = 0;
          let xvatamount = 0;
          groupedByItem = _.groupBy(xarrSubClass, "itmdsc");
          for (const [_, arrItems] of Object.entries(groupedByItem)) {
            const xarrItems: any = arrItems;

            for (const xdata_val of Object.values(xarrItems)) {
              const record: any = xdata_val;
              qty += record.qty;
              amount += record.amount;
              total += record.total;
              discount += record.discount;
              vatadj += record.vatadj;
              xvatexempt += record.xvatexempt;
              xvatexempt_less_disc += record.xvatexempt_less_disc;
              xvatable += record.xvatable;
              vat_exempt_net += record.vat_exempt_net;
              xvatamount += record.xvatamount;
            }
          }

          arraySubClass.push({
            itemsubclasscde: keySubClass,
            qty: qty,
            vatadj: vatadj,
            discount: discount,
            amount: amount,
            total: total,
            xvatexempt: xvatexempt,
            xvatexempt_less_disc: xvatexempt_less_disc,
            xvatable: xvatable,
            vat_exempt_net: vat_exempt_net,
            xvatamount: xvatamount,
          });
        }
        arraySubClass.sort((a: any, b: any) => {
          return a.itemsubclasscde < b.itemsubclasscde ? -1 : 1;
        });

        arrayClass = {
          ...arrayClass,
          ...{
            [keyClass]: arraySubClass,
          },
        };
      }
      returnData = {
        ...returnData,
        ...{
          [keyDine]: arrayClass,
        },
      };
    }
  } else {
    groupedByClass = _.sortBy(arrayItems, "itmcladsc");
    groupedByClass = _.groupBy(groupedByClass, "itmcladsc");
    for (const [keyClass, arrClass] of Object.entries(groupedByClass)) {
      const xarrClass: any = arrClass;
      // this.socketService.emit(
      //   "managersreport_emit",
      //   `<b>Class and Subclass</b><br> Finishing ${(
      //     (x / Object.entries(groupedByClass).length) *
      //     100
      //   ).toFixed(2)}%`
      // );
      arraySubClass = [];
      groupedBySubClass = _.sortBy(xarrClass, "itemsubclassdsc");
      groupedBySubClass = _.groupBy(groupedBySubClass, "itemsubclassdsc");
      for (const [keySubClass, arrSubClass] of Object.entries(
        groupedBySubClass
      )) {
        const xarrSubClass: any = arrSubClass;
        arrayItems = [];

        let qty = 0;
        let amount = 0;
        let vatadj = 0;
        let discount = 0;
        let total = 0;
        let vat_exempt_net = 0;
        let xvatable = 0;
        let xvatexempt = 0;
        let xvatexempt_less_disc = 0;
        let xvatamount = 0;
        groupedByItem = _.groupBy(xarrSubClass, "itmdsc");

        for (const [ _, itemProps] of Object.entries(groupedByItem)) {

          for (const xdata_val of itemProps as any) {
            const record: any = xdata_val;

            qty += Number(record.qty);
            amount += Number(numberFormat(record.amount, 2));
            total += Number(numberFormat(record.total, 2));
            discount += Number(numberFormat(record.discount, 2));
            vatadj += Number(numberFormat(record.vatadj, 2));
            xvatexempt += Number(numberFormat(record.xvatexempt, 2));
            xvatexempt_less_disc += Number(numberFormat(record.xvatexempt_less_disc, 2));
            xvatable += Number(numberFormat(record.xvatable, 2));
            vat_exempt_net += Number(numberFormat(record.vat_exempt_net, 2));
            xvatamount += Number(numberFormat(record.xvatamount, 2));
          }
        }

        arraySubClass.push({
          itemsubclasscde: keySubClass,
          qty: qty,
          vatadj: vatadj,
          discount: discount,
          amount: amount,
          total: total,
          xvatexempt: xvatexempt,
          xvatexempt_less_disc: xvatexempt_less_disc,
          xvatable: xvatable,
          vat_exempt_net: vat_exempt_net,
          xvatamount: xvatamount,
        });
      }
      arraySubClass.sort((a: any, b: any) => {
        return a.itemsubclasscde < b.itemsubclasscde ? -1 : 1;
      });

      returnData = {
        ...returnData,
        ...{
          [keyClass]: arraySubClass,
        },
      };
    }
  }

  return returnData;
}
