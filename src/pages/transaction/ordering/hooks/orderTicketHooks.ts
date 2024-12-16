import {useAppSelector} from "../../../../store/store";
import {useOrderingPrintout} from "./orderingPrintoutHooks";
import {orderticketPrintout} from "../../../../hooks/printer/orderTicket";
import {voidticketPrintout} from "../../../../hooks/printer/voidTicket";
import {cancelticketPrintout} from "../../../../hooks/printer/cancelTicket";
import { getOrderTicketLocationCodes } from "../../../../helper/transaction";
import { toast } from "react-toastify";

export function useOrderTicketHooks() {
  const selector = useAppSelector((state) => state);

  const {syspar, itemClassification, itemSubclassification} = useAppSelector((state) => state.masterfile);
  const {posfiles, previousPosfiles} = useAppSelector((state) => state.order);

  const {generateOrderTicketReceipt, generateOrderingReceipt} = useOrderingPrintout();
  const isTicketBySubclass = syspar.data[0] ? syspar.data[0].ticket_bysubclass as unknown as number === 1 : false;
  const isSendToKitchen = syspar.data[0] ? syspar.data[0].send_to_kitchen : 0;
  const ticketCount = syspar.data[0] ? syspar.data[0].orderprintcount : 0;

  const handleOrderTicket = async (reprint?: boolean) => {
    const isPrinterStationSubclassTagged = syspar.data[0].itemsubclass_printer_station_tag as unknown as number === 1;
    const isItemClassTagged = isSendToKitchen === 1 && !isPrinterStationSubclassTagged;

    if (reprint && previousPosfiles.data.length === 0) {
      return toast.error("No previous transaction to reprint or you have already Z-Read.", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
      });
    }
    
    const locationCodes = getOrderTicketLocationCodes(
      reprint ? previousPosfiles.data : posfiles.data,
      syspar.data[0].itemclass_printer_station_tag as unknown as number,
      syspar.data[0].itemsubclass_printer_station_tag as unknown as number,
      itemClassification.data,
      itemSubclassification.data
    );

    let groupedByLocationCodes: any = {};
    groupedByLocationCodes = locationCodes.reduce((acc: any, curr) => {
      const key = curr.locationcode;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(curr);
      return acc;
    }, {});

    for (const locationcde in groupedByLocationCodes) {
      const _locationCodes = groupedByLocationCodes[locationcde];
      const itemClasses = _locationCodes.map((d: any) => d.itmclass);
      const itemSubclasses = _locationCodes.map((d: any) => d.itmsubclass);
      
      if (isItemClassTagged) {
        const printout = orderticketPrintout(selector, false, itemClasses, itemSubclasses, reprint);
        await generateOrderTicketReceipt(
          locationcde,
          "orderticket",
          printout,
          () => {
            console.log("axd normal order ticket printed");
          },
          ticketCount
        );

        continue;
      }

      if (isTicketBySubclass) {
        const printout = orderticketPrintout(selector, true, itemClasses, itemSubclasses, reprint);
        console.log("axdBysubclass:", printout);
        
        await generateOrderTicketReceipt(
          locationcde,
          "orderticket",
          printout,
          () => {
            console.log("axd sub class order ticket printed");
          },
          ticketCount
        );

      } else {
        const printout = orderticketPrintout(selector, false, itemClasses, itemSubclasses, reprint);
        await generateOrderTicketReceipt(
          locationcde,
          "orderticket",
          printout,
          () => {
            console.log("axd normal order ticket printed");
          },
          ticketCount
        );
      }
    }

    // if (isTicketBySubclass) {
    //   console.log("posfilesxxxsubclassOrder", orderticketPrintout(selector, true));        

    //   await generateOrderTicketReceipt(
    //     "orderticket",
    //     orderticketPrintout(selector, true),
    //     () => {
    //       console.log("sub class order ticket");
    //     },
    //     ticketCount
    //   );
    // }
  };

  const handleOrderTicketCancel = async () => {
    if (
      isSendToKitchen === 1 &&
      isTicketBySubclass &&
      posfiles.data.length > 0
    ) {
      await generateOrderingReceipt(
        "orderticket",
        cancelticketPrintout(selector),
        () => {
          console.log("cancel order ticket");
        },
        ticketCount
      );
    }
  };

  const handleOrderTicketVoid = async () => {
    if (isSendToKitchen === 1 && isTicketBySubclass) {
      await generateOrderingReceipt(
        "orderticket",
        voidticketPrintout(selector),
        () => {
          console.log("void order ticket");
        },
        ticketCount
      );
    }
  };

  return {
    handleOrderTicket,
    handleOrderTicketCancel,
    handleOrderTicketVoid,
  };
}
