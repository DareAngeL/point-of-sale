import moment from "moment";
import {useService} from "../../../../hooks/reportHooks";
import {discountComputation} from "../ManagerReportService";
import * as _ from "lodash";
import {PosfileModel} from "../../../../models/posfile";

export async function ItemizedService(
  posData: PosfileModel[],
  formValue: any,
  masterFiles: any
) {
  const {getData} = useService<any>();

  let returnData: any = [];
  let groupedByItem: any = [];
  let groupedByClass: any = [];
  let groupedBySubClass: any = [];
  let groupedByDay: any = [];
  let arrayItems: any = [];
  let arrayClass: any = [];
  let arraySubClass: any = [];
  let arrayDine: any = [];
  let groupedByDinetype: any = [];
  const xnonvat = masterFiles.header.chknonvat;

  groupedByItem = _.groupBy(
    posData,//.filter((item) => item.itmcomtyp === null),
    "itemfile.itmdsc"
  );
  
  arrayItems = [];
  let xcount_item = 1;

  for (const [keyItem, valueItem] of Object.entries(groupedByItem)) {
    const xvalueItem: any = valueItem;
    xcount_item++;

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

          if (refund.length > 0) {
            record.itmqty = record.itmqty - resRefund.refundqty;
            record.groext = record.groext - resRefund.groext;
            record.extprc = record.extprc - resRefund.extprc;
            record.netvatamt = record.netvatamt - resRefund.netvatamt;
            record.vatamt = record.vatamt - resRefund.vatamt;

            await discountComputation(resRefund).then((res) => {
              refundDiscount +=
                res.xscpwddisc + res.x_regdiscount + res.xgovdiscount;
              refundScpwddisc += res.xscpwddisc;
            });

            record.lessvat = record.lessvat - resRefund.lessvat;
            record.vatexempt = record.vatexempt - resRefund.vatexempt;
            discount = discount - refundDiscount;
            xscpwddisc = xscpwddisc - refundScpwddisc;
          }
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
        day: moment(record.trndte).format("LL"),
        qty: parseFloat(record.itmqty),
        amount: parseFloat(record.groext),
        discount: discount,
        vatadj: parseFloat(record.lessvat),
        total: xnonvat === 0 ? parseFloat(record.extprc) : 0,
        xvatamount: parseFloat(record.vatamt),
        xvatable: parseFloat(record.netvatamt),
        xvatexempt: parseFloat(record.vatexempt),
        xvatexempt_less_disc: parseFloat(record.vatexempt) - xscpwddisc,
        vat_exempt_net:
          xnonvat === 0
            ? parseFloat(record.vatexempt) - xscpwddisc + parseFloat(record.netvatamt)
            : parseFloat(record.vatexempt) - discount + parseFloat(record.netvatamt) ,
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
    if (formValue?.detailedSumOption === "detailed") {
      groupedByDay = _.groupBy(arrayItems, "day");
      let x = 1;
      for (const [keyDay, arrayDay] of Object.entries(groupedByDay)) {
        const xarrayDay: any = arrayDay;
        // this.socketService.emit(
        //   "managersreport_emit",
        //   `<b>Itemized</b><br> Finishing ${(
        //     (x / Object.entries(groupedByDay).length) *
        //     100
        //   ).toFixed(2)}%`
        // );
        x++;
        arrayDine = [];
        groupedByDinetype = _.sortBy(xarrayDay, "dinetypedsc");
        groupedByDinetype = _.groupBy(groupedByDinetype, "dinetype");

        for (const [keyDine, arrDine] of Object.entries(groupedByDinetype)) {
          const xarrDine: any = arrDine;
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
              groupedByItem = _.groupBy(xarrSubClass, "itmdsc");

              for (const [keyItem, arrItems] of Object.entries(groupedByItem)) {
                const xarrItems: any = arrItems;
                let qty = 0;
                let amount = 0;
                let vatadj = 0;
                let discount = 0;
                let total = 0;
                let xvatamount = 0;
                let xvatable = 0;
                let xvatexempt = 0;
                let xvatexempt_less_disc = 0;
                let vat_exempt_net = 0;

                for (const xdata_val of Object.values(xarrItems)) {
                  let record: any = xdata_val;
                  discount += record.discount;
                  vatadj += record.vatadj;
                  qty += record.qty;
                  amount += record.amount;
                  total += record.total;
                  xvatable += record.xvatable;
                  xvatamount += record.xvatamount;
                  xvatexempt += record.xvatexempt;
                  vat_exempt_net += record.vat_exempt_net;
                  xvatexempt_less_disc += record.xvatexempt_less_disc;
                }
                arrayItems.push({
                  discount: discount,
                  vatadj: vatadj,
                  itmdsc: keyItem,
                  qty: qty,
                  amount: amount,
                  total: total,
                  xvatable: xvatable,
                  xvatamount: xvatamount,
                  xvatexempt: xvatexempt,
                  xvatexempt_less_disc: xvatexempt_less_disc,
                  vat_exempt_net: vat_exempt_net,
                });
              }
              arrayItems.sort((a: any, b: any) => {
                return a.itmdsc < b.itmdsc ? -1 : 1;
              });
              arraySubClass = {
                ...arraySubClass,
                ...{
                  [keySubClass]: arrayItems,
                },
              };
            }

            arrayClass = {
              ...arrayClass,
              ...{
                [keyClass]: arraySubClass,
              },
            };
          }
          arrayDine = {
            ...arrayDine,
            ...{
              [keyDine]: arrayClass,
            },
          };
        }

        returnData = {
          ...returnData,
          ...{
            [keyDay]: arrayDine,
          },
        };
      }
    } else {
      arrayDine = [];
      groupedByDinetype = _.sortBy(arrayItems, "dinetypedsc");
      groupedByDinetype = _.groupBy(groupedByDinetype, "dinetype");
      let x = 1;
      for (const [keyDine, arrDine] of Object.entries(groupedByDinetype)) {
        const xarrDine: any = arrDine;
        // this.socketService.emit(
        //   "managersreport_emit",
        //   `<b>Itemized</b><br> Finishing ${(
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
            groupedByItem = _.groupBy(xarrSubClass, "itmdsc");

            for (const [keyItem, arrItems] of Object.entries(groupedByItem)) {
              const xarrItems: any = arrItems;
              let qty = 0;
              let amount = 0;
              let vatadj = 0;
              let discount = 0;
              let total = 0;
              let xvatamount = 0;
              let xvatable = 0;
              let xvatexempt = 0;
              let xvatexempt_less_disc = 0;
              let vat_exempt_net = 0;

              for (const xdata_val of Object.values(xarrItems)) {
                let record: any = xdata_val;
                discount += record.discount;
                vatadj += record.vatadj;
                qty += record.qty;
                amount += record.amount;
                total += record.total;
                xvatable += record.xvatable;
                xvatamount += record.xvatamount;
                xvatexempt += record.xvatexempt;
                vat_exempt_net += record.vat_exempt_net;
                xvatexempt_less_disc += record.xvatexempt_less_disc;
              }
              arrayItems.push({
                discount: discount,
                vatadj: vatadj,
                itmdsc: keyItem,
                qty: qty,
                amount: amount,
                total: total,
                xvatable: xvatable,
                xvatamount: xvatamount,
                xvatexempt: xvatexempt,
                xvatexempt_less_disc: xvatexempt_less_disc,
                vat_exempt_net: vat_exempt_net,
              });
            }

            arrayItems.sort((a: any, b: any) => {
              return a.itmdsc < b.itmdsc ? -1 : 1;
            });

            arraySubClass = {
              ...arraySubClass,
              ...{
                [keySubClass]: arrayItems,
              },
            };
          }

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
    }
  } else {
    if (formValue?.detailedSumOption === "detailed") {
      groupedByDay = _.groupBy(arrayItems, "day");
      let x = 1;
      for (const [keyDay, arrayDay] of Object.entries(groupedByDay)) {
        const xarrayDay: any = arrayDay;
        // this.socketService.emit(
        //   "managersreport_emit",
        //   `<b>Itemized</b><br> Finishing ${(
        //     (x / Object.entries(groupedByDay).length) *
        //     100
        //   ).toFixed(2)}%`
        // );
        x++;
        arrayClass = [];
        groupedByClass = _.sortBy(xarrayDay, "itmcladsc");
        groupedByClass = _.sortBy(xarrayDay, "itmcladsc");
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
            groupedByItem = _.groupBy(xarrSubClass, "itmdsc");

            for (const [keyItem, arrItems] of Object.entries(groupedByItem)) {
              const xarrItems: any = arrItems;
              let qty = 0;
              let amount = 0;
              let vatadj = 0;
              let discount = 0;
              let total = 0;
              let xvatamount = 0;
              let xvatable = 0;
              let xvatexempt = 0;
              let xvatexempt_less_disc = 0;
              let vat_exempt_net = 0;

              for (const xdata_val of Object.values(xarrItems)) {
                let record: any = xdata_val;
                discount += record.discount;
                vatadj += record.vatadj;
                qty += record.qty;
                amount += record.amount;
                total += record.total;
                xvatable += record.xvatable;
                xvatamount += record.xvatamount;
                xvatexempt += record.xvatexempt;
                xvatexempt_less_disc += record.xvatexempt_less_disc;
                vat_exempt_net += record.vat_exempt_net;
              }
              arrayItems.push({
                discount: discount,
                vatadj: vatadj,
                itmdsc: keyItem,
                qty: qty,
                amount: amount,
                total: total,
                xvatable: xvatable,
                xvatamount: xvatamount,
                xvatexempt: xvatexempt,
                xvatexempt_less_disc: xvatexempt_less_disc,
                vat_exempt_net: vat_exempt_net,
              });
            }
            arrayItems.sort((a: any, b: any) => {
              return a.itmdsc < b.itmdsc ? -1 : 1;
            });
            arraySubClass = {
              ...arraySubClass,
              ...{
                [keySubClass]: arrayItems,
              },
            };
          }

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
            [keyDay]: arrayClass,
          },
        };
      }
    } else {
      groupedByClass = _.sortBy(arrayItems, "itmcladsc");
      groupedByClass = _.groupBy(groupedByClass, "itmcladsc");
      let x = 1;
      for (const [keyClass, arrClass] of Object.entries(groupedByClass)) {
        const xarrClass: any = arrClass;
        // this.socketService.emit(
        //   "managersreport_emit",
        //   `<b>Itemized</b><br> Finishing ${(
        //     (x / Object.entries(groupedByClass).length) *
        //     100
        //   ).toFixed(2)}%`
        // );
        x++;
        arraySubClass = [];
        groupedBySubClass = _.sortBy(xarrClass, "itemsubclassdsc");
        groupedBySubClass = _.groupBy(groupedBySubClass, "itemsubclassdsc");

        for (const [keySubClass, arrSubClass] of Object.entries(
          groupedBySubClass
        )) {
          const xarrSubClass: any = arrSubClass;
          arrayItems = [];
          groupedByItem = _.groupBy(xarrSubClass, "itmdsc");

          for (const [keyItem, arrItems] of Object.entries(groupedByItem)) {
            const xarrItems: any = arrItems;
            let qty = 0;
            let amount = 0;
            let vatadj = 0;
            let discount = 0;
            let total = 0;
            let xvatamount = 0;
            let xvatable = 0;
            let xvatexempt = 0;
            let xvatexempt_less_disc = 0;
            let vat_exempt_net = 0;

            for (const xdata_val of Object.values(xarrItems)) {
              let record: any = xdata_val;
              discount += record.discount;
              vatadj += record.vatadj;
              qty += record.qty;
              amount += record.amount;
              total += record.total;
              xvatable += record.xvatable;
              xvatamount += record.xvatamount;
              xvatexempt += record.xvatexempt;
              xvatexempt_less_disc += record.xvatexempt_less_disc;
              vat_exempt_net += record.vat_exempt_net;
            }
            arrayItems.push({
              discount: discount,
              vatadj: vatadj,
              itmdsc: keyItem,
              qty: qty,
              amount: amount,
              total: total,
              xvatable: xvatable,
              xvatamount: xvatamount,
              xvatexempt: xvatexempt,
              xvatexempt_less_disc: xvatexempt_less_disc,
              vat_exempt_net: vat_exempt_net,
            });
          }
          arrayItems.sort((a: any, b: any) => {
            return a.itmdsc < b.itmdsc ? -1 : 1;
          });
          arraySubClass = {
            ...arraySubClass,
            ...{
              [keySubClass]: arrayItems,
            },
          };
        }

        returnData = {
          ...returnData,
          ...{
            [keyClass]: arraySubClass,
          },
        };
      }
    }
  }

  return returnData;
}
