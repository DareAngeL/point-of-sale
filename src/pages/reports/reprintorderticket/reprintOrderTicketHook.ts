import moment from "moment";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useAppDispatch } from "../../../store/store";
import { getPrinterStations } from "../../../store/actions/printerStation.action";

export const useScroll = (nextData: (query: object)=> Promise<void>, dateRange: {to: string, from: string}) => {
  const onScroll = async (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
      const bottom =
      e.currentTarget.scrollHeight - e.currentTarget.scrollTop ===
      e.currentTarget.clientHeight;

      if (bottom) {
          await nextData({from: dateRange.from, to: dateRange.to});
      }
  };

  return {onScroll}
};

export const useReprintInitialization = (dateRange: {to: string, from: string}, reset: () => void, initData: (query: object) => Promise<any>, setData: (data: any) => void) => {
  
  const appDispatch = useAppDispatch();

  useEffect(() => {
    appDispatch(getPrinterStations())
  }, []);
  
  useEffect(() => {
      console.log("Is this being called??", dateRange);
      const getClosedTransactions = async () => {
        if (!moment(dateRange.from).isSameOrBefore(dateRange.to)) {
          toast.error("Invalid Date Range", {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
          });
  
          reset();
          setData([]);
          return;
        }
  
        // get closed transactions
        reset();
        const closedTran = await initData({
          from: dateRange.from,
          to: dateRange.to,
        });
        setData(closedTran);
      };
  
      getClosedTransactions();
  }, [dateRange]);
};