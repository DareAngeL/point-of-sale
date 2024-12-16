// interface ViewSentFilesProp {
//   data: any;
// }

import MaterialReactTable, { MRT_ColumnDef } from "material-react-table";
import moment from "moment";
import { useMemo, useState } from "react";
import { useLoaderData } from "react-router";

interface ViewFiles {
  filename: string;
  salesdte: string;
  datesent: string;
}

export function ViewSentFiles() {
  const data = useLoaderData() as any;
  const [viewFileData] = useState<ViewFiles[]>(
    data?.data.map((file: ViewFiles) => ({
      ...file,
      salesdte: moment(file.salesdte).format("YYYY-MM-DD"),
      datesent: moment(file.datesent).format("YYYY-MM-DD"),
    }))
  );

  // const mockData: ViewFiles[] = [
  //   {name: "Karl", path: "path/to/destination"},
  //   {name: "Vienn", path: "destination/path"}
  // ]

  const columns = useMemo<MRT_ColumnDef<ViewFiles>[]>(
    () => [
      {
        accessorKey: "filename",
        id: "filename",
        header: "File Name",
      },
      {
        accessorKey: "salesdte",
        id: "salesdte", // Make sure to include the 'id' property
        header: "Sales Date",
      },
      {
        accessorKey: "datesent",
        id: "datesent",
        header: "Date Sent",
      },
    ],
    []
  );

  const [rowSelection, setRowSelection] = useState({});

  return (
    <>
      <MaterialReactTable
        columns={columns}
        data={viewFileData}
        enableColumnOrdering
        enablePagination={true} //disable a default feature
        onRowSelectionChange={setRowSelection} //hoist internal state to your own state (optional)
        state={{ rowSelection }} //manage your own state, pass it back to the table (optional)
        // tableInstanceRef={tableInstanceRef} //get a reference to the underlying table instance (optional)
        // enableRowActions={
        //   hasActionAccess(UserAccessActions.EDIT) ||
        //   hasActionAccess(UserAccessActions.DELETE)
        // }
        // renderRowActions={({row}) => (
        //   <Box>
        //     {hasActionAccess(UserAccessActions.EDIT) && (
        //       <IconButton
        //         onClick={() => props.onClick(row)}
        //         color="secondary"
        //       >
        //         <EditFilled className=" text-green-300" />
        //       </IconButton>
        //     )}
        //     {hasActionAccess(UserAccessActions.DELETE) && (
        //       <IconButton
        //         onClick={() => props.onDeleteConfirm(row)}
        //         color="error"
        //       >
        //         <DeleteFilled className=" text-red-300" />
        //       </IconButton>
        //     )}
        //   </Box>
        // )}
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
    </>
  );
}
