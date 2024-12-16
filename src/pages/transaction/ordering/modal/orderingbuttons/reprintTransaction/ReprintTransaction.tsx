/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {formatNumberWithCommasAndDecimals} from "../../../../../../helper/NumberFormat";
import {useAppSelector} from "../../../../../../store/store";
import {InputDateV2} from "../../../../../../common/form/InputDate";
import {useLazyLoading} from "../../../../../../hooks/lazyLoading";
import {Empty, Modal, Spin} from "antd";
import {CustomModal} from "../../../../../../common/modal/CustomModal";
import { ReprintReceipt } from "../../../receipt/ReprintReceipt";
import { receiptDefiner } from "../../../../../../helper/ReceiptNumberFormatter";
import { useChangeData, useConfirmationOpen, useDateRange, useFetchPrevious, useGenerateReceipt, useReprint, useReprintIniitialization, useScroll } from "./reprintTransactionHooks";


export function ReprintTransaction() {

  const { syspar } = useAppSelector((state) => state.masterfile);
  
  const {confirmationOpen, setConfirmationOpen, setConfirmationClose} = useConfirmationOpen();
  const {dateRange,setRange} = useDateRange();
  const {onChangeDate} = useChangeData(setRange);
  const {isReprinting, setReprinting} = useReprint();
  const {generateReceipt} = useGenerateReceipt();

  const {data, reset, nextData, initData, setData} = useLazyLoading(
    `posfile/closedTransactions`,
    {from: dateRange.from, to: dateRange.to},
    30
  );
  const {getAllPrevious} = useFetchPrevious();

  const setDatas = (data: any) =>{
    setData(data)
  }

  const {onScroll} = useScroll(nextData, dateRange);

  useReprintIniitialization(dateRange, reset, initData, setDatas);

  return (
    <>
      <section>
        <Modal okButtonProps={{ style: { backgroundColor: 'green' } }}  title="Are you sure you want to reprint?" open={confirmationOpen} onOk={async () => {
          setConfirmationOpen();
          setReprinting(true);
          await generateReceipt();
          setReprinting(false);
          setConfirmationClose();
        }} onCancel={()=>{
          setConfirmationClose();
        }}>
        </Modal>
        <div className="absolute -z-10">
          <ReprintReceipt />
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
          {data.map((item: any, index: number) => (
            <div
              key={index}
              className="flex justify-between mt-2 border-b cursor-pointer hover:bg-blue-200 p-1"
              onClick={ async () => {
                await getAllPrevious(item);
                setConfirmationOpen()
              }}
            >
              <div>{receiptDefiner(syspar.data[0].receipt_title!, item.ordocnum)}</div>
              <div>{formatNumberWithCommasAndDecimals((item.extprc*1) + (item.scharge*1) - (item.scharge_disc*1), 2)}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
