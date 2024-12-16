import { useAppDispatch, useAppSelector } from "../../../store/store";
import { Empty, Modal, Spin } from "antd";
import { CustomModal } from "../../../common/modal/CustomModal";
import { formatNumberWithCommasAndDecimals } from "../../../helper/NumberFormat";
import { receiptDefiner } from "../../../helper/ReceiptNumberFormatter";
import { useConfirmationOpen, useDateRange, useReprint } from "../../transaction/ordering/modal/orderingbuttons/reprintTransaction/reprintTransactionHooks";
import { useLazyLoading } from "../../../hooks/lazyLoading";
import { useReprintInitialization, useScroll } from "./reprintOrderTicketHook";
import { useOrderTicketHooks } from "../../transaction/ordering/hooks/orderTicketHooks";
import { getPreviousPosfiles, getPreviousTotal } from "../../../store/actions/posfile.action";
import { getSpecialRequestByOrdercode } from "../../../store/actions/specialRequest.action";
import OrderTicket from "../../transaction/ordering/receipt/OrderTicket";
import OrderTicketBySubClass from "../../transaction/ordering/receipt/OrderTicketBySubClass";
import { formatTimeTo12Hour } from "../../../helper/Date";


export const ReprintOrderTicket = () => {

  const appDispatch = useAppDispatch();
  const { syspar } = useAppSelector((state) => state.masterfile);
  const { lastTransaction } = useAppSelector((state) => state.transaction);
  
  const {confirmationOpen, setConfirmationOpen, setConfirmationClose} = useConfirmationOpen();
  const {dateRange} = useDateRange();
  const {isReprinting, setReprinting} = useReprint();
  const {handleOrderTicket} = useOrderTicketHooks();

  const {data, reset, nextData, initData, setData} = useLazyLoading(
    `posfile/closedTransactions`,
    {from: dateRange.from, to: dateRange.to},
    30
  );

  const setDatas = (data: any) =>{
    setData(data)
  }

  const {onScroll} = useScroll(nextData, dateRange);

  useReprintInitialization(dateRange, reset, initData, setDatas);

  return (
    <>
      <div className="top-0 right-0  fixed -z-20 opacity-[0] bg-white">
        <OrderTicket />
      </div>
      <div className="top-[0%] left-[30%] fixed -z-20 opacity-[0] bg-white">
        <OrderTicketBySubClass />
      </div>
      
      <section>
        <Modal okButtonProps={{ style: { backgroundColor: 'green' } }}  title="Are you sure you want to reprint?" open={confirmationOpen} onOk={async () => {
          setConfirmationOpen();
          setReprinting(true);
          await handleOrderTicket(true);
          setReprinting(false);
          setConfirmationClose();
        }} onCancel={()=>{
          setConfirmationClose();
        }}>
        </Modal>

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

        {lastTransaction.trntyp === "GRANDTOTAL" ? (
          <div>
            {syspar.data[0].robinson == 1 && syspar.data[0].timestart != "00:00:00" ? (<>
              <p className="bg-yellow-200 text-[12px] p-1 font-bold mb-2">
                <span className="text-red-700">Note:</span> Re-print order ticket is lock until next operation at {formatTimeTo12Hour("09:00:00")}.
              </p>
            </>):(<>
              <p className="bg-yellow-200 text-[12px] p-1 font-bold mb-2">
                <span className="text-red-700">Note:</span> Re-print order ticket is lock until next operation at {formatTimeTo12Hour(syspar.data[0].timestart || "00:00:00")}.
              </p>
            </>)}
            <p>You can't reprint order ticket. ZReading is done for the day.</p>
          </div>
        ) : (
          <div className="overflow-y-auto h-[360px]" onScroll={onScroll}>
            {data.length === 0 && (
              <Empty
                className="mt-5"
                description="No available closed transactions"
              />
            )}
            {data.map((item: any, index: number) => (
              <div
                key={index}
                className="flex justify-between mt-2 border-b cursor-pointer hover:bg-blue-200 p-1"
                onClick={ async () => {
                  appDispatch(getPreviousPosfiles(item.ordercde));
                  appDispatch(getPreviousTotal(item.ordercde));
                  appDispatch(getSpecialRequestByOrdercode(item.ordercde));
                  setConfirmationOpen()
                }}
              >
                <div>{receiptDefiner(syspar.data[0].receipt_title!, item.ordocnum)}</div>
                <div>{formatNumberWithCommasAndDecimals((item.extprc*1) + (item.scharge*1) - (item.scharge_disc*1), 2)}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )


}