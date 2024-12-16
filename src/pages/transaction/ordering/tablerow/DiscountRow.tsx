import {IconButton, TableCell, TableRow} from "@mui/material";
import {CloseOutlined} from "@ant-design/icons";
import {PosfileModel} from "../../../../models/posfile";
import {useAppDispatch, useAppSelector} from "../../../../store/store";
import {useEffect, useState} from "react";
import {DiscountOrderModel} from "../../../../models/discount";
import {
  priceListGenerator,
  useDiscount,
  useOrderingService,
} from "../hooks/orderingHooks";
import {PricelistModel} from "../../../../models/pricelist";
import {OrderingModel} from "../model/OrderingModel";
import { getOrderDiscount } from "../../../../store/actions/discount.action";
import { getTotal, getLessVatAdj, getPosfiles } from "../../../../store/actions/posfile.action";
import { filterPosfiles } from "../../../../helper/transaction";
import { setSelectedOrder } from "../../../../reducer/orderingSlice";

interface DiscountRowProps {
  row: PosfileModel;
  index: number;
  discountOrder: DiscountOrderModel[][];
  setDiscountOrder: (
    updatedDiscountOrder: (DiscountOrderModel | null)[][]
  ) => void;
  removeX?: boolean;
}

export function DiscountRow(props: DiscountRowProps) {
  const {orderDiscount, posfiles, transaction, /*selectedOrder*/} = useAppSelector(
    (state) => state.order
  );
  const {priceList, warehouse} = useAppSelector((state) => state.masterfile);
  const {onDeleteDiscount} = useDiscount();
  const [generatedPricelist, setGeneratedPricelist] =
    useState<PricelistModel>();
  const appDispatch = useAppDispatch();
  const {postTransaction} = useOrderingService<PosfileModel | any>("posfile");

  console.log(props);

  useEffect(() => {
    const load = async () => {
      console.log("Prayslist",priceList, warehouse,transaction.data);
      setGeneratedPricelist(
        await priceListGenerator(
          warehouse.data,
          priceList.data,
          transaction.data as OrderingModel
        )
      );
    };

    load();
  }, []);

  useEffect(() => {
    // const find = orderDiscount.data.find(
    //   (d) => props.row.orderitmid == d.orderitmid
    // );

    const load = async () =>  {

      const filteredDiscounts = (await filterPosfiles(posfiles?.data))
          .map((row) => {
            return orderDiscount.data.filter(
              (d) => row.orderitmid == d.orderitmid
            );
          });
  
      console.log("discountrow", filteredDiscounts);
  
      if (filteredDiscounts.length > 0) {
        // props.discountOrder[props.index] = filteredDiscounts;
        props.setDiscountOrder(filteredDiscounts);
      }
  
      if (orderDiscount.data.length === 0) {
        props.setDiscountOrder([]);
      }
    }

    load();
  }, [orderDiscount, orderDiscount.data, posfiles.data]);

  const onDeleteClick = (recid: string, discde: string) => {
    const filterAddOns = posfiles.data
      .filter((addOn) => {
        return (
          addOn.isaddon === 1 &&
          props.discountOrder[props.index].find(d => d.orderitmid === addOn.mainitmid)// .orderitmid === addOn.mainitmid
        );
      })
      .map((item) => {
        return item.orderitmid;
      });

      console.log(generatedPricelist);

    const origItemPrice = generatedPricelist?.pricecodefile2s.find(
      (d) => d.itmcde == props.row.itmcde
    );

    onDeleteDiscount(
      // props.discountOrder[props.index].recid + "",
      
      // `${props.discountOrder[props.index].recid}/${encodeURIComponent(
      `${recid}/${encodeURIComponent(
        JSON.stringify(filterAddOns)
      )}`,
      (deletedPosfileItem) => {
        const cloneDiscountOrder = [...props.discountOrder[props.index]];

        // const filterDiscountOrder = cloneDiscountOrder.map((d) => {
        //   if (d && d.orderitmid != props.row.orderitmid) {
        //     return d;
        //   } else {
        //     return null;
        //   }
        // });
        // const filterDiscountOrder = cloneDiscountOrder.filter((d) => {
        //   return d && d.recid?.toString() !== recid;
        // });

        const deletedDiscount = cloneDiscountOrder.splice(cloneDiscountOrder.findIndex(f => f.recid?.toString() === recid), 1);
        
        if (cloneDiscountOrder.length === 0) {
          props.discountOrder.splice(props.index, 1);
        } else {
          props.discountOrder[props.index] = cloneDiscountOrder;
        }

        appDispatch(getOrderDiscount());

        const deletedDiscAmt = parseFloat(deletedDiscount[0].amtdis as unknown as string);
        const deletedDiscLessVat = parseFloat(deletedDiscount[0].lessvatadj as unknown as string);
        const deletedSchargeDisc = deletedPosfileItem.scharge_disc as number;

        const newDiscountAmnt = (parseFloat(props.row.amtdis as unknown as string) || deletedDiscAmt) - deletedDiscAmt;
        const newLessVat = parseFloat(props.row.lessvat as unknown as string) - deletedDiscLessVat;
        const newSchargeDisc = Math.max(0, parseFloat(props.row.scharge_disc as unknown as string) - deletedSchargeDisc);

        let itemTemplate = {
          ...props.row,
          // groprc: origItemPrice?.groprc,
          // grossprc: origItemPrice?.groprc,
          // groext: origItemPrice?.groprc,
          // extprc: origItemPrice?.groprc,
          amtdis: newDiscountAmnt,
          // untprc: origItemPrice?.untprc,
          disamt: newDiscountAmnt,
          lessvat: newLessVat,
        } as PosfileModel;

        // if (props.row.chkcombo === 0) {

          const newPrice = parseFloat(props.row?.groprc as unknown as string) * parseInt(props.row?.itmqty as unknown as string) - newDiscountAmnt - newLessVat;

          itemTemplate = {
            ...props.row,
            groprc: props.row?.groprc,
            grossprc: props.row?.groprc,
            groext: props.row?.groprc,
            extprc: newPrice,
            amtdis: newDiscountAmnt,
            untprc: origItemPrice?.untprc,
            disamt: newDiscountAmnt,
            lessvat: newLessVat,
            scharge_disc: newSchargeDisc,
          } as PosfileModel;
        // }

        // update the item from the posfile table
        postTransaction(
          {...itemTemplate, disc_deletion: true},
          (data) => {
            props.setDiscountOrder(props.discountOrder);
            console.log(data);
            appDispatch(getTotal(""));
            appDispatch(getLessVatAdj(""));
            appDispatch(getPosfiles(transaction.data?.ordercde));
            appDispatch(setSelectedOrder(null));
          },
          undefined,
          undefined,
          true
        );
      },
      {discde: discde, orderitmid: props.row.orderitmid || ''},
      // props.row.orderitmid as string,
      {
        customError: "Failed to Remove Discount.",
        customSuccess: `${
          props.discountOrder[props.index]
            .find(f => f.recid?.toString() === recid)?.discde
        }: Discount Removed.`,
      }
    );
  };

  return (
    <>
      {props.discountOrder[props.index] && 
      props.discountOrder[props.index].map(d => (
        <TableRow>
          <TableCell colSpan={5} padding="checkbox">
            <div className="flex justify-between items-center mx-10">
              <p
                className="ml-10"
                onClick={() => console.log(props.discountOrder)}
              >
                {/* Discount : {props.discountOrder[props.index].discde} */}
                Discount : {d.discde}
              </p>
              {!props.removeX && (
                <IconButton
                  onClick={() => {
                    onDeleteClick(d.recid?.toString() || '', d.discde);
                  }}
                >
                  <CloseOutlined className=" text-[0.7rem]" />
                </IconButton>
              )}
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
