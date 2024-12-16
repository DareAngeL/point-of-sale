import { ItemClassificationModel } from "../models/itemclassification";
import { ItemSubclassificationModel } from "../models/itemsubclassification";
import { PosfileModel } from "../models/posfile";

export const computeTotal = (arrayOfObjects: any) => {
  const sum = arrayOfObjects
    .filter((item: any) => item.quantity > 0)
    .reduce((total: number, current: any) => {
      const {value, quantity} = current;
      if (quantity > 0) {
        const subTotal = parseFloat(value) * quantity;
        return total + subTotal;
      }
      return;
    }, 0);
  // console.log(sum);
  return sum;
};

export const helperFixName = (cashType: string) => {
  switch (cashType) {
    case "CASHIN":
      return "CASH IN";
    case "CASHOUT":
      return "CASH OUT";
    case "CASHFUND":
      return "CASH FUND";
    case "DECLARATION":
      return "CASH DECLARATION";
    default:
      break;
  }
};

export const filterPosfiles = async (posfiles: PosfileModel[]) => {
  const filter = posfiles
    ?.filter((pf) => pf.isaddon == 0)
    .filter((item) => item.itmcomcde === null);

    return await Promise.all(
      filter.map(async (d: any) => {
        
        const item = d.itemfile;

        return {
          ...d,
          itmdsc: item.itmdsc,
          itmclacde: item.itmclacde,
          itemsubclasscde: item.itemsubclasscde,
        };
      })
    )
};

export const getOrderTicketLocationCodes = (
  posfiles: PosfileModel[], 
  itemclass_printer_station_tag: number, 
  itemsubclass_printer_station_tag: number,
  itemClassification: ItemClassificationModel[],
  itemSubclassification: ItemSubclassificationModel[],
) => {

  const locationCodes: {itmclass?: string; itmsubclass?: string; locationcode: string}[] = [];

  for (const posfile of posfiles) {
    const itemfile = posfile.itemfile;
    // const locationcde = itemfile?.locationcde;

    if (itemclass_printer_station_tag as unknown as number === 1) {
      const itemClassificationData = itemClassification.find((d) => d.itmclacde === itemfile?.itmclacde)
      
      if (itemClassificationData?.locationcde && !locationCodes.find((d) => d.itmclass === itemClassificationData.itmclacde)) {
        locationCodes.push({itmclass: itemClassificationData.itmclacde, locationcode: itemClassificationData?.locationcde});
      }

    } else if (itemsubclass_printer_station_tag as unknown as number === 1) {
      const itemSubclassificationData = itemSubclassification.find((d) => d.itemsubclasscde === itemfile?.itemsubclasscde)

      if (itemSubclassificationData?.locationcde && !locationCodes.find((d) => d.itmsubclass === itemSubclassificationData.itemsubclasscde)) {
        locationCodes.push({itmsubclass: itemSubclassificationData.itemsubclasscde, locationcode: itemSubclassificationData?.locationcde});
      }
    }
  }

  return locationCodes;
}
