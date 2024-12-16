import moment from "moment";
import {ALIGNMENT, usePrinterCommands} from "../../enums/printerCommandEnums";
import {formatNumberWithCommasAndDecimals} from "../../helper/NumberFormat";
import { dateNowFormattedNumerical } from "../../helper/Date";

export function cashieringReceiptPrintout(selector: any, value?: any, reprint?: boolean) {
  const {encode, input, fullCut, tableInput, lineBreak, openCashDrawer} = usePrinterCommands();

  const {header} = selector.masterfile;

  const {account} = selector.account;
  const {denom, reason, cashieringType, cashDeclarationTotal, reprintCashiering} =
    selector.transaction;

  if(!reprint && cashieringType !== "CASH DECLARATION"){
    openCashDrawer();
  }


  input(header.data[0].business1 || "", ALIGNMENT.CENTER);
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

  input(`${reprint ? reprintCashiering.data.postrntyp === "DECLARATION" ? "CASH DECLARATION" : reprintCashiering.data.postrntyp : cashieringType}`, ALIGNMENT.CENTER);
  input(
    reprint ?
      dateNowFormattedNumerical(reprintCashiering.data?.trndte + ' ' + reprintCashiering.data?.logtim)
      :
      `${moment(new Date(), "MM/DD/YYYY h:mm:ss A").format(
        "MM/DD/YYYY h:mm:ss A"
      )}`,
    ALIGNMENT.CENTER
  );

  lineBreak();
  input(`------------------------------------------------`, ALIGNMENT.LEFT);

  tableInput(`CASHIER: ${reprint ? reprintCashiering.data.cashier : account.data?.usrname}` || "", "");

  input(`------------------------------------------------`, ALIGNMENT.LEFT);

  if (reprint) {
    tableInput(`TOTAL:`, formatNumberWithCommasAndDecimals(reprintCashiering.data?.extprc||0, 2));
  }
  else {
    if (cashieringType !== "CASH DECLARATION") {
      tableInput(`TOTAL:`, formatNumberWithCommasAndDecimals(value, 2));
      if (cashieringType !== "CASH FUND") {
        tableInput(`REASON:`, reason);
      }
    } else {
      denom.forEach((item: any) => {
        const {total, quantity, value} = item;
        tableInput(
          `${value} x ${quantity}`,
          formatNumberWithCommasAndDecimals(total, 2)
        );
      });
      input(`------------------------------------------------`, ALIGNMENT.LEFT);
      tableInput(
        `TOTAL:`,
        formatNumberWithCommasAndDecimals(cashDeclarationTotal, 2)
      );
    }
  }

  input(`------------------------------------------------`, ALIGNMENT.LEFT);

  lineBreak();
  lineBreak();
  lineBreak();

  input(`-------------------------`, ALIGNMENT.CENTER);
  input(`Cashier's Signature`, ALIGNMENT.CENTER);

  lineBreak();
  lineBreak();

  input(`-------------------------`, ALIGNMENT.CENTER);
  input(`Supervisor's Signature`, ALIGNMENT.CENTER);

  for (let i = 0; i < 5; i++) {
    lineBreak();
  }

  fullCut();
  console.log("rawr data", encode());

  // the logic of cash drawer is here.

  return encode();
}
