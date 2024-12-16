import {AddButton} from "../../../common/addbutton/AddButton";
import {BackButton} from "../../../common/backbutton/BackButton";
import {PrinterButton} from "../../../common/printerbutton/PrinterButton";
import {PageTitle} from "../../../common/title/MasterfileTitle";
import {dateNowFormatted} from "../../../helper/Date";
import {useServiceMasterfile} from "../../../hooks/masterfileHooks";
import {DiscountModel} from "../../../models/discount";
import {useAppSelector} from "../../../store/store";
import {useState} from "react";
import {useFormInputValidation} from "../../../hooks/inputValidation";
import {MODULES} from "../../../enums/activitylogs";
import {useUserActivityLog} from "../../../hooks/useractivitylogHooks";
import {roundDecimalPlaces} from "../../../helper/FileConversion";
import {useCentral} from "../../../hooks/centralHooks";
import {CentralNote} from "../../../common/centralnote/CentralNote";
import {useTablePagination} from "../../../hooks/pagination";
import {POSTable} from "../../../common/table/POSTable";
import {Box, IconButton} from "@mui/material";
import {
  UserAccessActions,
  useUserAccessHook,
} from "../../../hooks/userAccessHook";
import {DeleteFilled, EditFilled, EyeOutlined} from "@ant-design/icons";
import { DiscountDeleteModal } from "./modals/DiscountDeleteModal";
import { DiscountModal } from "./modals/DiscountModal";
import { useDiscountInitialization } from "./hooks/initialization";
import { useTheme } from "../../../hooks/theme";

export interface DiscountFormRequiredValues {
  "Discount Code *": string;
  "Discount Description *": string;
  "Type *": string;
}

export enum DiscountRequiredFields {
  discde = "discde",
  disdsc = "disdsc",
  distyp = "distyp",
}

