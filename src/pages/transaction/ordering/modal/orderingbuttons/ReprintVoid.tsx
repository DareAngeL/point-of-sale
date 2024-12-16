import {useState} from "react";
import {formatNumberWithCommasAndDecimals} from "../../../../../helper/NumberFormat";
import {PosfileModel} from "../../../../../models/posfile";
import {CustomModal} from "../../../../../common/modal/CustomModal";
import {useAppDispatch, useAppSelector} from "../../../../../store/store";
import {WarningModal} from "../../../../../common/modal/WarningModal";
import {useOrderingButtons} from "../../hooks/orderingHooks";
import {toggle} from "../../../../../reducer/modalSlice";
import { useLazyLoading } from "../../../../../hooks/lazyLoading";
import { Empty, Modal, Spin } from "antd";
import { getLessVatAdj, getServiceCharge, getPreviousPosfiles, getPreviousTotal, getAllPOSVoid } from "../../../../../store/actions/posfile.action";
import { receiptDefiner } from "../../../../../helper/ReceiptNumberFormatter";
import { VoidReceiptV2 } from "../../receipt/VoidReceiptV2";
import { getOrderDiscountByCode } from "../../../../../store/actions/discount.action";

export function ReprintVoid() {
  // const {voidTransaction} = useOrderingButtons();

  // const {allLoadedData} = useAllLoadedData<PosfileModel>();

  const [customModal, setCustomModal] = useState(false);
  const [selectedOr, setSelectedOr] = useState<PosfileModel>();
  const [isReprinting, setIsReprinting] = useState(false);
  const [openReprintWarning, setOpenReprintWarning] = useState(false);
  
  const {syspar} = useAppSelector((state) => state.masterfile);
  // const { allPOSVoid } = useAppSelector((state) => state.void);

  const {reprintVoid} = useOrderingButtons();

  const dispatch = useAppDispatch();

  const {
    data,
    nextData,
  } = useLazyLoading("posfile/void", undefined, 20);

  // when the allPosVoid is already loaded, then we can now reprint the void transaction
  // this ensures that allPosVoid is already loaded before reprinting the void transaction to avoid errors
  // useEffect(() => {
  //   const reprint = async () => {
  //     if (Object.keys(allPOSVoid.data).length > 0 && isReprinting) {
  //       await reprintVoid();
  //       dispatch(toggle());
  //       setIsReprinting(false); 
  //     }
  //   }

  //   reprint();
  // }, [allPOSVoid]);

  const onScroll = async (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop === e.currentTarget.clientHeight;

    if (bottom) {
      await nextData();
    }
  }

  return (
    <>
      <div className="top-0 right-0 z-10 w-[80%] bg-white opacity-[0] max-h-[0px] overflow-clip">
        <VoidReceiptV2 voidPosfile={undefined} isReprint />
      </div>

      <section>

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

        <Modal 
          open={openReprintWarning} 
          onOk={async () => {
            setOpenReprintWarning(false);
            setIsReprinting(true);

            await reprintVoid();
            dispatch(toggle());
            setIsReprinting(false); 
          }}
          okType="primary"
          okButtonProps={{ style: { backgroundColor: 'green' } }}
          onCancel={() => setOpenReprintWarning(false)}
          title="Are you sure you want to reprint void?" 
        />

        {customModal ? (
          <CustomModal modalName={"Set void reason"} maxHeight={""}>
            <WarningModal
              modalName=""
              onYes={() => {
                console.log(selectedOr);
                reprintVoid();
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
                  description="No available voided transactions"
                />
              )}
              {data.map((item:any) => (
                <>
                  <div
                    className="flex justify-between mt-2 border-b cursor-pointer"
                    onClick={async () => {
                      // setCustomModal(true);
                      // setIsReprinting(true);
                      // setCustomModal(false);
                      setSelectedOr(item);

                      dispatch(getLessVatAdj(item.ordercde || ""));
                      dispatch(getServiceCharge(item.ordercde || ""));
                      dispatch(getPreviousPosfiles(item.ordercde || ""));
                      dispatch(getPreviousTotal(item.ordercde || ""));
                      dispatch(getAllPOSVoid(item.ordercde));
                      dispatch(getOrderDiscountByCode(item.ordercde || ""));

                      setOpenReprintWarning(true);
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
