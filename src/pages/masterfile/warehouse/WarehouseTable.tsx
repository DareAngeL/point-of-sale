import {useEffect, useMemo, useRef, useState} from "react";
import MaterialReactTable, {MRT_ColumnDef} from "material-react-table";
import {Box} from "@mui/system";
import {IconButton} from "@mui/material";
import {DeleteFilled, EditFilled} from "@ant-design/icons";
import {WarehouseModel} from "../../../models/warehouse";
import {
  UserAccessActions,
  useUserAccessHook,
} from "../../../hooks/userAccessHook";

interface WarehouseTableProps {
  tableData: WarehouseModel[];
  onClick: (row: any) => void;
  // onDelete: (row: any) => void;
  onDeleteConfirm: (row: any) => void;
  isCentralConnected: boolean;
}

export function WarehouseTable(props: WarehouseTableProps) {
  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "wardsc",
        id: "wardsc", // Make sure to include the 'id' property
        header: "Warehouse",
      },
    ],
    []
  );

  const {hasActionAccess} = useUserAccessHook();

  //optionally, you can manage any/all of the table state yourself
  const [rowSelection, setRowSelection] = useState({});

  useEffect(() => {
    //do something when the row selection changes
    console.log("row selectionsss");
  }, [rowSelection]);

  //Or, optionally, you can get a reference to the underlying table instance
  const tableInstanceRef = useRef(null);

  return (
    <>
      <div className="w-[90%] h-[70vh] top-[4rem] overflow-auto relative justify-items-center mx-auto">
        <MaterialReactTable
          columns={columns}
          data={props.tableData}
          enableColumnOrdering
          enablePagination={true} //disable a default feature
          onRowSelectionChange={setRowSelection} //hoist internal state to your own state (optional)
          state={{rowSelection}} //manage your own state, pass it back to the table (optional)
          tableInstanceRef={tableInstanceRef} //get a reference to the underlying table instance (optional)
          enableRowActions={
            hasActionAccess(UserAccessActions.EDIT) ||
            hasActionAccess(UserAccessActions.DELETE)
          }
          renderRowActions={({row}) => (
            <Box>
              {hasActionAccess(UserAccessActions.EDIT) && (
                <IconButton
                  onClick={() => props.onClick(row)}
                  color="secondary"
                >
                  <EditFilled className=" text-green-300" />
                </IconButton>
              )}
              {!props.isCentralConnected &&
                hasActionAccess(UserAccessActions.DELETE) && (
                  <IconButton
                    onClick={() => props.onDeleteConfirm(row)}
                    // onClick={() => props.onDelete(row)}
                    color="error"
                  >
                    <DeleteFilled className=" text-red-300" />
                  </IconButton>
                )}
            </Box>
          )}
          muiTableHeadCellFilterCheckboxProps={{
            sx: {
              color: "white",
            },
          }}
          muiTableHeadCellColumnActionsButtonProps={{
            sx: {
              color: "white",
            },
          }}
          muiTableHeadCellDragHandleProps={{
            sx: {
              color: "#fff",
            },
          }}
          muiTableHeadCellFilterTextFieldProps={{
            sx: {
              color: "#fff",
              backgroundColor: "#fff",
              borderRadius: "5px",
              padding: "6px",
              margin: "5px",
              textDecoration: "none",
              display: "inline-block",
            },
          }}
          muiTableHeadCellProps={{
            sx: {
              backgroundColor: "rgb(51 65 85)",
              color: "#fff",
              "& .MuiTableSortLabel-icon": {
                color: "#ddd !important",
                margin: "5px",
              },
            },
          }}
          muiTableBodyRowProps={({}) => ({
            sx: {
              cursor: "pointer",
            },
          })}
        />
      </div>
    </>
  );
}
