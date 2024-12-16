import {TableCell, TableRow} from "@mui/material";
import {PosfileModel} from "../../../../models/posfile";
interface ItemComboRowProps {
  row: PosfileModel;
  index: number;
  comboItems: any[];
}

export function ItemComboRow({comboItems, index, row}: ItemComboRowProps) {
  const filteredItemCombo = comboItems.filter(
    (item) =>
      item.itmcomcde === row.itmcde && item.orderitmid === row.orderitmid
  );

  console.log(comboItems[0], index, row.itmcde);

  return (
    <>
      {filteredItemCombo.length > 0 && (
        <TableRow>
          <TableCell colSpan={5} padding="checkbox">
            <div className="flex flex-col mx-10 gap-2 py-3 text">
              {filteredItemCombo.map((item, index) => {
                return (
                  <div
                    key={index}
                    className="flex justify-between text-[10px] items-center"
                  >
                    <p>
                      {item.itmcomtyp === "UPGRADE" && parseInt(item.itmqty)}{" "}
                      {item.itmdsc}
                    </p>
                    {item.itmcomtyp === "UPGRADE" && (
                      <p className="bg-blue-500 text-white rounded p-1 flex items-center">
                        {parseFloat(item.extprc).toFixed(2)} - {item.itmcomtyp}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
