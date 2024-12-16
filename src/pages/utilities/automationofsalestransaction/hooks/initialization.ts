import { useEffect, useRef, useState } from "react";
import { PosfileModel } from "../../../../models/posfile";
import { useWebSocket } from "../../../../hooks/socketHooks";
import { IMessageEvent } from "websocket";
import { useLazyLoading } from "../../../../hooks/lazyLoading";

export function useAutoSalesTranTableInitialization(
  setAllLoadedData: React.Dispatch<unknown>,
  setDocnum: React.Dispatch<React.SetStateAction<string[]>>,
  setArrayCheck: React.Dispatch<unknown>, 
  scrollableDivRef: React.RefObject<HTMLDivElement>
) {

  // const appDispatch = useAppDispatch();
  const { listen } = useWebSocket();
  const [socketMsg, setSocketMsg] = useState<string>();

  const query = useRef<any>({
    // docnum: "like:POS-",
    trnstat: 1,
    // postrntyp: 'or:ITEM,CASHFUND,CASHIN,CASHOUT,DECLARATION',
    _groupby: "docnum",
    _sortby: "trnsfrdte,docnum",
    _includes: "recid,docnum,cashier,trndte,trnsfrdte,trnsfrtime,postrntyp,ordercde,itmcde",
  });

  const { data, nextData, reset, initData, setData } = useLazyLoading("posfile/auto_ofsales", query.current, 10);

  const onSocketMessage = (msg: IMessageEvent) => {
    setSocketMsg(msg.data as string);
  }

  const getSalesTransactions = async () => {
    reset();
    const data = await initData(query.current);
    setData(data);
  }

  const onScroll = async () => {
    const container = scrollableDivRef.current;
    if (container === null) return;

    const scrollTop = container.scrollTop;
    const clientHeight = container.clientHeight;
    const scrollHeight = container.scrollHeight;

    if (scrollTop + clientHeight >= scrollHeight-200) {
      nextData(query.current);
    }
  }

  const onDateChange = async (date: { date_start?:string; date_end?:string }) => {
    query.current = {
      ...query.current,
      startDate: date.date_start,
      endDate: date.date_end,
    }

    setDocnum([]);
    getSalesTransactions();
  }

  useEffect(() => {
    listen.onmessage(onSocketMessage);

    //#region container scroll event listener
    const container = scrollableDivRef.current;
    if (container === null) return;

    container.addEventListener('scroll', onScroll);

    return () => {
      container.removeEventListener('scroll', onScroll);
    }
    //#endregion
  }, []);

  useEffect(() => {
    setAllLoadedData(data.map((d: any) => ({...d, expandSpecReq: false})));
    
    data.forEach((posfile: PosfileModel) => {
      setArrayCheck((prev: any) => ({
        ...prev,
        selectall: false,
        [posfile.recid as string]: {
          recid: posfile.recid,
          docnum: posfile.docnum,
          checked: false,
          disable: !posfile.trnsfrdte && !posfile.trnsfrtime ? false : true,
        },
      }));
    });
  }, [data]);

  return { onDateChange, getSalesTransactions, socketMsg };
}