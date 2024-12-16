import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {useAppDispatch, useAppSelector} from "../../../../../../store/store";
import {numberPadFormatter} from "../../../../../../helper/NumberFormat";
import {InputNumber} from "../../../../../../common/form/InputNumber";
import {useState} from "react";
import {PaymentButtons} from "../../../common/buttons/PaymentButtons";
import {useNavigate} from "react-router";
import {addToRefund} from "../../../../../../reducer/refundSlice";
import {useAllLoadedData} from "../../../../../../hooks/serviceHooks";
import {PosfileModel} from "../../../../../../models/posfile";
import { useChangeNameModal } from "../../../../../../hooks/modalHooks";
import { enableBackButton } from "../../../../../../reducer/modalSlice";
import { Empty } from "antd";
import { toast } from "react-toastify";

export function RefundItemList() {
  const {refundItemList, toRefund} = useAppSelector((state) => state.refund);
  const { syspar } = useAppSelector((state) => state.masterfile);
  const {allLoadedData} = useAllLoadedData<PosfileModel>();

  const navigate = useNavigate();
  const appDispatch = useAppDispatch();
  const { modalNameDispatch } = useChangeNameModal();

  const [refundObj, setRefundObj] = useState<{[name: string]: any}>({});

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;

    const selectedItem = refundItemList.data.find((d) => d.recid == name);

    if (selectedItem) {
      const qty = parseInt(value) < 0 ? 0 : value;

      const newQuantityToReturn = Math.min(qty as number, realQuantity(selectedItem.ordocnum, selectedItem.orderitmid, selectedItem.itmcde, selectedItem.itmqty as number));

      if ((qty as number) <= 0) {
        const {[name]: removeItem, ...rest} = refundObj;

        return setRefundObj(rest);
      }

      setRefundObj((prev) => ({
        ...prev,
        [name]: {
          ...selectedItem,
          refundqty: newQuantityToReturn,
        },
      }));
    }
  };

  const realQuantity = (ordocnum: string, orderitmid: string, itmcde: string, itmqty: number) => {
    const findRefundedSaved = allLoadedData.find(
      (d) => ordocnum == d.ordocnum && itmcde == d.itmcde && d.orderitmid == orderitmid
    );

    if (!findRefundedSaved) return itmqty;

    console.log(
      itmqty - (findRefundedSaved && (findRefundedSaved?.refundqty as number))
    );

    return (
      itmqty - (findRefundedSaved && (findRefundedSaved?.refundqty as number))
    );
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

  const filteredRefundItems = refundItemList.data.filter((item) => {
    if (item.refund*1 === 1) return false;

    const findRefunded = toRefund.data.find((d) => item.recid == d.recid);
    const findRefundedSaved = allLoadedData.find(
      (d) => item.ordocnum == d.ordocnum && item.itmcde == d.itmcde && item.orderitmid == d.orderitmid
    );

    if (
      (findRefunded &&
        parseInt(findRefunded.refundqty) < item.itmqty*1) ||
      (findRefundedSaved &&
        (findRefundedSaved.refundqty as number) < item.itmqty*1)
    )
      return true;

    if (findRefunded || findRefundedSaved) return false;

    return true;
  });

  return (
    <>
      <section className="h-full flex-col flex-between overflow-scroll-auto">
        <TableContainer component={Paper}>
          <Table
            sx={{
              minWidth: 200,
              "& .MuiTableCell-head": {
                fontWeight: 700,
              },
            }}
            aria-label="simple table"
          >
            <TableHead>
              <TableRow>
                <TableCell align="left">ITEM</TableCell>
                <TableCell align="center">QTY</TableCell>
                <TableCell align="center">QTY TO RETURN</TableCell>
                <TableCell align="center">AMT TO REFUND</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRefundItems.length == 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Empty
                      className="mx-auto"
                      description="No items left to refund"
                    />
                  </TableCell>
                </TableRow> 
              )}

              {filteredRefundItems.map((item) => (
                <TableRow>
                  <TableCell>{item.itmdsc}</TableCell>

                  <TableCell align="center">
                    <div className="flex justify-center">
                      {numberPadFormatter(
                        realQuantity(item.ordocnum, item.orderitmid, item.itmcde, item.itmqty),
                        0
                      )}
                    </div>
                  </TableCell>

                  <TableCell align="center">
                    <InputNumber
                      handleInputChange={onChange}
                      name={item.recid + ""}
                      id="refundqty"
                      description={""}
                      value={
                        refundObj[item.recid as string]?.refundqty >
                          (item.itmqty as number) ||
                        refundObj[item.recid as string]?.refundqty < 0
                          ? item.itmqty
                          : refundObj[item.recid as string]?.refundqty || 0
                      }
                    />
                  </TableCell>

                  <TableCell align="center">
                    {numberPadFormatter(
                      // item.extprc / ((item.itmqty*1) - (refundObj[item.recid as string]?.refundqty - 1)),
                      computeAmtToRefund(
                        item.itmqty*1,
                        refundObj[item.recid as string]?.refundqty*1 || 0,
                        item.groprc*1,
                        item.vatexempt*1,
                        item.disamt*1,
                        item.scharge*1,
                        item.scharge_disc*1
                      ),
                      2
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <PaymentButtons
          buttonName={"Next"}
          onClick={() => {
            const refundItems = Object.values(refundObj);
            if (refundItems.length <= 0) {
              toast.info("No item(s) added.", {
                position: 'top-center',
                autoClose: 2000,
                hideProgressBar: true,
              });
            } else {
              toast.success("Added item(s) successful.", {
                position: 'top-center',
                autoClose: 2000,
                hideProgressBar: true,
              });
            }

            modalNameDispatch(syspar.data[0].refnum);
            appDispatch(enableBackButton(false));
            navigate("/pages/ordering/refundtransactionlist");
            console.log(Object.values(refundObj));
            appDispatch(addToRefund(Object.values(refundObj)));
          }}
        />
      </section>
    </>
  );
}
