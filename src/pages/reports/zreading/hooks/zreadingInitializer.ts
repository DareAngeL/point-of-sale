import { useAppDispatch, useAppSelector } from "../../../../store/store"
import { getOpenTransactions } from "../../../../store/actions/zreading.action";
import { useEffect, useState } from "react";
import { CashieringTransactType } from "../../../transaction/cashiering/cashieringEnums";
import { getMallFields } from "../../../../store/actions/mallhookup.action";

export function useZReadingInitializer(
  setAllLoadedData: React.Dispatch<React.SetStateAction<any>>,
  switchToGenerateInfo: () => void,
  switchToNoEOD: () => void,
  switchToCashDecl: () => void,
) {

  const appDispatch = useAppDispatch();
  const { report, transaction, masterfile } = useAppSelector(state => state)

  const [hasOpenTran, setHasOpenTran] = useState(false);

  const { nonZReading } = report;
  const { lastTransaction, noEOD } = transaction;
  const { syspar, mallHookUp } = masterfile;

  useEffect(() => {
    hasOpenTransaction((hasOpen) => {
      setHasOpenTran(hasOpen);
    });

    // if (noEOD.NOEOD) {
    //   switchToNoEOD();
    //   return;
    // }

    if (lastTransaction.trntyp !== CashieringTransactType.CASH_DECLARATION && 
      (lastTransaction.trntyp !== "GRANDTOTAL" && lastTransaction.trntyp !== "EMPTY")
      ) 
    {
      switchToCashDecl();
      return;
    }

    if (syspar.data[0].active_mall !== 0) {
      if (!mallHookUp.data) {
        appDispatch(getMallFields(syspar.data[0].active_mall||0));
      }
    }

    setAllLoadedData(nonZReading.data);
    if (nonZReading.data.length > 0) {
      switchToGenerateInfo();
    } else {
      if (noEOD.NOEOD) {
        switchToNoEOD();
      } else {
        // display instead the "all set and done".
        switchToGenerateInfo();
      }
    }
  }, []);

  const fetchOpenTransactions = async () => {
    try {
      const hasOpenTransaction = await appDispatch(getOpenTransactions());
      return !!hasOpenTransaction.payload;
    } catch (error) {
      console.error('Error fetching open transactions:', error);
      return false;
    }
  }

  const hasOpenTransaction = (cb: (hasOpen: boolean) => void) => {
    fetchOpenTransactions().then((bool) => {
      cb(bool);
    });
  };

  return {
    appDispatch,
    hasOpenTran
  }
}