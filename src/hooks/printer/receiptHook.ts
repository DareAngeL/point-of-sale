import moment from "moment";
import {ALIGNMENT, usePrinterCommands} from "../../enums/printerCommandEnums";
import {formatNumberWithCommasAndDecimals} from "../../helper/NumberFormat";
import _ from "lodash";
import {PosfileModel} from "../../models/posfile";
import { receiptDefiner } from "../../helper/ReceiptNumberFormatter";

/**
 * NOT IN USE - PLEASE REFER TO THE NEW VERSION - receiptHookV2.ts
 * Note from: Rene
 */
export function receiptPrintout(selector: any) {
  const {encode, input, fullCut, tableInput, lineBreak, openCashDrawer} = usePrinterCommands();

  const {header, dineType, footer, syspar} = selector.masterfile;

  const {account} = selector.account;
  const {
    posfile,
    posfiles,
    transaction,
    lessVatAdj,
    orderDiscount,
    serviceCharge,
  } = selector.order;

  const {change, payment} = selector.payment;

  const defineReceiptNumber = () =>  receiptDefiner(syspar.receipt_title, posfile.data.ordocnum);

  // const defineReceiptNumber = useMemo(() => receiptDefiner(syspar.receipt_title, posfile.data.ordocnum), [syspar]);

  const findActiveDineType = dineType.data.find(
    (dt: any) => dt.postypcde == transaction.data?.postypcde
  );

  const isItemNumEnabled = syspar.data[0].receipt_itmnum;
  const isDineType = syspar.data[0].no_dineout;

  const orderingEntry = posfiles.data.map((pf: any) => {
    const entry = orderDiscount.data.find(
      (od: any) => pf.orderitmid == od.orderitmid
    );
    return {...pf, discount: entry};
  });

  const dineInDTypePosfiles = posfiles.data
    .filter((pf: any) => pf.ordertyp === "DINEIN")
    .map((pf: any) => {
      const entry = orderDiscount.data.find(
        (od: any) => pf.orderitmid == od.orderitmid
      );
      return {...pf, discount: entry};
    });
  const takeoutDTypePosfiles = posfiles.data
    .filter((pf: any) => pf.ordertyp === "TAKEOUT")
    .map((pf: any) => {
      const entry = orderDiscount.data.find(
        (od: any) => pf.orderitmid == od.orderitmid
      );
      return {...pf, discount: entry};
    });

  const tempAddOns = posfiles.data.filter((d: any) => d.isaddon);

  const computeSalesWOVat = () => {
    return formatNumberWithCommasAndDecimals(
      // (posfile?.data?.groext as number) / 1.12,
      posfile?.data?.netvatamt as any,
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
            formatNumberWithCommasAndDecimals(totalDisamt, 2)
          );
        }
      });
    }
  };

  openCashDrawer();


  input(header.data[0].business1 || "", ALIGNMENT.CENTER);
  input(header.data[0].business2 || "", ALIGNMENT.CENTER);
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
  input(`CASHIER: ${account.data?.usrname || ""}`, ALIGNMENT.LEFT);
  input(`SERVER: MANAGER`, ALIGNMENT.LEFT);

  lineBreak();
  lineBreak();

  if (isDineType === 0) {
    input(`${findActiveDineType?.postypdsc}`, ALIGNMENT.CENTER);
    input(`------------------------------------------------`, ALIGNMENT.LEFT);
    input(`(DINE IN)`, ALIGNMENT.CENTER);

    lineBreak();

    dineInDTypePosfiles.length > 0 &&
      dineInDTypePosfiles.forEach((item: any) => {
        console.log("tignan naten", item);
        if (isItemNumEnabled === 1 && item.itmcomtyp === null) {
          input(`${item.itmnum}`, ALIGNMENT.LEFT);
        }
        if (item.discount) {
          console.log("eto 1");

          // no item combo with discount
          if (item.itmcomtyp === null && item.isaddon === 0) {
            tableInput(
              `${formatNumberWithCommasAndDecimals(item.itmqty)} ${
                item.itmdsc
              }`,
              `${formatNumberWithCommasAndDecimals(item.extprc, 2)} ${item.taxcde === "VATABLE" ? "V" : "N"}`
            );
            if (item.discount.distyp === "Percent") {
              input(
                " ".repeat(5) +
                  "*" +
                  `${item.discount.discde} @ ${item.discount.disper}%`,
                ALIGNMENT.LEFT
              );
            } else {
              // for Amount
              input(
                " ".repeat(5) +
                  "*" +
                  `${item.discount.discde} @ ${item.discount.disamt}`,
                ALIGNMENT.LEFT
              );
            }
          } else {
            // combo meals with discount
            // checks if upgrade or normal
            if (item.itmcomtyp === "UPGRADE") {
              tableInput(
                `${" ".repeat(5)} ${formatNumberWithCommasAndDecimals(
                  item.itmqty
                )} ${item.itmdsc}`,
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
                  )} ${item.itmdsc}`,
                  ``
                );
            }
          }
          // end condition
        } else {
          // not item combo
          if (item.itmcomtyp === null && item.isaddon === 0) {
            tableInput(
              `${formatNumberWithCommasAndDecimals(item.itmqty)} ${
                item.itmdsc
              }`,
              `${formatNumberWithCommasAndDecimals(item.extprc, 2)} ${item.taxcde === "VATABLE" ? "V" : "N"}`
            );
          } else {
            // combo meals with discount
            // checks if upgrade or normal
            if (item.itmcomtyp === "UPGRADE") {
              tableInput(
                `${" ".repeat(5)} ${formatNumberWithCommasAndDecimals(
                  item.itmqty
                )} ${item.itmdsc}`,
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
                  )} ${item.itmdsc}`,
                  ``
                );
            }
          }
          // end condition
        }

        const filtered = tempAddOns.filter(
          (addOn: any) => addOn.mainitmid == item.orderitmid
        );

        filtered.forEach((ao: any) => {
          tableInput(
            `${" ".repeat(5)}  *${ao.itmdsc}`,
            `${formatNumberWithCommasAndDecimals(ao.extprc, 2)} ${item.taxcde === "VATABLE" ? "V" : "N"}`
          );
        });
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
              `${formatNumberWithCommasAndDecimals(item.itmqty)} ${
                item.itmdsc
              }`,
              `${formatNumberWithCommasAndDecimals(item.extprc, 2)} ${item.taxcde === "VATABLE" ? "V" : "N"}`
            );
            if (item.discount.distyp === "Percent") {
              input(
                " ".repeat(5) +
                  "*" +
                  `${item.discount.discde} @ ${item.discount.disper}%`,
                ALIGNMENT.LEFT
              );
            } else {
              // for Amount
              input(
                " ".repeat(5) +
                  "*" +
                  `${item.discount.discde} @ ${item.discount.disamt}`,
                ALIGNMENT.LEFT
              );
            }
          } else {
            // combo meals with discount
            // checks if upgrade or normal
            if (item.itmcomtyp === "UPGRADE") {
              tableInput(
                `${" ".repeat(5)} ${formatNumberWithCommasAndDecimals(
                  item.itmqty
                )} ${item.itmdsc}`,
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
                  )} ${item.itmdsc}`,
                  ``
                );
            }
          }
          // end condition
        } else {
          // not item combo
          if (item.itmcomtyp === null && item.isaddon === 0) {
            tableInput(
              `${formatNumberWithCommasAndDecimals(item.itmqty)} ${
                item.itmdsc
              }`,
              `${formatNumberWithCommasAndDecimals(item.extprc, 2)} ${item.taxcde === "VATABLE" ? "V" : "N"}`
            );
          } else {
            // combo meals with discount
            // checks if upgrade or normal
            if (item.itmcomtyp === "UPGRADE") {
              tableInput(
                `${" ".repeat(5)} ${formatNumberWithCommasAndDecimals(
                  item.itmqty
                )} ${item.itmdsc}`,
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
                  )} ${item.itmdsc}`,
                  ``
                );
            }
          }
          // end condition
        }

        const filtered = tempAddOns.filter(
          (addOn: any) => addOn.mainitmid == item.orderitmid
        );

        filtered.forEach((ao: any) => {
          tableInput(
            `${" ".repeat(5)}  *${ao.itmdsc}`,
            `${formatNumberWithCommasAndDecimals(ao.extprc, 2)} ${item.taxcde === "VATABLE" ? "V" : "N"}`
          );
        });
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
      formatNumberWithCommasAndDecimals(lessVatAdj.data?.extprc as number, 2)
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

    tableInput(
      "AMOUNT DUE",
      formatNumberWithCommasAndDecimals(
        parseFloat(posfile.data.extprc + "") +
          parseFloat(serviceCharge.data.extprc + ""),
        2
      )
    );

    payment.data.map((item: any) => {
      tableInput(
        item.paymentMode,
        formatNumberWithCommasAndDecimals(item.amount as number, 2)
      );
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
      (posfile?.data?.disamt as number) > 0
        ? formatNumberWithCommasAndDecimals(
            posfile.data?.vatexempt as number,
            2
          )
        : "0"
    );

    tableInput("Zero-Rated Sales", formatNumberWithCommasAndDecimals(0.0, 2));

    input(`------------------------------------------------`, ALIGNMENT.LEFT);

    input(`Customer's Name:`, ALIGNMENT.LEFT);
    input(`Address:`, ALIGNMENT.LEFT);
    input(`Contact No.:`, ALIGNMENT.LEFT);
    input(`TIN:`, ALIGNMENT.LEFT);

    input("Official Receipt", ALIGNMENT.CENTER);

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

    orderingEntry.forEach((item: any) => {
      if (isItemNumEnabled === 1 && item.itmcomtyp === null) {
        input(`${item.itmnum}`, ALIGNMENT.LEFT);
      }
      if (item.discount) {
        console.log("eto 1");

        // no item combo with discount
        if (item.itmcomtyp === null) {
          tableInput(
            `${formatNumberWithCommasAndDecimals(item.itmqty)} ${item.itmdsc}`,
            `${formatNumberWithCommasAndDecimals(item.extprc, 2)}`
          );
          if (item.discount.distyp === "Percent") {
            input(
              " ".repeat(5) +
                "*" +
                `${item.discount.discde} @ ${item.discount.disper}%`,
              ALIGNMENT.LEFT
            );
          } else {
            // for Amount
            input(
              " ".repeat(5) +
                "*" +
                `${item.discount.discde} @ ${item.discount.disamt}`,
              ALIGNMENT.LEFT
            );
          }
        } else {
          // combo meals with discount
          // checks if upgrade or normal
          if (item.itmcomtyp === "UPGRADE") {
            tableInput(
              `${" ".repeat(5)} ${formatNumberWithCommasAndDecimals(
                item.itmqty
              )} ${item.itmdsc}`,
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
                )} ${item.itmdsc}`,
                ``
              );
          }
        }
        // end condition
      } else {
        // not item combo
        if (item.itmcomtyp === null) {
          tableInput(
            `${formatNumberWithCommasAndDecimals(item.itmqty)} ${item.itmdsc}`,
            `${formatNumberWithCommasAndDecimals(item.extprc, 2)}`
          );
        } else {
          // combo meals with discount
          // checks if upgrade or normal
          if (item.itmcomtyp === "UPGRADE") {
            tableInput(
              `${" ".repeat(5)} ${formatNumberWithCommasAndDecimals(
                item.itmqty
              )} ${item.itmdsc}`,
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
                )} ${item.itmdsc}`,
                ``
              );
          }
        }
        // end condition
      }

      const filtered = tempAddOns.filter(
        (addOn: any) => addOn.mainitmid == item.orderitmid
      );

      filtered.forEach((ao: any) => {
        tableInput(
          `${" ".repeat(5)}  *${ao.itmdsc}`,
          `${formatNumberWithCommasAndDecimals(ao.extprc, 2)}`
        );
      });
    });

    input(`------------------------------------------------`, ALIGNMENT.LEFT);

    tableInput(
      "SUBTOTAL",
      formatNumberWithCommasAndDecimals(posfile?.data?.groext as number, 2)
    );

    tableInput(
      "Less VAT (SC/PWD)",
      formatNumberWithCommasAndDecimals(lessVatAdj.data?.extprc as number, 2)
    );

    tableInput("Sales without VAT", computeSalesWOVat());

    handleGroupingDiscounts();

    tableInput(
      "SERVICE CHARGE",
      formatNumberWithCommasAndDecimals(serviceCharge?.data?.extprc || 0, 2)
    );

    tableInput(
      "AMOUNT DUE",
      formatNumberWithCommasAndDecimals(
        parseFloat(posfile.data.extprc + "") +
          parseFloat(serviceCharge.data.extprc + ""),
        2
      )
    );

    payment.data.map((item: any) => {
      tableInput(
        item.paymentMode,
        formatNumberWithCommasAndDecimals(item.amount as number, 2)
      );
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
      (posfile?.data?.disamt as number) > 0
        ? formatNumberWithCommasAndDecimals(
            posfile.data?.vatexempt as number,
            2
          )
        : "0"
    );

    tableInput("Zero-Rated Sales", formatNumberWithCommasAndDecimals(0.0, 2));

    input(`------------------------------------------------`, ALIGNMENT.LEFT);

    input(`Customer's Name:`, ALIGNMENT.LEFT);
    input(`Address:`, ALIGNMENT.LEFT);
    input(`Contact No.:`, ALIGNMENT.LEFT);
    input(`TIN:`, ALIGNMENT.LEFT);

    input("Official Receipt", ALIGNMENT.CENTER);

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
