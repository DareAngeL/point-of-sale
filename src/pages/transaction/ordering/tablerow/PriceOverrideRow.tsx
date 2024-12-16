import {IconButton, TableCell, TableRow} from "@mui/material";
import {CloseOutlined} from "@ant-design/icons";
import {PosfileModel} from "../../../../models/posfile";
import {useAppSelector} from "../../../../store/store";
import {useEffect, useState} from "react";
import {useOrdering, useOrderingButtons} from "../hooks/orderingHooks";

interface PriceOverrideRowProps {
  row: PosfileModel;
  removeX?: boolean;
}

export function PriceOverrideRow(props: PriceOverrideRowProps) {
  const {posfiles} = useAppSelector((state) => state.order);
  const {resetPriceOverride} = useOrderingButtons();
  const { hasDiscount } = useOrdering();

  const [addOns, setAddOns] = useState<PosfileModel[]>();

  useEffect(() => {
    const tempAddOns = posfiles.data.filter(
      (d) => d.isaddon && d.mainitmid == props.row.orderitmid
    );

    console.log("add ons", tempAddOns);

    setAddOns(tempAddOns);
    
  }, [posfiles]);

  const onDeleteClick = () => {
    console.log("asd:props", props.row);
    
    if (hasDiscount(props.row.orderitmid)) return
    resetPriceOverride(props.row);

  };

  return (
    <>
      {props.row.changed == 1 &&(
        <TableRow>
          <TableCell colSpan={5} padding="checkbox">
            <div className="flex justify-between items-center mx-10">
              <p className="ml-10" onClick={() => console.log(addOns)}>
                Price Override
              </p>

              {!props.removeX && (
                <IconButton
                  onClick={() => {
                    onDeleteClick();
                  }}
                >
                  <CloseOutlined className=" text-[0.7rem]" />
                </IconButton>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}