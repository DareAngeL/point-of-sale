import moment from "moment";
import { useEffect, useState } from "react";
import { useOrderingPrintout } from "../../../hooks/orderingPrintoutHooks";
import { reprintReceiptPrintout } from "../../../../../../hooks/printer/reprintReceiptHook";
import { useAppDispatch, useAppSelector } from "../../../../../../store/store";
import { toast } from "react-toastify";
import { getPreviousAll, getPreviousPosfiles, getPreviousTotal, incrementReprintCount } from "../../../../../../store/actions/posfile.action";
import { getOrderDiscountByCode } from "../../../../../../store/actions/discount.action";
import { PosfileModel } from "../../../../../../models/posfile";



export const useConfirmationOpen = () => {

    const [open, setOpen] = useState(false);

    const setConfirmationOpen = () => {
        setOpen(true)
    }

    const setConfirmationClose = () => {
        setOpen(false)
    }

    return {confirmationOpen: open, setConfirmationOpen, setConfirmationClose }

};

export const useDateRange = () => {
    const [dateRange, setDateRange] = useState({
        from: moment().format("MM/DD/YYYY"),
        to: moment().format("MM/DD/YYYY"),
    });

    const setRange = (name: string, value: string) => {
        setDateRange((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    return {dateRange, setRange}

};

export const useReprint = () => {

  const [isReprinting, setIsReprinting] = useState(false);

    const setReprinting = (isReprint: boolean) => {
        setIsReprinting(isReprint);
    };

    return {isReprinting, setReprinting};


};

export const useReprintIniitialization = (dateRange: {to: string, from: string}, reset: () => void, initData: (query: object) => Promise<any>, setData: (data: any) => void) => {
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

export const useGenerateReceipt = () => {
    
    const {generateOrderingReceipt} = useOrderingPrintout();
    const selector = useAppSelector(state => state);
    const posfilePreviousAll = useAppSelector(state => state.order.posfilePreviousAll);
    
    const appDispatch = useAppDispatch();

    const generateReceipt = async () => {
        try{
            await generateOrderingReceipt("reprint-receipt", reprintReceiptPrintout(selector));
            // update the DB to update the reprinted count
            const posfileTOTAL = (posfilePreviousAll as any)?.find((data: any) => data.postrntyp === "TOTAL") as unknown as PosfileModel;
            await appDispatch(incrementReprintCount(posfileTOTAL.ordercde||''));
        }
        catch(e){
            console.error(e);
        }
    };

    return {generateReceipt}
};

export const useChangeData = (setRange: (name: string, value: string) => void) => {


    const onChangeDate = (name: string, value: string) => {
        setRange(name, value);
    };

    return {onChangeDate}
};


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

export const useFetchPrevious = () =>{

    const dispatch = useAppDispatch();

    const getAllPrevious = async (item: any) =>{

        await dispatch(getPreviousAll(item.ordocnum || ""));
        await dispatch(getOrderDiscountByCode(item.ordercde || ""));
        await dispatch(getPreviousPosfiles(item.ordercde || ""));
        await dispatch(getPreviousTotal(item.ordercde || ""));

    }

    return {getAllPrevious}

}