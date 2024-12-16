/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import moment from "moment";
import { ALIGNMENT, usePrinterCommands } from "../../enums/printerCommandEnums";

export function stickerPrintout(
  dineType: string,
  customerName: string,
  itemIndex: number,
  itemsLength: number,
  item: string,
  addOns: string[],
  remarks: string[],
  printerSize: number
) {
  const {encode, input, fullCut, lineBreak} = usePrinterCommands(printerSize);

  //#region Creating Receipt Content
  lineBreak();

  input(`${dineType}`, ALIGNMENT.CENTER, true);
  lineBreak();
  if (customerName) input(`Name: ${customerName}`, ALIGNMENT.LEFT, true);
  input(`Item ${itemIndex} of ${itemsLength}`, ALIGNMENT.LEFT);
  lineBreak();
  input('Main Order:', ALIGNMENT.LEFT);
  input(`* ${item}`, ALIGNMENT.LEFT, false, true);
  lineBreak();
  input('Add-ons:', ALIGNMENT.LEFT);
  addOns.forEach((addOn) => {
    input(`* ${addOn}`, ALIGNMENT.LEFT);
  });

  lineBreak();
  input('Remarks:', ALIGNMENT.LEFT);
  remarks.forEach((remark) => {
    input(`* ${remark}`, ALIGNMENT.LEFT);
  });
  lineBreak();

  input(moment().format("Do-MMM YYYY hh:mm:ss A"), ALIGNMENT.LEFT);
  //#endregion Creating Receipt Content

  for (let i = 0; i < 5; i++) {
    lineBreak();
  }

  fullCut();

  return encode();
}