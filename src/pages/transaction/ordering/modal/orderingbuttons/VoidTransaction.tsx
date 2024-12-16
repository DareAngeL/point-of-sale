import {useState} from "react";
import {formatNumberWithCommasAndDecimals} from "../../../../../helper/NumberFormat";
import {PosfileModel} from "../../../../../models/posfile";
import {VoidReason} from "./reason/VoidReason";
import {CustomModal} from "../../../../../common/modal/CustomModal";
import {useAppDispatch, useAppSelector} from "../../../../../store/store";
import {removeDuplicates} from "../../../../../helper/RemoveDuplicate";
import { useLazyLoading } from "../../../../../hooks/lazyLoading";
import { Empty } from "antd";
import { getOrderDiscountByCode } from "../../../../../store/actions/discount.action";
import { getAllPOSVoid } from "../../../../../store/actions/posfile.action";
import { receiptDefiner } from "../../../../../helper/ReceiptNumberFormatter";

export function VoidTransaction() {
  // const {voidTransaction} = useOrderingButtons();

  // const {allLoadedData} = useAllLoadedData<PosfileModel>();

  const {posfileTOTAL: posfile} = useAppSelector((state) => state.order);
  const {syspar} = useAppSelector((state) => state.masterfile)

  const [customModal, setCustomModal] = useState(false);
  const [selectedOr, setSelectedOr] = useState<PosfileModel>();

  const dispatch = useAppDispatch();

  const {
    data,
    nextData
  } = useLazyLoading("posfile/head", undefined, 20);

  const resultArray = removeDuplicates(data, "ordocnum");

  const onScroll = async (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const scrollOffset = Math.ceil(e.currentTarget.scrollTop + e.currentTarget.clientHeight);
    const bottom = scrollOffset >= e.currentTarget.scrollHeight;

    if (bottom) {
      await nextData();
    }
  }

  return (
    <>
      <section>
        {/* <div className="hidden">
          <VoidReceipt voidPosfile={undefined} />
        </div> */}
        {customModal ? (
          <CustomModal modalName={"Set void reason"} maxHeight={""}>
            <VoidReason
              reason={selectedOr}
              onCancel={() => setCustomModal(false)}
            />
          </CustomModal>
        ) : (
          <>
            <div className="flex flex-col overflow-y-auto h-[500px] px-2" onScroll={onScroll}>
              {resultArray.length === 0 && (
                <Empty
                  className="mx-auto my-auto"
                  description="No available transactions"
                />
              )}
              {resultArray.map((item) => (
                <>
                  {item.ordocnum !== posfile.data?.ordocnum && (
                    <>
                      <div
                        className="flex justify-between mt-2 border-b cursor-pointer"
                        onClick={() => {
                          setCustomModal(true);
                          setSelectedOr(item);
                          console.log("KATAWA KA", item.ordercde);
                          dispatch(getAllPOSVoid(item.ordercde));
                          dispatch(getOrderDiscountByCode(item.ordercde));
                        }}
                      >
                        <div>{receiptDefiner(syspar.data[0].receipt_title || 0, item.ordocnum)}</div>
                        <div>{formatNumberWithCommasAndDecimals(item.extprc, 2)}</div>
                      </div>
                    </>
                  )}
                </>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
