import moment from "moment";
import {ALIGNMENT, usePrinterCommands} from "../../enums/printerCommandEnums";
import {formatNumberWithCommasAndDecimals} from "../../helper/NumberFormat";
import {PosfileModel} from "../../models/posfile";
import { receiptDefiner } from "../../helper/ReceiptNumberFormatter";
export function refundReceiptPrintout(selector: any) {
  const {encode, input, fullCut, tableInput, lineBreak, openCashDrawer} = usePrinterCommands();

  const {header, dineType, footer, syspar} = selector.masterfile;

  const {account} = selector.account;
  const {
    transaction,
    // lessVatAdj,
    // serviceCharge,
    previousPosfile,
    previousPosfiles,
    orderDiscountByCode,
  } = selector.order;
  // const {change, payment} = selector.payment;

  const {toRefund, modeOfRefund, refundReason} = selector.refund;

  const defineReceiptNumber = () => receiptDefiner(syspar.receipt_title, previousPosfile.data.ordocnum);

  const findActiveDineType = dineType.data.find(
    (dt: any) => dt.postypcde == transaction.data?.postypcde
  );

  const isItemNumEnabled = syspar.data[0].receipt_itmnum;
  const isDineType = syspar.data[0].no_dineout;

  const orderingEntry = previousPosfiles.data.map((pf: any) => {
    const entry = orderDiscountByCode.data.find(
      (od: any) => pf.orderitmid == od.orderitmid
    );
    return {...pf, discount: entry};
  });

  const dineInDTypePosfiles = toRefund.data
    .filter((pf: any) => pf.ordertyp === "DINEIN")
    .map((pf: any) => {
      const entry = orderDiscountByCode.data.find(
        (od: any) => pf.orderitmid == od.orderitmid
      );
      return {...pf, discount: entry};
    });
  const takeoutDTypePosfiles = toRefund.data
    .filter((pf: any) => pf.ordertyp === "TAKEOUT")
    .map((pf: any) => {
      const entry = orderDiscountByCode.data.find(
        (od: any) => pf.orderitmid == od.orderitmid
      );
      return {...pf, discount: entry};
    });

  const tempAddOns = previousPosfiles.data.filter((d: any) => d.isaddon);

  // const computeSalesWOVat = () => {
  //   return formatNumberWithCommasAndDecimals(
  //     (previousPosfile?.data?.groext as number) / 1.12,
  //     2
  //   );
  // };

  const computeSubTotal = () => {
    const subTotal = toRefund.data.reduce(
      (total: number, current: PosfileModel) => {
        return (
          total + parseFloat(current.untprc as any) * (current.refundqty as any)
        );
      },
      0
    );
    return subTotal;
  };

  const computeTotal = () => {
    return computeSubTotal();
  };

  
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
  input(`${defineReceiptNumber()|| ""}`, ALIGNMENT.LEFT);

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
          if (item.itmcomtyp === null) {
            tableInput(
              `${formatNumberWithCommasAndDecimals(item.itmqty)} ${
                item.itmdsc
              }`,
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
              `${formatNumberWithCommasAndDecimals(item.itmqty)} ${
                item.itmdsc
              }`,
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
          if (item.itmcomtyp === null) {
            tableInput(
              `${formatNumberWithCommasAndDecimals(item.itmqty)} ${
                item.itmdsc
              }`,
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
              `${formatNumberWithCommasAndDecimals(item.itmqty)} ${
                item.itmdsc
              }`,
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
  }

  tableInput(
    "SUBTOTAL",
    formatNumberWithCommasAndDecimals(computeSubTotal(), 2)
  );

  // tableInput(
  //   "Less VAT (SC/PWD)",
  //   formatNumberWithCommasAndDecimals(lessVatAdj.data?.extprc as number, 2)
  // );

  // tableInput("Sales without VAT", computeSalesWOVat());

  // if ((previousPosfiles?.data?.disamt as number) > 0) {
  //   dineInDTypePosfiles.forEach((item: any) => {
  //     console.log("sheesh", item);
  //     if (item.discount && item.itmcomtyp === null) {
  //       tableInput(
  //         `${item.discount.discde}`,
  //         formatNumberWithCommasAndDecimals(item?.discount?.amtdis as number, 2)
  //       );
  //     }
  //   });
  // }

  // if ((previousPosfiles?.data?.disamt as number) > 0) {
  //   takeoutDTypePosfiles.forEach((item: any) => {
  //     if (item.discount && item.itmcomtyp === null) {
  //       console.log("sheesh", item);
  //       tableInput(
  //         `${item.discount.discde}`,
  //         formatNumberWithCommasAndDecimals(item?.discount?.amtdis as number, 2)
  //       );
  //     }
  //   });
  // }

  tableInput("Refund Reason", refundReason.data);

  input("Mode of Refund", ALIGNMENT.LEFT);
  tableInput(
    modeOfRefund,
    formatNumberWithCommasAndDecimals(computeTotal(), 2)
  );

  // tableInput(
  //   "SERVICE CHARGE",
  //   formatNumberWithCommasAndDecimals(serviceCharge?.data?.extprc || 0, 2)
  // );

  // tableInput(
  //   "AMOUNT DUE",
  //   formatNumberWithCommasAndDecimals(
  //     parseFloat(previousPosfile.data.extprc + "") +
  //       parseFloat(serviceCharge.data.extprc + ""),
  //     2
  //   )
  // );

  // payment.data.map((item: any) => {
  //   tableInput(
  //     item.paymentMode,
  //     formatNumberWithCommasAndDecimals(item.amount as number, 2)
  //   );
  // });

  // tableInput(
  //   "CHANGE",
  //   formatNumberWithCommasAndDecimals((change.data.change as number) || 0, 2)
  // );

  input(
    `** ${
      previousPosfiles.data.filter(
        (item: any) => item.itmcomtyp === null && item.isaddon === 0
      ).length
    } PRODUCT(S) REFUNDED **`,
    ALIGNMENT.CENTER
  );

  input(`------------------------------------------------`, ALIGNMENT.LEFT);
  input(`------------------------------------------------`, ALIGNMENT.LEFT);

  // input("VAT ANALYSIS", ALIGNMENT.CENTER);

  // input(`------------------------------------------------`, ALIGNMENT.LEFT);

  // tableInput(
  //   "VATable Sales",
  //   formatNumberWithCommasAndDecimals(
  //     previousPosfile.data?.netvatamt as number,
  //     2
  //   )
  // );

  // tableInput(
  //   "VAT Amount",
  //   formatNumberWithCommasAndDecimals(
  //     previousPosfile.data?.vatamt as number,
  //     2
  //   )
  // );

  // tableInput(
  //   "VAT Exempted Sales",
  //   (previousPosfile?.data?.disamt as number) > 0
  //     ? formatNumberWithCommasAndDecimals(
  //         (previousPosfile?.data?.untprc || 0) -
  //           (lessVatAdj.data?.untprc || 0),
  //         2
  //       )
  //     : "0"
  // );

  // tableInput("Zero-Rated Sales", formatNumberWithCommasAndDecimals(0.0, 2));

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

  // for(let i = 0;  i<50; i++){
  //     input(`F12`, ALIGNMENT.LEFT)
  //     tableInput(`${1} ${"CHUPAPI ADRIAN"}`,`1.00`);
  // }

  for (let i = 0; i < 5; i++) {
    lineBreak();
  }

  fullCut();


  // the logic of cash drawer is here.

  return encode();
}
