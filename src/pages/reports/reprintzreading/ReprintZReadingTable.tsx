import MaterialReactTable, { MRT_ColumnDef } from "material-react-table";
import { Box } from "@mui/system";
import { useEffect, useMemo, useRef } from "react";
import { PrinterFilled } from "@ant-design/icons";
import { ZReadingReprintModel } from "../../../models/zreadingreprint";
import { Spin } from "antd";
import { useTheme } from "../../../hooks/theme";

interface ReprintZReadingTableProps {
  tableData: ZReadingReprintModel[];
  setSearch: (search: string) => void;
  onReprint: (row: ZReadingReprintModel) => void;
  noMoreData: boolean;
  onLoadMoreData: () => void;
}

export function ReprintZReadingTable(props: ReprintZReadingTableProps) {
  const { tableData, onReprint} = props;
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { ButtonStyled, theme } = useTheme();

  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    if (tableContainer === null) return;

    tableContainer.addEventListener('scroll', handleScroll);

    return () => {
      tableContainer.removeEventListener('scroll', handleScroll);
    }
  }, [])

  /**
   * Use to handle lazy loading of the data due to the fact
   * that reprint zreading will contain huge amount of data
   */
  const handleScroll = () => {
    const tableContainer = tableContainerRef.current;
    if (tableContainer === null) return;

    const scrollTop = tableContainer.scrollTop;
    const clientHeight = tableContainer.clientHeight;
    const scrollHeight = tableContainer.scrollHeight;

    if (scrollTop + clientHeight >= scrollHeight) {
      props.onLoadMoreData();
    }
  }

  const columns = useMemo<MRT_ColumnDef<ZReadingReprintModel>[]>(
    () => [
      {
        accessorKey: "batchnum",
        id: "batchnum", // Make sure to include the 'id' property
        header: "Batch Number",
      },
      {
        accessorKey: "fromDateTime",
        id: "fromDateTime", // Make sure to include the 'id' property
        header: "Date & Time From",
      },
      {
        accessorKey: "toDateTime",
        id: "toDateTime", // Make sure to include the 'id' property
        header: "Date & Time To",
      },
    ],
    []
  );

  return (
    <>
      <div ref={tableContainerRef} className="h-[90vh] overflow-auto relative justify-items-center mx-auto">
        <MaterialReactTable
          columns={columns}
          data={tableData}
          enableColumnOrdering
          enablePagination={false} //disable a default feature
          manualFiltering
          onGlobalFilterChange={props.setSearch}
          // onRowSelectionChange={setRowSelection} //hoist internal state to your own state (optional)
          // state={{ rowSelection }} //manage your own state, pass it back to the table (optional)
          // tableInstanceRef={tableInstanceRef} //get a reference to the underlying table instance (optional)
          enableRowActions
          muiSearchTextFieldProps={
            {
              placeholder: 'Search Batch Number'
            }
          }
          renderRowActions={({ row }) => (
            <Box marginRight={4}>
              <ButtonStyled $color={theme.primarycolor}
                className="bg-slate-600 text-white hover:bg-slate-400 hover:text-slate-700 active:bg-slate-600 p-2 flex items-center rounded-md"
                onClick={() => onReprint(row.original)}
                color="info"
              >
                <PrinterFilled className="text-lg" />
                <span className="text-sm ms-2">RE-PRINT</span>
              </ButtonStyled>
            </Box>
          )}
          muiTablePaperProps={{
            sx: {
              boxShadow: "none !important",
            },
          }}
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
        />
        {!props.noMoreData && (
          <div className="absolute right-[50%] translate-x-[50%] pt-1 pb-8 flex">
            <Spin className="me-5"/>
            <span className="font-montserrat font-bold text-lg">LOADING....</span>
          </div>
        )}
      </div>
    </>
  );
}
