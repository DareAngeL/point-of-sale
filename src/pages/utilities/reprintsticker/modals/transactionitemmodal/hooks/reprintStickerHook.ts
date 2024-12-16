import { useRef } from "react"
import { PosfileModel } from "../../../../../../models/posfile"
import { PrinterStationModel } from "../../../../../../models/printerstation";
import { useAppDispatch, useAppSelector } from "../../../../../../store/store";
import { getSinglePrinterStation } from "../../../../../../store/actions/printerStation.action";
import { toast } from "react-toastify";
import { stickerPrintout } from "../../../../../../hooks/printer/stickerPrintout";
import { useOrderingPrintout } from "../../../../../transaction/ordering/hooks/orderingPrintoutHooks";

export function useReprintStickerHook() {

  const appDispatch = useAppDispatch();
  const { dineType } = useAppSelector((state) => state.masterfile);
  const { specialRequest } = useAppSelector((state) => state.order);

  const { generateStickerPrintout } = useOrderingPrintout();

  const stickerPrinterStations = useRef<PrinterStationModel[]>([]);

  const processStickerPrinting = async (posfiles: PosfileModel[], checkedItens: string[]) => {
    // set the printer stations for the sticker printing
    stickerPrinterStations.current = []; // reset printer stations data
    const filteredPosfiles = posfiles.filter((d) => checkedItens.includes(d.orderitmid || ''));
    console.log("asdxfilteredPosfiles", filteredPosfiles);
    
    for (const posfile of filteredPosfiles) {
      if (posfile.isaddon === 1) continue;
      if (posfile.itmcomtyp) continue;

      let printersize = 48;

      const itemfile = posfile.itemfile;
      const locationcde = itemfile?.locationcde;
      const printerStation = await appDispatch(getSinglePrinterStation(locationcde));
      
      if (printerStation.payload) {
        printersize = printerStation.payload.printersize;

        if (!printersize) {
          toast.error(`Printer size is not set. Please set the printer size for the ${printerStation.payload.printername} printer station.`, {
            autoClose: 5000,
            hideProgressBar: true,
            position: 'top-center',
          })

          continue;
        }

        if (stickerPrinterStations.current.find((d) => d.locationcde === locationcde)) continue;
        stickerPrinterStations.current.push(printerStation.payload);
      }
    }
    // end region: set the printer stations for the sticker printing

    // print the stickers
    for (const stickerPrinterStation of stickerPrinterStations.current) {

      const stickerPrinterStationPosfiles = posfiles.filter((d) => 
        d.isaddon === 0 && 
        d.itemfile?.locationcde === stickerPrinterStation.locationcde &&
        checkedItens.includes(d.orderitmid || '')
      );
      if (!(stickerPrinterStationPosfiles.length > 0)) continue;

      // check first if one of the posfile item has 2 or more quantity
      const finalStickerPStationPosfiles: PosfileModel[] = [];
      stickerPrinterStationPosfiles.forEach((posfile) => {
        const posfileQuantity = posfile.itmqty || 1;
        for (let i=0; i<posfileQuantity; i++) {
          finalStickerPStationPosfiles.push(posfile);
        }
      });

      let index = 1;
      for (const stickerPrinterStationPosfile of finalStickerPStationPosfiles) {
        let printStickerData: {
          dineType: string;
          item: string;
          addOns: string[];
          remarks: string[];
          printerSize: number;
        } = {} as any;
    
        const dineTypeName = dineType.data.find((d) => d.postypcde === stickerPrinterStationPosfile.postypcde)?.postypdsc || '';
        const item = stickerPrinterStationPosfile.itmdsc || '';
        const orderItmId = stickerPrinterStationPosfile.orderitmid || '';
        const addOns = posfiles.filter((d) => d.mainitmid === orderItmId && d.isaddon === 1).map((d) => d.itmdsc || '');
        const remarks = specialRequest.data.filter((d) => d.orderitmid === orderItmId).map((d) => d.modcde);
        const printerSize = stickerPrinterStation.printersize;

        printStickerData = {
          dineType: dineTypeName,
          item,
          addOns,
          remarks,
          printerSize,
        };

        console.log("asdxprintStickerData", printStickerData);

        const printout = stickerPrintout(
          printStickerData.dineType, 
          stickerPrinterStationPosfile.customername || '',
          index, 
          finalStickerPStationPosfiles.length, 
          printStickerData.item, 
          printStickerData.addOns, 
          printStickerData.remarks,
          printerSize
        );

        console.log("asdxprintout", printout);
        
        await generateStickerPrintout(
          printout,
          stickerPrinterStation,
          undefined,
        );

        index++;
      }
    }
    // end region: print the stickers
  }

  return {
    processStickerPrinting
  }
}