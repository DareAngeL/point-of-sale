/* eslint-disable @typescript-eslint/no-non-null-assertion */
import moment from "moment";
import {ALIGNMENT, usePrinterCommands} from "../../enums/printerCommandEnums";
import {formatNumberWithCommasAndDecimals} from "../../helper/NumberFormat";
import {PosfileModel} from "../../models/posfile";
import _ from "lodash";
import { SpecialRequestDetailModel } from "../../models/specialrequest";
import { receiptDefiner } from "../../helper/ReceiptNumberFormatter";
export function refundReceiptPrintoutV2(selector: any, isReprint?: boolean) {
  const {encode, input, fullCut, tableInput, lineBreak, openCashDrawer} = usePrinterCommands();

  const {header, dineType, footer, syspar} = selector.masterfile;

  const {account} = selector.account;
  const {
    // lessVatAdj,
    // serviceCharge,
    previousPosfile,
    previousPosfiles,
    prevTranPayment,
    orderDiscountByCode,
    specialRequest
  } = selector.order;
  // const {change, payment} = selector.payment;

  const {toRefund, modeOfRefund, cardDetails, refundReason} = selector.refund;
  const refundedData = isReprint ? previousPosfiles.data.filter((a: PosfileModel) => a.refund === 1) : toRefund.data;

  const defineReceiptNumber = () => {
    return previousPosfile.data ? receiptDefiner(syspar.receipt_title, previousPosfile.data.ordocnum) : undefined;
  };

  const findActiveDineType = dineType.data.find(
    (dt: any) => dt.postypcde == refundedData[0].postypcde
  );

  const isItemNumEnabled = syspar.data[0].receipt_itmnum;
  const isDineType = syspar.data[0].no_dineout;
  const isEnabledSpecRequest = syspar.data[0].enable_spcl_req_receipt;

  const orderingEntry = previousPosfiles.data.map((pf: any) => {
    const entry = orderDiscountByCode.data.find(
      (od: any) => pf.orderitmid == od.orderitmid
    );
    return {...pf, discount: entry};
  });

  const dineInDTypePosfiles = refundedData
    .filter((pf: any) => pf.ordertyp === "DINEIN")
    .map((pf: any) => {
      const entry = orderDiscountByCode.data.find(
        (od: any) => pf.orderitmid == od.orderitmid
      );
      return {...pf, discount: entry};
    });
  const takeoutDTypePosfiles = refundedData
    .filter((pf: any) => pf.ordertyp === "TAKEOUT")
    .map((pf: any) => {
      const entry = orderDiscountByCode.data.find(
        (od: any) => pf.orderitmid == od.orderitmid
      );
      return {...pf, discount: entry};
    });
  
  

  // const tempAddOns = previousPosfiles.data.filter((d: any) => d.isaddon);

  // const computeSalesWOVat = () => {
  //   return formatNumberWithCommasAndDecimals(
  //     (previousPosfile?.data?.groext as number) / 1.12,
  //     2
  //   );
  // };

  const computeSubTotal = () => {
    const subTotal = refundedData.reduce((total: number, current: PosfileModel) => {
      if (!current.groext || !current.itmqty || !current.refundqty) return total + 0;

      return (
        total + current.groext / ((current.itmqty*1) - (current.refundqty - 1)) //parseFloat(current.untprc as any) * (current.refundqty as any)
      );
    }, 0);
    return subTotal;
  };

  const computeLessVat = () => {
    const lessvat = refundedData.reduce((lessvat: number, current: PosfileModel) => {
      return current.lessvat!*1 / ((current.itmqty!*1) - (current.refundqty!*1 - 1)) + lessvat;
    }, 0);

    return lessvat;
  }

  const computeSalesWOVat = () => {
    const salesWOVat = refundedData.reduce((salesWOVat: number, current: PosfileModel) => {
      return current.vatexempt!*1 / ((current.itmqty!*1) - (current.refundqty!*1 - 1)) + salesWOVat;
    }, 0);

    return salesWOVat;
  }

  const computeSCharge = () => {
    const sCharge = refundedData.reduce((sCharge: number, current: PosfileModel) => {
      return current.scharge!*1 / ((current.itmqty!*1) - (current.refundqty!*1 - 1)) + sCharge;
    }, 0);

    return sCharge;
  }

  const computeSchargeDisc = () => {
    const sChargeDisc = refundedData.reduce((sChargeDisc: number, current: PosfileModel) => {
      return current.scharge_disc!*1 / ((current.itmqty!*1) - (current.refundqty!*1 - 1)) + sChargeDisc;
    }, 0);

    return sChargeDisc;
  }

  const computeAmtDue = () => {
    const amtDue = refundedData.reduce((amtDue: number, current: PosfileModel) => {
      return (current.extprc!*1 + current.scharge!*1 - current.scharge_disc!*1) / ((current.itmqty!*1) - (current.refundqty!*1 - 1)) + amtDue;
    }, 0);

    return amtDue;
  }

  const handleGroupingDiscounts = () => {
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
          (total: number, item: any) =>
            total + (parseFloat(item.disamt as any) || 0) / ((item.itmqty!*1) - (item.refundqty!*1 - 1)),
          0
        );

        tableInput(
          `${discde}`,
          formatNumberWithCommasAndDecimals(totalDisamt, 2)
        );
      }
    });
  };

  const handleGroupingDiscountHolders = () => {
    const cards = refundedData.reduce((acc: {[cardno: string]: {itmcde: string, cardholder: string, cardno: string, tin: string}}, curr: PosfileModel) => {
      if (curr.posDiscount) {
        curr.posDiscount.forEach((d) => {
          if (!d.cardno) return;

          if (!acc[d.cardno]) {
            acc[d.cardno] = {
              itmcde: d.itmcde,
              cardholder: d.cardholder,
              tin: d.tin,
              cardno: d.cardno
            }
          }
        })
      }
      return acc;
    }, {} as {[cardno: string]: {itmcde: string, cardholder: string, cardno: string, tin: string}})

    return Object.values(cards).flat().map((item: any) => {
      input(`Discount: ${item.itmcde}`, ALIGNMENT.LEFT);
      input(`  Card No.: ${item.cardno}`, ALIGNMENT.LEFT);
      input(`  Card Holder: ${item.cardholder}`, ALIGNMENT.LEFT);
      input(`  TIN: ${item.tin}`, ALIGNMENT.LEFT);
      input(`  Signature: _______________`, ALIGNMENT.LEFT);
    })
  }

  const paymentDisplayer = (payment: PosfileModel) => {
    const isCard = isReprint ? payment.itmcde === "CARD" : modeOfRefund.includes("CARD");

    if (isCard) {
      tableInput(isReprint ? payment?.cardclass : cardDetails?.cardclass, formatNumberWithCommasAndDecimals(isReprint ? payment.extprc as number : computeAmtDue(), 2));
      tableInput("CARD NUMBER:", `***${(isReprint ? payment!.cardno! : cardDetails?.cardno)?.substring((isReprint ? payment!.cardno! : cardDetails!.cardno).length - Math.min(4, (isReprint ? payment!.cardno! : cardDetails!.cardno).length))}`);
      tableInput("CARD HOLDER NAME:", (isReprint ? payment!.cardholder : cardDetails?.cardholder));
      tableInput("APPROVAL CODE:", (isReprint ? payment!.approvalcode! : cardDetails?.approvalcode));
    } else {
      tableInput(
        isReprint ? payment.itmcde : modeOfRefund,
        formatNumberWithCommasAndDecimals(computeAmtDue(), 2)
      );
    }
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
  input(`${isReprint ? refundedData[0]?.refnum : syspar.data[0].refnum}`, ALIGNMENT.LEFT);
  input(`${defineReceiptNumber() || ""}`, ALIGNMENT.LEFT);

  // input(`CUSTOMER: ${change?.data?.customerName}` || "", ALIGNMENT.LEFT);
  // input(`PAX: ${transaction?.data?.paxcount}` || "", ALIGNMENT.LEFT);
  tableInput(
    `CASHIER: ${account.data?.usrname}` || "",
    `SERVER: ${account.data?.usrname || ""}`
  );

  input(`------------------------------------------------`, ALIGNMENT.LEFT);

  input("** REFUND **", ALIGNMENT.CENTER);

  lineBreak();
  lineBreak();

  if (isDineType === 0) {
    input(`${findActiveDineType?.postypdsc}`, ALIGNMENT.CENTER);
    input(`------------------------------------------------`, ALIGNMENT.LEFT);
    dineInDTypePosfiles.length > 0 && input(`(DINE IN)`, ALIGNMENT.CENTER);
    dineInDTypePosfiles.length > 0 && lineBreak();

    dineInDTypePosfiles.length > 0 &&
      dineInDTypePosfiles.forEach((item: PosfileModel) => {
        if (isItemNumEnabled === 1 && item.itmcomtyp === null) {
          input(`${item.itmnum}`, ALIGNMENT.LEFT);
        }
        if (item.discount) {
          // no item combo with discount
          if (item.itmcomtyp === null && item.isaddon === 0) {
            tableInput(
              `${formatNumberWithCommasAndDecimals(item.refundqty!)}x ${
                item.itmdsc
              }`,
              `${formatNumberWithCommasAndDecimals(
                ((item.freereason || item.changed) ? item.grossprc as number : item.untprc as number) * (item.refundqty as number),
              2)} ${item.taxcde === "VATABLE" ? "V" : "N"}`
            );

            if (item.itemfile?.itmdscforeign && item.itemfile?.itmdscforeign !== '') {
              input('    ' + item.itemfile?.itmdscforeign, ALIGNMENT.LEFT)
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
                  `(-${formatNumberWithCommasAndDecimals((item.disamt as number) / ((item.itmqty!*1) - (item.refundqty!*1 - 1)), 2)})`
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
                `(-${formatNumberWithCommasAndDecimals((item.disamt as number) / ((item.itmqty!*1) - (item.refundqty!*1 - 1)), 2)})`
              )
            }
          } else {
            // combo meals with discount
            // checks if upgrade or normal
            if (item.itmcomtyp === "UPGRADE") {
              tableInput(
                `${" ".repeat(5)} ${formatNumberWithCommasAndDecimals(
                  item.itmqty!
                )}x ${item.itmdsc}`,
                ``
              );
              tableInput(
                `${" ".repeat(10)} *UPGRADE`,
                `${formatNumberWithCommasAndDecimals(item.extprc!, 2)} ${item.taxcde === "VATABLE" ? "V" : "N"}`
              );
            } else {
              // OTHERS DEFAULT
              item.isaddon === 0 &&
                tableInput(
                  `${" ".repeat(5)} ${formatNumberWithCommasAndDecimals(
                    item.itmqty!
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
              `${formatNumberWithCommasAndDecimals(item.refundqty!)}x ${
                item.itmdsc
              }`,
              `${formatNumberWithCommasAndDecimals(
                ((item.freereason || item.changed) ? item.grossprc as number : item.untprc as number) * (item.refundqty as number),
              2)} ${item.taxcde === "VATABLE" ? "V" : "N"}`
            );

            if (item.itemfile?.itmdscforeign && item.itemfile?.itmdscforeign !== '') {
              input('    ' + item.itemfile?.itmdscforeign, ALIGNMENT.LEFT)
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
                  item.itmqty!
                )}x ${item.itmdsc}`,
                ``
              );
              tableInput(
                `${" ".repeat(10)} *UPGRADE`,
                `${formatNumberWithCommasAndDecimals(item.extprc!, 2)} ${item.taxcde === "VATABLE" ? "V" : "N"}`
              );
            } else {
              // OTHERS DEFAULT
              item.isaddon === 0 &&
                tableInput(
                  `${" ".repeat(5)} ${formatNumberWithCommasAndDecimals(
                    item.itmqty!
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
      });

    if (dineInDTypePosfiles.length > 0) {
      input(`------------------------------------------------`, ALIGNMENT.LEFT);
    }

    if (takeoutDTypePosfiles.length > 0) {
      input(`(TAKE OUT)`, ALIGNMENT.CENTER);
      lineBreak();

      takeoutDTypePosfiles.forEach((item: PosfileModel) => {
        if (isItemNumEnabled === 1 && item.itmcomtyp === null) {
          input(`${item.itmnum}`, ALIGNMENT.LEFT);
        }
        if (item.discount) {
          console.log("eto 1");

          // no item combo with discount
          if (item.itmcomtyp === null && item.isaddon === 0) {
            tableInput(
              `${formatNumberWithCommasAndDecimals(item.refundqty!)}x ${
                item.itmdsc
              }`,
              `${formatNumberWithCommasAndDecimals(
                ((item.freereason || item.changed) ? item.grossprc as number : item.untprc as number) * (item.refundqty as number),
              2)} ${item.taxcde === "VATABLE" ? "V" : "N"}`
            );

            if (item.itemfile?.itmdscforeign && item.itemfile?.itmdscforeign !== '') {
              input('    ' + item.itemfile?.itmdscforeign, ALIGNMENT.LEFT)
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
                  `(-${formatNumberWithCommasAndDecimals((item.disamt as number) / ((item.itmqty!*1) - (item.refundqty!*1 - 1)), 2)})`
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
                `(-${formatNumberWithCommasAndDecimals((item.disamt as number) / ((item.itmqty!*1) - (item.refundqty!*1 - 1)), 2)})`
              )
            }
          } else {
            // combo meals with discount
            // checks if upgrade or normal
            if (item.itmcomtyp === "UPGRADE") {
              tableInput(
                `${" ".repeat(5)} ${formatNumberWithCommasAndDecimals(
                  item.itmqty!
                )}x ${item.itmdsc}`,
                ``
              );
              tableInput(
                `${" ".repeat(10)} *UPGRADE`,
                `${formatNumberWithCommasAndDecimals(item.extprc!, 2)} ${item.taxcde === "VATABLE" ? "V" : "N"}`
              );
            } else {
              // OTHERS DEFAULT
              item.isaddon === 0 &&
                tableInput(
                  `${" ".repeat(5)} ${formatNumberWithCommasAndDecimals(
                    item.itmqty!
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
              `${formatNumberWithCommasAndDecimals(item.refundqty!)}x ${
                item.itmdsc
              }`,
              `${formatNumberWithCommasAndDecimals(
                ((item.freereason || item.changed) ? item.grossprc as number : item.untprc as number) * (item.refundqty as number),
              2)} ${item.taxcde === "VATABLE" ? "V" : "N"}`
            );

            if (item.itemfile?.itmdscforeign && item.itemfile?.itmdscforeign !== '') {
              input('    ' + item.itemfile?.itmdscforeign, ALIGNMENT.LEFT)
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
                  item.itmqty!
                )}x ${item.itmdsc}`,
                ``
              );
              tableInput(
                `${" ".repeat(10)} *UPGRADE`,
                `${formatNumberWithCommasAndDecimals(item.extprc!, 2)} ${item.taxcde === "VATABLE" ? "V" : "N"}`
              );
            } else {
              // OTHERS DEFAULT
              item.isaddon === 0 &&
                tableInput(
                  `${" ".repeat(5)} ${formatNumberWithCommasAndDecimals(
                    item.itmqty!
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
      });
    }

    input(`------------------------------------------------`, ALIGNMENT.LEFT);
  } else if (isDineType === 1) {
    input("TRANSACTION", ALIGNMENT.CENTER);
    lineBreak();

    orderingEntry.forEach((item: PosfileModel) => {
      if (isItemNumEnabled === 1 && item.itmcomtyp === null) {
        input(`${item.itmnum}`, ALIGNMENT.LEFT);
      }
      if (item.discount) {
        console.log("eto 1");

        // no item combo with discount
        if (item.itmcomtyp === null) {
          tableInput(
            `${formatNumberWithCommasAndDecimals(item.refundqty!)}x ${item.itmdsc}`,
            `${formatNumberWithCommasAndDecimals(item.untprc!, 2)}`
          );

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
                `(-${formatNumberWithCommasAndDecimals((item.disamt as number) / ((item.itmqty!*1) - (item.refundqty!*1 - 1)), 2)})`
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
              `(-${formatNumberWithCommasAndDecimals((item.disamt as number) / ((item.itmqty!*1) - (item.refundqty!*1 - 1)), 2)})`
            )
          }
        } else {
          // combo meals with discount
          // checks if upgrade or normal
          if (item.itmcomtyp === "UPGRADE") {
            tableInput(
              `${" ".repeat(5)} ${formatNumberWithCommasAndDecimals(
                item.itmqty!
              )}x ${item.itmdsc}`,
              ``
            );
            tableInput(
              `${" ".repeat(10)} *UPGRADE`,
              `${formatNumberWithCommasAndDecimals(item.extprc!, 2)}`
            );
          } else {
            // OTHERS DEFAULT
            item.isaddon === 0 &&
              tableInput(
                `${" ".repeat(5)} ${formatNumberWithCommasAndDecimals(
                  item.itmqty!
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
            `${formatNumberWithCommasAndDecimals(item.refundqty!)}x ${item.itmdsc}`,
            `${formatNumberWithCommasAndDecimals(item.untprc!, 2)}`
          );

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
                item.itmqty!
              )}x ${item.itmdsc}`,
              ``
            );
            tableInput(
              `${" ".repeat(10)} *UPGRADE`,
              `${formatNumberWithCommasAndDecimals(item.extprc!, 2)}`
            );
          } else {
            // OTHERS DEFAULT
            item.isaddon === 0 &&
              tableInput(
                `${" ".repeat(5)} ${formatNumberWithCommasAndDecimals(
                  item.itmqty!
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
    });

    input(`------------------------------------------------`, ALIGNMENT.LEFT);
  }

  tableInput(
    "SUBTOTAL",
    formatNumberWithCommasAndDecimals(computeSubTotal(), 2)
  );

  tableInput(
    "Less VAT (SC/PWD)",
    formatNumberWithCommasAndDecimals(computeLessVat(), 2)
  );

  tableInput("Sales without VAT", computeSalesWOVat());

  {handleGroupingDiscounts()}

  tableInput(
    "SERVICE CHARGE",
    formatNumberWithCommasAndDecimals(computeSCharge(), 2)
  );

  tableInput(
    "SERVICE CHARGE DISCOUNT",
    formatNumberWithCommasAndDecimals(computeSchargeDisc(), 2)
  );

  tableInput(
    "AMOUNT DUE",
    formatNumberWithCommasAndDecimals(
      computeAmtDue(),
      2
    )
  );

  tableInput("Refund Reason", refundReason.data);

  input("Mode of Refund", ALIGNMENT.LEFT);
  paymentDisplayer(prevTranPayment.data);
  // tableInput(
  //   modeOfRefund,
  //   formatNumberWithCommasAndDecimals(computeAmtDue(), 2)
  // );

  input(
    `** ${refundedData.length} PRODUCT(S) REFUNDED **`,
    ALIGNMENT.CENTER
  );

  input(`------------------------------------------------`, ALIGNMENT.LEFT);

  {previousPosfile?.data?.disamt as number > 0 && handleGroupingDiscountHolders()}

  input(`Customer's Name: ${prevTranPayment.data?.customername || ''}`, ALIGNMENT.LEFT);
  input(`Address: ${prevTranPayment.data?.address || ''}`, ALIGNMENT.LEFT);
  input(`Contact No.: ${prevTranPayment.data?.contactno || ''}`, ALIGNMENT.LEFT);
  input(`TIN: ${prevTranPayment.data?.tin || ''}`, ALIGNMENT.LEFT);

  // input("Official Receipt", ALIGNMENT.CENTER);

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

  input("** REFUND **", ALIGNMENT.CENTER);

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

  isReprint && input('[ THIS IS A REPRINTED RECEIPT ]', ALIGNMENT.CENTER);

  // for(let i = 0;  i<50; i++){
  //     input(`F12`, ALIGNMENT.LEFT)
  //     tableInput(`${1} ${"CHUPAPI ADRIAN"}`,`1.00`);
  // }

  for (let i = 0; i < 5; i++) {
    lineBreak();
  }

  fullCut();

  console.log('rawrEncode', encode());
  
  return encode();
}
