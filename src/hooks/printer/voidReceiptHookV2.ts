import moment from "moment";
import {ALIGNMENT, usePrinterCommands} from "../../enums/printerCommandEnums";
import {formatNumberWithCommasAndDecimals} from "../../helper/NumberFormat";
import {PosfileModel} from "../../models/posfile";
import { receiptDefiner } from "../../helper/ReceiptNumberFormatter";
import { SpecialRequestDetailModel } from "../../models/specialrequest";

export function voidReceiptPrintoutV2(selector: any, isReprint?: boolean) {
  const {encode, input, fullCut, tableInput, lineBreak, openCashDrawer} = usePrinterCommands();

  const {header, dineType, footer, syspar} = selector.masterfile;

  const {orderDiscountByCode, specialRequest} = selector.order;
  const {allPOSVoid} = selector.void;
  const {voidChange, voidPayment, voidSCharge, voidTotal, voidPosfiles} =
    allPOSVoid.data;

  const findActiveDineType = dineType.data.find(
    (dt: any) => dt.postypcde == voidPosfiles[0].postypcde
  );

  const isItemNumEnabled = syspar.data[0].receipt_itmnum;
  const isDineType = syspar.data[0].no_dineout;
  const isEnabledSpecRequest = syspar.data[0].enable_spcl_req_receipt;

  const computeLessVat = () => {
    const totalLessVat = voidPosfiles.reduce(
      (acc: number, posfile: PosfileModel) => {
        if (posfile && posfile.lessvat) {
          return acc + parseFloat(posfile?.lessvat as any);
        }
      },
      0
    );
    return formatNumberWithCommasAndDecimals(totalLessVat, 2);
  };

  const orderingEntry = voidPosfiles.map((pf: any) => {
    const entry = orderDiscountByCode.data.find(
      (od: any) => pf.orderitmid == od.orderitmid
    );
    return {...pf, discount: entry};
  });

  const dineInDTypePosfiles = voidPosfiles
    .filter((pf: any) => pf.ordertyp === "DINEIN")
    .map((pf: any) => {
      const entry = orderDiscountByCode.data.find(
        (od: any) => pf.orderitmid == od.orderitmid
      );
      return {...pf, discount: entry};
    });
  const takeoutDTypePosfiles = voidPosfiles
    .filter((pf: any) => pf.ordertyp === "TAKEOUT")
    .map((pf: any) => {
      const entry = orderDiscountByCode.data.find(
        (od: any) => pf.orderitmid == od.orderitmid
      );
      return {...pf, discount: entry};
    });

  // const tempAddOns = voidPosfiles.filter((d: any) => d.isaddon);

  const computeSalesWOVat = () => {
    return formatNumberWithCommasAndDecimals(
      (voidTotal.groext as number) / 1.12,
      2
    );
  };

  const handleGroupingDiscountHolders = () => {
    const cards = voidPosfiles.reduce((acc: {[cardno: string]: {itmcde: string, cardholder: string, cardno: string, tin: string}}, curr: PosfileModel) => {
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
    if (payment.itmcde === "CARD") {
      tableInput(payment.cardclass!, formatNumberWithCommasAndDecimals(payment.extprc as number, 2));
      tableInput("CARD NUMBER:", `***${payment.cardno!.substring(payment.cardno!.length - Math.min(4, payment.cardno!.length))}`);
      tableInput("CARD HOLDER NAME:", payment.cardholder!);
      tableInput("APPROVAL CODE:", payment.approvalcode!);
    } else {
      tableInput(payment.itmcde!, formatNumberWithCommasAndDecimals(payment.amount as number, 2));
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

  input(`${receiptDefiner(syspar.data[0].receipt_title || 0,voidTotal?.ordocnum) || ""}`, ALIGNMENT.LEFT);
  input(`------------------------------------------------`, ALIGNMENT.LEFT);

  tableInput(`CASHIER: ${voidTotal?.cashier || ""}`, `SERVER: ${voidTotal?.cashier || ""}`);
  // input(`CASHIER: ${voidTotal?.cashier || ""}`, ALIGNMENT.LEFT);
  // input(`SERVER: ${account.data?.usrname || ""}`, ALIGNMENT.LEFT);

  input(`------------------------------------------------`, ALIGNMENT.LEFT);

  input("** VOID **", ALIGNMENT.CENTER);

  lineBreak();
  lineBreak();

  if (isDineType === 0) {
    input(`${findActiveDineType?.postypdsc}`, ALIGNMENT.CENTER);
    input(`------------------------------------------------`, ALIGNMENT.LEFT);
    findActiveDineType?.ordertyp === 'DINEIN' && input(`(DINE IN)`, ALIGNMENT.CENTER);
    findActiveDineType?.ordertyp === 'DINEIN' && lineBreak();

    dineInDTypePosfiles.length > 0 &&
      dineInDTypePosfiles.forEach((item: any) => {
        if (isItemNumEnabled === 1 && item.itmcomtyp === null) {
          input(`${item.itmnum}`, ALIGNMENT.LEFT);
        }
        if (item.discount) {

          // no item combo with discount
          if (item.itmcomtyp === null && item.isaddon === 0) {
            tableInput(
              `${formatNumberWithCommasAndDecimals(item.itmqty)}x ${
                item.itmdsc
              }`,
              `${formatNumberWithCommasAndDecimals(
                (item.freereason ? 0: item.changed ? item.grossprc as number : item.untprc as number) * (item.itmqty as number),
                // ((item.freereason || item.changed) ? item.grossprc as number : item.untprc as number) * (item.itmqty as number),
              2)} ${item.taxcde === "VATABLE" ? "V" : "N"}`
            );

            if (item.itemfile?.itmdscforeign && item.itemfile?.itmdscforeign !== '') {
              input('    ' + item.itemfile?.itmdscforeign, ALIGNMENT.LEFT)
            }

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
                  `(-${formatNumberWithCommasAndDecimals(item.disamt as number, 2)})`
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
                `(-${formatNumberWithCommasAndDecimals(item.disamt as number, 2)})`
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
              `${formatNumberWithCommasAndDecimals(item.itmqty)}x ${
                item.itmdsc
              }`,
              `${formatNumberWithCommasAndDecimals(
                (item.freereason ? 0: item.changed ? item.grossprc as number : item.untprc as number) * (item.itmqty as number),
                // ((item.freereason || item.changed) ? item.grossprc as number : item.untprc as number) * (item.itmqty as number),
              2)} ${item.taxcde === "VATABLE" ? "V" : "N"}`
            );

            if (item.itemfile?.itmdscforeign && item.itemfile?.itmdscforeign !== '') {
              input('    ' + item.itemfile?.itmdscforeign, ALIGNMENT.LEFT)
            }

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
      });

    if (dineInDTypePosfiles.length > 0) {
      input(`------------------------------------------------`, ALIGNMENT.LEFT);
    }

    if (takeoutDTypePosfiles.length > 0) {
      input(`(TAKE OUT)`, ALIGNMENT.CENTER);
      lineBreak();

      takeoutDTypePosfiles.forEach((item: any) => {
        if (isItemNumEnabled === 1 && item.itmcomtyp === null) {
          input(`${item.itmnum}`, ALIGNMENT.LEFT);
        }
        if (item.discount) {
          console.log("eto 1");

          // no item combo with discount
          if (item.itmcomtyp === null && item.isaddon === 0) {
            tableInput(
              `${formatNumberWithCommasAndDecimals(item.itmqty)}x ${
                item.itmdsc
              }`,
              `${formatNumberWithCommasAndDecimals(
                (item.freereason ? 0: item.changed ? item.grossprc as number : item.untprc as number) * (item.itmqty as number),
                // ((item.freereason || item.changed) ? item.grossprc as number : item.untprc as number) * (item.itmqty as number),
              2)} ${item.taxcde === "VATABLE" ? "V" : "N"}`
            );

            if (item.itemfile?.itmdscforeign && item.itemfile?.itmdscforeign !== '') {
              input('    ' + item.itemfile?.itmdscforeign, ALIGNMENT.LEFT)
            }

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
                  `(-${formatNumberWithCommasAndDecimals(item.disamt as number, 2)})`
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
                `(-${formatNumberWithCommasAndDecimals(item.disamt as number, 2)})`
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
              `${formatNumberWithCommasAndDecimals(item.itmqty)}x ${
                item.itmdsc
              }`,
              `${formatNumberWithCommasAndDecimals(
                (item.freereason ? 0: item.changed ? item.grossprc as number : item.untprc as number) * (item.itmqty as number),
                // ((item.freereason || item.changed) ? item.grossprc as number : item.untprc as number) * (item.itmqty as number),
              2)} ${item.taxcde === "VATABLE" ? "V" : "N"}`
            );

            if (item.itemfile?.itmdscforeign && item.itemfile?.itmdscforeign !== '') {
              input('    ' + item.itemfile?.itmdscforeign, ALIGNMENT.LEFT)
            }

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
      });
    }

    input(`------------------------------------------------`, ALIGNMENT.LEFT);
  } else if (isDineType === 1) {
    input("TRANSACTION", ALIGNMENT.CENTER);
    lineBreak();

    orderingEntry.forEach((item: any) => {
      if (isItemNumEnabled === 1 && item.itmcomtyp === null) {
        input(`${item.itmnum}`, ALIGNMENT.LEFT);
      }
      if (item.discount) {

        // no item combo with discount
        if (item.itmcomtyp === null) {
          tableInput(
            `${formatNumberWithCommasAndDecimals(item.itmqty)}x ${item.itmdsc}`,
            `${formatNumberWithCommasAndDecimals(item.untprc, 2)}`
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
                `(-${formatNumberWithCommasAndDecimals(item.disamt as number, 2)})`
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
              `(-${formatNumberWithCommasAndDecimals(item.disamt as number, 2)})`
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
            `${formatNumberWithCommasAndDecimals(item.itmqty)}x ${item.itmdsc}`,
            `${formatNumberWithCommasAndDecimals(item.untprc, 2)}`
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
    });

    input(`------------------------------------------------`, ALIGNMENT.LEFT);
  }

  tableInput(
    "SUBTOTAL",
    formatNumberWithCommasAndDecimals(voidTotal?.groext as number, 2)
  );

  tableInput("Less VAT (SC/PWD)", `-${computeLessVat()}`);

  voidTotal?.vatexempt as number > 0 && tableInput("Sales without VAT", computeSalesWOVat());

  if ((voidTotal?.disamt as number) > 0) {
    dineInDTypePosfiles.forEach((item: any) => {
      if (item.discount && item.itmcomtyp === null) {
        tableInput(
          `${item.discount.discde}`,
          `${-formatNumberWithCommasAndDecimals(
            item?.discount?.amtdis as number,
            2
          )}`
        );
      }
    });
  }

  if ((voidTotal?.disamt as number) > 0) {
    takeoutDTypePosfiles.forEach((item: any) => {
      if (item.discount && item.itmcomtyp === null) {
        tableInput(
          `${item.discount.discde}`,
          `${-formatNumberWithCommasAndDecimals(
            item?.discount?.amtdis as number,
            2
          )}`
        );
      }
    });
  }

  tableInput(
    "SERVICE CHARGE",
    formatNumberWithCommasAndDecimals(voidSCharge?.scharge || 0, 2)
  );

  tableInput(
    "AMOUNT DUE",
    formatNumberWithCommasAndDecimals(
      parseFloat(voidTotal?.extprc + "") +
        parseFloat(voidSCharge?.scharge || 0 + ""),
      2
    )
  );

  voidPayment.map((item: any) => {
    paymentDisplayer(item);
  });

  tableInput(
    "CHANGE",
    formatNumberWithCommasAndDecimals(voidChange?.extprc || 0, 2)
  );

  input(
    `** ${voidPosfiles && voidPosfiles.length} PRODUCT(S) PURCHASED **`,
    ALIGNMENT.CENTER
  );

  input(`------------------------------------------------`, ALIGNMENT.LEFT);
  input(`------------------------------------------------`, ALIGNMENT.LEFT);

  input("VAT ANALYSIS", ALIGNMENT.CENTER);

  input(`------------------------------------------------`, ALIGNMENT.LEFT);

  tableInput(
    "VATable Sales",
    formatNumberWithCommasAndDecimals(voidTotal?.netvatamt as number, 2)
  );

  tableInput(
    "VAT Amount",
    formatNumberWithCommasAndDecimals(voidTotal?.vatamt as number, 2)
  );

  tableInput(
    "VAT Exempted Sales",
    formatNumberWithCommasAndDecimals(voidTotal?.vatexempt as number, 2)
  );

  tableInput("Zero-Rated Sales", formatNumberWithCommasAndDecimals(0.0, 2));

  input(`------------------------------------------------`, ALIGNMENT.LEFT);

  {voidTotal?.disamt as number > 0 && handleGroupingDiscountHolders()}

  input(`Customer's Name: ${voidPayment?.[0]?.customername || ''}`, ALIGNMENT.LEFT);
  input(`Address: ${voidPayment?.[0]?.address || ''}`, ALIGNMENT.LEFT);
  input(`Contact No.: ${voidPayment?.[0]?.contactno || ''}`, ALIGNMENT.LEFT);
  input(`TIN: ${voidPayment?.[0]?.tin || ''}`, ALIGNMENT.LEFT);

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

  input("** VOID **", ALIGNMENT.CENTER);

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

  // the logic of cash drawer is here.
  console.log('rawr', encode());
  
  return encode();
}
