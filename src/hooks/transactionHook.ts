import {toast} from "react-toastify";
import {useAppSelector} from "../store/store";
import { CashieringTransactType } from "../pages/transaction/cashiering/cashieringEnums";
import { formatTimeTo12Hour } from "../helper/Date";

/**
 * Use to check if the user can proceed to the transaction page
 * @returns
 */
export function useVisitingTransactionChecking() {
  const order = useAppSelector((state) => state.order);
  const transaction = useAppSelector((state) => state.transaction);
  const { header, syspar } = useAppSelector((state) => state.masterfile)

  const {remainingZread} = order;
  const {lastTransaction, hasCashFund, isEnd} = transaction;

  const canProceed = (
    validate: "remainingZRead" | "lastTransaction" | "NOEOD" | "terminalno" | "printer_station" | "hasCashFund" | "isEndTime" | "hasRequiredHeaders"
  ) => {
    switch (validate) {
      case "hasRequiredHeaders": {
        const { postrmno, brhcde, warcde } = header.data[0];
        const withtracc = syspar.data[0].withtracc! * 1;
    
        if (!postrmno || !brhcde || (withtracc !== 0 && !warcde)) {
            toast.info("Please setup Terminal No. / Branch / Warehouse on Header masterfile", {
                autoClose: 2000,
                position: "top-center",
                hideProgressBar: true,
            });
            return false;
        }
    
        return true;
    }
      case "printer_station":
        if (syspar.data[0].prntr_stn_tag_modified) {
          return true;
        }

        toast.error("You need to setup printer station in the settings before you can proceed.", {
          autoClose: 3000,
          position: 'top-center',
          hideProgressBar: true
        })
        return false;
      // case "terminalno":
      //   if () {
      //     toast.error("Please set the terminal number first", {
      //       autoClose: 2000,
      //       position: "top-center",
      //       hideProgressBar: true, 
      //     })
      //     return false;
      //   }

      //   return true;
      case "remainingZRead":
        if (remainingZread.data?.hasRemainingZread /*&& lastTransaction.trntyp === CashieringTransactType.CASH_DECLARATION*/) {
          return false;
        }
        
        return true;
      case "lastTransaction":
        console.log("Huling transaction", lastTransaction);
        if (!lastTransaction.trntyp) {
          toast.error("Please wait, the program is still processing", {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: true,
          });
          console.error("lastTransaction is empty");

          return false;
        } else if (lastTransaction.trntyp === "GRANDTOTAL") {

          if(syspar.data[0].robinson == 1){

            if(syspar.data[0].timestart != '00:00:00'){
              toast.info(`TRANSACTION IS LOCK UNTIL NEXT OPERATION AT ${formatTimeTo12Hour('09:00:00')}`, {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: true,
              });
            }
            else{
              toast.info(`TRANSACTION IS LOCK UNTIL NEXT OPERATION AT ${formatTimeTo12Hour('00:00:00')}`, {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: true,
              });
            }

          }
          else{
            toast.info(`TRANSACTION IS LOCK UNTIL NEXT OPERATION AT ${formatTimeTo12Hour(syspar.data[0].timestart || '00:00:00')}`, {
              position: "top-center",
              autoClose: 2000,
              hideProgressBar: true,
            });
            
          }

          return false;
        }

        return true;
      case "NOEOD":
        if (
          (transaction.noEOD.NOEOD && lastTransaction.trntyp === CashieringTransactType.CASH_DECLARATION) ||
          (transaction.noEOD.NOEOD && lastTransaction.trntyp === CashieringTransactType.EMPTY)
        )
          return false;

        return true;
      case "hasCashFund":
        console.log(hasCashFund.data);
        if (!hasCashFund.data || lastTransaction.trntyp == "DECLARATION") {
          toast.info("Please cash fund first.", {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: true,
          });
          return false;
        }
        return true;

      case "isEndTime":
        if(isEnd){
          return false;
        }
        return true;
    }
  };

  return {
    canProceed,
  };
}