export function Discount() {
  const {
    onSubmit,
    onDelete,
    onOpenModal,
    onChangeData,
    singleData: discountModalData,
    allLoadedData,
    setAllLoadedData,
    setSingleData,
  } = useServiceMasterfile<DiscountModel>("discount");

  const {
    handleSubmit,
    registerInputs,
    unregisterInputs,
    changeRequiredValue,
    clearErrors,
    errors,
  } = useFormInputValidation<DiscountFormRequiredValues>();

  const {
    pagination,
    columnFilters,
    sorting,
    setPagination,
    setSearch,
    setColumnFilters,
    setSorting,
    isFetching,
    rows,
    pageCount,
  } = useTablePagination<DiscountModel>(setAllLoadedData, "discount");

  const { EyeOutlineStyled, theme } = useTheme();

  const {isCentralConnected, checkLinkInputsCentral} = useCentral();

  const company = useAppSelector((state) => state.masterfile.company);
  const { printAction } = useUserActivityLog();
  const [deleteData, setDeleteData] = useState<any>();
  
  const [status, setStatus] = useState<any>("");
  const [editCopy, setEditCopy] = useState<any>([]);
  const [originalGovDiscHolder, setOriginalGovDiscHolder] = useState<any>();

  const modalName = useAppSelector((state) => state.modal.modalName);
  const {hasActionAccess} = useUserAccessHook();

  useDiscountInitialization(
    discountModalData,
    setSingleData,
    editCopy,
    setEditCopy,
    checkLinkInputsCentral,
    registerInputs,
    unregisterInputs,
    setOriginalGovDiscHolder
  );

  const onDeleteConfirm = (row: any) => {
    setDeleteData(row);
    onOpenModal("Delete Confirmation");
  };

  return (
    <>
      {modalName === "Delete Confirmation" ? (
        <DiscountDeleteModal
          deleteData={deleteData}
          onDelete={onDelete}
        />
      ) : (
        <DiscountModal
          onSubmit={onSubmit}
          onChangeData={onChangeData}
          status={status}
          singleData={discountModalData}
          setSingleData={setSingleData}
          originalGovDiscHolder={originalGovDiscHolder}
          editCopy={editCopy} 
          isCentralConnected={isCentralConnected} 
          changeRequiredValue={changeRequiredValue}
          clearErrors={clearErrors} 
          handleSubmit={handleSubmit} 
          errors={errors}
          />
      )}

      <section className="h-screen w-full relative">
        {isCentralConnected.current ? (
          <CentralNote description="Discount" />
        ) : (
          <AddButton
            onClick={() => {
              onOpenModal("Add Discount");
              setStatus("CREATE");
            }}
          />
        )}

        <div className="bg-white flex justify-between items-center fixed w-[95%] z-10 left-[3%] top-[1rem]">
          <div className="flex items-center">
            <BackButton />
            <PageTitle name={"Discounts"} />
          </div>

          <div className="flex items-center">
            <PrinterButton
              otherOnClick={() => {
                printAction(MODULES.DISCOUNTS);
              }}
              printoutData={{
                companyName: company.data[0] && company.data[0].comdsc,
                title: "Discount Masterfile",
                date: dateNowFormatted(),
                headers: {
                  discde: {
                    header: "Code",
                    id: "discde",
                  },
                  disdsc: {
                    header: "Description",
                    id: "disdsc",
                  },
                  distyp: {
                    header: "Type",
                    id: "distyp",
                  },
                  disamt: {
                    header: "Amount",
                    id: "disamt",
                  },
                  disper: {
                    header: "Percentage",
                    id: "disper",
                  },
                },
                data: roundDecimalPlaces(allLoadedData, ["disamt", "disper"]),
              }}
            />
          </div>
        </div>

        <POSTable<DiscountModel>
          columns={[
            {
              accessorKey: "disdsc",
              id: "disdsc", // Make sure to include the 'id' property
              header: "Description",
            },
          ]}
          tableSearchPlaceholder="Search Discount"
          isCentralConnected={isCentralConnected.current}
          setColumnFilters={setColumnFilters}
          setSorting={setSorting}
          columnFilters={columnFilters}
          sorting={sorting}
          tableData={allLoadedData}
          onDeleteConfirm={onDeleteConfirm}
          isFetching={isFetching}
          setSearch={setSearch}
          setPagination={setPagination}
          pagination={pagination}
          row={rows}
          pageCount={pageCount}
          renderRowActions={({row}) => (
            <Box>
              {isCentralConnected.current && (
                <IconButton
                  onClick={() => {
                    onOpenModal(row.original.disdsc);
                    setSingleData(row.original);
                    setStatus("UPDATE");
                    setEditCopy(discountModalData);
                  }}
                  color="secondary"
                >
                  <EyeOutlineStyled $color={theme.primarycolor}>
                    <EyeOutlined />
                  </EyeOutlineStyled>
                </IconButton>
              )}
              {row.original.discde.toLowerCase() === "placeholderxxx"
                ? ""
                : !isCentralConnected.current &&
                  hasActionAccess(UserAccessActions.EDIT) && (
                    <IconButton
                      onClick={() => {
                        onOpenModal("Edit Discount");
                        setSingleData(row.original);
                        setStatus("UPDATE");
                        setEditCopy(discountModalData);
                      }}
                      color="secondary"
                    >
                      <EditFilled className=" text-green-300" />
                    </IconButton>
                  )}

              {row.original.discde.toLowerCase() === "senior" ||
              row.original.discde.toLowerCase() === "pwd" ||
              row.original.discde.toLowerCase() === "mov" ||
              row.original.discde.toLowerCase() === "diplomat" ||
              row.original.discde.toLowerCase() === "athlete"
                ? ""
                : !isCentralConnected.current &&
                  hasActionAccess(UserAccessActions.DELETE) && (
                    <IconButton
                      onClick={() => {
                        onDeleteConfirm(row);
                      }}
                      color="error"
                    >
                      <DeleteFilled className=" text-red-300" />
                    </IconButton>
                  )}
            </Box>
          )}
        />
      </section>
    </>
  );
}
