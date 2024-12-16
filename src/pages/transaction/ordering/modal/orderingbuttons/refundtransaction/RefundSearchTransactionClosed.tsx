/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useNavigate } from "react-router";
import { formatNumberWithCommasAndDecimals } from "../../../../../../helper/NumberFormat";
import { useAppDispatch, useAppSelector } from "../../../../../../store/store";
import { getRefundItemsByCode } from "../../../../../../store/actions/refundAction";
import { removeDuplicates } from "../../../../../../helper/RemoveDuplicate";
import { setSelectedRefundOrdercde } from "../../../../../../reducer/orderingSlice";
import { getOrderDiscountByCode } from "../../../../../../store/actions/discount.action";
import {
  getPreviousPosfiles,
  getPreviousTotal,
  getLessVatAdj,
  getServiceCharge,
} from "../../../../../../store/actions/posfile.action";
import { useLazyLoading } from "../../../../../../hooks/lazyLoading";
import { useChangeNameModal } from "../../../../../../hooks/modalHooks";
import { Empty, Typography } from "antd";
import { receiptDefiner } from "../../../../../../helper/ReceiptNumberFormatter";
import moment from "moment";
import { Box, Stack } from "@mui/material";
// import {useOrderingButtons} from "../../../hooks/orderingHooks";

export function RefundSearchTransactionClosed() {
  const { posfileTOTAL: posfile } = useAppSelector((state) => state.order);
  const { syspar } = useAppSelector((state) => state.masterfile);
  const { modalNameDispatch } = useChangeNameModal();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { Title } = Typography;
  const dateToday = moment(new Date()).format("YYYY-MM-DD");
  const oneTimeCurRender = 1
  const oneTimePastRender = 1
  let currentCurRender = 0
  let currentPastRender = 0

  const { data, nextData } = useLazyLoading(
    "posfile/headRefund",
    undefined,
    20
  );

  const resultArray = removeDuplicates(data, "ordocnum");

  const onScroll = async (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const scrollOffset = Math.ceil(
      e.currentTarget.scrollTop + e.currentTarget.clientHeight
    );
    const bottom = scrollOffset >= e.currentTarget.scrollHeight;

    if (bottom) {
      await nextData();
    }
  };

  const dispatchTrans = async (item: {
    ordercde: string;
    ordocnum: string;
    refnum: string;
  }) => {
    modalNameDispatch(
      `${receiptDefiner(syspar.data[0].receipt_title! * 1, item.ordocnum)}`
    );
    dispatch(getRefundItemsByCode(item.ordercde));
    navigate(`/pages/ordering/refunditemlist/`);

    dispatch(getPreviousPosfiles(item.ordercde || ""));
    dispatch(getPreviousTotal(item.ordercde || ""));
    dispatch(getLessVatAdj(item.ordercde || ""));
    dispatch(getServiceCharge(item.ordercde || ""));
    dispatch(setSelectedRefundOrdercde(item.refnum));
    dispatch(getOrderDiscountByCode(item.ordercde));
  };

  return (
    <>
      <div
        className="flex flex-col overflow-y-auto h-[500px] px-2"
        onScroll={onScroll}
      >
        {resultArray.length === 0 && (
          <Empty className="mt-40" description="No available data found" />
        )}
        {resultArray.map((item) => (
          <>
            {item.ordocnum != posfile.data?.ordocnum && (
              <>
                {dateToday === item.trndte ? (
                  <>
                    {(() => {
                      currentCurRender++;
                      if (oneTimeCurRender === currentCurRender) {
                        return <Title level={4}>Today's Transaction/'s</Title>;
                      }
                      return null;
                    })()}
                    <Box>
                      <div
                        className="flex justify-between pt-2 pb-2 border-b cursor-pointer"
                        onClick={() => dispatchTrans(item)}
                      >
                        <Stack direction="row" spacing={3}>
                          <Box width={130} borderRight={"1px solid #ccc"}>
                            {moment(item.trndte).format("ll")}
                          </Box>
                          <div>
                            {receiptDefiner(
                              syspar.data[0].receipt_title || 0,
                              item.ordocnum
                            )}
                          </div>
                        </Stack>
                        <div>
                          {formatNumberWithCommasAndDecimals(item.extprc, 2)}
                        </div>
                      </div>
                    </Box>
                  </>
                ) : (
                  <>
                    {(() => {
                      currentPastRender++;
                      if (oneTimePastRender === currentPastRender) {
                        return <Title level={4} style={{marginTop: currentCurRender === 1 ? 50 : 0}}>Past Transaction/'s</Title>;
                      }
                      return null;
                    })()}
                    <div
                      className="flex justify-between pt-2 pb-2 border-b cursor-pointer"
                      onClick={() => dispatchTrans(item)}
                    >
                      <Stack direction="row" spacing={3}>
                        <Box width={130} borderRight={"1px solid #ccc"}>
                          {moment(item.trndte).format("ll")}
                        </Box>
                        <div>
                          {receiptDefiner(
                            syspar.data[0].receipt_title || 0,
                            item.ordocnum
                          )}
                        </div>
                      </Stack>
                      <div>
                        {formatNumberWithCommasAndDecimals(item.extprc, 2)}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </>
        ))}
      </div>
    </>
  );
}
