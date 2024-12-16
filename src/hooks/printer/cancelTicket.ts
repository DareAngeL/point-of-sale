import moment from "moment";
import {ALIGNMENT, usePrinterCommands} from "../../enums/printerCommandEnums";
import {formatNumberWithCommasAndDecimals} from "../../helper/NumberFormat";

export function cancelticketPrintout(selector: any) {
  const {encode, input, fullCut, tableInput, lineBreak} = usePrinterCommands();

  const {account} = selector.account;
  const {posfile, posfiles} = selector.order;
  const {itemSubclassification, item} = selector.masterfile;

  const findItem = posfiles.data.map((itm: any) => {
    const matchingItem = item.data.find(
      (orig: any) => itm.itmcde === orig.itmcde
    );
    const clone = {...matchingItem};
    clone.itmqty = itm.itmqty;
    return clone;
  });

  const findSubClassByCde = (itemsubclasscde: any) => {
    const foundSubClass = itemSubclassification.data.find((subitm: any) => {
      return itemsubclasscde === subitm.itemsubclasscde;
    });

    return foundSubClass ? foundSubClass.itemsubclassdsc : undefined;
  };

  input(`SERVER: ${account.data?.usrname}` || "", ALIGNMENT.LEFT);
  input(`------------------------------------------------`, ALIGNMENT.LEFT);
  lineBreak();
  input(`------------------------------------------------`, ALIGNMENT.LEFT);

  lineBreak();
  input(`-- CANCEL --`, ALIGNMENT.CENTER);

  input(`------------------------------------------------`, ALIGNMENT.LEFT);
  lineBreak();

  // posfiles.data.forEach((item: any) => {
  //   tableInput(
  //     `${formatNumberWithCommasAndDecimals(item.itmqty as number)} ${
  //       item.itmdsc
  //     }`,
  //     ``
  //   );
  // });

  findItem.forEach((item: any) => {
    console.log("xxx", findSubClassByCde(item.itemsubclasscde));
    console.log(
      "yyy",
      formatNumberWithCommasAndDecimals(item.itmqty as number)
    );
    console.log(item);

    input(`${findSubClassByCde(item.itemsubclasscde)}`, ALIGNMENT.LEFT);
    tableInput(
      `${formatNumberWithCommasAndDecimals(item.itmqty as number)} ${
        item.itmdsc
      }`,
      ``
    );
  });

  input(`-- ${posfiles.data.length} PRODUCTS CANCELLED--`, ALIGNMENT.CENTER);

  input(`------------------------------------------------`, ALIGNMENT.LEFT);
  lineBreak();

  input(
    `${moment(new Date(), "MM/DD/YYYY h:mm:ss A").format(
      "MM/DD/YYYY h:mm:ss A"
    )}`,
    ALIGNMENT.RIGHT
  );

  input(`------------------------------------------------`, ALIGNMENT.LEFT);
  lineBreak();
  input(`** ORDER TICKET **`, ALIGNMENT.CENTER);
  input(`CUSTOMER: ${posfile.data?.ordercde}` || "", ALIGNMENT.LEFT);

  lineBreak();
  lineBreak();
  lineBreak();
  lineBreak();
  lineBreak();

  fullCut();

  console.log("rawr data", encode());

  return encode();
}
