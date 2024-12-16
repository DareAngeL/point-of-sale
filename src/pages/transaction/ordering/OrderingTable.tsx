import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {useAppDispatch, useAppSelector} from "../../../store/store";
import Paper from "@mui/material/Paper";
import {memo, useEffect, useState} from "react";
import {setSelectedOrder} from "../../../reducer/orderingSlice";
import {ExpandingOrderingTable} from "./ExpandingOrderingTable";
import {SpecialRequestDetailModel} from "../../../models/specialrequest";
import {SpecialRequestRow} from "./tablerow/SpecialRequestRow";
import {DiscountOrderModel} from "../../../models/discount";
import {DiscountRow} from "./tablerow/DiscountRow";
import {numberPadFormatter} from "../../../helper/NumberFormat";
import {FreeItemRow} from "./tablerow/FreeItemRow";
import {AddOnRow} from "./tablerow/AddOnRow";
import {PosfileModel} from "../../../models/posfile";
import {ItemComboRow} from "./tablerow/ItemComboRow";
import {PriceOverrideRow} from "./tablerow/PriceOverrideRow";
import { filterPosfiles } from "../../../helper/transaction";

interface OrderingTableInterface {
  columns?: Array<'qty'|'itm_desc'|'order_type'|'price'>;
  forDisplay?: boolean;
}

function OrderingTableComponent(props: OrderingTableInterface) {
  const {
    masterfile,
    order,
    // transaction
  } = useAppSelector((state) => state);
  const {/*item*/ syspar} = masterfile;
  const {posfiles, selectedOrder} = order;
  const isDisableDInTOut = syspar.data[0] ? syspar.data[0].no_dineout : false;
  const dispatch = useAppDispatch();

  const [filteredSpecialRequests, setFilteredSpecialRequests] = useState<
    SpecialRequestDetailModel[][]
  >([]);

  const [discountOrder, setDiscountOrder] = useState<
    (DiscountOrderModel | null)[][]
  >([]);

  console.log("selOrder", selectedOrder.data);

  const [addOnItems, setAddOnItems] = useState<(PosfileModel | null)[]>([]);
  const [comboItems, setComboItems] = useState<(PosfileModel | null)[]>([]);

  const [filteredPosfile, setFilteredPosfile] = useState<PosfileModel[]>([]);

  useEffect(() => {
    const load = async () => {

      setFilteredPosfile(await filterPosfiles(posfiles?.data));

      const filterHasCombo = posfiles?.data.filter(
        (item) => item.itmcomcde !== null
      );
      setComboItems(filterHasCombo);
    };

    load();
  }, [posfiles]);

  const rowOnClick = async (row: any) => {
    console.log(discountOrder);

    if (selectedOrder.data?.recid == row.recid) {
      dispatch(setSelectedOrder(null));
      return;
    }

    dispatch(setSelectedOrder(row));
  };


  console.log("asd:", filteredPosfile);
  

  return (
    <>
      <section className="h-[94%] overflow-y-scroll px-2">
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
                <TableCell padding="checkbox" />
                {props.columns ? (
                  <>
                    {props.columns.includes('qty') && <TableCell align="center">Qty</TableCell>}
                    {props.columns.includes('itm_desc') && <TableCell align="center">Item Name</TableCell>}
                    {(props.columns.includes('order_type') && isDisableDInTOut === 0) && (
                      <TableCell align="center">Order Type</TableCell>
                    )}
                    {props.columns.includes('price') && <TableCell align="center">Price</TableCell>}
                  </>
                ) : (
                  <>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Item Name</TableCell>
                    {isDisableDInTOut === 0 && (
                      <TableCell align="right">Order Type</TableCell>
                    )}
                    <TableCell align="right">Price</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody className="bg-slate-100">
              {filteredPosfile.map((row, index) => (
                <>
                  <ExpandingOrderingTable
                    showFlag={
                      (filteredSpecialRequests.length != 0 &&
                        filteredSpecialRequests[index] &&
                        filteredSpecialRequests[index].length > 0) ||
                      discountOrder[index] != undefined ||
                      addOnItems.length != 0
                    }
                    expandedComponent={
                      <>
                        <ItemComboRow
                          row={row}
                          index={index}
                          comboItems={comboItems}
                        />

                        <PriceOverrideRow 
                          row={row} 
                          removeX={props.forDisplay} 
                        />

                        <DiscountRow
                          row={row}
                          index={index}
                          removeX={props.forDisplay}
                          setDiscountOrder={setDiscountOrder}
                          discountOrder={discountOrder as DiscountOrderModel[][]}
                        />

                        <SpecialRequestRow
                          filteredSpecialRequests={filteredSpecialRequests}
                          index={index}
                          setFilteredSpecialRequests={
                            setFilteredSpecialRequests
                          }
                          removeX={props.forDisplay}
                        />

                        {row.freereason && <FreeItemRow row={row} removeX={props.forDisplay} />}

                        <AddOnRow row={row} setAddOnItem={setAddOnItems} removeX={props.forDisplay} />
                      </>
                    }
                    onClick={() => rowOnClick(row)}
                    key={row.recid}
                    sx={{
                      "&:last-child td, &:last-child th": {border: 0},
                      "&:hover": {backgroundColor: "#9EDDFF"},
                    }}
                    style={selectedOrder.data?.recid == row.recid}
                  >
                    {props.columns ? (
                      <>
                        {props.columns.includes('qty') && <TableCell align="center">
                          {numberPadFormatter(row.itmqty, 0)}
                        </TableCell>}
                        {props.columns.includes('itm_desc') && <TableCell align="center">{row.itmdsc}</TableCell>}
                        {(props.columns.includes('order_type') && isDisableDInTOut === 0) && (
                          <TableCell align="center">
                            {row.ordertyp == "DINEIN" ? "D" : "T"}
                          </TableCell>
                        )}
                        {props.columns.includes('price') && <TableCell align="center">
                          {numberPadFormatter(row?.extprc, 2)}
                        </TableCell>}
                      </>  
                    ) : (
                      <>
                        <TableCell align="right">
                          {numberPadFormatter(row.itmqty, 0)}
                        </TableCell>
                        <TableCell align="right">{row.itmdsc}</TableCell>
                        {isDisableDInTOut === 0 && (
                          <TableCell align="right">
                            {row.ordertyp == "DINEIN" ? "D" : "T"}
                          </TableCell>
                        )}
                        <TableCell align="right">
                          {numberPadFormatter(row?.extprc, 2)}
                        </TableCell>
                      </>
                    )}
                  </ExpandingOrderingTable>
                </>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </section>
    </>
  );
}

const OrderingTable = memo(OrderingTableComponent);
export default OrderingTable;