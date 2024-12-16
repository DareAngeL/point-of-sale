import { Empty } from "antd";
import { InputDateV2 } from "../../../common/form/InputDate";
import { numberPadFormatter } from "../../../helper/NumberFormat";
import moment from "moment";
import { useEffect, useState } from "react";
import { useLazyLoading } from "../../../hooks/lazyLoading";
import { toast } from "react-toastify";
import { useAppDispatch } from "../../../store/store";
import { getOrdocnumItems } from "../../../store/actions/utilities/reprintsticker.action";
import { PosfileModel } from "../../../models/posfile";
import { ReprintStickerItemsModal } from "./modals/transactionitemmodal/TransactionItemsModal";
import { getSpecialRequestByOrdercode } from "../../../store/actions/specialRequest.action";

export function ReprintStickers() {

  const appDispatch = useAppDispatch();

  const [dateRange, setDateRange] = useState({
    from: moment().format("YYYY-MM-DD"),
    to: moment().format("YYYY-MM-DD"),
  });
  const [ordernumbers, setOrderNumbers] = useState<{ordocnum:string;ordercde:string;}>();
  const [ordocnumItems, setOrdocnumItems] = useState<PosfileModel[]>([]);
  const [openItemsModal, setOpenItemsModal] = useState(false);

  const {data, reset, nextData, initData, setData} = useLazyLoading(
    `posfile/closedTransactions`,
    {from: dateRange.from, to: dateRange.to},
    30
  );

  useEffect(() => {
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

  useEffect(() => {
    const ordocnumItems = async () => {
      if (!ordernumbers?.ordocnum) {
        return;
      }

      await appDispatch(getSpecialRequestByOrdercode(ordernumbers?.ordercde));
      const responseOrdocnum = await appDispatch(getOrdocnumItems(ordernumbers?.ordocnum));
      
      if (responseOrdocnum.meta.requestStatus === "fulfilled") {
        setOrdocnumItems(responseOrdocnum.payload);
      }
    };

    ordocnumItems();
  }, [ordernumbers?.ordocnum]);

  const onChangeDate = (name: string, value: string) => {
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onScroll = async (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const bottom =
      e.currentTarget.scrollHeight - e.currentTarget.scrollTop ===
      e.currentTarget.clientHeight;

    if (bottom) {
      await nextData({from: dateRange.from, to: dateRange.to});
    }
  };

  return (
    <>
      <ReprintStickerItemsModal items={ordocnumItems} ordocnum={ordernumbers?.ordocnum || ''} open={openItemsModal} onClose={() => setOpenItemsModal(false)}/>

      <div className="flex mb-5">
          <div className="flex-auto mx-2">
            <InputDateV2
              handleInputChange={onChangeDate}
              name={"from"}
              value={dateRange.from}
              id={"from"}
              description={"Date From:"}
            />
          </div>
          <div className="flex-auto">
            <InputDateV2
              handleInputChange={onChangeDate}
              name={"to"}
              value={dateRange.to}
              id={"to"}
              description={"Date To:"}
            />
          </div>
        </div>
        <p className="text-[12px]">Closed Transactions</p>
        <div className="overflow-y-auto h-[360px]" onScroll={onScroll}>
          {data.length === 0 && (
            <Empty
              className="mt-5"
              description="No available closed transactions"
            />
          )}
          {data.map((item: PosfileModel, index: number) => (
            <div
              key={index}
              className="flex justify-between mt-2 border-b cursor-pointer hover:bg-blue-200 p-1"
              onClick={async () => {
                setOrderNumbers({ordocnum: item.ordocnum || '', ordercde: item.ordercde || ''});
                setOpenItemsModal(true);
              }}
            >
              <div>{item.ordocnum}</div>
              <div>{numberPadFormatter(item.extprc, 2)}</div>
            </div>
          ))}
        </div>
    </>
  )
}