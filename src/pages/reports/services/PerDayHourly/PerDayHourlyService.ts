import moment from "moment";
import { useService } from "../../../../hooks/reportHooks";
import { discountComputation } from "../ManagerReportService";
import * as _ from "lodash";
import { PosfileModel } from "../../../../models/posfile";

export async function PerDayHourlyService(
  posData: PosfileModel,
  formValue: any
) {
  const { getData } = useService<any>();

  let groupedByDay: any = [];
  let returnData: any = [];
  let arrayDine: any = [];
  let groupedByDinetype: any = [];

  const arrayHours = [
    "00:00 - 00:59",
    "01:00 - 01:59",
    "02:00 - 02:59",
    "03:00 - 03:59",
    "04:00 - 04:59",
    "05:00 - 05:59",
    "06:00 - 06:59",
    "07:00 - 07:59",
    "08:00 - 08:59",
    "09:00 - 09:59",
    "10:00 - 10:59",
    "11:00 - 11:59",
    "12:00 - 12:59",
    "13:00 - 13:59",
    "14:00 - 14:59",
    "15:00 - 15:59",
    "16:00 - 16:59",
    "17:00 - 17:59",
    "18:00 - 18:59",
    "19:00 - 19:59",
    "20:00 - 20:59",
    "21:00 - 21:59",
    "22:00 - 22:59",
    "23:00 - 23:59",
  ];

  const arrayDaysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  if (formValue?.dineType.length > 0) {
    groupedByDinetype = _.groupBy(posData, "postypcde");
    arrayDine = [];
    let xcount_perday = 1;
    for (const [dinetype, arrDinetype] of Object.entries(groupedByDinetype)) {
      // this.socketService.emit("managersreport_emit", `<b>Per Day Hourly</b><br> Generating ${((xcount_perday/(Object.entries(groupedByDinetype).length))*100).toFixed(2)}%`);
      xcount_perday++;
      let Sunday: any = {},
        Monday: any = {},
        Tuesday: any = {},
        Wednesday: any = {},
        Thursday: any = {},
        Friday: any = {},
        Saturday: any = {};
      const xarrDinetype: any = arrDinetype;
      groupedByDay = _.sortBy(xarrDinetype, "trndte");
      groupedByDay = _.groupBy(groupedByDay, "trndte");

      for (let indexDay = 0; indexDay < arrayDaysOfWeek.length; indexDay++) {
        for (let hourIndex = 0; hourIndex < arrayHours.length; hourIndex++) {
          switch (arrayDaysOfWeek[indexDay]) {
            case "Sunday":
              Sunday = {
                ...Sunday,
                ...{
                  daycount: 0,
                  [arrayHours[hourIndex]]: {
                    numtrans: 0,
                    totalsales: 0,
                    servicecharge: 0,
                    vatadj: 0,
                    scpwddisc: 0,
                    regdisc: 0,
                    totalitemsales: 0,
                  },
                },
              };
              break;
            case "Monday":
              Monday = {
                ...Monday,
                ...{
                  daycount: 0,
                  [arrayHours[hourIndex]]: {
                    numtrans: 0,
                    totalsales: 0,
                    servicecharge: 0,
                    vatadj: 0,
                    scpwddisc: 0,
                    regdisc: 0,
                    totalitemsales: 0,
                  },
                },
              };
              break;
            case "Tuesday":
              Tuesday = {
                ...Tuesday,
                ...{
                  daycount: 0,
                  [arrayHours[hourIndex]]: {
                    numtrans: 0,
                    totalsales: 0,
                    servicecharge: 0,
                    vatadj: 0,
                    scpwddisc: 0,
                    regdisc: 0,
                    totalitemsales: 0,
                  },
                },
              };
              break;
            case "Wednesday":
              Wednesday = {
                ...Wednesday,
                ...{
                  daycount: 0,
                  [arrayHours[hourIndex]]: {
                    numtrans: 0,
                    totalsales: 0,
                    servicecharge: 0,
                    vatadj: 0,
                    scpwddisc: 0,
                    regdisc: 0,
                    totalitemsales: 0,
                  },
                },
              };
              break;
            case "Thursday":
              Thursday = {
                ...Thursday,
                ...{
                  daycount: 0,
                  [arrayHours[hourIndex]]: {
                    numtrans: 0,
                    totalsales: 0,
                    servicecharge: 0,
                    vatadj: 0,
                    scpwddisc: 0,
                    regdisc: 0,
                    totalitemsales: 0,
                  },
                },
              };
              break;
            case "Friday":
              Friday = {
                ...Friday,
                ...{
                  daycount: 0,
                  [arrayHours[hourIndex]]: {
                    numtrans: 0,
                    totalsales: 0,
                    servicecharge: 0,
                    vatadj: 0,
                    scpwddisc: 0,
                    regdisc: 0,
                    totalitemsales: 0,
                  },
                },
              };
              break;
            case "Saturday":
              Saturday = {
                ...Saturday,
                ...{
                  daycount: 0,
                  [arrayHours[hourIndex]]: {
                    numtrans: 0,
                    totalsales: 0,
                    servicecharge: 0,
                    vatadj: 0,
                    scpwddisc: 0,
                    regdisc: 0,
                    totalitemsales: 0,
                  },
                },
              };
              break;
          }
        }
      }

      for (const [keyDay, arrDays] of Object.entries(groupedByDay)) {
        if (moment(keyDay).format("dddd") === "Sunday") {
          Sunday.daycount += 1;
        } else if (moment(keyDay).format("dddd") === "Monday") {
          Monday.daycount += 1;
        } else if (moment(keyDay).format("dddd") === "Tuesday") {
          Tuesday.daycount += 1;
        } else if (moment(keyDay).format("dddd") === "Wednesday") {
          Wednesday.daycount += 1;
        } else if (moment(keyDay).format("dddd") === "Thursday") {
          Thursday.daycount += 1;
        } else if (moment(keyDay).format("dddd") === "Friday") {
          Friday.daycount += 1;
        } else if (moment(keyDay).format("dddd") === "Saturday") {
          Saturday.daycount += 1;
        }
        const xarrDays: any = arrDays;
        for (const record of xarrDays) {
          let discount = 0;
          let x_regdiscount = 0;
          await discountComputation(record).then((res) => {
            discount += res.xscpwddisc + res.xgovdiscount;
            x_regdiscount += res.x_regdiscount;
          });

          if (record.postrntyp == "TOTAL") {
            const refund = await getData(
              "posfile/filter",
              {
                ordocnum: record.ordocnum,
                itmcde: record.itmcde,
                refund: 1,
                trndte: record.trndte,
              },
              () => {}
            );
            if (refund.data.length > 0) {
              refund.data.map(async (resRefund: any) => {
                let refundDiscount = 0;
                let refundRegDisc = 0;

                record.groext = record.groext - resRefund.groext;

                await discountComputation(resRefund).then((res) => {
                  refundDiscount += res.xscpwddisc + res.xgovdiscount;
                  refundRegDisc += res.x_regdiscount;
                });
              });
            }
          } else if (record.postrntyp == "ITEM") {
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
          }

          let indexHour: number = 0;
          if (moment(keyDay).format("dddd") === "Sunday") {
            if ("00:00:00" <= record.logtim && "00:59:59" >= record.logtim) {
              indexHour = 0;
            } else if (
              "01:00:00" <= record.logtim &&
              "01:59:59" >= record.logtim
            ) {
              indexHour = 1;
            } else if (
              "02:00:00" <= record.logtim &&
              "02:59:59" >= record.logtim
            ) {
              indexHour = 2;
            } else if (
              "03:00:00" <= record.logtim &&
              "03:59:59" >= record.logtim
            ) {
              indexHour = 3;
            } else if (
              "04:00:00" <= record.logtim &&
              "04:59:59" >= record.logtim
            ) {
              indexHour = 4;
            } else if (
              "05:00:00" <= record.logtim &&
              "05:59:59" >= record.logtim
            ) {
              indexHour = 5;
            } else if (
              "06:00:00" <= record.logtim &&
              "06:59:59" >= record.logtim
            ) {
              indexHour = 6;
            } else if (
              "07:00:00" <= record.logtim &&
              "07:59:59" >= record.logtim
            ) {
              indexHour = 7;
            } else if (
              "08:00:00" <= record.logtim &&
              "08:59:59" >= record.logtim
            ) {
              indexHour = 8;
            } else if (
              "09:00:00" <= record.logtim &&
              "09:59:59" >= record.logtim
            ) {
              indexHour = 9;
            } else if (
              "10:00:00" <= record.logtim &&
              "10:59:59" >= record.logtim
            ) {
              indexHour = 10;
            } else if (
              "11:00:00" <= record.logtim &&
              "11:59:59" >= record.logtim
            ) {
              indexHour = 11;
            } else if (
              "12:00:00" <= record.logtim &&
              "12:59:59" >= record.logtim
            ) {
              indexHour = 12;
            } else if (
              "13:00:00" <= record.logtim &&
              "13:59:59" >= record.logtim
            ) {
              indexHour = 13;
            } else if (
              "14:00:00" <= record.logtim &&
              "14:59:59" >= record.logtim
            ) {
              indexHour = 14;
            } else if (
              "15:00:00" <= record.logtim &&
              "15:59:59" >= record.logtim
            ) {
              indexHour = 15;
            } else if (
              "16:00:00" <= record.logtim &&
              "16:59:59" >= record.logtim
            ) {
              indexHour = 16;
            } else if (
              "17:00:00" <= record.logtim &&
              "17:59:59" >= record.logtim
            ) {
              indexHour = 17;
            } else if (
              "18:00:00" <= record.logtim &&
              "18:59:59" >= record.logtim
            ) {
              indexHour = 18;
            } else if (
              "19:00:00" <= record.logtim &&
              "19:59:59" >= record.logtim
            ) {
              indexHour = 19;
            } else if (
              "20:00:00" <= record.logtim &&
              "20:59:59" >= record.logtim
            ) {
              indexHour = 20;
            } else if (
              "21:00:00" <= record.logtim &&
              "21:59:59" >= record.logtim
            ) {
              indexHour = 21;
            } else if (
              "22:00:00" <= record.logtim &&
              "22:59:59" >= record.logtim
            ) {
              indexHour = 22;
            } else if (
              "23:00:00" <= record.logtim &&
              "23:59:59" >= record.logtim
            ) {
              indexHour = 23;
            }
            if (record.postrntyp === "TOTAL") {
              Sunday[arrayHours[indexHour]].numtrans += 1;
              Sunday[arrayHours[indexHour]].totalsales += parseFloat(record.groext);
            } else if (record.postrntyp === "ITEM") {
              Sunday[arrayHours[indexHour]].totalitemsales += parseFloat(record.extprc);
              Sunday[arrayHours[indexHour]].vatadj += parseFloat(record.lessvat);
              Sunday[arrayHours[indexHour]].scpwddisc += discount;
              Sunday[arrayHours[indexHour]].regdisc += x_regdiscount;
            } else if (record.postrntyp === "SERVICE CHARGE") {
              Sunday[arrayHours[indexHour]].servicecharge += record.extprc;
            }
          }
          if (moment(keyDay).format("dddd") === "Monday") {
            if ("00:00:00" <= record.logtim && "00:59:59" >= record.logtim) {
              indexHour = 0;
            } else if (
              "01:00:00" <= record.logtim &&
              "01:59:59" >= record.logtim
            ) {
              indexHour = 1;
            } else if (
              "02:00:00" <= record.logtim &&
              "02:59:59" >= record.logtim
            ) {
              indexHour = 2;
            } else if (
              "03:00:00" <= record.logtim &&
              "03:59:59" >= record.logtim
            ) {
              indexHour = 3;
            } else if (
              "04:00:00" <= record.logtim &&
              "04:59:59" >= record.logtim
            ) {
              indexHour = 4;
            } else if (
              "05:00:00" <= record.logtim &&
              "05:59:59" >= record.logtim
            ) {
              indexHour = 5;
            } else if (
              "06:00:00" <= record.logtim &&
              "06:59:59" >= record.logtim
            ) {
              indexHour = 6;
            } else if (
              "07:00:00" <= record.logtim &&
              "07:59:59" >= record.logtim
            ) {
              indexHour = 7;
            } else if (
              "08:00:00" <= record.logtim &&
              "08:59:59" >= record.logtim
            ) {
              indexHour = 8;
            } else if (
              "09:00:00" <= record.logtim &&
              "09:59:59" >= record.logtim
            ) {
              indexHour = 9;
            } else if (
              "10:00:00" <= record.logtim &&
              "10:59:59" >= record.logtim
            ) {
              indexHour = 10;
            } else if (
              "11:00:00" <= record.logtim &&
              "11:59:59" >= record.logtim
            ) {
              indexHour = 11;
            } else if (
              "12:00:00" <= record.logtim &&
              "12:59:59" >= record.logtim
            ) {
              indexHour = 12;
            } else if (
              "13:00:00" <= record.logtim &&
              "13:59:59" >= record.logtim
            ) {
              indexHour = 13;
            } else if (
              "14:00:00" <= record.logtim &&
              "14:59:59" >= record.logtim
            ) {
              indexHour = 14;
            } else if (
              "15:00:00" <= record.logtim &&
              "15:59:59" >= record.logtim
            ) {
              indexHour = 15;
            } else if (
              "16:00:00" <= record.logtim &&
              "16:59:59" >= record.logtim
            ) {
              indexHour = 16;
            } else if (
              "17:00:00" <= record.logtim &&
              "17:59:59" >= record.logtim
            ) {
              indexHour = 17;
            } else if (
              "18:00:00" <= record.logtim &&
              "18:59:59" >= record.logtim
            ) {
              indexHour = 18;
            } else if (
              "19:00:00" <= record.logtim &&
              "19:59:59" >= record.logtim
            ) {
              indexHour = 19;
            } else if (
              "20:00:00" <= record.logtim &&
              "20:59:59" >= record.logtim
            ) {
              indexHour = 20;
            } else if (
              "21:00:00" <= record.logtim &&
              "21:59:59" >= record.logtim
            ) {
              indexHour = 21;
            } else if (
              "22:00:00" <= record.logtim &&
              "22:59:59" >= record.logtim
            ) {
              indexHour = 22;
            } else if (
              "23:00:00" <= record.logtim &&
              "23:59:59" >= record.logtim
            ) {
              indexHour = 23;
            }
            if (record.postrntyp === "TOTAL") {
              Monday[arrayHours[indexHour]].numtrans += 1;
              Monday[arrayHours[indexHour]].totalsales += parseFloat(record.groext);
            } else if (record.postrntyp === "ITEM") {
              Monday[arrayHours[indexHour]].totalitemsales += parseFloat(record.extprc);
              Monday[arrayHours[indexHour]].vatadj += parseFloat(record.lessvat);
              Monday[arrayHours[indexHour]].scpwddisc += discount;
              Monday[arrayHours[indexHour]].regdisc += x_regdiscount;
            }
          }
          if (moment(keyDay).format("dddd") === "Tuesday") {
            if ("00:00:00" <= record.logtim && "00:59:59" >= record.logtim) {
              indexHour = 0;
            } else if (
              "01:00:00" <= record.logtim &&
              "01:59:59" >= record.logtim
            ) {
              indexHour = 1;
            } else if (
              "02:00:00" <= record.logtim &&
              "02:59:59" >= record.logtim
            ) {
              indexHour = 2;
            } else if (
              "03:00:00" <= record.logtim &&
              "03:59:59" >= record.logtim
            ) {
              indexHour = 3;
            } else if (
              "04:00:00" <= record.logtim &&
              "04:59:59" >= record.logtim
            ) {
              indexHour = 4;
            } else if (
              "05:00:00" <= record.logtim &&
              "05:59:59" >= record.logtim
            ) {
              indexHour = 5;
            } else if (
              "06:00:00" <= record.logtim &&
              "06:59:59" >= record.logtim
            ) {
              indexHour = 6;
            } else if (
              "07:00:00" <= record.logtim &&
              "07:59:59" >= record.logtim
            ) {
              indexHour = 7;
            } else if (
              "08:00:00" <= record.logtim &&
              "08:59:59" >= record.logtim
            ) {
              indexHour = 8;
            } else if (
              "09:00:00" <= record.logtim &&
              "09:59:59" >= record.logtim
            ) {
              indexHour = 9;
            } else if (
              "10:00:00" <= record.logtim &&
              "10:59:59" >= record.logtim
            ) {
              indexHour = 10;
            } else if (
              "11:00:00" <= record.logtim &&
              "11:59:59" >= record.logtim
            ) {
              indexHour = 11;
            } else if (
              "12:00:00" <= record.logtim &&
              "12:59:59" >= record.logtim
            ) {
              indexHour = 12;
            } else if (
              "13:00:00" <= record.logtim &&
              "13:59:59" >= record.logtim
            ) {
              indexHour = 13;
            } else if (
              "14:00:00" <= record.logtim &&
              "14:59:59" >= record.logtim
            ) {
              indexHour = 14;
            } else if (
              "15:00:00" <= record.logtim &&
              "15:59:59" >= record.logtim
            ) {
              indexHour = 15;
            } else if (
              "16:00:00" <= record.logtim &&
              "16:59:59" >= record.logtim
            ) {
              indexHour = 16;
            } else if (
              "17:00:00" <= record.logtim &&
              "17:59:59" >= record.logtim
            ) {
              indexHour = 17;
            } else if (
              "18:00:00" <= record.logtim &&
              "18:59:59" >= record.logtim
            ) {
              indexHour = 18;
            } else if (
              "19:00:00" <= record.logtim &&
              "19:59:59" >= record.logtim
            ) {
              indexHour = 19;
            } else if (
              "20:00:00" <= record.logtim &&
              "20:59:59" >= record.logtim
            ) {
              indexHour = 20;
            } else if (
              "21:00:00" <= record.logtim &&
              "21:59:59" >= record.logtim
            ) {
              indexHour = 21;
            } else if (
              "22:00:00" <= record.logtim &&
              "22:59:59" >= record.logtim
            ) {
              indexHour = 22;
            } else if (
              "23:00:00" <= record.logtim &&
              "23:59:59" >= record.logtim
            ) {
              indexHour = 23;
            }
            if (record.postrntyp === "TOTAL") {
              Tuesday[arrayHours[indexHour]].numtrans += 1;
              Tuesday[arrayHours[indexHour]].totalsales += parseFloat(record.groext);
            } else if (record.postrntyp === "ITEM") {
              Tuesday[arrayHours[indexHour]].totalitemsales += parseFloat(record.extprc);
              Tuesday[arrayHours[indexHour]].vatadj += parseFloat(record.lessvat);
              Tuesday[arrayHours[indexHour]].scpwddisc += discount;
              Tuesday[arrayHours[indexHour]].regdisc += x_regdiscount;
            }
          }
          if (moment(keyDay).format("dddd") === "Wednesday") {
            if ("00:00:00" <= record.logtim && "00:59:59" >= record.logtim) {
              indexHour = 0;
            } else if (
              "01:00:00" <= record.logtim &&
              "01:59:59" >= record.logtim
            ) {
              indexHour = 1;
            } else if (
              "02:00:00" <= record.logtim &&
              "02:59:59" >= record.logtim
            ) {
              indexHour = 2;
            } else if (
              "03:00:00" <= record.logtim &&
              "03:59:59" >= record.logtim
            ) {
              indexHour = 3;
            } else if (
              "04:00:00" <= record.logtim &&
              "04:59:59" >= record.logtim
            ) {
              indexHour = 4;
            } else if (
              "05:00:00" <= record.logtim &&
              "05:59:59" >= record.logtim
            ) {
              indexHour = 5;
            } else if (
              "06:00:00" <= record.logtim &&
              "06:59:59" >= record.logtim
            ) {
              indexHour = 6;
            } else if (
              "07:00:00" <= record.logtim &&
              "07:59:59" >= record.logtim
            ) {
              indexHour = 7;
            } else if (
              "08:00:00" <= record.logtim &&
              "08:59:59" >= record.logtim
            ) {
              indexHour = 8;
            } else if (
              "09:00:00" <= record.logtim &&
              "09:59:59" >= record.logtim
            ) {
              indexHour = 9;
            } else if (
              "10:00:00" <= record.logtim &&
              "10:59:59" >= record.logtim
            ) {
              indexHour = 10;
            } else if (
              "11:00:00" <= record.logtim &&
              "11:59:59" >= record.logtim
            ) {
              indexHour = 11;
            } else if (
              "12:00:00" <= record.logtim &&
              "12:59:59" >= record.logtim
            ) {
              indexHour = 12;
            } else if (
              "13:00:00" <= record.logtim &&
              "13:59:59" >= record.logtim
            ) {
              indexHour = 13;
            } else if (
              "14:00:00" <= record.logtim &&
              "14:59:59" >= record.logtim
            ) {
              indexHour = 14;
            } else if (
              "15:00:00" <= record.logtim &&
              "15:59:59" >= record.logtim
            ) {
              indexHour = 15;
            } else if (
              "16:00:00" <= record.logtim &&
              "16:59:59" >= record.logtim
            ) {
              indexHour = 16;
            } else if (
              "17:00:00" <= record.logtim &&
              "17:59:59" >= record.logtim
            ) {
              indexHour = 17;
            } else if (
              "18:00:00" <= record.logtim &&
              "18:59:59" >= record.logtim
            ) {
              indexHour = 18;
            } else if (
              "19:00:00" <= record.logtim &&
              "19:59:59" >= record.logtim
            ) {
              indexHour = 19;
            } else if (
              "20:00:00" <= record.logtim &&
              "20:59:59" >= record.logtim
            ) {
              indexHour = 20;
            } else if (
              "21:00:00" <= record.logtim &&
              "21:59:59" >= record.logtim
            ) {
              indexHour = 21;
            } else if (
              "22:00:00" <= record.logtim &&
              "22:59:59" >= record.logtim
            ) {
              indexHour = 22;
            } else if (
              "23:00:00" <= record.logtim &&
              "23:59:59" >= record.logtim
            ) {
              indexHour = 23;
            }
            if (record.postrntyp === "TOTAL") {
              Wednesday[arrayHours[indexHour]].numtrans += 1;
              Wednesday[arrayHours[indexHour]].totalsales += parseFloat(record.groext);
            } else if (record.postrntyp === "ITEM") {
              Wednesday[arrayHours[indexHour]].totalitemsales += parseFloat(record.extprc);
              Wednesday[arrayHours[indexHour]].vatadj += parseFloat(record.lessvat);
              Wednesday[arrayHours[indexHour]].scpwddisc += discount;
              Wednesday[arrayHours[indexHour]].regdisc += x_regdiscount;
            }
          }
          if (moment(keyDay).format("dddd") === "Thursday") {
            if ("00:00:00" <= record.logtim && "00:59:59" >= record.logtim) {
              indexHour = 0;
            } else if (
              "01:00:00" <= record.logtim &&
              "01:59:59" >= record.logtim
            ) {
              indexHour = 1;
            } else if (
              "02:00:00" <= record.logtim &&
              "02:59:59" >= record.logtim
            ) {
              indexHour = 2;
            } else if (
              "03:00:00" <= record.logtim &&
              "03:59:59" >= record.logtim
            ) {
              indexHour = 3;
            } else if (
              "04:00:00" <= record.logtim &&
              "04:59:59" >= record.logtim
            ) {
              indexHour = 4;
            } else if (
              "05:00:00" <= record.logtim &&
              "05:59:59" >= record.logtim
            ) {
              indexHour = 5;
            } else if (
              "06:00:00" <= record.logtim &&
              "06:59:59" >= record.logtim
            ) {
              indexHour = 6;
            } else if (
              "07:00:00" <= record.logtim &&
              "07:59:59" >= record.logtim
            ) {
              indexHour = 7;
            } else if (
              "08:00:00" <= record.logtim &&
              "08:59:59" >= record.logtim
            ) {
              indexHour = 8;
            } else if (
              "09:00:00" <= record.logtim &&
              "09:59:59" >= record.logtim
            ) {
              indexHour = 9;
            } else if (
              "10:00:00" <= record.logtim &&
              "10:59:59" >= record.logtim
            ) {
              indexHour = 10;
            } else if (
              "11:00:00" <= record.logtim &&
              "11:59:59" >= record.logtim
            ) {
              indexHour = 11;
            } else if (
              "12:00:00" <= record.logtim &&
              "12:59:59" >= record.logtim
            ) {
              indexHour = 12;
            } else if (
              "13:00:00" <= record.logtim &&
              "13:59:59" >= record.logtim
            ) {
              indexHour = 13;
            } else if (
              "14:00:00" <= record.logtim &&
              "14:59:59" >= record.logtim
            ) {
              indexHour = 14;
            } else if (
              "15:00:00" <= record.logtim &&
              "15:59:59" >= record.logtim
            ) {
              indexHour = 15;
            } else if (
              "16:00:00" <= record.logtim &&
              "16:59:59" >= record.logtim
            ) {
              indexHour = 16;
            } else if (
              "17:00:00" <= record.logtim &&
              "17:59:59" >= record.logtim
            ) {
              indexHour = 17;
            } else if (
              "18:00:00" <= record.logtim &&
              "18:59:59" >= record.logtim
            ) {
              indexHour = 18;
            } else if (
              "19:00:00" <= record.logtim &&
              "19:59:59" >= record.logtim
            ) {
              indexHour = 19;
            } else if (
              "20:00:00" <= record.logtim &&
              "20:59:59" >= record.logtim
            ) {
              indexHour = 20;
            } else if (
              "21:00:00" <= record.logtim &&
              "21:59:59" >= record.logtim
            ) {
              indexHour = 21;
            } else if (
              "22:00:00" <= record.logtim &&
              "22:59:59" >= record.logtim
            ) {
              indexHour = 22;
            } else if (
              "23:00:00" <= record.logtim &&
              "23:59:59" >= record.logtim
            ) {
              indexHour = 23;
            }
            if (record.postrntyp === "TOTAL") {
              Thursday[arrayHours[indexHour]].numtrans += 1;
              Thursday[arrayHours[indexHour]].totalsales += parseFloat(record.groext);
            } else if (record.postrntyp === "ITEM") {
              Thursday[arrayHours[indexHour]].totalitemsales += parseFloat(record.extprc);
              Thursday[arrayHours[indexHour]].vatadj += parseFloat(record.lessvat);
              Thursday[arrayHours[indexHour]].scpwddisc += discount;
              Thursday[arrayHours[indexHour]].regdisc += x_regdiscount;
            }
          }
          if (moment(keyDay).format("dddd") === "Friday") {
            if ("00:00:00" <= record.logtim && "00:59:59" >= record.logtim) {
              indexHour = 0;
            } else if (
              "01:00:00" <= record.logtim &&
              "01:59:59" >= record.logtim
            ) {
              indexHour = 1;
            } else if (
              "02:00:00" <= record.logtim &&
              "02:59:59" >= record.logtim
            ) {
              indexHour = 2;
            } else if (
              "03:00:00" <= record.logtim &&
              "03:59:59" >= record.logtim
            ) {
              indexHour = 3;
            } else if (
              "04:00:00" <= record.logtim &&
              "04:59:59" >= record.logtim
            ) {
              indexHour = 4;
            } else if (
              "05:00:00" <= record.logtim &&
              "05:59:59" >= record.logtim
            ) {
              indexHour = 5;
            } else if (
              "06:00:00" <= record.logtim &&
              "06:59:59" >= record.logtim
            ) {
              indexHour = 6;
            } else if (
              "07:00:00" <= record.logtim &&
              "07:59:59" >= record.logtim
            ) {
              indexHour = 7;
            } else if (
              "08:00:00" <= record.logtim &&
              "08:59:59" >= record.logtim
            ) {
              indexHour = 8;
            } else if (
              "09:00:00" <= record.logtim &&
              "09:59:59" >= record.logtim
            ) {
              indexHour = 9;
            } else if (
              "10:00:00" <= record.logtim &&
              "10:59:59" >= record.logtim
            ) {
              indexHour = 10;
            } else if (
              "11:00:00" <= record.logtim &&
              "11:59:59" >= record.logtim
            ) {
              indexHour = 11;
            } else if (
              "12:00:00" <= record.logtim &&
              "12:59:59" >= record.logtim
            ) {
              indexHour = 12;
            } else if (
              "13:00:00" <= record.logtim &&
              "13:59:59" >= record.logtim
            ) {
              indexHour = 13;
            } else if (
              "14:00:00" <= record.logtim &&
              "14:59:59" >= record.logtim
            ) {
              indexHour = 14;
            } else if (
              "15:00:00" <= record.logtim &&
              "15:59:59" >= record.logtim
            ) {
              indexHour = 15;
            } else if (
              "16:00:00" <= record.logtim &&
              "16:59:59" >= record.logtim
            ) {
              indexHour = 16;
            } else if (
              "17:00:00" <= record.logtim &&
              "17:59:59" >= record.logtim
            ) {
              indexHour = 17;
            } else if (
              "18:00:00" <= record.logtim &&
              "18:59:59" >= record.logtim
            ) {
              indexHour = 18;
            } else if (
              "19:00:00" <= record.logtim &&
              "19:59:59" >= record.logtim
            ) {
              indexHour = 19;
            } else if (
              "20:00:00" <= record.logtim &&
              "20:59:59" >= record.logtim
            ) {
              indexHour = 20;
            } else if (
              "21:00:00" <= record.logtim &&
              "21:59:59" >= record.logtim
            ) {
              indexHour = 21;
            } else if (
              "22:00:00" <= record.logtim &&
              "22:59:59" >= record.logtim
            ) {
              indexHour = 22;
            } else if (
              "23:00:00" <= record.logtim &&
              "23:59:59" >= record.logtim
            ) {
              indexHour = 23;
            }
            if (record.postrntyp === "TOTAL") {
              Friday[arrayHours[indexHour]].numtrans += 1;
              Friday[arrayHours[indexHour]].totalsales += parseFloat(record.groext);
            } else if (record.postrntyp === "ITEM") {
              Friday[arrayHours[indexHour]].totalitemsales += parseFloat(record.extprc);
              Friday[arrayHours[indexHour]].vatadj += parseFloat(record.lessvat);
              Friday[arrayHours[indexHour]].scpwddisc += discount;
              Friday[arrayHours[indexHour]].regdisc += x_regdiscount;
            }
          }
          if (moment(keyDay).format("dddd") === "Saturday") {
            if ("00:00:00" <= record.logtim && "00:59:59" >= record.logtim) {
              indexHour = 0;
            } else if (
              "01:00:00" <= record.logtim &&
              "01:59:59" >= record.logtim
            ) {
              indexHour = 1;
            } else if (
              "02:00:00" <= record.logtim &&
              "02:59:59" >= record.logtim
            ) {
              indexHour = 2;
            } else if (
              "03:00:00" <= record.logtim &&
              "03:59:59" >= record.logtim
            ) {
              indexHour = 3;
            } else if (
              "04:00:00" <= record.logtim &&
              "04:59:59" >= record.logtim
            ) {
              indexHour = 4;
            } else if (
              "05:00:00" <= record.logtim &&
              "05:59:59" >= record.logtim
            ) {
              indexHour = 5;
            } else if (
              "06:00:00" <= record.logtim &&
              "06:59:59" >= record.logtim
            ) {
              indexHour = 6;
            } else if (
              "07:00:00" <= record.logtim &&
              "07:59:59" >= record.logtim
            ) {
              indexHour = 7;
            } else if (
              "08:00:00" <= record.logtim &&
              "08:59:59" >= record.logtim
            ) {
              indexHour = 8;
            } else if (
              "09:00:00" <= record.logtim &&
              "09:59:59" >= record.logtim
            ) {
              indexHour = 9;
            } else if (
              "10:00:00" <= record.logtim &&
              "10:59:59" >= record.logtim
            ) {
              indexHour = 10;
            } else if (
              "11:00:00" <= record.logtim &&
              "11:59:59" >= record.logtim
            ) {
              indexHour = 11;
            } else if (
              "12:00:00" <= record.logtim &&
              "12:59:59" >= record.logtim
            ) {
              indexHour = 12;
            } else if (
              "13:00:00" <= record.logtim &&
              "13:59:59" >= record.logtim
            ) {
              indexHour = 13;
            } else if (
              "14:00:00" <= record.logtim &&
              "14:59:59" >= record.logtim
            ) {
              indexHour = 14;
            } else if (
              "15:00:00" <= record.logtim &&
              "15:59:59" >= record.logtim
            ) {
              indexHour = 15;
            } else if (
              "16:00:00" <= record.logtim &&
              "16:59:59" >= record.logtim
            ) {
              indexHour = 16;
            } else if (
              "17:00:00" <= record.logtim &&
              "17:59:59" >= record.logtim
            ) {
              indexHour = 17;
            } else if (
              "18:00:00" <= record.logtim &&
              "18:59:59" >= record.logtim
            ) {
              indexHour = 18;
            } else if (
              "19:00:00" <= record.logtim &&
              "19:59:59" >= record.logtim
            ) {
              indexHour = 19;
            } else if (
              "20:00:00" <= record.logtim &&
              "20:59:59" >= record.logtim
            ) {
              indexHour = 20;
            } else if (
              "21:00:00" <= record.logtim &&
              "21:59:59" >= record.logtim
            ) {
              indexHour = 21;
            } else if (
              "22:00:00" <= record.logtim &&
              "22:59:59" >= record.logtim
            ) {
              indexHour = 22;
            } else if (
              "23:00:00" <= record.logtim &&
              "23:59:59" >= record.logtim
            ) {
              indexHour = 23;
            }
            if (record.postrntyp === "TOTAL") {
              Saturday[arrayHours[indexHour]].numtrans += 1;
              Saturday[arrayHours[indexHour]].totalsales += parseFloat(record.groext);
            } else if (record.postrntyp === "ITEM") {
              Saturday[arrayHours[indexHour]].totalitemsales += parseFloat(record.extprc);
              Saturday[arrayHours[indexHour]].vatadj += parseFloat(record.lessvat);
              Saturday[arrayHours[indexHour]].scpwddisc += discount;
              Saturday[arrayHours[indexHour]].regdisc += x_regdiscount;
            }
          }
        }
      }
      arrayDine = {
        Sunday: Sunday,
        Monday: Monday,
        Tuesday: Tuesday,
        Wednesday: Wednesday,
        Thursday: Thursday,
        Friday: Friday,
        Saturday: Saturday,
      };

      returnData = {
        ...returnData,
        ...{
          [dinetype]: arrayDine,
        },
      };
    }
  } else {
    let Sunday: any = {},
      Monday: any = {},
      Tuesday: any = {},
      Wednesday: any = {},
      Thursday: any = {},
      Friday: any = {},
      Saturday: any = {};

    for (let indexDay = 0; indexDay < arrayDaysOfWeek.length; indexDay++) {
      for (let indexHour = 0; indexHour < arrayHours.length; indexHour++) {
        switch (arrayDaysOfWeek[indexDay]) {
          case "Sunday":
            Sunday = {
              ...Sunday,
              ...{
                daycount: 0,
                [arrayHours[indexHour]]: {
                  numtrans: 0,
                  totalsales: 0,
                  servicecharge: 0,
                  vatadj: 0,
                  scpwddisc: 0,
                  regdisc: 0,
                  totalitemsales: 0,
                },
              },
            };
            break;
          case "Monday":
            Monday = {
              ...Monday,
              ...{
                daycount: 0,
                [arrayHours[indexHour]]: {
                  numtrans: 0,
                  totalsales: 0,
                  servicecharge: 0,
                  vatadj: 0,
                  scpwddisc: 0,
                  regdisc: 0,
                  totalitemsales: 0,
                },
              },
            };
            break;
          case "Tuesday":
            Tuesday = {
              ...Tuesday,
              ...{
                daycount: 0,
                [arrayHours[indexHour]]: {
                  numtrans: 0,
                  totalsales: 0,
                  servicecharge: 0,
                  vatadj: 0,
                  scpwddisc: 0,
                  regdisc: 0,
                  totalitemsales: 0,
                },
              },
            };
            break;
          case "Wednesday":
            Wednesday = {
              ...Wednesday,
              ...{
                daycount: 0,
                [arrayHours[indexHour]]: {
                  numtrans: 0,
                  totalsales: 0,
                  servicecharge: 0,
                  vatadj: 0,
                  scpwddisc: 0,
                  regdisc: 0,
                  totalitemsales: 0,
                },
              },
            };
            break;
          case "Thursday":
            Thursday = {
              ...Thursday,
              ...{
                daycount: 0,
                [arrayHours[indexHour]]: {
                  numtrans: 0,
                  totalsales: 0,
                  servicecharge: 0,
                  vatadj: 0,
                  scpwddisc: 0,
                  regdisc: 0,
                  totalitemsales: 0,
                },
              },
            };
            break;
          case "Friday":
            Friday = {
              ...Friday,
              ...{
                daycount: 0,
                [arrayHours[indexHour]]: {
                  numtrans: 0,
                  totalsales: 0,
                  servicecharge: 0,
                  vatadj: 0,
                  scpwddisc: 0,
                  regdisc: 0,
                  totalitemsales: 0,
                },
              },
            };
            break;
          case "Saturday":
            Saturday = {
              ...Saturday,
              ...{
                daycount: 0,
                [arrayHours[indexHour]]: {
                  numtrans: 0,
                  totalsales: 0,
                  servicecharge: 0,
                  vatadj: 0,
                  scpwddisc: 0,
                  regdisc: 0,
                  totalitemsales: 0,
                },
              },
            };
            break;
        }
      }
    }

    groupedByDay = _.sortBy(posData, "trndte");
    groupedByDay = _.groupBy(groupedByDay, "trndte");
    let xcount_perday = 1;
    for (const [keyDay, arrDays] of Object.entries(groupedByDay)) {
      // this.socketService.emit(
      //   "managersreport_emit",
      //   `<b>Per Day Hourly</b><br> Finishing ${(
      //     (xcount_perday / Object.entries(groupedByDay).length) *
      //     100
      //   ).toFixed(2)}%`
      // );
      xcount_perday++;
      if (moment(keyDay).format("dddd") === "Sunday") {
        Sunday.daycount += 1;
      } else if (moment(keyDay).format("dddd") === "Monday") {
        Monday.daycount += 1;
      } else if (moment(keyDay).format("dddd") === "Tuesday") {
        Tuesday.daycount += 1;
      } else if (moment(keyDay).format("dddd") === "Wednesday") {
        Wednesday.daycount += 1;
      } else if (moment(keyDay).format("dddd") === "Thursday") {
        Thursday.daycount += 1;
      } else if (moment(keyDay).format("dddd") === "Friday") {
        Friday.daycount += 1;
      } else if (moment(keyDay).format("dddd") === "Saturday") {
        Saturday.daycount += 1;
      }
      const xarrDays: any = arrDays;
      for (const record of xarrDays) {
        let discount = 0;
        let x_regdiscount = 0;
        await discountComputation(record).then((res) => {
          discount += res.xscpwddisc + res.xgovdiscount;
          x_regdiscount += res.x_regdiscount;
        });

        if (record.postrntyp == "TOTAL") {
          const refund = await getData(
            "posfile/filter",
            {
              ordocnum: record.ordocnum,
              itmcde: record.itmcde,
              refund: 1,
              trndte: record.trndte,
            },
            () => {}
          );
          if (refund.data.length > 0) {
            refund.data.map(async (resRefund: any) => {
              let refundDiscount = 0;
              let refundRegDisc = 0;

              record.groext = record.groext - resRefund.groext;

              await discountComputation(resRefund).then((res) => {
                refundDiscount += res.xscpwddisc + res.xgovdiscount;
                refundRegDisc += res.x_regdiscount;
              });
            });
          }
        } else if (record.postrntyp == "ITEM") {
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
        }

        let indexHour: number = 0;
        if (moment(keyDay).format("dddd") === "Sunday") {
          if ("00:00:00" <= record.logtim && "00:59:59" >= record.logtim) {
            indexHour = 0;
          } else if (
            "01:00:00" <= record.logtim &&
            "01:59:59" >= record.logtim
          ) {
            indexHour = 1;
          } else if (
            "02:00:00" <= record.logtim &&
            "02:59:59" >= record.logtim
          ) {
            indexHour = 2;
          } else if (
            "03:00:00" <= record.logtim &&
            "03:59:59" >= record.logtim
          ) {
            indexHour = 3;
          } else if (
            "04:00:00" <= record.logtim &&
            "04:59:59" >= record.logtim
          ) {
            indexHour = 4;
          } else if (
            "05:00:00" <= record.logtim &&
            "05:59:59" >= record.logtim
          ) {
            indexHour = 5;
          } else if (
            "06:00:00" <= record.logtim &&
            "06:59:59" >= record.logtim
          ) {
            indexHour = 6;
          } else if (
            "07:00:00" <= record.logtim &&
            "07:59:59" >= record.logtim
          ) {
            indexHour = 7;
          } else if (
            "08:00:00" <= record.logtim &&
            "08:59:59" >= record.logtim
          ) {
            indexHour = 8;
          } else if (
            "09:00:00" <= record.logtim &&
            "09:59:59" >= record.logtim
          ) {
            indexHour = 9;
          } else if (
            "10:00:00" <= record.logtim &&
            "10:59:59" >= record.logtim
          ) {
            indexHour = 10;
          } else if (
            "11:00:00" <= record.logtim &&
            "11:59:59" >= record.logtim
          ) {
            indexHour = 11;
          } else if (
            "12:00:00" <= record.logtim &&
            "12:59:59" >= record.logtim
          ) {
            indexHour = 12;
          } else if (
            "13:00:00" <= record.logtim &&
            "13:59:59" >= record.logtim
          ) {
            indexHour = 13;
          } else if (
            "14:00:00" <= record.logtim &&
            "14:59:59" >= record.logtim
          ) {
            indexHour = 14;
          } else if (
            "15:00:00" <= record.logtim &&
            "15:59:59" >= record.logtim
          ) {
            indexHour = 15;
          } else if (
            "16:00:00" <= record.logtim &&
            "16:59:59" >= record.logtim
          ) {
            indexHour = 16;
          } else if (
            "17:00:00" <= record.logtim &&
            "17:59:59" >= record.logtim
          ) {
            indexHour = 17;
          } else if (
            "18:00:00" <= record.logtim &&
            "18:59:59" >= record.logtim
          ) {
            indexHour = 18;
          } else if (
            "19:00:00" <= record.logtim &&
            "19:59:59" >= record.logtim
          ) {
            indexHour = 19;
          } else if (
            "20:00:00" <= record.logtim &&
            "20:59:59" >= record.logtim
          ) {
            indexHour = 20;
          } else if (
            "21:00:00" <= record.logtim &&
            "21:59:59" >= record.logtim
          ) {
            indexHour = 21;
          } else if (
            "22:00:00" <= record.logtim &&
            "22:59:59" >= record.logtim
          ) {
            indexHour = 22;
          } else if (
            "23:00:00" <= record.logtim &&
            "23:59:59" >= record.logtim
          ) {
            indexHour = 23;
          }
          if (record.postrntyp === "TOTAL") {
            Sunday[arrayHours[indexHour]].numtrans += 1;
            Sunday[arrayHours[indexHour]].totalsales += parseFloat(record.groext);
          } else if (record.postrntyp === "ITEM") {
            Sunday[arrayHours[indexHour]].totalitemsales += parseFloat(record.extprc);
            Sunday[arrayHours[indexHour]].vatadj += parseFloat(record.lessvat);
            Sunday[arrayHours[indexHour]].scpwddisc += discount;
            Sunday[arrayHours[indexHour]].regdisc += x_regdiscount;
          } else if (record.postrntyp === "SERVICE CHARGE") {
            Sunday[arrayHours[indexHour]].servicecharge += record.extprc;
          }
        }
        if (moment(keyDay).format("dddd") === "Monday") {
          if ("00:00:00" <= record.logtim && "00:59:59" >= record.logtim) {
            indexHour = 0;
          } else if (
            "01:00:00" <= record.logtim &&
            "01:59:59" >= record.logtim
          ) {
            indexHour = 1;
          } else if (
            "02:00:00" <= record.logtim &&
            "02:59:59" >= record.logtim
          ) {
            indexHour = 2;
          } else if (
            "03:00:00" <= record.logtim &&
            "03:59:59" >= record.logtim
          ) {
            indexHour = 3;
          } else if (
            "04:00:00" <= record.logtim &&
            "04:59:59" >= record.logtim
          ) {
            indexHour = 4;
          } else if (
            "05:00:00" <= record.logtim &&
            "05:59:59" >= record.logtim
          ) {
            indexHour = 5;
          } else if (
            "06:00:00" <= record.logtim &&
            "06:59:59" >= record.logtim
          ) {
            indexHour = 6;
          } else if (
            "07:00:00" <= record.logtim &&
            "07:59:59" >= record.logtim
          ) {
            indexHour = 7;
          } else if (
            "08:00:00" <= record.logtim &&
            "08:59:59" >= record.logtim
          ) {
            indexHour = 8;
          } else if (
            "09:00:00" <= record.logtim &&
            "09:59:59" >= record.logtim
          ) {
            indexHour = 9;
          } else if (
            "10:00:00" <= record.logtim &&
            "10:59:59" >= record.logtim
          ) {
            indexHour = 10;
          } else if (
            "11:00:00" <= record.logtim &&
            "11:59:59" >= record.logtim
          ) {
            indexHour = 11;
          } else if (
            "12:00:00" <= record.logtim &&
            "12:59:59" >= record.logtim
          ) {
            indexHour = 12;
          } else if (
            "13:00:00" <= record.logtim &&
            "13:59:59" >= record.logtim
          ) {
            indexHour = 13;
          } else if (
            "14:00:00" <= record.logtim &&
            "14:59:59" >= record.logtim
          ) {
            indexHour = 14;
          } else if (
            "15:00:00" <= record.logtim &&
            "15:59:59" >= record.logtim
          ) {
            indexHour = 15;
          } else if (
            "16:00:00" <= record.logtim &&
            "16:59:59" >= record.logtim
          ) {
            indexHour = 16;
          } else if (
            "17:00:00" <= record.logtim &&
            "17:59:59" >= record.logtim
          ) {
            indexHour = 17;
          } else if (
            "18:00:00" <= record.logtim &&
            "18:59:59" >= record.logtim
          ) {
            indexHour = 18;
          } else if (
            "19:00:00" <= record.logtim &&
            "19:59:59" >= record.logtim
          ) {
            indexHour = 19;
          } else if (
            "20:00:00" <= record.logtim &&
            "20:59:59" >= record.logtim
          ) {
            indexHour = 20;
          } else if (
            "21:00:00" <= record.logtim &&
            "21:59:59" >= record.logtim
          ) {
            indexHour = 21;
          } else if (
            "22:00:00" <= record.logtim &&
            "22:59:59" >= record.logtim
          ) {
            indexHour = 22;
          } else if (
            "23:00:00" <= record.logtim &&
            "23:59:59" >= record.logtim
          ) {
            indexHour = 23;
          }
          console.log("RECORD GROEXT", record.groext);
          if (record.postrntyp === "TOTAL") {
            Monday[arrayHours[indexHour]].numtrans += 1;
            Monday[arrayHours[indexHour]].totalsales += parseFloat(record.groext);
          } else if (record.postrntyp === "ITEM") {
            Monday[arrayHours[indexHour]].totalitemsales += parseFloat(record.extprc);
            Monday[arrayHours[indexHour]].vatadj += parseFloat(record.lessvat);
            Monday[arrayHours[indexHour]].scpwddisc += discount;
            Monday[arrayHours[indexHour]].regdisc += x_regdiscount;
          }
        }
        if (moment(keyDay).format("dddd") === "Tuesday") {
          if ("00:00:00" <= record.logtim && "00:59:59" >= record.logtim) {
            indexHour = 0;
          } else if (
            "01:00:00" <= record.logtim &&
            "01:59:59" >= record.logtim
          ) {
            indexHour = 1;
          } else if (
            "02:00:00" <= record.logtim &&
            "02:59:59" >= record.logtim
          ) {
            indexHour = 2;
          } else if (
            "03:00:00" <= record.logtim &&
            "03:59:59" >= record.logtim
          ) {
            indexHour = 3;
          } else if (
            "04:00:00" <= record.logtim &&
            "04:59:59" >= record.logtim
          ) {
            indexHour = 4;
          } else if (
            "05:00:00" <= record.logtim &&
            "05:59:59" >= record.logtim
          ) {
            indexHour = 5;
          } else if (
            "06:00:00" <= record.logtim &&
            "06:59:59" >= record.logtim
          ) {
            indexHour = 6;
          } else if (
            "07:00:00" <= record.logtim &&
            "07:59:59" >= record.logtim
          ) {
            indexHour = 7;
          } else if (
            "08:00:00" <= record.logtim &&
            "08:59:59" >= record.logtim
          ) {
            indexHour = 8;
          } else if (
            "09:00:00" <= record.logtim &&
            "09:59:59" >= record.logtim
          ) {
            indexHour = 9;
          } else if (
            "10:00:00" <= record.logtim &&
            "10:59:59" >= record.logtim
          ) {
            indexHour = 10;
          } else if (
            "11:00:00" <= record.logtim &&
            "11:59:59" >= record.logtim
          ) {
            indexHour = 11;
          } else if (
            "12:00:00" <= record.logtim &&
            "12:59:59" >= record.logtim
          ) {
            indexHour = 12;
          } else if (
            "13:00:00" <= record.logtim &&
            "13:59:59" >= record.logtim
          ) {
            indexHour = 13;
          } else if (
            "14:00:00" <= record.logtim &&
            "14:59:59" >= record.logtim
          ) {
            indexHour = 14;
          } else if (
            "15:00:00" <= record.logtim &&
            "15:59:59" >= record.logtim
          ) {
            indexHour = 15;
          } else if (
            "16:00:00" <= record.logtim &&
            "16:59:59" >= record.logtim
          ) {
            indexHour = 16;
          } else if (
            "17:00:00" <= record.logtim &&
            "17:59:59" >= record.logtim
          ) {
            indexHour = 17;
          } else if (
            "18:00:00" <= record.logtim &&
            "18:59:59" >= record.logtim
          ) {
            indexHour = 18;
          } else if (
            "19:00:00" <= record.logtim &&
            "19:59:59" >= record.logtim
          ) {
            indexHour = 19;
          } else if (
            "20:00:00" <= record.logtim &&
            "20:59:59" >= record.logtim
          ) {
            indexHour = 20;
          } else if (
            "21:00:00" <= record.logtim &&
            "21:59:59" >= record.logtim
          ) {
            indexHour = 21;
          } else if (
            "22:00:00" <= record.logtim &&
            "22:59:59" >= record.logtim
          ) {
            indexHour = 22;
          } else if (
            "23:00:00" <= record.logtim &&
            "23:59:59" >= record.logtim
          ) {
            indexHour = 23;
          }
          if (record.postrntyp === "TOTAL") {
            Tuesday[arrayHours[indexHour]].numtrans += 1;
            Tuesday[arrayHours[indexHour]].totalsales += parseFloat(record.groext);
          } else if (record.postrntyp === "ITEM") {
            Tuesday[arrayHours[indexHour]].totalitemsales += parseFloat(record.extprc);
            Tuesday[arrayHours[indexHour]].vatadj += parseFloat(record.lessvat);
            Tuesday[arrayHours[indexHour]].scpwddisc += discount;
            Tuesday[arrayHours[indexHour]].regdisc += x_regdiscount;
          }
        }
        if (moment(keyDay).format("dddd") === "Wednesday") {
          if ("00:00:00" <= record.logtim && "00:59:59" >= record.logtim) {
            indexHour = 0;
          } else if (
            "01:00:00" <= record.logtim &&
            "01:59:59" >= record.logtim
          ) {
            indexHour = 1;
          } else if (
            "02:00:00" <= record.logtim &&
            "02:59:59" >= record.logtim
          ) {
            indexHour = 2;
          } else if (
            "03:00:00" <= record.logtim &&
            "03:59:59" >= record.logtim
          ) {
            indexHour = 3;
          } else if (
            "04:00:00" <= record.logtim &&
            "04:59:59" >= record.logtim
          ) {
            indexHour = 4;
          } else if (
            "05:00:00" <= record.logtim &&
            "05:59:59" >= record.logtim
          ) {
            indexHour = 5;
          } else if (
            "06:00:00" <= record.logtim &&
            "06:59:59" >= record.logtim
          ) {
            indexHour = 6;
          } else if (
            "07:00:00" <= record.logtim &&
            "07:59:59" >= record.logtim
          ) {
            indexHour = 7;
          } else if (
            "08:00:00" <= record.logtim &&
            "08:59:59" >= record.logtim
          ) {
            indexHour = 8;
          } else if (
            "09:00:00" <= record.logtim &&
            "09:59:59" >= record.logtim
          ) {
            indexHour = 9;
          } else if (
            "10:00:00" <= record.logtim &&
            "10:59:59" >= record.logtim
          ) {
            indexHour = 10;
          } else if (
            "11:00:00" <= record.logtim &&
            "11:59:59" >= record.logtim
          ) {
            indexHour = 11;
          } else if (
            "12:00:00" <= record.logtim &&
            "12:59:59" >= record.logtim
          ) {
            indexHour = 12;
          } else if (
            "13:00:00" <= record.logtim &&
            "13:59:59" >= record.logtim
          ) {
            indexHour = 13;
          } else if (
            "14:00:00" <= record.logtim &&
            "14:59:59" >= record.logtim
          ) {
            indexHour = 14;
          } else if (
            "15:00:00" <= record.logtim &&
            "15:59:59" >= record.logtim
          ) {
            indexHour = 15;
          } else if (
            "16:00:00" <= record.logtim &&
            "16:59:59" >= record.logtim
          ) {
            indexHour = 16;
          } else if (
            "17:00:00" <= record.logtim &&
            "17:59:59" >= record.logtim
          ) {
            indexHour = 17;
          } else if (
            "18:00:00" <= record.logtim &&
            "18:59:59" >= record.logtim
          ) {
            indexHour = 18;
          } else if (
            "19:00:00" <= record.logtim &&
            "19:59:59" >= record.logtim
          ) {
            indexHour = 19;
          } else if (
            "20:00:00" <= record.logtim &&
            "20:59:59" >= record.logtim
          ) {
            indexHour = 20;
          } else if (
            "21:00:00" <= record.logtim &&
            "21:59:59" >= record.logtim
          ) {
            indexHour = 21;
          } else if (
            "22:00:00" <= record.logtim &&
            "22:59:59" >= record.logtim
          ) {
            indexHour = 22;
          } else if (
            "23:00:00" <= record.logtim &&
            "23:59:59" >= record.logtim
          ) {
            indexHour = 23;
          }
          if (record.postrntyp === "TOTAL") {
            Wednesday[arrayHours[indexHour]].numtrans += 1;
            Wednesday[arrayHours[indexHour]].totalsales += parseFloat(record.groext);
          } else if (record.postrntyp === "ITEM") {
            Wednesday[arrayHours[indexHour]].totalitemsales += parseFloat(record.extprc);
            Wednesday[arrayHours[indexHour]].vatadj += parseFloat(record.lessvat);
            Wednesday[arrayHours[indexHour]].scpwddisc += discount;
            Wednesday[arrayHours[indexHour]].regdisc += x_regdiscount;
          }
        }
        if (moment(keyDay).format("dddd") === "Thursday") {
          if ("00:00:00" <= record.logtim && "00:59:59" >= record.logtim) {
            indexHour = 0;
          } else if (
            "01:00:00" <= record.logtim &&
            "01:59:59" >= record.logtim
          ) {
            indexHour = 1;
          } else if (
            "02:00:00" <= record.logtim &&
            "02:59:59" >= record.logtim
          ) {
            indexHour = 2;
          } else if (
            "03:00:00" <= record.logtim &&
            "03:59:59" >= record.logtim
          ) {
            indexHour = 3;
          } else if (
            "04:00:00" <= record.logtim &&
            "04:59:59" >= record.logtim
          ) {
            indexHour = 4;
          } else if (
            "05:00:00" <= record.logtim &&
            "05:59:59" >= record.logtim
          ) {
            indexHour = 5;
          } else if (
            "06:00:00" <= record.logtim &&
            "06:59:59" >= record.logtim
          ) {
            indexHour = 6;
          } else if (
            "07:00:00" <= record.logtim &&
            "07:59:59" >= record.logtim
          ) {
            indexHour = 7;
          } else if (
            "08:00:00" <= record.logtim &&
            "08:59:59" >= record.logtim
          ) {
            indexHour = 8;
          } else if (
            "09:00:00" <= record.logtim &&
            "09:59:59" >= record.logtim
          ) {
            indexHour = 9;
          } else if (
            "10:00:00" <= record.logtim &&
            "10:59:59" >= record.logtim
          ) {
            indexHour = 10;
          } else if (
            "11:00:00" <= record.logtim &&
            "11:59:59" >= record.logtim
          ) {
            indexHour = 11;
          } else if (
            "12:00:00" <= record.logtim &&
            "12:59:59" >= record.logtim
          ) {
            indexHour = 12;
          } else if (
            "13:00:00" <= record.logtim &&
            "13:59:59" >= record.logtim
          ) {
            indexHour = 13;
          } else if (
            "14:00:00" <= record.logtim &&
            "14:59:59" >= record.logtim
          ) {
            indexHour = 14;
          } else if (
            "15:00:00" <= record.logtim &&
            "15:59:59" >= record.logtim
          ) {
            indexHour = 15;
          } else if (
            "16:00:00" <= record.logtim &&
            "16:59:59" >= record.logtim
          ) {
            indexHour = 16;
          } else if (
            "17:00:00" <= record.logtim &&
            "17:59:59" >= record.logtim
          ) {
            indexHour = 17;
          } else if (
            "18:00:00" <= record.logtim &&
            "18:59:59" >= record.logtim
          ) {
            indexHour = 18;
          } else if (
            "19:00:00" <= record.logtim &&
            "19:59:59" >= record.logtim
          ) {
            indexHour = 19;
          } else if (
            "20:00:00" <= record.logtim &&
            "20:59:59" >= record.logtim
          ) {
            indexHour = 20;
          } else if (
            "21:00:00" <= record.logtim &&
            "21:59:59" >= record.logtim
          ) {
            indexHour = 21;
          } else if (
            "22:00:00" <= record.logtim &&
            "22:59:59" >= record.logtim
          ) {
            indexHour = 22;
          } else if (
            "23:00:00" <= record.logtim &&
            "23:59:59" >= record.logtim
          ) {
            indexHour = 23;
          }
          if (record.postrntyp === "TOTAL") {
            Thursday[arrayHours[indexHour]].numtrans += 1;
            Thursday[arrayHours[indexHour]].totalsales += parseFloat(record.groext);
          } else if (record.postrntyp === "ITEM") {
            Thursday[arrayHours[indexHour]].totalitemsales += parseFloat(record.extprc);
            Thursday[arrayHours[indexHour]].vatadj += parseFloat(record.lessvat);
            Thursday[arrayHours[indexHour]].scpwddisc += discount;
            Thursday[arrayHours[indexHour]].regdisc += x_regdiscount;
          }
        }
        if (moment(keyDay).format("dddd") === "Friday") {
          if ("00:00:00" <= record.logtim && "00:59:59" >= record.logtim) {
            indexHour = 0;
          } else if (
            "01:00:00" <= record.logtim &&
            "01:59:59" >= record.logtim
          ) {
            indexHour = 1;
          } else if (
            "02:00:00" <= record.logtim &&
            "02:59:59" >= record.logtim
          ) {
            indexHour = 2;
          } else if (
            "03:00:00" <= record.logtim &&
            "03:59:59" >= record.logtim
          ) {
            indexHour = 3;
          } else if (
            "04:00:00" <= record.logtim &&
            "04:59:59" >= record.logtim
          ) {
            indexHour = 4;
          } else if (
            "05:00:00" <= record.logtim &&
            "05:59:59" >= record.logtim
          ) {
            indexHour = 5;
          } else if (
            "06:00:00" <= record.logtim &&
            "06:59:59" >= record.logtim
          ) {
            indexHour = 6;
          } else if (
            "07:00:00" <= record.logtim &&
            "07:59:59" >= record.logtim
          ) {
            indexHour = 7;
          } else if (
            "08:00:00" <= record.logtim &&
            "08:59:59" >= record.logtim
          ) {
            indexHour = 8;
          } else if (
            "09:00:00" <= record.logtim &&
            "09:59:59" >= record.logtim
          ) {
            indexHour = 9;
          } else if (
            "10:00:00" <= record.logtim &&
            "10:59:59" >= record.logtim
          ) {
            indexHour = 10;
          } else if (
            "11:00:00" <= record.logtim &&
            "11:59:59" >= record.logtim
          ) {
            indexHour = 11;
          } else if (
            "12:00:00" <= record.logtim &&
            "12:59:59" >= record.logtim
          ) {
            indexHour = 12;
          } else if (
            "13:00:00" <= record.logtim &&
            "13:59:59" >= record.logtim
          ) {
            indexHour = 13;
          } else if (
            "14:00:00" <= record.logtim &&
            "14:59:59" >= record.logtim
          ) {
            indexHour = 14;
          } else if (
            "15:00:00" <= record.logtim &&
            "15:59:59" >= record.logtim
          ) {
            indexHour = 15;
          } else if (
            "16:00:00" <= record.logtim &&
            "16:59:59" >= record.logtim
          ) {
            indexHour = 16;
          } else if (
            "17:00:00" <= record.logtim &&
            "17:59:59" >= record.logtim
          ) {
            indexHour = 17;
          } else if (
            "18:00:00" <= record.logtim &&
            "18:59:59" >= record.logtim
          ) {
            indexHour = 18;
          } else if (
            "19:00:00" <= record.logtim &&
            "19:59:59" >= record.logtim
          ) {
            indexHour = 19;
          } else if (
            "20:00:00" <= record.logtim &&
            "20:59:59" >= record.logtim
          ) {
            indexHour = 20;
          } else if (
            "21:00:00" <= record.logtim &&
            "21:59:59" >= record.logtim
          ) {
            indexHour = 21;
          } else if (
            "22:00:00" <= record.logtim &&
            "22:59:59" >= record.logtim
          ) {
            indexHour = 22;
          } else if (
            "23:00:00" <= record.logtim &&
            "23:59:59" >= record.logtim
          ) {
            indexHour = 23;
          }
          if (record.postrntyp === "TOTAL") {
            Friday[arrayHours[indexHour]].numtrans += 1;
            Friday[arrayHours[indexHour]].totalsales += parseFloat(record.groext);
          } else if (record.postrntyp === "ITEM") {
            Friday[arrayHours[indexHour]].totalitemsales += parseFloat(record.extprc);
            Friday[arrayHours[indexHour]].vatadj += parseFloat(record.lessvat);
            Friday[arrayHours[indexHour]].scpwddisc += discount;
            Friday[arrayHours[indexHour]].regdisc += x_regdiscount;
          }
        }
        if (moment(keyDay).format("dddd") === "Saturday") {
          if ("00:00:00" <= record.logtim && "00:59:59" >= record.logtim) {
            indexHour = 0;
          } else if (
            "01:00:00" <= record.logtim &&
            "01:59:59" >= record.logtim
          ) {
            indexHour = 1;
          } else if (
            "02:00:00" <= record.logtim &&
            "02:59:59" >= record.logtim
          ) {
            indexHour = 2;
          } else if (
            "03:00:00" <= record.logtim &&
            "03:59:59" >= record.logtim
          ) {
            indexHour = 3;
          } else if (
            "04:00:00" <= record.logtim &&
            "04:59:59" >= record.logtim
          ) {
            indexHour = 4;
          } else if (
            "05:00:00" <= record.logtim &&
            "05:59:59" >= record.logtim
          ) {
            indexHour = 5;
          } else if (
            "06:00:00" <= record.logtim &&
            "06:59:59" >= record.logtim
          ) {
            indexHour = 6;
          } else if (
            "07:00:00" <= record.logtim &&
            "07:59:59" >= record.logtim
          ) {
            indexHour = 7;
          } else if (
            "08:00:00" <= record.logtim &&
            "08:59:59" >= record.logtim
          ) {
            indexHour = 8;
          } else if (
            "09:00:00" <= record.logtim &&
            "09:59:59" >= record.logtim
          ) {
            indexHour = 9;
          } else if (
            "10:00:00" <= record.logtim &&
            "10:59:59" >= record.logtim
          ) {
            indexHour = 10;
          } else if (
            "11:00:00" <= record.logtim &&
            "11:59:59" >= record.logtim
          ) {
            indexHour = 11;
          } else if (
            "12:00:00" <= record.logtim &&
            "12:59:59" >= record.logtim
          ) {
            indexHour = 12;
          } else if (
            "13:00:00" <= record.logtim &&
            "13:59:59" >= record.logtim
          ) {
            indexHour = 13;
          } else if (
            "14:00:00" <= record.logtim &&
            "14:59:59" >= record.logtim
          ) {
            indexHour = 14;
          } else if (
            "15:00:00" <= record.logtim &&
            "15:59:59" >= record.logtim
          ) {
            indexHour = 15;
          } else if (
            "16:00:00" <= record.logtim &&
            "16:59:59" >= record.logtim
          ) {
            indexHour = 16;
          } else if (
            "17:00:00" <= record.logtim &&
            "17:59:59" >= record.logtim
          ) {
            indexHour = 17;
          } else if (
            "18:00:00" <= record.logtim &&
            "18:59:59" >= record.logtim
          ) {
            indexHour = 18;
          } else if (
            "19:00:00" <= record.logtim &&
            "19:59:59" >= record.logtim
          ) {
            indexHour = 19;
          } else if (
            "20:00:00" <= record.logtim &&
            "20:59:59" >= record.logtim
          ) {
            indexHour = 20;
          } else if (
            "21:00:00" <= record.logtim &&
            "21:59:59" >= record.logtim
          ) {
            indexHour = 21;
          } else if (
            "22:00:00" <= record.logtim &&
            "22:59:59" >= record.logtim
          ) {
            indexHour = 22;
          } else if (
            "23:00:00" <= record.logtim &&
            "23:59:59" >= record.logtim
          ) {
            indexHour = 23;
          }
          if (record.postrntyp === "TOTAL") {
            Saturday[arrayHours[indexHour]].numtrans += 1;
            Saturday[arrayHours[indexHour]].totalsales += parseFloat(record.groext);
          } else if (record.postrntyp === "ITEM") {
            Saturday[arrayHours[indexHour]].totalitemsales += parseFloat(record.extprc);
            Saturday[arrayHours[indexHour]].vatadj += parseFloat(record.lessvat);
            Saturday[arrayHours[indexHour]].scpwddisc += discount;
            Saturday[arrayHours[indexHour]].regdisc += x_regdiscount;
          }
        }
      }
    }
    returnData = {
      Sunday: Sunday,
      Monday: Monday,
      Tuesday: Tuesday,
      Wednesday: Wednesday,
      Thursday: Thursday,
      Friday: Friday,
      Saturday: Saturday,
    };
  }

  return returnData;
}
