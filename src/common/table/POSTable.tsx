/* eslint-disable @typescript-eslint/no-explicit-any */
import {EyeOutlined, EditFilled, DeleteFilled} from "@ant-design/icons";
import {Box, IconButton} from "@mui/material";
import MaterialReactTable, {MRT_ColumnDef} from "material-react-table";
import {UserAccessActions, useUserAccessHook} from "../../hooks/userAccessHook";
import {useMemo} from "react";
import { useTheme } from "../../hooks/theme";

interface POSTableProps<T> {
  tableData: T[];
  tableSearchPlaceholder: string;
  columns: MRT_ColumnDef<any>[];
  columnFilters: any;
  sorting: any;
  setSearch: (search: string) => void;
  setPagination: React.Dispatch<React.SetStateAction<any>>;
  setColumnFilters: React.Dispatch<React.SetStateAction<any>>;
  setSorting: React.Dispatch<React.SetStateAction<any>>;
  pagination: any;
  isFetching: boolean;
  row: number;
  pageCount: number;
  onClick?: (row: any) => void;
  onDeleteConfirm?: (row: any) => void;
  isCentralConnected?: boolean;
  renderRowActions?: (row: any) => JSX.Element;
  topAdjust?: string;
}

export function POSTable<T>(props: POSTableProps<T>) {
  const {hasActionAccess} = useUserAccessHook();
  const { theme, EyeOutlineStyled } = useTheme();

  const cols = useMemo<MRT_ColumnDef<any>[]>(
    () => props.columns.map((col) => ({...col, header: col.header || ""})),
    []
  );

  return (
    <>
      <div
        className={`w-[90%] h-[70vh] top-[${
          props.topAdjust || "4rem"
        }] overflow-auto relative justify-items-center mx-auto`}
      >
        <MaterialReactTable
          columns={cols}
          data={props.tableData}
          enableColumnOrdering
          enablePagination={true} //disable a default feature
          manualPagination={true}
          rowCount={props.row}
          pageCount={props.pageCount}
          onGlobalFilterChange={props.setSearch}
          onPaginationChange={props.setPagination}
          onColumnFiltersChange={props.setColumnFilters}
          onSortingChange={props.setSorting}
          muiSearchTextFieldProps={{
            placeholder: props.tableSearchPlaceholder,
          }}
          // onRowSelectionChange={setRowSelection} //hoist internal state to your own state (optional)
          state={{
            pagination: props.pagination,
            showProgressBars: props.isFetching,
            columnFilters: props.columnFilters,
            sorting: props.sorting,
          }} //manage your own state, pass it back to the table (optional)
          // tableInstanceRef={tableInstanceRef} //get a reference to the underlying table instance (optional)enableRowActions
          enableRowActions={
            hasActionAccess(UserAccessActions.EDIT) ||
            hasActionAccess(UserAccessActions.DELETE)
          }
          renderRowActions={
            props.renderRowActions
              ? props.renderRowActions
              : ({row}) => (
                  <Box>
                    {props.isCentralConnected ? (
                      <IconButton
                        onClick={() => props.onClick && props.onClick(row)}
                        color="secondary"
                      >
                        <EyeOutlineStyled $color={theme.primarycolor}>
                          <EyeOutlined />
                        </EyeOutlineStyled>
                      </IconButton>
                    ) : (
                      <>
                        {hasActionAccess(UserAccessActions.EDIT) && (
                          <IconButton
                            onClick={() => props.onClick && props.onClick(row)}
                            color="secondary"
                          >
                            <EditFilled className=" text-green-300" />
                          </IconButton>
                        )}
                        {hasActionAccess(UserAccessActions.DELETE) && (
                          <IconButton
                            onClick={() =>
                              props.onDeleteConfirm &&
                              props.onDeleteConfirm(row)
                            }
                            color="error"
                          >
                            <DeleteFilled className=" text-red-300" />
                          </IconButton>
                        )}
                      </>
                    )}
                  </Box>
                )
          }
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
              backgroundColor: theme.primarycolor,
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
