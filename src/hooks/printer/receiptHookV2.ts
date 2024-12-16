/* eslint-disable react-hooks/rules-of-hooks */
import moment from "moment";
import {ALIGNMENT, usePrinterCommands} from "../../enums/printerCommandEnums";
import {formatNumberWithCommasAndDecimals} from "../../helper/NumberFormat";
import _ from "lodash";
import {PosfileModel} from "../../models/posfile";
import { SpecialRequestDetailModel } from "../../models/specialrequest";
import { receiptDefiner } from "../../helper/ReceiptNumberFormatter";
import { PaymentMethod } from "../../pages/transaction/ordering/enums";

export function receiptPrintoutV2(selector: any, printersize: number) {
  const {encode, input, fullCut, tableInput, lineBreak, openCashDrawer} = usePrinterCommands(printersize)
  
  

  const {header, dineType, footer, syspar} = selector.masterfile;
  const {change, payment, card} = selector.payment;

  const {account} = selector.account;
  const {
    posfileTOTAL: posfile,
    activeOrdocnum,
    posfiles,
    transaction,
    lessVatAdj,
    orderDiscount,
    serviceCharge,
    specialRequest,
    serviceChargeDiscount
    // serviceChargeDiscount,
  } = selector.order;
  
  const defineReceiptNumber = () => receiptDefiner(syspar.receipt_title, activeOrdocnum)//posfile.data.ordocnum)

  const isItemNumEnabled = syspar.data[0].receipt_itmnum;
  const isDineType = syspar.data[0].no_dineout;
  const isEnabledSpecRequest = syspar.data[0].enable_spcl_req_receipt;

  const posfilesMapped = posfiles.data
    .map((pf: any) => {
      const entry = orderDiscount.data.find(
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

      prev[key].push(curr);
      return prev;
    }, {}) as unknown as {[index: string]: PosfileModel[]};

  const findActiveDineType = dineType.data.find(
    (dt: any) => dt.postypcde == transaction.data?.postypcde
  );

  const getPosfiles = (ordertype: string) => {
    let posfiles = {};

    Object.keys(posfilesMapped).forEach((key) => {
      if (posfilesMapped[key][0].ordertyp === ordertype) {
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
      posfile?.data?.vatexempt as any,
      2
    );
  };

  const handleGroupingDiscounts = () => {
    if ((posfile?.data?.disamt as number) > 0) {
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
              total + (parseFloat(item.disamt as any) || 0),
            0
          );

          tableInput(
            `${discde}`,
            '-'+formatNumberWithCommasAndDecimals(totalDisamt, 2)
          );
        }
      });
    }
  };

  const handleGroupingDiscountHolders = () => {
    const cards = posfiles.data.reduce((acc: {[cardno: string]: {itmcde: string, cardholder: string, cardno: string, tin: string}}, curr: PosfileModel) => {
      if (curr.posDiscount) {
        curr.posDiscount.forEach((d) => {
          if (!d.cardno) return;

          if (!acc[d.cardno]) {
            acc[d.cardno] = {
              itmcde: d.itmcde,
              cardholder: d.cardholder,
              cardno: d.cardno,
              tin: d.tin
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

  const paymentDisplayer = (payment: any) => {
    if(payment.paymentMode === PaymentMethod.FREE){
      return;
    }
    else if (payment.paymentMode === PaymentMethod.OTHER_PAYMENT) {
      tableInput(payment.itmcde, formatNumberWithCommasAndDecimals(payment.amount as number, 2));
    } else if (payment.paymentMode === PaymentMethod.CREDIT_CARD || payment.paymentMode === PaymentMethod.DEBIT_CARD) {
      tableInput(card.data?.cardclass, formatNumberWithCommasAndDecimals(payment.amount as number, 2));
      tableInput("CARD NUMBER:", `***${card.data?.cardno.substring(card.data?.cardno.length - Math.min(4, card.data?.cardno.length))}`);
      tableInput("CARD HOLDER NAME:", card.data?.cardholder);
      tableInput("APPROVAL CODE:", card.data?.approvalcode);
    } else {
      tableInput(payment.paymentMode, formatNumberWithCommasAndDecimals(payment.amount as number, 2));
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

  // input(`${syspar.data[0].ordocnum || ""}`, ALIGNMENT.LEFT);
  input(`${defineReceiptNumber()}`, ALIGNMENT.LEFT);
  input(`PAX: ${transaction.data?.paxcount || "1"}`, ALIGNMENT.LEFT);
  input(`------------------------------------------------`, ALIGNMENT.LEFT);
  tableInput(`CASHIER: ${account.data?.usrname || ""}`, `SERVER: ${account.data?.usrname || ""}`);
  // input(`CASHIER: ${account.data?.usrname || ""}`, ALIGNMENT.LEFT);
  // input(`SERVER: ${account.data?.usrname || ""}`, ALIGNMENT.LEFT);

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
              2)}${item.taxcde === "VATABLE" ? "V" : "N"}`
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
                `${formatNumberWithCommasAndDecimals(item.extprc, 2)}${item.taxcde === "VATABLE" ? "V" : "N"}`
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
              2)}${item.taxcde === "VATABLE" ? "V" : "N"}`
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
                `${formatNumberWithCommasAndDecimals(item.extprc, 2)}${item.taxcde === "VATABLE" ? "V" : "N"}`
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
            `${formatNumberWithCommasAndDecimals((item.freereason ? 0: item.changed ? item.grossprc as number : item.untprc as number) * (item.itmqty as number), 2)}`
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

      takeoutPosfiles.map((key) => {
        (takeoutDTypePosfiles[key as keyof typeof takeoutDTypePosfiles] as any[]).forEach((item: any) => {
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
                2)}${item.taxcde === "VATABLE" ? "V" : "N"}`
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
                  `${formatNumberWithCommasAndDecimals(item.extprc, 2)}${item.taxcde === "VATABLE" ? "V" : "N"}`
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
                2)}${item.taxcde === "VATABLE" ? "V" : "N"}`
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
                  `${formatNumberWithCommasAndDecimals(item.extprc, 2)}${item.taxcde === "VATABLE" ? "V" : "N"}`
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
              `${formatNumberWithCommasAndDecimals((item.freereason ? 0: item.changed ? item.grossprc as number : item.untprc as number) * (item.itmqty as number), 2)}`
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
    }

    input(`------------------------------------------------`, ALIGNMENT.LEFT);
    //start changes

    tableInput(
      "SUBTOTAL",
      formatNumberWithCommasAndDecimals(posfile?.data?.groext as number, 2)
    );

    tableInput(
      "Less VAT (SC/PWD)",
      '-'+formatNumberWithCommasAndDecimals(lessVatAdj.data?.extprc as number, 2)
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
      formatNumberWithCommasAndDecimals(serviceCharge?.data?.extprc || 0, 2)
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
        parseFloat(posfile.data.extprc || 0 + ""), //+
          // parseFloat(serviceCharge.data.extprc || 0 + "") - parseFloat(serviceChargeDiscount.data || 0 + ""),
        2
      )
    );

    payment.data.map((item: any) => {
      paymentDisplayer(item);
    });

    tableInput(
      "CHANGE",
      formatNumberWithCommasAndDecimals((change.data.change as number) || 0, 2)
    );

    input(
      `** ${
        posfiles.data.filter(
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
      formatNumberWithCommasAndDecimals(posfile.data?.netvatamt as number, 2)
    );

    tableInput(
      "VAT Amount",
      formatNumberWithCommasAndDecimals(posfile.data?.vatamt as number, 2)
    );

    tableInput(
      "VAT Exempted Sales",
      formatNumberWithCommasAndDecimals(
        parseFloat(posfile.data?.vatexempt as unknown as string) + parseFloat(serviceCharge.data?.extprc as unknown as string) - parseFloat(serviceChargeDiscount.data as unknown as string),
        2
      )
    );

    tableInput("Zero-Rated Sales", formatNumberWithCommasAndDecimals(0.0, 2));

    input(`------------------------------------------------`, ALIGNMENT.LEFT);

    posfile?.data?.disamt as number > 0 && handleGroupingDiscountHolders();

    input(`Customer's Name: ${change.data.customerName || ''}`, ALIGNMENT.LEFT);
    input(`Address: ${change.data.address || ''}`, ALIGNMENT.LEFT);
    input(`Contact No.: ${change.data.contactNo || ''}`, ALIGNMENT.LEFT);
    input(`TIN: ${change.data.tinNo || ''}`, ALIGNMENT.LEFT);


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
  
          // no item combo with discount
          if (item.itmcomtyp === null) {
            tableInput(
              `${formatNumberWithCommasAndDecimals(item.itmqty)}x ${item.itmdsc}`,
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
            `${formatNumberWithCommasAndDecimals((item.freereason ? 0: item.changed ? item.grossprc as number : item.untprc as number) * (item.itmqty as number), 2)}`
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
      formatNumberWithCommasAndDecimals(posfile?.data?.groext as number, 2)
    );

    tableInput(
      "Less VAT (SC/PWD)",
      '-'+formatNumberWithCommasAndDecimals(lessVatAdj.data?.extprc as number, 2)
    );

    // tableInput("Sales without VAT", computeSalesWOVat());
    tableInput("Sales without VAT", formatNumberWithCommasAndDecimals(
      posfile.data?.vatexempt as number,
      2
    ));

    handleGroupingDiscounts();

    tableInput(
      "SERVICE CHARGE",
      formatNumberWithCommasAndDecimals(serviceCharge?.data?.extprc || 0, 2)
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
        parseFloat(posfile.data.extprc || 0 + ""), //+
          // parseFloat(serviceCharge.data.extprc || 0 + "") - parseFloat(serviceChargeDiscount.data || 0 + ""),
        2
      )
    );

    // tableInput(
    //   "AMOUNT DUE",
    //   formatNumberWithCommasAndDecimals(
    //     parseFloat(posfile.data.extprc + "") +
    //       parseFloat((serviceCharge.data.extprc || 0) + "") -
    //       parseFloat((serviceChargeDiscount.data || 0) + ""),
    //     2
    //   )
    // );

    payment.data.map((item: any) => {
      paymentDisplayer(item);
    });

    tableInput(
      "CHANGE",
      formatNumberWithCommasAndDecimals((change.data.change as number) || 0, 2)
    );

    input(
      `** ${
        posfiles.data.filter(
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
      formatNumberWithCommasAndDecimals(posfile.data?.netvatamt as number, 2)
    );

    tableInput(
      "VAT Amount",
      formatNumberWithCommasAndDecimals(posfile.data?.vatamt as number, 2)
    );

    tableInput(
      "VAT Exempted Sales",
      formatNumberWithCommasAndDecimals(
        parseFloat(posfile.data?.vatexempt as unknown as string) + parseFloat(serviceCharge.data?.extprc as unknown as string) - parseFloat(serviceChargeDiscount.data as unknown as string),
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

    posfile?.data?.disamt as number > 0 && handleGroupingDiscountHolders();

    input(`Customer's Name: ${change.data.customerName || ''}`, ALIGNMENT.LEFT);
    input(`Address: ${change.data.address || ''}`, ALIGNMENT.LEFT);
    input(`Contact No.: ${change.data.contactNo || ''}`, ALIGNMENT.LEFT);
    input(`TIN: ${change.data.tinNo || ''}`, ALIGNMENT.LEFT);

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

  return encode();
}
