import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import Paper from "@mui/material/Paper";
import {useState} from "react";
import {useAppDispatch, useAppSelector} from "../../../../../../store/store";
import {numberPadFormatter} from "../../../../../../helper/NumberFormat";
import {CustomModal} from "../../../../../../common/modal/CustomModal";
import {RefundItem} from "./RefundItem";
import {PaymentButtons} from "../../../common/buttons/PaymentButtons";
import {useNavigate} from "react-router";
import {changeName, enableBackButton} from "../../../../../../reducer/modalSlice";
import {
  deleteToRefundById,
} from "../../../../../../reducer/refundSlice";
import {DeleteFilled} from "@ant-design/icons";
import {RefundModeOfRefund} from "./RefundModeOfRefund";
import { Empty } from "antd";
import { toast } from "react-toastify";
import { receiptDefiner } from "../../../../../../helper/ReceiptNumberFormatter";
// import { RefundtransactionClosed } from "./RefundTransactionClosed";

export function RefundTable() {
  const {toRefund} = useAppSelector((state) => state.refund);
  const {syspar} = useAppSelector((state) => state.masterfile)
  const appDispatch = useAppDispatch();

  // const {refundTransaction} = useOrderingButtons();
  const [customModal, setCustomModal] = useState(false);
  const [modeOfRefundModal, setModeofRefundModal] = useState<boolean>(false);
  const [refItem] = useState<any>({});
  const navigate = useNavigate();

  const deleteRefund = (recid: string) => {
    appDispatch(deleteToRefundById(recid));
  };

  const computeAmtToRefund = (itmqty: number, refundqty: number, groprc: number, vatexempt: number, disamt: number, scharge: number, scharge_disc: number) => {
    if (vatexempt > 0) {
      const disc = disamt / itmqty;
      const schrge_dsc = scharge_disc / itmqty;
      const schrge = scharge / itmqty - schrge_dsc;
      const singleItemAmt = (groprc / 1.12) - disc + schrge;
      return singleItemAmt * refundqty;
    }
    else {
      const disc = disamt / itmqty;
      const schrge_dsc = scharge_disc / itmqty;
      const schrge = scharge / itmqty - schrge_dsc;
      const singleItemAmt = groprc - disc + schrge;
      
      return singleItemAmt * refundqty;
    }
  }

  const renderModals = () => {
    if (modeOfRefundModal) {
      return (
        <CustomModal
          modalName={"Mode of Refund"}
          maxHeight={""}
          onExitClick={() => {
            setModeofRefundModal(false);
          }}
          isShowXBtn={true}
        >
          <RefundModeOfRefund onClear={() => setModeofRefundModal(false)} />
        </CustomModal>
      );
    } else if (customModal) {
      return (
        <CustomModal
          modalName={"Set refund reason"}
          maxHeight={""}
          onExitClick={() => setCustomModal(false)}
        >
          <RefundItem quantity={refItem.itmqty} />
        </CustomModal>
      );
    }
  };

  return (
    <>
      {customModal || modeOfRefundModal ? (
        renderModals()
      ) : (
        <section className="h-full overflow-scroll-auto flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <PaymentButtons
              buttonName={"Search OR/INV"}
              width="200px"
              onClick={() => {
                appDispatch(enableBackButton(true));
                navigate("/pages/ordering/refundtransactionclosed");
                appDispatch(changeName({modalName: "Search OR/INV"}));
              }}
            />
            <h1
              onClick={() => {
                console.log(toRefund);
              }}
              className="font-bold text-2xl bg-green-400 p-2 rounded"
            >
              TOTAL :{" "}
              {numberPadFormatter(toRefund.data.reduce((total, currentItem) => {
                const quantityToAdd = computeAmtToRefund(currentItem.itmqty*1, currentItem.refundqty*1, currentItem.groprc*1, currentItem.vatexempt*1, currentItem.disamt*1, currentItem.scharge*1, currentItem.scharge_disc*1);
                  // parseFloat(currentItem.untprc) *
                  //   parseInt(currentItem.refundqty) || 0;
                return total + quantityToAdd;
              }, 0), 2) || "0.00"}
            </h1>
          </div>
          <TableContainer component={Paper}>
            <Table
              sx={{
                minWidth: 200,
                height: 400,
                "& .MuiTableCell-head": {
                  fontWeight: 700,
                },
              }}
              aria-label="simple table"
            >
              <TableHead>
                <TableRow>
                  <TableCell align="left">Action</TableCell>
                  <TableCell align="left">ITEM</TableCell>
                  <TableCell align="left">OR/INV #</TableCell>
                  <TableCell align="left">QTY TO RETURN</TableCell>
                  <TableCell align="left">AMT TO REFUND</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {toRefund.data.map((item) => (
                  <TableRow>
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => {
                          deleteRefund(item.recid);
                        }}
                      >
                        <DeleteFilled className=" text-red-300" />
                      </IconButton>
                    </TableCell>

                    <TableCell>{item.itmdsc}</TableCell>

                    <TableCell>{receiptDefiner(syspar.data[0].receipt_title || 0, item.ordocnum)}</TableCell>

                    <TableCell>
                      {numberPadFormatter(item.refundqty, 0)}
                    </TableCell>

                    <TableCell>
                      {/* {numberPadFormatter(item.extprc / ((item.itmqty*1) - (item.refundqty - 1)), 2)} */}
                      {numberPadFormatter(computeAmtToRefund(item.itmqty*1, item.refundqty, item.groprc*1, item.vatexempt*1, item.disamt*1, item.scharge*1, item.scharge_disc*1), 2)}
                    </TableCell>
                  </TableRow>
                ))}
                {toRefund.data.length===0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className="flex w-full">
                        <Empty 
                          className="mx-auto"
                          description="No available items" 
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <button>
            <PaymentButtons
              buttonName={"Refund Transaction"}
              onClick={() => {
                if (toRefund.data.length <= 0) {
                  toast.error("No item(s) to refund.", {
                    position: 'top-center',
                    autoClose: 2000,
                    hideProgressBar: true,
                  });

                  return;
                }

                setModeofRefundModal(true);
              }}
            />
          </button>
        </section>
      )}
    </>
  );
}
