import {IconButton, TableCell, TableRow} from "@mui/material";
import {CloseOutlined} from "@ant-design/icons";
import {PosfileModel} from "../../../../models/posfile";
import {useAppDispatch, useAppSelector} from "../../../../store/store";
import {useEffect, useState} from "react";
import {useOrdering} from "../hooks/orderingHooks";
import { getLessVatAdj, getPosfiles, getTotal } from "../../../../store/actions/posfile.action";

interface AddOnRowProps {
  row: PosfileModel;
  setAddOnItem: (updatedDiscountOrder: (PosfileModel | null)[]) => void;
  removeX?: boolean;
}

export function AddOnRow(props: AddOnRowProps) {
  const dispatch = useAppDispatch();
  const {posfiles, transaction} = useAppSelector((state) => state.order);

  const {onDeleteTransaction} = useOrdering();

  const [addOns, setAddOns] = useState<PosfileModel[]>();

  useEffect(() => {
    const tempAddOns = posfiles.data.filter(
      (d) => d.isaddon && d.mainitmid == props.row.orderitmid
    );

    console.log("add ons", tempAddOns);

    setAddOns(tempAddOns);
  }, [posfiles]);

  const onDeleteClick = (recid: string) => {
    console.log(recid);

    onDeleteTransaction(
      recid,
      () => {
        dispatch(getPosfiles(transaction.data?.ordercde));
        dispatch(getTotal(""));
        dispatch(getLessVatAdj(""));
      },
      {
        customError: `Add ons Failed to Removed.`,
        customSuccess: `Add ons Removed.`,
      }
    );
  };

  return (
    <>
      {addOns?.map((addOn) => (
        <TableRow>
          <TableCell colSpan={5} padding="checkbox">
            <div className="flex justify-between items-center mx-10">
              <p className="ml-10" onClick={() => console.log(addOns)}>
                Add on : {addOn.itmdsc}
              </p>
              {!props.removeX && (
                <IconButton
                  onClick={() => {
                    onDeleteClick(addOn.recid + "");
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
