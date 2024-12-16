/* eslint-disable @typescript-eslint/no-non-null-assertion */
import moment from "moment";
import {ALIGNMENT, usePrinterCommands} from "../../enums/printerCommandEnums";
import {formatNumberWithCommasAndDecimals} from "../../helper/NumberFormat";
import { SpecialRequestDetailModel } from "../../models/specialrequest";
import { PosfileModel } from "../../models/posfile";

export function orderticketPrintout(selector: any, bySubClass?: boolean, itemclass?: string[], itemsubclass?: string[], isReprint?: boolean) {
  const {encode, input, fullCut, lineBreak, bigInput, bigTableInput} = usePrinterCommands();

  const {account} = selector.account;
  const {posfiles: posfileItems, previousPosfiles, specialRequest} = selector.order;
  const {itemSubclassification} = selector.masterfile;
  const {change} = selector.payment;

  // const posfile = isReprint ? previousPosfile : posfileTotal;
  const posfiles = isReprint ? previousPosfiles : posfileItems;

  let itemsToDisplay = [];
  let dineInDisplay = [];
  let takeOutDisplay = [];
  if (itemclass && itemclass[0]) {
    itemsToDisplay = posfiles.data.filter((posfile: any) => itemclass.find(str => str === posfile.itemfile.itmclacde) !== undefined);
    dineInDisplay = itemsToDisplay.filter((posfile: any) => posfile.ordertyp === "DINEIN");
    takeOutDisplay = itemsToDisplay.filter((posfile: any) => posfile.ordertyp === "TAKEOUT");
  }

  if (itemsubclass && itemsubclass[0]) {
    itemsToDisplay = posfiles.data.filter((posfile: any) => itemsubclass.find(str => str === posfile.itemfile.itemsubclasscde !== undefined));
    dineInDisplay = itemsToDisplay.filter((posfile: any) => posfile.ordertyp === "DINEIN");
    takeOutDisplay = itemsToDisplay.filter((posfile: any) => posfile.ordertyp === "TAKEOUT");
  }

  const findSubClassByCde = (itemsubclasscde: any) => {
    const foundSubClass = itemSubclassification.data.find((subitm: any) => {
      return itemsubclasscde === subitm.itemsubclasscde;
    });

    return foundSubClass ? foundSubClass.itemsubclassdsc : undefined;
  };

  const byClassitemsRenderer = (item: PosfileModel) => {
    if (item.itmcomcde) return; // if this item is included in a combo, skip this item

      bigTableInput(
        `${formatNumberWithCommasAndDecimals(item.itmqty as number)} ${
          item.itmdsc
        }`,
        ``
      );

      // if this is a combo item, display all of its comboed items
      if (item.chkcombo!*1 === 1) {
        const findCombo = posfiles.data.filter(
          (f: PosfileModel) => f.itmcomcde === item.itmcde
        );

        findCombo.forEach((combo: PosfileModel) => {
          input(`${combo.itmdsc}`, ALIGNMENT.LEFT);
        });
      }

      const findItemOrderModifier = specialRequest.data.filter((f: SpecialRequestDetailModel) => f.orderitmid === item.orderitmid);

      if(findItemOrderModifier.length>0){
        findItemOrderModifier.forEach((spc: SpecialRequestDetailModel) => {
          bigInput(' '.repeat(3) + `${spc.modcde}`, ALIGNMENT.LEFT);
          lineBreak();
        });
      }
  }

  const bySubclassItemsRenderer = (items: PosfileModel[]) => {
    const reducedItems = items
      .filter((a:PosfileModel) => !a.itmcomcde)
      .reduce((acc: any, curr: PosfileModel) => {
        const key = curr.itemfile!.itemsubclasscde;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(curr);
        return acc;
      }, {});

    for (const [itemsubclasscde, posfile] of Object.entries(reducedItems)) {
      const subClass = findSubClassByCde(itemsubclasscde);
      bigInput(`${subClass}`, ALIGNMENT.LEFT);
      for (const item of posfile as PosfileModel[]) {
        bigTableInput(
          `${formatNumberWithCommasAndDecimals(item.itmqty as number)} ${
            item.itmdsc
          }`,
          ``
        );

        // if this is a combo item, display all of its comboed items
        if (item.chkcombo!*1 === 1) {
          const findCombo = posfiles.data.filter(
            (f: PosfileModel) => f.itmcomcde === item.itmcde
          );

          findCombo.forEach((combo: PosfileModel) => {
            input(`${combo.itmdsc}`, ALIGNMENT.LEFT);
          });
        }

        const findItemOrderModifier = specialRequest.data.filter((f: SpecialRequestDetailModel) => f.orderitmid === item.orderitmid);

        if(findItemOrderModifier.length>0){
          findItemOrderModifier.forEach((spc: SpecialRequestDetailModel) => {
            bigInput(' '.repeat(5) + `${spc.modcde}`, ALIGNMENT.LEFT);
          });
        }
      }
    }
  }

  input(`SERVER: ${account.data?.usrname}` || "", ALIGNMENT.LEFT);

  if (bySubClass) {
    //#region DINE IN
    if (dineInDisplay.length > 0) {
      input(`------------------------------------------------`, ALIGNMENT.LEFT);
      bigInput(`-- DINEIN --`, ALIGNMENT.CENTER);
      lineBreak();
      input(`------------------------------------------------`, ALIGNMENT.LEFT);

      bySubclassItemsRenderer(dineInDisplay);
    }
    //#endregion

    // #region TAKE OUT
    if (takeOutDisplay.length > 0) {
      input(`------------------------------------------------`, ALIGNMENT.LEFT);
      bigInput(`-- TAKEOUT --`, ALIGNMENT.CENTER);
      lineBreak();
      input(`------------------------------------------------`, ALIGNMENT.LEFT);

      bySubclassItemsRenderer(takeOutDisplay);
    }
    //#endregion

  } else {
    //#region DINE IN
    if (dineInDisplay.length > 0) {
      input(`------------------------------------------------`, ALIGNMENT.LEFT);
      bigInput(`-- DINEIN --` , ALIGNMENT.CENTER);
      lineBreak();
      input(`------------------------------------------------`, ALIGNMENT.LEFT);

      dineInDisplay.forEach((item: PosfileModel) => {
        byClassitemsRenderer(item);
      });
    }
    //#endregion

    // #region TAKE OUT
    if (takeOutDisplay.length > 0) {
      input(`------------------------------------------------`, ALIGNMENT.LEFT);
      bigInput(`-- TAKEOUT --`, ALIGNMENT.CENTER);
      lineBreak();
      input(`------------------------------------------------`, ALIGNMENT.LEFT);

      takeOutDisplay.forEach((item: PosfileModel) => {
        byClassitemsRenderer(item);
      });
    }
    //#endregion
  }

  input(`-- ${itemsToDisplay.filter((a: PosfileModel) => !a.itmcomcde).length} PRODUCT(S) ORDERED --`, ALIGNMENT.CENTER);

  input(`------------------------------------------------`, ALIGNMENT.LEFT);

  input(
    `${moment(new Date(), "MM/DD/YYYY h:mm:ss A").format(
      "MM/DD/YYYY h:mm:ss A"
    )}`,
    ALIGNMENT.RIGHT
  );

  input(`------------------------------------------------`, ALIGNMENT.LEFT);
  bigInput(`** ORDER TICKET **`, ALIGNMENT.CENTER);
  lineBreak();
  bigInput(`CUSTOMER: ${isReprint ? itemsToDisplay[0]?.customername || '' : change.data?.customerName || ""}`, ALIGNMENT.LEFT);

  lineBreak();
  lineBreak();
  lineBreak();
  lineBreak();
  lineBreak();
  lineBreak();
  lineBreak();

  fullCut();

  console.log("rawr data", encode());

  return encode();
}
