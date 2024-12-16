import {IconButton, TableCell, TableRow} from "@mui/material";
import {CloseOutlined} from "@ant-design/icons";
import {PosfileModel} from "../../../../models/posfile";
import {useAppDispatch, useAppSelector} from "../../../../store/store";
import {useEffect, useState} from "react";
import {priceListGenerator, useOrderingService} from "../hooks/orderingHooks";
import {OrderingModel} from "../model/OrderingModel";
import {PricelistModel} from "../../../../models/pricelist";
import {setSelectedOrder} from "../../../../reducer/orderingSlice";
import { getTotal, getPosfiles, getServiceCharge } from "../../../../store/actions/posfile.action";

interface FreeItemRowProps {
  row: PosfileModel;
  removeX?: boolean;
}

export function FreeItemRow(props: FreeItemRowProps) {
  const {priceList, warehouse} = useAppSelector((state) => state.masterfile);
  const {transaction} = useAppSelector((state) => state.order);
  const [generatedPricelist, setGeneratedPricelist] =
    useState<PricelistModel>();
  const {postTransaction} = useOrderingService<PosfileModel>("posfile");

  const dispatch = useAppDispatch();

  useEffect(() => {
    const load = async () => {
      setGeneratedPricelist(
        await priceListGenerator(
          warehouse.data,
          priceList.data,
          transaction.data as OrderingModel
        )
      ); 
    }

    load();
  }, []);

  const onDeleteFreeItem = () => {
    console.log(priceList);
    console.log(transaction);
    console.log(generatedPricelist);

    const origItemPrice = generatedPricelist?.pricecodefile2s.find(
      (d) => d.itmcde == props.row.itmcde
    );

    const origPrice = origItemPrice?.untprc;
    const freeItemTemplate = {
      ...props.row,
      freereason: null,
      groprc: origPrice,
      grossprc: origPrice,
      groext: origPrice,
      extprc: origPrice,
      amtdis: 0,
      untprc: origPrice,
    } as PosfileModel;

    postTransaction(
      freeItemTemplate,
      (data) => {
        console.log("eyyx", data);
        dispatch(getTotal(""));
        dispatch(getPosfiles(transaction.data?.ordercde));
        dispatch(getServiceCharge(transaction?.data?.ordercde || ""));
        dispatch(setSelectedOrder(data));
      },
      undefined,
      {
        customError: `Failed to Remove Free Item.`,
        customSuccess: `Free Item Removed.`,
      }
    );
  };

  return (
    <>
      <TableRow>
        <TableCell colSpan={5} padding="checkbox">
          <div className="flex justify-between items-center mx-10">
            <p className="ml-10">Free Item : {props.row.freereason}</p>
            {!props.removeX && (
              <IconButton onClick={() => onDeleteFreeItem()}>
                <CloseOutlined className=" text-[0.7rem]" />
              </IconButton>
            )}
          </div>
        </TableCell>
      </TableRow>
    </>
  );
}
