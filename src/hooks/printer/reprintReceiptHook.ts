/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable react-hooks/rules-of-hooks */
import moment from "moment";
import {ALIGNMENT, usePrinterCommands} from "../../enums/printerCommandEnums";
import {formatNumberWithCommasAndDecimals} from "../../helper/NumberFormat";
import _ from "lodash";
import {PosfileModel} from "../../models/posfile";
import { SpecialRequestDetailModel } from "../../models/specialrequest";
import { receiptDefiner } from "../../helper/ReceiptNumberFormatter";
// import { useAppSelector } from "../../store/store";

export function reprintReceiptPrintout(selector: any, printersize?: number) {

  const {encode, input, fullCut, tableInput, lineBreak, openCashDrawer, bigInput} = usePrinterCommands(printersize);
  // const selector = useAppSelector(state => state);
  const {header, dineType, footer, syspar} = selector.masterfile;
  // const {payment} = selector.payment;

  const {account} = selector.account;
  const {
    transaction,
    specialRequest,
    posfilePreviousAll,
    orderDiscountByCode
  } = selector.order;

  const isItemNumEnabled = syspar.data[0].receipt_itmnum;
  const isDineType = syspar.data[0].no_dineout;
  const isEnabledSpecRequest = syspar.data[0].enable_spcl_req_receipt;
  
  const serviceCharge = posfilePreviousAll?.find((data: any) => data.postrntyp == "SERVICE CHARGE") as unknown as PosfileModel;
  const refundedServiceCharges = posfilePreviousAll?.filter((data: any) => data.postrntyp === "SERVICE CHARGE" && data.refund*1 === 1) as unknown as PosfileModel[];
  const nonRefundedPosfiles = posfilePreviousAll?.filter((data: any) => data.postrntyp === "ITEM" && data.refund*1 === 0) as unknown as PosfileModel[];
  const refundedPosfiles = posfilePreviousAll?.filter((data: any) => data.postrntyp === "ITEM" && data.refund*1 === 1) as unknown as PosfileModel[];
  // const sChargeDisc = posfilePreviousAll?.filter((data: any) => data.postrntyp === "DISCOUNT");
  const posfileTOTAL = posfilePreviousAll?.find((data: any) => data.postrntyp === "TOTAL") as unknown as PosfileModel;
  const refundedPosfileTOTAL = posfilePreviousAll?.filter((data: any) => data.postrntyp === "TOTAL" && data.refund*1 === 1) as unknown as PosfileModel[];
  const change = posfilePreviousAll?.find((data: any) => data.postrntyp === "CHANGE") as unknown as PosfileModel;
  const lessVatAdj = posfilePreviousAll?.find((data: any) => data.postrntyp.toLowerCase() === "less vat adj.") as unknown as PosfileModel;
  const refundedLessVatAdjs = posfilePreviousAll?.filter((data: any) => data.postrntyp === "Less Vat Adj." && data.refund*1 === 1) as unknown as PosfileModel[];
  const payment = posfilePreviousAll?.filter((data: any) => data.postrntyp === "PAYMENT" && data.refund*1 === 0) as unknown as PosfileModel[];
  const discounts = posfilePreviousAll?.filter((data: any) => data.postrntyp === "DISCOUNT" && data.refund*1 === 0) as unknown as PosfileModel[];
  
  const defineReceiptNumber = () =>  receiptDefiner(syspar.receipt_title, posfileTOTAL.ordocnum || "");
  

  const serviceChargeDiscount = nonRefundedPosfiles.reduce((acc: any, cur: any) =>{
    acc.data += cur.scharge_disc * 1;
    return acc;
  } , {data: 0})

  const posfilesMapped = nonRefundedPosfiles.map((pf: any) => {
      const entry = orderDiscountByCode?.data?.find(
        (od: any) => pf.orderitmid == od.orderitmid
      );
      return {
        ...pf,
        discount: entry,
      };
    })
    .reduce((acc: any, curr: any) => {
      const key = curr.isaddon ? curr.mainitmid : curr.orderitmid;
      const prev = acc.recid ? ({} as any) : ({...acc} as any);

      if (!prev[key]) {
        prev[key] = [];
      }

      if (refundedPosfiles.findIndex((item: PosfileModel) => item.orderitmid === curr.orderitmid && item.refundqty!*1 === curr.itmqty*1) > -1) {
        return prev;
      }

      prev[key].push(curr);
      return prev;

    }, {}) as unknown as {[index: string]: PosfileModel[]};

  const findActiveDineType = dineType.data.find(
    (dt: any) => dt.postypcde == posfilePreviousAll?.[0].postypcde
  );

  // Get posfiles and separate it using ordertype
  const getPosfiles = (ordertype: string) => {
    let posfiles = {};

    Object.keys(posfilesMapped).forEach((key) => {
      if (posfilesMapped[key][0]?.ordertyp === ordertype) {
        posfiles = {
          ...posfiles,
          [key]: posfilesMapped[key],
        };
      }
    });

    return posfiles;
  }

  const dineInDTypePosfiles = getPosfiles("DINEIN");
  const takeoutDTypePosfiles = getPosfiles("TAKEOUT");
  const noDineTypePosfiles = posfilesMapped;

  const computeSalesWOVat = () => {
    return formatNumberWithCommasAndDecimals(
      // (posfile?.data?.groext as number) / 1.12,
      posfileTOTAL.vatexempt!*1 - refundedPosfileTOTAL.reduce((acc, curr) => acc + curr.vatexempt!*1, 0),
      2
    );
  };

  const handleGroupingDiscounts = () => {
    if ((posfileTOTAL?.disamt as number) > 0) {
      const mergedPosfiles = {
        ...dineInDTypePosfiles,
        ...takeoutDTypePosfiles,
      };

      const groupedByDiscount = _.groupBy(
        _.flatMap(Object.values(mergedPosfiles)),
        (item: PosfileModel) => item.discount && item.discount.discde
      );

      return Object.keys(groupedByDiscount).forEach((discde) => {
        if (discde != "undefined") {
          const items = groupedByDiscount[discde];
          const totalDisamt: number = items.reduce(
            (total: number, item: any) =>{
              console.log("xxxitem", item.disamt, item.itmqty, );
              
              return total + (parseFloat(item.disamt as any) || 0) / ((item.itmqty!*1) - ((getRefPosFieldVal(item.orderitmid, 'refundqty')||item.itmqty*1) - 1))},
            0
          );

          tableInput(
            `${discde}`,
            formatNumberWithCommasAndDecimals(totalDisamt, 2)
          );
        }
      });
    }
  };

  const handleGroupingDiscountHolders = () => {
    const cards = nonRefundedPosfiles.reduce((acc: {[cardno: string]: {itmcde: string, cardholder: string, cardno: string}}, curr: PosfileModel) => {
      const foundDiscount = discounts.find((d: PosfileModel) => d.orderitmid === curr.orderitmid);
      if (foundDiscount) {
        if (!foundDiscount.cardno) return acc;

        if (!acc[foundDiscount.cardno]) {
          acc[foundDiscount.cardno] = {
            itmcde: foundDiscount.itmcde || '',
            cardholder: foundDiscount.cardholder || '',
            cardno: foundDiscount.cardno || ''
          }
        }
      }
      return acc;
    }, {} as {[cardno: string]: {itmcde: string, cardholder: string, cardno: string}})

    return Object.values(cards).flat().map((item: any) => {
      input(`Discount: ${item.itmcde}`, ALIGNMENT.LEFT);
      input(`  Card No.: ${item.cardno}`, ALIGNMENT.LEFT);
      input(`  Card Holder: ${item.cardholder}`, ALIGNMENT.LEFT);
    })
  }

  const paymentDisplayer = (payment: PosfileModel) => {
    if (payment.itmcde === "CARD") {
      tableInput(payment.cardclass!, formatNumberWithCommasAndDecimals(payment.extprc as number, 2));
      tableInput("CARD NUMBER:", `***${payment.cardno!.substring(payment.cardno!.length - Math.min(4, payment.cardno!.length))}`);
      tableInput("CARD HOLDER NAME:", payment.cardholder!);
      tableInput("APPROVAL CODE:", payment.approvalcode!);
    } else {
      tableInput(payment.itmcde!, formatNumberWithCommasAndDecimals(payment.extprc as number, 2));
    }
  }

  const getRefPosFieldVal = (orderitmid: string, field: string) => {
    return refundedPosfiles.find((item: PosfileModel) => item.orderitmid === orderitmid)?.[field] || undefined;
  }
  
  openCashDrawer();

  input(header.data[0].business1 || "", ALIGNMENT.CENTER);
  // input(header.data[0].business2 || "", ALIGNMENT.CENTER);
  input(header.data[0].business3 || "", ALIGNMENT.CENTER);
  input((header.data[0].chknonvat ? "NON-VAT Reg."
    : "VAT Reg.") + ` TIN- ${header.data[0].tin}` || "", ALIGNMENT.CENTER);
  input(header.data[0].address1 || "", ALIGNMENT.CENTER);
  input(header.data[0].address2 || "", ALIGNMENT.CENTER);
  input(header.data[0].address3 || "", ALIGNMENT.CENTER);
  input(
    `MIN#${header.data[0].machineno} SN#${header.data[0].serialno}` || "",
    ALIGNMENT.CENTER
  );

  lineBreak();

  // input(`${syspar.data[0].ordocnum || ""}`, ALIGNMENT.LEFT);
  input(`${defineReceiptNumber()|| ""}`, ALIGNMENT.LEFT);
  input(`PAX: ${transaction.data?.paxcount || "1"}`, ALIGNMENT.LEFT);
  tableInput(`CASHIER: ${account.data?.usrname || ""}`, `SERVER: ${account.data?.usrname || ""}`);
  // input(`CASHIER: ${account.data?.usrname || ""}`, ALIGNMENT.LEFT);
  // input(`SERVER: MANAGER` || "", ALIGNMENT.LEFT);

  bigInput("** REPRINT RECEIPT **", ALIGNMENT.CENTER)

  lineBreak();
  lineBreak();

  const dineInPosfiles = Object.keys(dineInDTypePosfiles);
  const takeoutPosfiles = Object.keys(takeoutDTypePosfiles);

  if (isDineType === 0) {
    input(`${findActiveDineType?.postypdsc}`, ALIGNMENT.CENTER);
    input(`------------------------------------------------`, ALIGNMENT.LEFT);
    dineInPosfiles.length > 0 && input(`(DINE IN)`, ALIGNMENT.CENTER);
    dineInPosfiles.length > 0 && lineBreak();

    dineInPosfiles.map((key) => {
      (dineInDTypePosfiles[key as keyof typeof dineInDTypePosfiles] as any[]).forEach((item: any) => {
        console.log("tignan naten", item);
        if (isItemNumEnabled === 1 && item.itmcomtyp === null) {
          input(`${item.itmnum}`, ALIGNMENT.LEFT);
        }
        if (item.discount) {
          console.log("eto 1");

          // no item combo with discount
          if (item.itmcomtyp === null && item.isaddon === 0) {

            // const itemDesc = itemFile?.data?.find((d: any)=> d.itmcde == item.itmcde)?.itmdsc

            tableInput(
              `${formatNumberWithCommasAndDecimals(item.itmqty - (getRefPosFieldVal(item.orderitmid, 'refundqty')||0)*1)}x ${
                item.itmdsc
              }`,
              `${formatNumberWithCommasAndDecimals(
                  (item.freereason ? 0: item.changed ? item.grossprc as number : item.untprc as number) * (item.itmqty as number),
                2)}${item.taxcde === "VATABLE" ? "V" : "N"}`
              // `${formatNumberWithCommasAndDecimals(item.untprc, 2)} ${item.taxcde === "VATABLE" ? "V" : "N"}`
            );

            if (item.freereason) {
              input(' '.repeat(5) + `Free Item: ${item.freereason}`, ALIGNMENT.LEFT);
            }

            if (isEnabledSpecRequest) {
              specialRequest.data
                .filter((f: SpecialRequestDetailModel) => f.orderitmid === item.orderitmid)
                .forEach((spc: SpecialRequestDetailModel) => {
                  input(' '.repeat(5) + `* Special Request/Remarks: ${spc.modcde}`, ALIGNMENT.LEFT);
                });
            }

            if (item.discount.distyp === "Percent") {
              tableInput(
                  " ".repeat(5) +
                  "*" +
                  `${item.discount.discde} @ ${item.discount.disper}%`,
                  `(-${formatNumberWithCommasAndDecimals(item.disamt*1 / (item.itmqty - ((getRefPosFieldVal(item.orderitmid, 'refundqty')||item.itmqty)*1 - 1)), 2)})`
              )
            } else {
              // for Amount
              // input(
              //   " ".repeat(5) +
              //     "*" +
              //     `${item.discount.discde} @ ${item.discount.disamt}`,
              //   ALIGNMENT.LEFT
              // );
              tableInput(
                " ".repeat(5) +
                "*" +
                `${item.discount.discde} @ ${item.discount.disamt}`,
                `(-${formatNumberWithCommasAndDecimals(item.disamt*1 / (item.itmqty - ((getRefPosFieldVal(item.orderitmid, 'refundqty')||item.itmqty)*1 - 1)), 2)})`
              )
            }
          } else {
            // combo meals with discount
            // checks if upgrade or normal
            if (item.itmcomtyp === "UPGRADE") {
              tableInput(
                `${" ".repeat(5)} ${formatNumberWithCommasAndDecimals(
                  item.itmqty
                )}x ${item.itmdsc}`,
                ``
              );
              tableInput(
                `${" ".repeat(10)} *UPGRADE`,
                `${formatNumberWithCommasAndDecimals(item.extprc, 2)} ${item.taxcde === "VATABLE" ? "V" : "N"}`
              );
            } else {
              // OTHERS DEFAULT
              item.isaddon === 0 &&
                tableInput(
                  `${" ".repeat(5)} ${formatNumberWithCommasAndDecimals(
                    item.itmqty
                  )}x ${item.itmdsc}`,
                  ``
                );
            }
          }
          // end condition
        } else {
          // not item combo
          if (item.itmcomtyp === null && item.isaddon === 0) {
            tableInput(
              `${formatNumberWithCommasAndDecimals(item.itmqty - (getRefPosFieldVal(item.orderitmid, 'refundqty')||0)*1)}x ${
                item.itmdsc
              }`,
              `${formatNumberWithCommasAndDecimals(
                  (item.freereason ? 0: item.changed ? item.grossprc as number : item.untprc as number) * (item.itmqty as number),
                2)}${item.taxcde === "VATABLE" ? "V" : "N"}`
              // `${formatNumberWithCommasAndDecimals(item.untprc, 2)} ${item.taxcde === "VATABLE" ? "V" : "N"}`
            );

            if (item.freereason) {
              input(' '.repeat(5) + `Free Item: ${item.freereason}`, ALIGNMENT.LEFT);
            }

            if (isEnabledSpecRequest) {
              specialRequest.data
                .filter((f: SpecialRequestDetailModel) => f.orderitmid === item.orderitmid)
                .forEach((spc: SpecialRequestDetailModel) => {
                  input(' '.repeat(5) + `* Special Request/Remarks: ${spc.modcde}`, ALIGNMENT.LEFT);
                });
            }
          } else {
            // combo meals with discount
            // checks if upgrade or normal
            if (item.itmcomtyp === "UPGRADE") {
              tableInput(
                `${" ".repeat(5)} ${formatNumberWithCommasAndDecimals(
                  item.itmqty
                )}x ${item.itmdsc}`,
                ``
              );
              tableInput(
                `${" ".repeat(10)} *UPGRADE`,
                `${formatNumberWithCommasAndDecimals(item.extprc, 2)} ${item.taxcde === "VATABLE" ? "V" : "N"}`
              );
            } else {
              // OTHERS DEFAULT
              item.isaddon === 0 &&
                tableInput(
                  `${" ".repeat(5)} ${formatNumberWithCommasAndDecimals(
                    item.itmqty
                  )}x ${item.itmdsc}`,
                  ``
                );
            }
          }
          // end condition
        }

        if (item.isaddon === 1) {
          tableInput(
            `${" ".repeat(5)} * Addon: ${item.itmdsc}`,
            `${formatNumberWithCommasAndDecimals((item.freereason || item.changed) ? item.grossprc as number : item.untprc as number, 2)}`
          );
          if (item.discount) {
            tableInput(
              `${" ".repeat(7)} * ${item.discount.discde} @ ${item.discount.disper}%`,
              `(-${formatNumberWithCommasAndDecimals(item.disamt as number, 2)})`
            )
          }
        }
      })
    });

    if (dineInPosfiles.length > 0 && takeoutPosfiles.length > 0) {
      input(`------------------------------------------------`, ALIGNMENT.LEFT);
    }

    if (takeoutPosfiles.length > 0) {
      input(`(TAKE OUT)`, ALIGNMENT.CENTER);
      lineBreak();

      Object.keys(takeoutDTypePosfiles).map((key) => {
        (takeoutDTypePosfiles[key as keyof typeof takeoutDTypePosfiles] as any[]).forEach((item: any) => {
          if (isItemNumEnabled === 1 && item.itmcomtyp === null) {
            input(`${item.itmnum}`, ALIGNMENT.LEFT);
          }
          if (item.discount) {
            console.log("eto 1");
  
            // no item combo with discount
            if (item.itmcomtyp === null && item.isaddon === 0) {
              tableInput(
                `${formatNumberWithCommasAndDecimals(item.itmqty - (getRefPosFieldVal(item.orderitmid, 'refundqty')||0)*1)}x ${
                  item.itmdsc
                }`,
                `${formatNumberWithCommasAndDecimals(
                  (item.freereason ? 0: item.changed ? item.grossprc as number : item.untprc as number) * (item.itmqty as number),
                2)}${item.taxcde === "VATABLE" ? "V" : "N"}`
                // `${formatNumberWithCommasAndDecimals(item.untprc, 2)} ${item.taxcde === "VATABLE" ? "V" : "N"}`
              );

              if (item.freereason) {
                input(' '.repeat(5) + `Free Item: ${item.freereason}`, ALIGNMENT.LEFT);
              }

              if (isEnabledSpecRequest) {
                specialRequest.data
                  .filter((f: SpecialRequestDetailModel) => f.orderitmid === item.orderitmid)
                  .forEach((spc: SpecialRequestDetailModel) => {
                    input(' '.repeat(5) + `* Special Request/Remarks: ${spc.modcde}`, ALIGNMENT.LEFT);
                  });
              }

              if (item.discount.distyp === "Percent") {
                // input(
                //   " ".repeat(5) +
                //     "*" +
                //     `${item.discount.discde} @ ${item.discount.disper}%`,
                //   ALIGNMENT.LEFT
                // );
                tableInput(
                    " ".repeat(5) +
                    "*" +
                    `${item.discount.discde} @ ${item.discount.disper}%`,
                    `(-${formatNumberWithCommasAndDecimals(item.disamt*1 / (item.itmqty - ((getRefPosFieldVal(item.orderitmid, 'refundqty')||item.itmqty)*1 - 1)), 2)})`
                )
              } else {
                // for Amount
                // input(
                //   " ".repeat(5) +
                //     "*" +
                //     `${item.discount.discde} @ ${item.discount.disamt}`,
                //   ALIGNMENT.LEFT
                // );
                tableInput(
                  " ".repeat(5) +
                  "*" +
                  `${item.discount.discde} @ ${item.discount.disamt}`,
                  `(-${formatNumberWithCommasAndDecimals(item.disamt*1 / (item.itmqty - ((getRefPosFieldVal(item.orderitmid, 'refundqty')||item.itmqty)*1 - 1)), 2)})`
                )
              }
            } else {
              // combo meals with discount
              // checks if upgrade or normal
              if (item.itmcomtyp === "UPGRADE") {
                tableInput(
                  `${" ".repeat(5)} ${formatNumberWithCommasAndDecimals(
                    item.itmqty
                  )}x ${item.itmdsc}`,
                  ``
                );
                tableInput(
                  `${" ".repeat(10)} *UPGRADE`,
                  `${formatNumberWithCommasAndDecimals(item.extprc, 2)} ${item.taxcde === "VATABLE" ? "V" : "N"}`
                );
              } else {
                // OTHERS DEFAULT
                item.isaddon === 0 &&
                  tableInput(
                    `${" ".repeat(5)} ${formatNumberWithCommasAndDecimals(
                      item.itmqty
                    )}x ${item.itmdsc}`,
                    ``
                  );
              }
            }
            // end condition
          } else {
            // not item combo
            if (item.itmcomtyp === null && item.isaddon === 0) {
              tableInput(
                `${formatNumberWithCommasAndDecimals(item.itmqty - (getRefPosFieldVal(item.orderitmid, 'refundqty')||0)*1)}x ${
                  item.itmdsc
                }`,
                `${formatNumberWithCommasAndDecimals(
                  (item.freereason ? 0: item.changed ? item.grossprc as number : item.untprc as number) * (item.itmqty as number),
                2)}${item.taxcde === "VATABLE" ? "V" : "N"}`
                // `${formatNumberWithCommasAndDecimals(item.untprc, 2)} ${item.taxcde === "VATABLE" ? "V" : "N"}`
              );

              if (item.freereason) {
                input(' '.repeat(5) + `Free Item: ${item.freereason}`, ALIGNMENT.LEFT);
              }

              if (isEnabledSpecRequest) {
                specialRequest.data
                  .filter((f: SpecialRequestDetailModel) => f.orderitmid === item.orderitmid)
                  .forEach((spc: SpecialRequestDetailModel) => {
                    input(' '.repeat(5) + `* Special Request/Remarks: ${spc.modcde}`, ALIGNMENT.LEFT);
                  });
              }
            } else {
              // combo meals with discount
              // checks if upgrade or normal
              if (item.itmcomtyp === "UPGRADE") {
                tableInput(
                  `${" ".repeat(5)} ${formatNumberWithCommasAndDecimals(
                    item.itmqty
                  )}x ${item.itmdsc}`,
                  ``
                );
                tableInput(
                  `${" ".repeat(10)} *UPGRADE`,
                  `${formatNumberWithCommasAndDecimals(item.extprc, 2)} ${item.taxcde === "VATABLE" ? "V" : "N"}`
                );
              } else {
                // OTHERS DEFAULT
                item.isaddon === 0 &&
                  tableInput(
                    `${" ".repeat(5)} ${formatNumberWithCommasAndDecimals(
                      item.itmqty
                    )}x ${item.itmdsc}`,
                    ``
                  );
              }
            }
            // end condition
          }
  
          if (item.isaddon === 1) {
            tableInput(
              `${" ".repeat(5)} * Addon: ${item.itmdsc}`,
              `${formatNumberWithCommasAndDecimals((item.freereason || item.changed) ? item.grossprc as number : item.untprc as number, 2)}`
            );
            if (item.discount) {
              tableInput(
                `${" ".repeat(7)} * ${item.discount.discde} @ ${item.discount.disper}%`,
                `(-${formatNumberWithCommasAndDecimals(item.disamt*1 / (item.itmqty - ((getRefPosFieldVal(item.orderitmid, 'refundqty')||item.itmqty)*1 - 1)), 2)})`
              )
            }
          }
        })
      });
    }

    input(`------------------------------------------------`, ALIGNMENT.LEFT);
    //start changes

    tableInput(
      "SUBTOTAL",
      formatNumberWithCommasAndDecimals(posfileTOTAL.groext!*1 - refundedPosfileTOTAL.reduce((acc, curr) => acc + curr.groext!*1, 0), 2)
    );

    console.log("LESS DAW", lessVatAdj);

    tableInput(
      "Less VAT (SC/PWD)",
      formatNumberWithCommasAndDecimals(lessVatAdj.extprc!*1 - refundedLessVatAdjs.reduce((acc, curr) => acc + curr.extprc!*1, 0), 2)
    );

    tableInput("Sales without VAT", computeSalesWOVat());

    handleGroupingDiscounts();

    // if ((posfile?.data?.disamt as number) > 0) {
    //   dineInDTypePosfiles.forEach((item: any) => {
    //     if (item.discount && item.itmcomtyp === null) {
    //       console.log("sheesh", item);
    //       tableInput(
    //         `${item.discount.discde}`,
    //         formatNumberWithCommasAndDecimals(
    //           item?.discount?.amtdis as number,
    //           2
    //         )
    //       );
    //     }
    //   });
    // }

    // if ((posfile?.data?.disamt as number) > 0) {
    //   takeoutDTypePosfiles.forEach((item: any) => {
    //     if (item.discount && item.itmcomtyp === null) {
    //       console.log("sheesh", item);
    //       tableInput(
    //         `${item.discount.discde}`,
    //         formatNumberWithCommasAndDecimals(
    //           item?.discount?.amtdis as number,
    //           2
    //         )
    //       );
    //     }
    //   });
    // }

    tableInput(
      "SERVICE CHARGE",
      formatNumberWithCommasAndDecimals(serviceCharge.extprc!*1 - refundedServiceCharges.reduce((acc, curr) => acc + curr.extprc!*1, 0) , 2)
    );

    if(serviceChargeDiscount.data>0){
      tableInput(
        "SERVICE CHARGE DISCOUNT",
        formatNumberWithCommasAndDecimals((serviceChargeDiscount.data || 0) - refundedServiceCharges.reduce((acc, curr) => acc + curr.amtdis!*1, 0), 2)
      );
    }

    tableInput(
      "AMOUNT DUE",
      formatNumberWithCommasAndDecimals(
        parseFloat(posfileTOTAL.extprc + ""|| 0 + "") - (
          refundedPosfileTOTAL.reduce((acc, curr) => acc + curr.extprc!*1, 0) + 
          refundedServiceCharges.reduce((acc, curr) => acc + curr.extprc!*1, 0) -
          refundedServiceCharges.reduce((acc, curr) => acc + curr.amtdis!*1, 0)
        ),
        2
      )
    );

    payment.map((item: PosfileModel) => {
      paymentDisplayer(item);
    });

    tableInput(
      "CHANGE",
      formatNumberWithCommasAndDecimals((change?.extprc as number) || 0, 2)
    );

    input(
      `** ${
        nonRefundedPosfiles.filter(
          (item: any) => item.itmcomtyp === null && item.isaddon === 0
        ).length
      } PRODUCT(S) PURCHASED **`,
      ALIGNMENT.CENTER
    );

    input(`------------------------------------------------`, ALIGNMENT.LEFT);
    input(`------------------------------------------------`, ALIGNMENT.LEFT);

    input("VAT ANALYSIS", ALIGNMENT.CENTER);

    input(`------------------------------------------------`, ALIGNMENT.LEFT);

    tableInput(
      "VATable Sales",
      formatNumberWithCommasAndDecimals(posfileTOTAL?.netvatamt as number, 2)
    );

    tableInput(
      "VAT Amount",
      formatNumberWithCommasAndDecimals(posfileTOTAL?.vatamt as number, 2)
    );

    tableInput(
      "VAT Exempted Sales",
      formatNumberWithCommasAndDecimals(
        parseFloat(posfileTOTAL.vatexempt as unknown as string) + parseFloat(serviceCharge.extprc as unknown as string) - parseFloat(serviceChargeDiscount.data as unknown as string),
        2
      )
      // (posfile?.data?.disamt as number) > 0
      //   ? formatNumberWithCommasAndDecimals(
      //       posfile.data?.vatexempt as number,
      //       2
      //     )
      //   : "0"
    );

    tableInput("Zero-Rated Sales", formatNumberWithCommasAndDecimals(0.0, 2));

    input(`------------------------------------------------`, ALIGNMENT.LEFT);

    posfileTOTAL.disamt as number > 0 && handleGroupingDiscountHolders();

    input(`Customer's Name: ${payment[0]?.customername || ''}`, ALIGNMENT.LEFT);
    input(`Address: ${payment[0]?.address || ''}`, ALIGNMENT.LEFT);
    input(`Contact No.: ${payment[0]?.contactno || ''}`, ALIGNMENT.LEFT);
    input(`TIN: ${payment[0]?.tin || ''}`, ALIGNMENT.LEFT);

    bigInput("** REPRINT RECEIPT **", ALIGNMENT.CENTER)

    lineBreak();

    if(syspar.data[0].receipt_title == 0){

      if(footer.data[0].officialreceipt == 1){
        input("Official Receipt", ALIGNMENT.CENTER);
      }
      else{
        input("This is not an official receipt, please ask for your manual OR", ALIGNMENT.CENTER);
      }

    }
    else{
      if(footer.data[0].officialreceipt == 1){
        input("Receipt Invoice", ALIGNMENT.CENTER);
      }
      else{
        input("Not valid as Invoice, please ask for manual invoice", ALIGNMENT.CENTER);
      }
    }
    
    input(
      `${moment(new Date(), "MM/DD/YYYY h:mm:ss A").format(
        "MM/DD/YYYY h:mm:ss A"
      )}`,
      ALIGNMENT.CENTER
    );
    input("Thank you. Come again!", ALIGNMENT.CENTER);

    input(`------------------------------------------------`, ALIGNMENT.LEFT);

    if (footer.data[0].footermsg1)
      input(`${footer.data[0].footermsg1}`, ALIGNMENT.CENTER);
    if (footer.data[0].footermsg2)
      input(`${footer.data[0].footermsg2}`, ALIGNMENT.CENTER);
    if (footer.data[0].footermsg3)
      input(`${footer.data[0].footermsg3}`, ALIGNMENT.CENTER);
    if (footer.data[0].footermsg4)
      input(`${footer.data[0].footermsg4}`, ALIGNMENT.CENTER);
    if (footer.data[0].footermsg5)
      input(`${footer.data[0].footermsg5}`, ALIGNMENT.CENTER);

    input(`------------------------------------------------`, ALIGNMENT.LEFT);

    input("POS PROVIDER", ALIGNMENT.LEFT);
    input(footer.data[0].supname, ALIGNMENT.LEFT);
    input(footer.data[0].supaddress, ALIGNMENT.LEFT);
    input(`TIN: ${footer.data[0].supvarregtin}`, ALIGNMENT.LEFT);
    input(`Accre: #${footer.data[0].accrenum}`, ALIGNMENT.LEFT);
    input(
      `Issued: ${moment(footer.data[0].accredate).format("MM/DD/YYYY")}`,
      ALIGNMENT.LEFT
    );
    input(
      `Valid Until: ${moment(footer.data[0].accredate)
        .add(footer.data[0].validyr, "years")
        .format("MM/DD/YYYY")}`,
      ALIGNMENT.LEFT
    );
    input(`Permit# ${footer.data[0].permitnum}`, ALIGNMENT.LEFT);
    input(`Date Issued: ${footer.data[0].dateissued}`, ALIGNMENT.LEFT);

    // end changes
  } else if (isDineType === 1) {
    input("TRANSACTION", ALIGNMENT.CENTER);
    lineBreak();

    Object.keys(noDineTypePosfiles).map((key) => {
      noDineTypePosfiles[key].forEach((item: any) => {
        if (isItemNumEnabled === 1 && item.itmcomtyp === null) {
          input(`${item.itmnum}`, ALIGNMENT.LEFT);
        }
        if (item.discount) {
          console.log("eto 1");
  
          // no item combo with discount
          if (item.itmcomtyp === null) {
            tableInput(
              `${formatNumberWithCommasAndDecimals(item.itmqty - (getRefPosFieldVal(item.orderitmid, 'refundqty')||0)*1)}x ${item.itmdsc}`,
              `${formatNumberWithCommasAndDecimals(
                  (item.freereason ? 0: item.changed ? item.grossprc as number : item.untprc as number) * (item.itmqty as number),
                2)}${item.taxcde === "VATABLE" ? "V" : "N"}`
              // `${formatNumberWithCommasAndDecimals(item.untprc, 2)}`
            );

            if (item.freereason) {
              input(' '.repeat(5) + `Free Item: ${item.freereason}`, ALIGNMENT.LEFT);
            }

            if (isEnabledSpecRequest) {
              specialRequest.data
                .filter((f: SpecialRequestDetailModel) => f.orderitmid === item.orderitmid)
                .forEach((spc: SpecialRequestDetailModel) => {
                  input(' '.repeat(5) + `* Special Request/Remarks: ${spc.modcde}`, ALIGNMENT.LEFT);
                });
            }

            if (item.discount.distyp === "Percent") {
              // input(
              //   " ".repeat(5) +
              //     "*" +
              //     `${item.discount.discde} @ ${item.discount.disper}%`,
              //   ALIGNMENT.LEFT
              // );
              tableInput(
                  " ".repeat(5) +
                  "*" +
                  `${item.discount.discde} @ ${item.discount.disper}%`,
                  `(-${formatNumberWithCommasAndDecimals(item.disamt*1 / (item.itmqty - ((getRefPosFieldVal(item.orderitmid, 'refundqty')||item.itmqty)*1 - 1)), 2)})`
              )
            } else {
              // for Amount
              // input(
              //   " ".repeat(5) +
              //     "*" +
              //     `${item.discount.discde} @ ${item.discount.disamt}`,
              //   ALIGNMENT.LEFT
              // );
              tableInput(
                " ".repeat(5) +
                "*" +
                `${item.discount.discde} @ ${item.discount.disamt}`,
                `(-${formatNumberWithCommasAndDecimals(item.disamt*1 / (item.itmqty - ((getRefPosFieldVal(item.orderitmid, 'refundqty')||item.itmqty)*1 - 1)), 2)})`
              )
            }
          } else {
            // combo meals with discount
            // checks if upgrade or normal
            if (item.itmcomtyp === "UPGRADE") {
              tableInput(
                `${" ".repeat(5)} ${formatNumberWithCommasAndDecimals(
                  item.itmqty
                )}x ${item.itmdsc}`,
                ``
              );
              tableInput(
                `${" ".repeat(10)} *UPGRADE`,
                `${formatNumberWithCommasAndDecimals(item.extprc, 2)}`
              );
            } else {
              // OTHERS DEFAULT
              item.isaddon === 0 &&
                tableInput(
                  `${" ".repeat(5)} ${formatNumberWithCommasAndDecimals(
                    item.itmqty
                  )}x ${item.itmdsc}`,
                  ``
                );
            }
          }
          // end condition
        } else {
          // not item combo
          if (item.itmcomtyp === null) {
            tableInput(
              `${formatNumberWithCommasAndDecimals(item.itmqty - (getRefPosFieldVal(item.orderitmid, 'refundqty')||0)*1)}x ${item.itmdsc}`,
              `${formatNumberWithCommasAndDecimals(
                  (item.freereason ? 0: item.changed ? item.grossprc as number : item.untprc as number) * (item.itmqty as number),
                2)}${item.taxcde === "VATABLE" ? "V" : "N"}`
              // `${formatNumberWithCommasAndDecimals(item.untprc, 2)}`
            );

            if (item.freereason) {
              input(' '.repeat(5) + `Free Item: ${item.freereason}`, ALIGNMENT.LEFT);
            }

            if (isEnabledSpecRequest) {
              specialRequest.data
                .filter((f: SpecialRequestDetailModel) => f.orderitmid === item.orderitmid)
                .forEach((spc: SpecialRequestDetailModel) => {
                  input(' '.repeat(5) + `* Special Request/Remarks: ${spc.modcde}`, ALIGNMENT.LEFT);
                });
            }
          } else {
            // combo meals with discount
            // checks if upgrade or normal
            if (item.itmcomtyp === "UPGRADE") {
              tableInput(
                `${" ".repeat(5)} ${formatNumberWithCommasAndDecimals(
                  item.itmqty
                )}x ${item.itmdsc}`,
                ``
              );
              tableInput(
                `${" ".repeat(10)} *UPGRADE`,
                `${formatNumberWithCommasAndDecimals(item.extprc, 2)}`
              );
            } else {
              // OTHERS DEFAULT
              item.isaddon === 0 &&
                tableInput(
                  `${" ".repeat(5)} ${formatNumberWithCommasAndDecimals(
                    item.itmqty
                  )}x ${item.itmdsc}`,
                  ``
                );
            }
          }
          // end condition
        }

        if (item.isaddon === 1) {
          tableInput(
            `${" ".repeat(5)} * Addon: ${item.itmdsc}`,
            `${formatNumberWithCommasAndDecimals((item.freereason || item.changed) ? item.grossprc as number : item.untprc as number, 2)}`
          );
          if (item.discount) {
            tableInput(
              `${" ".repeat(7)} * ${item.discount.discde} @ ${item.discount.disper}%`,
              `(-${formatNumberWithCommasAndDecimals(item.disamt as number, 2)})`
            )
          }
        }
      })
    });

    input(`------------------------------------------------`, ALIGNMENT.LEFT);

    tableInput(
      "SUBTOTAL",
      formatNumberWithCommasAndDecimals(posfileTOTAL?.groext as number, 2)
    );

    tableInput(
      "Less VAT (SC/PWD)",
      formatNumberWithCommasAndDecimals(lessVatAdj?.extprc as number, 2)
    );

    // tableInput("Sales without VAT", computeSalesWOVat());
    tableInput("Sales without VAT", formatNumberWithCommasAndDecimals(
      posfileTOTAL?.vatexempt as number,
      2
    ));

    handleGroupingDiscounts();

    tableInput(
      "SERVICE CHARGE",
      formatNumberWithCommasAndDecimals(serviceCharge?.extprc || 0, 2)
    );

    if(serviceChargeDiscount.data>0){
      tableInput(
        "SERVICE CHARGE DISCOUNT",
        formatNumberWithCommasAndDecimals(serviceChargeDiscount.data || 0, 2)
      );
    }

    tableInput(
      "AMOUNT DUE",
      formatNumberWithCommasAndDecimals(
        parseFloat(posfileTOTAL.extprc+ "" || 0 + "") +
          parseFloat(serviceCharge.extprc+"" || 0 + "") - parseFloat(serviceChargeDiscount.data || 0 + ""),
        2
      )
    );

    payment.map((item: PosfileModel) => {
      paymentDisplayer(item);
    });

    tableInput(
      "CHANGE",
      formatNumberWithCommasAndDecimals((change?.extprc as number) || 0, 2)
    );

    input(
      `** ${
        nonRefundedPosfiles.filter(
          (item: any) => item.itmcomtyp === null && item.isaddon === 0
        ).length
      } PRODUCT(S) PURCHASED **`,
      ALIGNMENT.CENTER
    );

    input(`------------------------------------------------`, ALIGNMENT.LEFT);
    input(`------------------------------------------------`, ALIGNMENT.LEFT);

    input("VAT ANALYSIS", ALIGNMENT.CENTER);

    input(`------------------------------------------------`, ALIGNMENT.LEFT);

    tableInput(
      "VATable Sales",
      formatNumberWithCommasAndDecimals(posfileTOTAL?.netvatamt as number, 2)
    );

    tableInput(
      "VAT Amount",
      formatNumberWithCommasAndDecimals(posfileTOTAL?.vatamt as number, 2)
    );

    tableInput(
      "VAT Exempted Sales",
      formatNumberWithCommasAndDecimals(
        parseFloat(posfileTOTAL.vatexempt as unknown as string) + parseFloat(serviceCharge.extprc as unknown as string) - parseFloat(serviceChargeDiscount.data as unknown as string),
        2
      )
      // (posfile?.data?.disamt as number) > 0
      //   ? formatNumberWithCommasAndDecimals(
      //       posfile.data?.vatexempt as number,
      //       2
      //     )
      //   : "0"
    );

    tableInput("Zero-Rated Sales", formatNumberWithCommasAndDecimals(0.0, 2));

    input(`------------------------------------------------`, ALIGNMENT.LEFT);

    posfileTOTAL.disamt as number > 0 && handleGroupingDiscountHolders();

    input(`Customer's Name: ${payment[0].customername || ''}`, ALIGNMENT.LEFT);
    input(`Address: ${payment[0].address || ''}`, ALIGNMENT.LEFT);
    input(`Contact No.: ${payment[0].contactno || ''}`, ALIGNMENT.LEFT);
    input(`TIN: ${payment[0].tin || ''}`, ALIGNMENT.LEFT);

    if(footer.data[0].officialreceipt == 1){
      input("Official Receipt", ALIGNMENT.CENTER);
    }
    else{
      input("This is unofficial receipt", ALIGNMENT.CENTER);
    }

    input(
      `${moment(new Date(), "MM/DD/YYYY h:mm:ss A").format(
        "MM/DD/YYYY h:mm:ss A"
      )}`,
      ALIGNMENT.CENTER
    );
    input("Thank you. Come again!", ALIGNMENT.CENTER);

    input(`------------------------------------------------`, ALIGNMENT.LEFT);

    if (footer.data[0].footermsg1)
      input(`${footer.data[0].footermsg1}`, ALIGNMENT.CENTER);
    if (footer.data[0].footermsg2)
      input(`${footer.data[0].footermsg2}`, ALIGNMENT.CENTER);
    if (footer.data[0].footermsg3)
      input(`${footer.data[0].footermsg3}`, ALIGNMENT.CENTER);
    if (footer.data[0].footermsg4)
      input(`${footer.data[0].footermsg4}`, ALIGNMENT.CENTER);
    if (footer.data[0].footermsg5)
      input(`${footer.data[0].footermsg5}`, ALIGNMENT.CENTER);

    input(`------------------------------------------------`, ALIGNMENT.LEFT);

    input("POS PROVIDER", ALIGNMENT.LEFT);
    input(footer.data[0].supname, ALIGNMENT.LEFT);
    input(footer.data[0].supaddress, ALIGNMENT.LEFT);
    input(`TIN: ${footer.data[0].supvarregtin}`, ALIGNMENT.LEFT);
    input(`Accre: #${footer.data[0].accrenum}`, ALIGNMENT.LEFT);
    input(
      `Issued: ${moment(footer.data[0].accredate).format("MM/DD/YYYY")}`,
      ALIGNMENT.LEFT
    );
    input(
      `Valid Until: ${moment(footer.data[0].accredate)
        .add(footer.data[0].validyr, "years")
        .format("MM/DD/YYYY")}`,
      ALIGNMENT.LEFT
    );
    input(`Permit# ${footer.data[0].permitnum}`, ALIGNMENT.LEFT);
    input(`Date Issued: ${footer.data[0].dateissued}`, ALIGNMENT.LEFT);
  }

  for (let i = 0; i < 5; i++) {
    lineBreak();
  }

  fullCut();

  console.log("rawr data", encode());
  console.log(change, payment);

  return encode();
}
