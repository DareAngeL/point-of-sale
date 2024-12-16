import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import {
  getRemainingZread,
  hasNoEOD,
} from "../../../store/actions/posfile.action";
import { getSysPar } from "../../../store/actions/systemParameters.action";
import { getTheme } from "../../../store/actions/utilities/theme.action";
import { homeInit } from "../../../store/actions/home.action";
import { setMasterfileMenu } from "../../../reducer/menuSlice";
import {
  setFooter,
  setHeader,
  setMallFields,
  setMasterFileLog,
  setPaymentType,
} from "../../../reducer/masterfileSlice";
import { setNonZReading } from "../../../reducer/reportSlice";
import { setTransaction } from "../../../reducer/orderingSlice";
import {
  removeLoading,
  setAllActiveHoldTransactions,
  setHasCashFund,
  setIsEnd,
  setLastTransaction,
} from "../../../reducer/transactionSlice";
import { setUserAccess } from "../../../reducer/accountSlice";
import { setCorruptedAutoOfSales } from "../../../reducer/utlitiesSlice";

export function initialization() {
  const dispatch = useAppDispatch();
  const { account } = useAppSelector((state) => state.account);

  const initializeHome = async (
    onDispatchComplete: (hasRemZread: boolean, hasNOEOD: boolean) => void
  ) => {
    if (account.data?.usrname) {
      toast.loading("Initializing, Please wait.", {
        position: "top-center",
      });

      // await dispatch(getMenusMasterfile());
      // await dispatch(getItems({}));
      // await dispatch(getDineType());
      // await dispatch(getPaymentType());
      // await dispatch(getItemClassifications());
      // await dispatch(getItemSubclassifications());
      // await dispatch(getPrinterStations());
      // await dispatch(getPriceList());
      // await dispatch(getCompany());
      // await dispatch(getTerminals());

      // await dispatch(getHeader());
      // await dispatch(getNonZReadData());
      // await dispatch(getActiveTransaction());
      // await dispatch(getLastTransaction());
      // await dispatch(hasCashfund());
      // await dispatch(getSpecialRequest());
      // await dispatch(getDiscount());
      // await dispatch(getMasterFileLog());
      // await dispatch(getFreeReason());
      // await dispatch(getCashIOReason());
      // await dispatch(getCardType());
      // await dispatch(getFooter());
      // await dispatch(getVoidReason());
      // await dispatch(getTransactions());
      // await dispatch(getLastCashFund());
      // await dispatch(getUserAccess({usrcde: account.data?.usrcde}));
      // await dispatch(getDefaultBackupPath());

      // await dispatch(getAllActiveTransactions());
      // await dispatch(getCorruptedAutoOfSales());

      dispatch(getSysPar());
      dispatch(getTheme());
      const remZReading = dispatch(getRemainingZread());
      const noEOD = dispatch(hasNoEOD(account.data?.usrcde || "None"));

      const allPromised = Promise.all([remZReading, noEOD]);
      const allResolved = await allPromised;

      onDispatchComplete(
        allResolved[0].payload?.hasRemainingZread || false,
        allResolved[1].payload.NOEOD || false
      );

      const homeInitialize = await dispatch(homeInit(account.data?.usrcde));

      dispatch(removeLoading());

      const {
        mallFields,
        otherpayment,
        menus,
        header,
        nonZRead,
        activeTrans,
        lastTransaction,
        cashFund,
        masterfileLog,
        footer,
        userAccess,
        allActiveTransactions,
        autoOfSales,
        isEnd,
      } = homeInitialize.payload;

      dispatch(setMasterfileMenu(menus));
      dispatch(setHeader(header));
      dispatch(setNonZReading(nonZRead));
      dispatch(setTransaction(activeTrans));
      dispatch(setLastTransaction(lastTransaction));
      dispatch(setHasCashFund(cashFund));
      dispatch(setMasterFileLog(masterfileLog));
      dispatch(setFooter(footer));
      dispatch(setUserAccess(userAccess));
      dispatch(setAllActiveHoldTransactions(allActiveTransactions));
      dispatch(setMallFields(mallFields));
      dispatch(setCorruptedAutoOfSales(autoOfSales));
      dispatch(setPaymentType(otherpayment));
      dispatch(setIsEnd(isEnd));
    }
  };
  return { dispatch, initializeHome };
}
