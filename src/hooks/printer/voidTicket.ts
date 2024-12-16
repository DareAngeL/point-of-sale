import moment from "moment";
import {ALIGNMENT, usePrinterCommands} from "../../enums/printerCommandEnums";
import {formatNumberWithCommasAndDecimals} from "../../helper/NumberFormat";

export function voidticketPrintout(selector: any) {
  const {encode, input, fullCut, tableInput, lineBreak, openCashDrawer} = usePrinterCommands();

  const {account} = selector.account;
  const {previousPosfiles} = selector.order;
  const {itemSubclassification, item} = selector.masterfile;

  const findItem = previousPosfiles.data.map((itm: any) => {
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

  
  openCashDrawer();

  input(`SERVER: ${account.data?.usrname}` || "", ALIGNMENT.LEFT);
  input(`------------------------------------------------`, ALIGNMENT.LEFT);
  lineBreak();
  input(`------------------------------------------------`, ALIGNMENT.LEFT);

  lineBreak();
  input(`-- VOID --`, ALIGNMENT.CENTER);

  input(`------------------------------------------------`, ALIGNMENT.LEFT);
  lineBreak();

  // previousPosfiles.data.forEach((item: any) => {
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

  input(
    `-- ${previousPosfiles.data.length} PRODUCTS VOIDED --`,
    ALIGNMENT.CENTER
  );

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
  input(`** ORDER TICKET **`, ALIGNMENT.LEFT);
  //   input(`CUSTOMER: ${previousPosfiles.data[0].ordercde}` || "", ALIGNMENT.LEFT);
  input(`CUSTOMER: `, ALIGNMENT.LEFT);

  lineBreak();
  lineBreak();
  lineBreak();
  lineBreak();
  lineBreak();

  fullCut();


  console.log("rawr data", encode());

  return encode();
}
