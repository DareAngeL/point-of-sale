import { useService } from "../../../../hooks/reportHooks";
import * as _ from "lodash";
import { PosfileModel } from "../../../../models/posfile";
import moment from "moment";

export async function FreeService(
  posData: PosfileModel,
  formValue: any,
  masterFiles: any
) {
  const { getData } = useService<any>();

  let groupedByPOSItem: any = [];
  let groupedByItem: any = [];
  let groupedByDocnum: any = [];
  let groupedByDay: any = [];
  let groupedByFreeReason: any = [];
  let arrayItems: any = [];
  let arrayPOSItems: any = [];
  let arrayDate: any = [];
  let arrayFreeReasons: any = [];
  let returnData: any = [];
  let arrayDine: any = [];
  let groupedByOrderType: any = [];

  let freereasonfile = masterFiles.freeReason.data;

  groupedByPOSItem = _.groupBy(posData, "itemfile.itmdsc");

  arrayPOSItems = [];
  let xcount_free = 1;
  for (const [keyItem, valueItem] of Object.entries(groupedByPOSItem)) {
    // this.socketService.emit(
    //   "managersreport_emit",
    //   `<b>Free Items</b><br> Generating ${xcount_free} of ${
    //     Object.entries(groupedByItem).length
    //   }`
    // );
    xcount_free++;
    const xvalueItem: any = valueItem;
    for (const xdata_val of Object.values(xvalueItem)) {
      let record: any = xdata_val;

      const lastPrice = await getData(
        "posfile/filter",
        {
          itmcde: record.itmcde,
          trndte: record.trndte,
          void: 0,
          refund: 0,
          freereason: "eqv2:null",
          comboid: "eqv2:",
          _sortby: "trndte:desc",
          _limit: 1,
        },
        () => {}
      );

      const priceList = masterFiles.warehouse
        .find((e: any) => e.warcde === record.warcde)
        .warehousefile2s.find((e2: any) => e2.postypcde === record.postypcde);

      const price = await getData(
        "pricedetail/filter",
        {
          prccde: priceList.prccde,
          itmcde: record.itmcde,
        },
        () => {}
      );

      const itemPrice =
        lastPrice.data.length > 0
          ? lastPrice.data[0].untprc
          : price.data[0].untprc;

      const refund = await getData(
        "posfile/filter",
        {
          ordocnum: record.ordocnum,
          orderitmid: record.orderitmid,
          itmcde: record.itmcde,
          refund: 1,
          postrntyp: "ITEM",
        },
        () => {}
      );
      refund.data.map(async (resRefund: any) => {
        if (record.itmqty != resRefund.itmqty) {
          record.itmqty = record.itmqty - resRefund.refundqty;
        }
      });

      arrayPOSItems.push({
        itmdsc: keyItem,
        freereason: _.find(freereasonfile, ["freereason", record.freereason])
          ? record.freereason
          : "Others",
        qty: record.itmqty,
        ordocnum: record.ordocnum,
        amount: itemPrice,
        trndte: record.trndte,
        total: record.itmqty * itemPrice,
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
    arrayDate = [];
    groupedByDay = _.sortBy(arrayPOSItems, "trndte");
    groupedByDay = _.groupBy(groupedByDay, "trndte");
    let x = 1;
    for (const [keyDay, arrDay] of Object.entries(groupedByDay)) {
      // this.socketService.emit(
      //   "managersreport_emit",
      //   `<b>Free Items</b><br> Finishing ${(
      //     (x / Object.entries(groupedByDay).length) *
      //     100
      //   ).toFixed(2)}%`
      // );
      x++;
      arrayDine = [];
      const xarrDay: any = arrDay;
      groupedByOrderType = _.sortBy(xarrDay, "dinetypedsc");
      groupedByOrderType = _.groupBy(groupedByOrderType, "dinetype");
      for (const [keyDine, arrDine] of Object.entries(groupedByOrderType)) {
        const xarrDine: any = arrDine;
        arrayFreeReasons = [];
        groupedByFreeReason = _.sortBy(xarrDine, "freereason");
        groupedByFreeReason = _.groupBy(groupedByFreeReason, "freereason");

        for (const [keyFreeReason, arrFreeReason] of Object.entries(
          groupedByFreeReason
        )) {
          arrayItems = [];
          const xarrFreeReason: any = arrFreeReason;
          groupedByItem = _.groupBy(xarrFreeReason, "itmdsc");
          for (const [keyItem, arrItems] of Object.entries(groupedByItem)) {
            let qty = 0;
            let amount = 0;
            let total = 0;
            const xarrItems: any = arrItems;
            for (const xdata_val of Object.values(xarrItems)) {
              let record: any = xdata_val;
              qty += record.qty;
              amount += record.amount;
              total += record.total;
            }
            arrayItems.push({
              itmdsc: keyItem,
              qty: qty,
              amount: amount,
              total: total,
            });
          }
          arrayItems.sort((a: any, b: any) => {
            return a.itmdsc < b.itmdsc ? -1 : 1;
          });
          arrayFreeReasons = {
            ...arrayFreeReasons,
            ...{
              [keyFreeReason]: arrayItems,
            },
          };
        }
        arrayDine = {
          ...arrayDine,
          ...{
            [keyDine]: arrayFreeReasons,
          },
        };
      }
      arrayDate = {
        ...arrayDate,
        ...{
          [moment(keyDay).format("MM-DD-YYYY")]: arrayDine,
        },
      };
    }

    returnData = {
      detailed: arrayDate,
    };

    let arrayDine2: any = [];

    groupedByOrderType = _.sortBy(arrayPOSItems, "dinetypedsc");
    groupedByOrderType = _.groupBy(groupedByOrderType, "dinetype");
    x = 1;
    for (const [keyDine, arrDine] of Object.entries(groupedByOrderType)) {
      // this.socketService.emit(
      //   "managersreport_emit",
      //   `<b>Free Transaction</b><br> Finishing ${(
      //     (x / Object.entries(groupedByOrderType).length) *
      //     100
      //   ).toFixed(2)}%`
      // );
      x++;
      const xarrDine: any = arrDine;
      groupedByFreeReason = _.sortBy(xarrDine, "freereason");
      groupedByFreeReason = _.groupBy(groupedByFreeReason, "freereason");
      arrayFreeReasons = [];
      for (const [keyFreeReason, arrFreeReasons] of Object.entries(
        groupedByFreeReason
      )) {
        const xarrFreeReasons: any = arrFreeReasons;
        groupedByDay = _.sortBy(xarrFreeReasons, "trndte");
        groupedByDay = _.groupBy(groupedByDay, "trndte");

        arrayDate = [];
        for (const [keyDay, arrDay] of Object.entries(groupedByDay)) {
          arrayItems = [];
          const xarrDay: any = arrDay;
          groupedByDocnum = _.groupBy(xarrDay, "ordocnum");
          for (const [keyDocnum, arrDocnum] of Object.entries(
            groupedByDocnum
          )) {
            let qty = 0;
            let amount = 0;
            let total = 0;
            const xarrDocnum: any = arrDocnum;
            for (const xdata_val of Object.values(xarrDocnum)) {
              let record: any = xdata_val;
              qty += record.qty;
              amount += record.amount;
              total += record.total;
            }
            arrayItems.push({
              ordocnum: keyDocnum,
              qty: qty,
              amount: amount,
              total: total,
            });
          }
          arrayItems.sort((a: any, b: any) => {
            return a.itmdsc < b.itmdsc ? -1 : 1;
          });
          arrayDate = {
            ...arrayDate,
            ...{
              [moment(keyDay).format("MM-DD-YYYY")]: arrayItems,
            },
          };
        }
        arrayFreeReasons = {
          ...arrayFreeReasons,
          ...{
            [keyFreeReason]: arrayDate,
          },
        };
      }
      arrayDine2 = {
        ...arrayDine2,
        ...{
          [keyDine]: arrayFreeReasons,
        },
      };
    }
    returnData = {
      ...returnData,
      ...{
        summary: arrayDine2,
      },
    };
  } else {
    groupedByDay = _.sortBy(arrayPOSItems, "trndte");
    groupedByDay = _.groupBy(groupedByDay, "trndte");
    let x = 1;
    for (const [keyDay, arrDay] of Object.entries(groupedByDay)) {
      // this.socketService.emit(
      //   "managersreport_emit",
      //   `<b>Free Items</b><br> Finishing ${(
      //     (x / Object.entries(groupedByDay).length) *
      //     100
      //   ).toFixed(2)}%`
      // );
      x++;
      arrayFreeReasons = [];
      const xarrDay: any = arrDay;
      groupedByFreeReason = _.sortBy(xarrDay, "freereason");
      groupedByFreeReason = _.groupBy(groupedByFreeReason, "freereason");

      for (const [keyFreeReason, arrFreeReason] of Object.entries(
        groupedByFreeReason
      )) {
        arrayItems = [];
        const xarrFreeReason: any = arrFreeReason;
        groupedByItem = _.groupBy(xarrFreeReason, "itmdsc");
        for (const [keyItem, arrItems] of Object.entries(groupedByItem)) {
          let qty = 0;
          let amount = 0;
          let total = 0;
          const xarrItems: any = arrItems;
          for (const xdata_val of Object.values(xarrItems)) {
            let record: any = xdata_val;
            qty += record.qty;
            amount += record.amount;
            total += record.total;
          }
          arrayItems.push({
            itmdsc: keyItem,
            qty: qty,
            amount: amount,
            total: total,
          });
        }
        arrayItems.sort((a: any, b: any) => {
          return a.itmdsc < b.itmdsc ? -1 : 1;
        });
        arrayFreeReasons = {
          ...arrayFreeReasons,
          ...{
            [keyFreeReason]: arrayItems,
          },
        };
      }
      arrayDate = {
        ...arrayDate,
        ...{
          [moment(keyDay).format("MM-DD-YYYY")]: arrayFreeReasons,
        },
      };
    }

    returnData = {
      detailed: arrayDate,
    };

    groupedByFreeReason = _.sortBy(arrayPOSItems, "freereason");
    groupedByFreeReason = _.groupBy(groupedByFreeReason, "freereason");
    x = 1;
    for (const [keyFreeReason, arrFreeReasons] of Object.entries(
      groupedByFreeReason
    )) {
      // this.socketService.emit(
      //   "managersreport_emit",
      //   `<b>Free Transactions</b><br> Finishing ${(
      //     (x / Object.entries(groupedByFreeReason).length) *
      //     100
      //   ).toFixed(2)}%`
      // );
      x++;
      const xarrFreeReasons: any = arrFreeReasons;
      groupedByDay = _.sortBy(xarrFreeReasons, "trndte");
      groupedByDay = _.groupBy(groupedByDay, "trndte");

      arrayDate = [];
      for (const [keyDay, arrDay] of Object.entries(groupedByDay)) {
        arrayItems = [];
        const xarrDay: any = arrDay;
        groupedByDocnum = _.groupBy(xarrDay, "ordocnum");
        for (const [keyDocnum, arrDocnum] of Object.entries(groupedByDocnum)) {
          let qty = 0;
          let amount = 0;
          let total = 0;
          const xarrDocnum: any = arrDocnum;
          for (const xdata_val of Object.values(xarrDocnum)) {
            let record: any = xdata_val;
            qty += record.qty;
            amount += record.amount;
            total += record.total;
          }
          arrayItems.push({
            ordocnum: keyDocnum,
            qty: qty,
            amount: amount,
            total: total,
          });
        }
        arrayItems.sort((a: any, b: any) => {
          return a.itmdsc < b.itmdsc ? -1 : 1;
        });
        arrayDate = {
          ...arrayDate,
          ...{
            [moment(keyDay).format("MM-DD-YYYY")]: arrayItems,
          },
        };
      }
      arrayFreeReasons = {
        ...arrayFreeReasons,
        ...{
          [keyFreeReason]: arrayDate,
        },
      };
    }

    returnData = {
      ...returnData,
      ...{
        summary: arrayFreeReasons,
      },
    };
  }

  return returnData;
}
