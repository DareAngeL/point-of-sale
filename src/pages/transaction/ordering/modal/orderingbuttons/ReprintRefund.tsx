import {useEffect, useRef, useState} from "react";
import {formatNumberWithCommasAndDecimals} from "../../../../../helper/NumberFormat";
import {PosfileModel} from "../../../../../models/posfile";
import {CustomModal} from "../../../../../common/modal/CustomModal";
import {useAppDispatch, useAppSelector} from "../../../../../store/store";
import {WarningModal} from "../../../../../common/modal/WarningModal";
import {useOrderingButtons} from "../../hooks/orderingHooks";
import {toggle} from "../../../../../reducer/modalSlice";
import {setSelectedRefundOrdercde} from "../../../../../reducer/orderingSlice";
import { useLazyLoading } from "../../../../../hooks/lazyLoading";
import { Empty, Spin } from "antd";
import { getLessVatAdj, getPreviousRefundedPayment, getPreviousPosfiles, getPreviousTotal, getServiceCharge, getPreviousTrnsactionPayment } from "../../../../../store/actions/posfile.action";
import { receiptDefiner } from "../../../../../helper/ReceiptNumberFormatter";
import { RefundReceiptV2 } from "../../receipt/RefundReceiptV2";

export function ReprintRefund() {

  const [customModal, setCustomModal] = useState(false);
  const [selectedOr, setSelectedOr] = useState<PosfileModel>();
  const [isReprinting, setIsReprinting] = useState(false);

  const {reprintRefund} = useOrderingButtons();
  const {syspar} = useAppSelector((state) => state.masterfile);
  const { prevTranPayment } = useAppSelector((state) => state.order);

  const refnumRef = useRef<string | undefined>();

  const dispatch = useAppDispatch();

  const {
    data,
    nextData,
  } = useLazyLoading("posfile/refundTransactions", undefined, 20);

  useEffect(() => {
    const reprint = async () => {
      if (isReprinting) {
        await reprintRefund(refnumRef.current || "", true);
        setIsReprinting(false);
      }
    }

    reprint();
  }, [prevTranPayment]);

  const onScroll = async (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop === e.currentTarget.clientHeight;

    if (bottom) {
      await nextData();
    }
  }

  return (
    <>
      <section>
        {/* <div className="hidden"> */}
        <div className="top-0 left-0 fixed -z-20 opacity-[0] bg-white">
          <RefundReceiptV2 voidPosfile={undefined} isReprint={true} />
        </div>

        {isReprinting && (
          <CustomModal 
            modalName={"Re-printing transaction"} 
            maxHeight={""}
            height={50}
          >
            <div className="flex">
              <Spin />
              <span className="ms-3">Generating receipt. Please wait...</span>
            </div>
          </CustomModal>
        )}

        {customModal ? (
          <CustomModal modalName={"Set refund reason"} maxHeight={""}>
            <WarningModal
              modalName=""
              onYes={() => {
                console.log(selectedOr);
                dispatch(toggle());
                setCustomModal(false);
              }}
              onNo={() => setCustomModal(false)}
            />
          </CustomModal>
        ) : (
          <>
            <div className="flex flex-col overflow-y-auto h-[500px] px-2" onScroll={onScroll}>
              {data.length === 0 && (
                <Empty
                  className="mx-auto my-auto"
                  description="No available refunded transactions"
                />
              )}
              {data.map((item:any) => (
                <>
                  <div
                    className="flex justify-between mt-2 border-b cursor-pointer"
                    onClick={async () => {
                      setCustomModal(false);
                      setIsReprinting(true);
                      setSelectedOr(item);

                      refnumRef.current = item.refnum;

                      await dispatch(getPreviousPosfiles(item.ordercde || ""));
                      await dispatch(getPreviousTotal(item.ordercde || ""));
                      await dispatch(getLessVatAdj(item.ordercde || ""));
                      await dispatch(getServiceCharge(item.ordercde || ""));
                      await dispatch(getPreviousRefundedPayment(item.ordercde || ""));
                      await dispatch(getPreviousTrnsactionPayment(item.ordercde || ""));
                      dispatch(setSelectedRefundOrdercde(item.refnum));
                    }}
                  >
                    <div>{receiptDefiner(syspar.data[0].receipt_title || 0,item.ordocnum)}</div>
                    <div>{formatNumberWithCommasAndDecimals(item.groext, 2)}</div>
                  </div>
                </>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
