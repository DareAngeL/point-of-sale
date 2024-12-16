import { useService } from "../../../../hooks/reportHooks";
import * as _ from "lodash";
import { PosfileModel } from "../../../../models/posfile";
import { discountComputation } from "../ManagerReportService";

export async function HourlySalesService(
  posData: PosfileModel,
  formValue: any
) {
  const { getData } = useService<any>();

  let returnData: any = [];
  let groupedByOrderType: any = [];

  groupedByOrderType =
    formValue?.dineType.length > 0
      ? _.groupBy(posData, "postypcde")
      : _.groupBy(posData, "ordertyp");
  let dataH0: any,
    dataH1: any,
    dataH2: any,
    dataH3: any,
    dataH4: any,
    dataH5: any,
    dataH6: any,
    dataH7: any,
    dataH8: any,
    dataH9: any,
    dataH10: any,
    dataH11: any,
    dataH12: any,
    dataH13: any,
    dataH14: any,
    dataH15: any,
    dataH16: any,
    dataH17: any,
    dataH18: any,
    dataH19: any,
    dataH20: any,
    dataH21: any,
    dataH22: any,
    dataH23: any;
  let xcount_hourly = 1;
  for (const [keyOrderType, arrOrderType] of Object.entries(
    groupedByOrderType
  )) {
    // this.socketService.emit("managersreport_emit", `<b>Hourly Sales</b><br> Generating ${((xcount_hourly/(Object.entries(groupedByOrderType).length))*100).toFixed(2)}%`);
    xcount_hourly++;
    let H0 = {
        qty: 0,
        amt: 0,
        svgchg: 0,
        vatadj: 0,
        totalamt: 0,
        discount: 0,
        tc: 0,
      },
      H1 = {
        qty: 0,
        amt: 0,
        svgchg: 0,
        vatadj: 0,
        totalamt: 0,
        discount: 0,
        tc: 0,
      },
      H2 = {
        qty: 0,
        amt: 0,
        svgchg: 0,
        vatadj: 0,
        totalamt: 0,
        discount: 0,
        tc: 0,
      },
      H3 = {
        qty: 0,
        amt: 0,
        svgchg: 0,
        vatadj: 0,
        totalamt: 0,
        discount: 0,
        tc: 0,
      },
      H4 = {
        qty: 0,
        amt: 0,
        svgchg: 0,
        vatadj: 0,
        totalamt: 0,
        discount: 0,
        tc: 0,
      },
      H5 = {
        qty: 0,
        amt: 0,
        svgchg: 0,
        vatadj: 0,
        totalamt: 0,
        discount: 0,
        tc: 0,
      },
      H6 = {
        qty: 0,
        amt: 0,
        svgchg: 0,
        vatadj: 0,
        totalamt: 0,
        discount: 0,
        tc: 0,
      },
      H7 = {
        qty: 0,
        amt: 0,
        svgchg: 0,
        vatadj: 0,
        totalamt: 0,
        discount: 0,
        tc: 0,
      },
      H8 = {
        qty: 0,
        amt: 0,
        svgchg: 0,
        vatadj: 0,
        totalamt: 0,
        discount: 0,
        tc: 0,
      },
      H9 = {
        qty: 0,
        amt: 0,
        svgchg: 0,
        vatadj: 0,
        totalamt: 0,
        discount: 0,
        tc: 0,
      },
      H10 = {
        qty: 0,
        amt: 0,
        svgchg: 0,
        vatadj: 0,
        totalamt: 0,
        discount: 0,
        tc: 0,
      },
      H11 = {
        qty: 0,
        amt: 0,
        svgchg: 0,
        vatadj: 0,
        totalamt: 0,
        discount: 0,
        tc: 0,
      },
      H12 = {
        qty: 0,
        amt: 0,
        svgchg: 0,
        vatadj: 0,
        totalamt: 0,
        discount: 0,
        tc: 0,
      },
      H13 = {
        qty: 0,
        amt: 0,
        svgchg: 0,
        vatadj: 0,
        totalamt: 0,
        discount: 0,
        tc: 0,
      },
      H14 = {
        qty: 0,
        amt: 0,
        svgchg: 0,
        vatadj: 0,
        totalamt: 0,
        discount: 0,
        tc: 0,
      },
      H15 = {
        qty: 0,
        amt: 0,
        svgchg: 0,
        vatadj: 0,
        totalamt: 0,
        discount: 0,
        tc: 0,
      },
      H16 = {
        qty: 0,
        amt: 0,
        svgchg: 0,
        vatadj: 0,
        totalamt: 0,
        discount: 0,
        tc: 0,
      },
      H17 = {
        qty: 0,
        amt: 0,
        svgchg: 0,
        vatadj: 0,
        totalamt: 0,
        discount: 0,
        tc: 0,
      },
      H18 = {
        qty: 0,
        amt: 0,
        svgchg: 0,
        vatadj: 0,
        totalamt: 0,
        discount: 0,
        tc: 0,
      },
      H19 = {
        qty: 0,
        amt: 0,
        svgchg: 0,
        vatadj: 0,
        totalamt: 0,
        discount: 0,
        tc: 0,
      },
      H20 = {
        qty: 0,
        amt: 0,
        svgchg: 0,
        vatadj: 0,
        totalamt: 0,
        discount: 0,
        tc: 0,
      },
      H21 = {
        qty: 0,
        amt: 0,
        svgchg: 0,
        vatadj: 0,
        totalamt: 0,
        discount: 0,
        tc: 0,
      },
      H22 = {
        qty: 0,
        amt: 0,
        svgchg: 0,
        vatadj: 0,
        totalamt: 0,
        discount: 0,
        tc: 0,
      },
      H23 = {
        qty: 0,
        amt: 0,
        svgchg: 0,
        vatadj: 0,
        totalamt: 0,
        discount: 0,
        tc: 0,
      };
    const xarrOrderType: any = arrOrderType;
    for (const xdata_val of Object.values(xarrOrderType)) {
      let record: any = xdata_val;
      let discount: number = 0;

      await discountComputation(record).then((res) => {
        discount += res.xscpwddisc + res.x_regdiscount + res.xgovdiscount;
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

          record.itmqty = record.itmqty - resRefund.refundqty;
          record.groext = record.groext - resRefund.groext;
          record.extprc = record.extprc - resRefund.extprc;

          await discountComputation(resRefund).then((res) => {
            refundDiscount +=
              res.xscpwddisc + res.x_regdiscount + res.xgovdiscount;
          });

          record.lessvat = record.lessvat - resRefund.lessvat;
          record.vatexempt = record.vatexempt - resRefund.vatexempt;
          discount = discount - refundDiscount;
        });
      }

      if (record.itmqty == 0) {
        continue;
      }
      if ("00:00:00" <= record.logtim && "00:59:59" >= record.logtim) {
        if (record.postrntyp === "ITEM") {
          H0.qty += parseFloat(record.itmqty);
          H0.amt += parseFloat(record.groext);
          H0.vatadj += parseFloat(record.lessvat);
          H0.discount += discount;
          H0.totalamt += parseFloat(record.extprc);
        } else if (record.postrntyp === "PAYMENT" && record.itmcde === "CASH") {
          H0.tc += 1;
        }
      } else if ("01:00:00" <= record.logtim && "01:59:59" >= record.logtim) {
        if (record.postrntyp === "ITEM") {
          H1.qty += record.itmqty;
          H1.amt += record.groext;
          H1.vatadj += record.lessvat;
          H1.discount += discount;
          H1.totalamt += record.extprc;
        } else if (record.postrntyp === "PAYMENT" && record.itmcde === "CASH") {
          H1.tc += 1;
        }
      } else if ("02:00:00" <= record.logtim && "02:59:59" >= record.logtim) {
        if (record.postrntyp === "ITEM") {
          H2.qty += parseFloat(record.itmqty);
          H2.amt += parseFloat(record.groext);
          H2.vatadj += parseFloat(record.lessvat);
          H2.discount += discount;
          H2.totalamt += parseFloat(record.extprc);
        } else if (record.postrntyp === "PAYMENT" && record.itmcde === "CASH") {
          H2.tc += 1;
        }
      } else if ("03:00:00" <= record.logtim && "03:59:59" >= record.logtim) {
        if (record.postrntyp === "ITEM") {
          H3.qty += parseFloat(record.itmqty);
          H3.amt += parseFloat(record.groext);
          H3.vatadj += parseFloat(record.lessvat);
          H3.discount += discount;
          H3.totalamt += parseFloat(record.extprc);
        } else if (record.postrntyp === "PAYMENT" && record.itmcde === "CASH") {
          H3.tc += 1;
        }
      } else if ("04:00:00" <= record.logtim && "04:59:59" >= record.logtim) {
        if (record.postrntyp === "ITEM") {
          H4.qty += parseFloat(record.itmqty);
          H4.amt += parseFloat(record.groext);
          H4.vatadj += parseFloat(record.lessvat);
          H4.discount += discount;
          H4.totalamt += parseFloat(record.extprc);
        } else if (record.postrntyp === "PAYMENT" && record.itmcde === "CASH") {
          H4.tc += 1;
        }
      } else if ("05:00:00" <= record.logtim && "05:59:59" >= record.logtim) {
        if (record.postrntyp === "ITEM") {
          H5.qty += record.itmqty;
          H5.amt += record.groext;
          H5.vatadj += record.lessvat;
          H5.discount += discount;
          H5.totalamt += record.extprc;
        } else if (record.postrntyp === "PAYMENT" && record.itmcde === "CASH") {
          H5.tc += 1;
        }
      } else if ("06:00:00" <= record.logtim && "06:59:59" >= record.logtim) {
        if (record.postrntyp === "ITEM") {
          H6.qty += parseFloat(record.itmqty);
          H6.amt += parseFloat(record.groext);
          H6.vatadj += parseFloat(record.lessvat);
          H6.discount += discount;
          H6.totalamt += parseFloat(record.extprc);
        } else if (record.postrntyp === "PAYMENT" && record.itmcde === "CASH") {
          H6.tc += 1;
        }
      } else if ("07:00:00" <= record.logtim && "07:59:59" >= record.logtim) {
        if (record.postrntyp === "ITEM") {
          H7.qty += parseFloat(record.itmqty);
          H7.amt += parseFloat(record.groext);
          H7.vatadj += parseFloat(record.lessvat);
          H7.discount += discount;
          H7.totalamt += parseFloat(record.extprc);
        } else if (record.postrntyp === "PAYMENT" && record.itmcde === "CASH") {
          H7.tc += 1;
        }
      } else if ("08:00:00" <= record.logtim && "08:59:59" >= record.logtim) {
        if (record.postrntyp === "ITEM") {
          H8.qty += parseFloat(record.itmqty);
          H8.amt += parseFloat(record.groext);
          H8.vatadj += parseFloat(record.lessvat);
          H8.discount += discount;
          H8.totalamt += parseFloat(record.extprc);
        } else if (record.postrntyp === "PAYMENT" && record.itmcde === "CASH") {
          H8.tc += 1;
        }
      } else if ("09:00:00" <= record.logtim && "09:59:59" >= record.logtim) {
        if (record.postrntyp === "ITEM") {
          H9.qty += parseFloat(record.itmqty);
          H9.amt += parseFloat(record.groext);
          H9.vatadj += parseFloat(record.lessvat);
          H9.discount += discount;
          H9.totalamt += parseFloat(record.extprc);
        } else if (record.postrntyp === "PAYMENT" && record.itmcde === "CASH") {
          H9.tc += 1;
        }
      } else if ("10:00:00" <= record.logtim && "10:59:59" >= record.logtim) {
        if (record.postrntyp === "ITEM") {
          H10.qty += record.itmqty;
          H10.amt += record.groext;
          H10.vatadj += record.lessvat;
          H10.discount += discount;
          H10.totalamt += record.extprc;
        } else if (record.postrntyp === "PAYMENT" && record.itmcde === "CASH") {
          H10.tc += 1;
        }
      } else if ("11:00:00" <= record.logtim && "11:59:59" >= record.logtim) {
        if (record.postrntyp === "ITEM") {
          H11.qty += parseFloat(record.itmqty);
          H11.amt += parseFloat(record.groext);
          H11.vatadj += parseFloat(record.lessvat);
          H11.discount += discount;
          H11.totalamt += parseFloat(record.extprc);
        } else if (record.postrntyp === "PAYMENT" && record.itmcde === "CASH") {
          H11.tc += 1;
        }
      } else if ("12:00:00" <= record.logtim && "12:59:59" >= record.logtim) {
        if (record.postrntyp === "ITEM") {
          H12.qty += record.itmqty;
          H12.amt += record.groext;
          H12.vatadj += record.lessvat;
          H12.discount += discount;
          H12.totalamt += record.extprc;
        } else if (record.postrntyp === "PAYMENT" && record.itmcde === "CASH") {
          H12.tc += 1;
        }
      } else if ("13:00:00" <= record.logtim && "13:59:59" >= record.logtim) {
        if (record.postrntyp === "ITEM") {
          H13.qty += parseFloat(record.itmqty);
          H13.amt += parseFloat(record.groext);
          H13.vatadj += parseFloat(record.lessvat);
          H13.discount += discount;
          H13.totalamt += parseFloat(record.extprc);
        } else if (record.postrntyp === "PAYMENT" && record.itmcde === "CASH") {
          H13.tc += 1;
        }
      } else if ("14:00:00" <= record.logtim && "14:59:59" >= record.logtim) {
        if (record.postrntyp === "ITEM") {
          H14.qty += parseFloat(record.itmqty);
          H14.amt += parseFloat(record.groext);
          H14.vatadj += parseFloat(record.lessvat);
          H14.discount += discount;
          H14.totalamt += parseFloat(record.extprc);
        } else if (record.postrntyp === "PAYMENT" && record.itmcde === "CASH") {
          H14.tc += 1;
        }
      } else if ("15:00:00" <= record.logtim && "15:59:59" >= record.logtim) {
        if (record.postrntyp === "ITEM") {
          H15.qty += parseFloat(record.itmqty);
          H15.amt += parseFloat(record.groext);
          H15.vatadj += parseFloat(record.lessvat);
          H15.discount += discount;
          H15.totalamt += parseFloat(record.extprc);
        } else if (record.postrntyp === "PAYMENT" && record.itmcde === "CASH") {
          H15.tc += 1;
        }
      } else if ("16:00:00" <= record.logtim && "16:59:59" >= record.logtim) {
        if (record.postrntyp === "ITEM") {
          H16.qty += parseFloat(record.itmqty);
          H16.amt += parseFloat(record.groext);
          H16.vatadj += parseFloat(record.lessvat);
          H16.discount += discount;
          H16.totalamt += parseFloat(record.extprc);
        } else if (record.postrntyp === "PAYMENT" && record.itmcde === "CASH") {
          H16.tc += 1;
        }
      } else if ("17:00:00" <= record.logtim && "17:59:59" >= record.logtim) {
        if (record.postrntyp === "ITEM") {
          H17.qty += parseFloat(record.itmqty);
          H17.amt += parseFloat(record.groext);
          H17.vatadj += parseFloat(record.lessvat);
          H17.discount += discount;
          H17.totalamt += parseFloat(record.extprc);
        } else if (record.postrntyp === "PAYMENT" && record.itmcde === "CASH") {
          H17.tc += 1;
        }
      } else if ("18:00:00" <= record.logtim && "18:59:59" >= record.logtim) {
        if (record.postrntyp === "ITEM") {
          H18.qty += parseFloat(record.itmqty);
          H18.amt += parseFloat(record.groext);
          H18.vatadj += parseFloat(record.lessvat);
          H18.discount += discount;
          H18.totalamt += parseFloat(record.extprc);
        } else if (record.postrntyp === "PAYMENT" && record.itmcde === "CASH") {
          H18.tc += 1;
        }
      } else if ("19:00:00" <= record.logtim && "19:59:59" >= record.logtim) {
        if (record.postrntyp === "ITEM") {
          H19.qty += parseFloat(record.itmqty);
          H19.amt += parseFloat(record.groext);
          H19.vatadj += parseFloat(record.lessvat);
          H19.discount += discount;
          H19.totalamt += parseFloat(record.extprc);
        } else if (record.postrntyp === "PAYMENT" && record.itmcde === "CASH") {
          H19.tc += 1;
        }
      } else if ("20:00:00" <= record.logtim && "20:59:59" >= record.logtim) {
        if (record.postrntyp === "ITEM") {
          H20.qty += record.itmqty;
          H20.amt += record.groext;
          H20.vatadj += record.lessvat;
          H20.discount += discount;
          H20.totalamt += record.extprc;
        } else if (record.postrntyp === "PAYMENT" && record.itmcde === "CASH") {
          H20.tc += 1;
        }
      } else if ("21:00:00" <= record.logtim && "21:59:59" >= record.logtim) {
        if (record.postrntyp === "ITEM") {
          H21.qty += parseFloat(record.itmqty);
          H21.amt += parseFloat(record.groext);
          H21.vatadj += parseFloat(record.lessvat);
          H21.discount += discount;
          H21.totalamt += parseFloat(record.extprc);
        } else if (record.postrntyp === "PAYMENT" && record.itmcde === "CASH") {
          H21.tc += 1;
        }
      } else if ("22:00:00" <= record.logtim && "22:59:59" >= record.logtim) {
        if (record.postrntyp === "ITEM") {
          H22.qty += parseFloat(record.itmqty);
          H22.amt += parseFloat(record.groext);
          H22.vatadj += parseFloat(record.lessvat);
          H22.discount += discount;
          H22.totalamt += parseFloat(record.extprc);
        } else if (record.postrntyp === "PAYMENT" && record.itmcde === "CASH") {
          H22.tc += 1;
        }
      } else if ("23:00:00" <= record.logtim && "23:59:59" >= record.logtim) {
        if (record.postrntyp === "ITEM") {
          H23.qty += parseFloat(record.itmqty);
          H23.amt += parseFloat(record.groext);
          H23.vatadj += parseFloat(record.lessvat);
          H23.discount += discount;
          H23.totalamt += parseFloat(record.extprc);
        } else if (record.postrntyp === "PAYMENT" && record.itmcde === "CASH") {
          H23.tc += 1;
        }
      }
    }

    dataH0 = {
      ...dataH0,
      ...{
        [keyOrderType]: H0,
      },
    };

    dataH1 = {
      ...dataH1,
      ...{
        [keyOrderType]: H1,
      },
    };

    dataH2 = {
      ...dataH2,
      ...{
        [keyOrderType]: H2,
      },
    };

    dataH3 = {
      ...dataH3,
      ...{
        [keyOrderType]: H3,
      },
    };

    dataH4 = {
      ...dataH4,
      ...{
        [keyOrderType]: H4,
      },
    };

    dataH5 = {
      ...dataH5,
      ...{
        [keyOrderType]: H5,
      },
    };

    dataH6 = {
      ...dataH6,
      ...{
        [keyOrderType]: H6,
      },
    };

    dataH7 = {
      ...dataH7,
      ...{
        [keyOrderType]: H7,
      },
    };

    dataH8 = {
      ...dataH8,
      ...{
        [keyOrderType]: H8,
      },
    };

    dataH9 = {
      ...dataH9,
      ...{
        [keyOrderType]: H9,
      },
    };

    dataH10 = {
      ...dataH10,
      ...{
        [keyOrderType]: H10,
      },
    };

    dataH11 = {
      ...dataH11,
      ...{
        [keyOrderType]: H11,
      },
    };

    dataH12 = {
      ...dataH12,
      ...{
        [keyOrderType]: H12,
      },
    };

    dataH13 = {
      ...dataH13,
      ...{
        [keyOrderType]: H13,
      },
    };

    dataH14 = {
      ...dataH14,
      ...{
        [keyOrderType]: H14,
      },
    };

    dataH15 = {
      ...dataH15,
      ...{
        [keyOrderType]: H15,
      },
    };

    dataH16 = {
      ...dataH16,
      ...{
        [keyOrderType]: H16,
      },
    };

    dataH17 = {
      ...dataH17,
      ...{
        [keyOrderType]: H17,
      },
    };

    dataH18 = {
      ...dataH18,
      ...{
        [keyOrderType]: H18,
      },
    };

    dataH19 = {
      ...dataH19,
      ...{
        [keyOrderType]: H19,
      },
    };

    dataH20 = {
      ...dataH20,
      ...{
        [keyOrderType]: H20,
      },
    };

    dataH21 = {
      ...dataH21,
      ...{
        [keyOrderType]: H21,
      },
    };

    dataH22 = {
      ...dataH22,
      ...{
        [keyOrderType]: H22,
      },
    };

    dataH23 = {
      ...dataH23,
      ...{
        [keyOrderType]: H23,
      },
    };
  }

  returnData = {
    "00:00 - 00:59": dataH0,
    "01:00 - 01:59": dataH1,
    "02:00 - 02:59": dataH2,
    "03:00 - 03:59": dataH3,
    "04:00 - 04:59": dataH4,
    "05:00 - 05:59": dataH5,
    "06:00 - 06:59": dataH6,
    "07:00 - 07:59": dataH7,
    "08:00 - 08:59": dataH8,
    "09:00 - 09:59": dataH9,
    "10:00 - 10:59": dataH10,
    "11:00 - 11:59": dataH11,
    "12:00 - 12:59": dataH12,
    "13:00 - 13:59": dataH13,
    "14:00 - 14:59": dataH14,
    "15:00 - 15:59": dataH15,
    "16:00 - 16:59": dataH16,
    "17:00 - 17:59": dataH17,
    "18:00 - 18:59": dataH18,
    "19:00 - 19:59": dataH19,
    "20:00 - 20:59": dataH20,
    "21:00 - 21:59": dataH21,
    "22:00 - 22:59": dataH22,
    "23:00 - 23:59": dataH23,
  };

  return returnData;
}
