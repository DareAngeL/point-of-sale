/* eslint-disable @typescript-eslint/no-explicit-any */
import { BackButton } from "../../../common/backbutton/BackButton";
import { ItemModel } from "../../../models/items";
import { useAppSelector } from "../../../store/store";
import { AddButton } from "../../../common/addbutton/AddButton";
import { useCallback, useState } from "react";
import { dateNowFormatted } from "../../../helper/Date";
import { PageTitle } from "../../../common/title/MasterfileTitle";
import { PrinterButton } from "../../../common/printerbutton/PrinterButton";
import { useChangeNameModal, useModal } from "../../../hooks/modalHooks";
import { useFormInputValidation } from "../../../hooks/inputValidation";
import { MODULES } from "../../../enums/activitylogs";
import { useUserActivityLog } from "../../../hooks/useractivitylogHooks";
import { useCentral } from "../../../hooks/centralHooks";
import { CentralNote } from "../../../common/centralnote/CentralNote";
import { roundDecimalPlaces } from "../../../helper/FileConversion";
import { useTablePagination } from "../../../hooks/pagination";
import { POSTable } from "../../../common/table/POSTable";
import { AuthenticationGuard } from "../../../security/authentication/AuthGuards";
import { formatNumberWithCommasAndDecimals } from "../../../helper/NumberFormat";
import { useAllLoadedData } from "../../../hooks/serviceHooks";
import { ItemsModal } from "./modals/ItemsModal";
import { useItemsInitialization } from "./hooks/initialization";
import { DeleteItemModal } from "./modals/DeleteItemModal";

interface ItemFormRequiredValues {
  "Item *": string;
  "Item Type *": string;
  "Item Classification *": string;
  "Item Subclassification *": string;
  "Selling Price *": string;
  "Tax Code *": string;
}

export enum ItemFormRequiredFields {
  itmdsc = "itmdsc",
  itmtyp = "itmtyp",
  itmclacde = "itmclacde",
  itemsubclasscde = "itemsubclasscde",
  untprc = "untprc",
  taxcde = "taxcde",
}

export function Item() {
  const [itemModalData, setItemModalData] = useState<ItemModel>();
  const [activeItemEdit, setActiveItemEdit] = useState<ItemModel | undefined>();
  const [deleteData, setDeleteData] = useState<any>();
  const [status, setStatus] = useState<any>("");
  const [editCopy, setEditCopy] = useState<any>([]);

  const { allLoadedData, setAllLoadedData } = useAllLoadedData<ItemModel>();
  const { modalNameDispatch, modalName } = useChangeNameModal();
  const { dispatch: dispatchModal } = useModal();
  const { printAction } = useUserActivityLog();

  const {
    handleSubmit,
    registerInputs,
    unregisterInputs,
    errors,
    clearErrors,
    changeRequiredValue,
  } = useFormInputValidation<ItemFormRequiredValues>();

  const { isCentralConnected } = useCentral();

  const { company, itemClassification, itemSubclassification } = useAppSelector(
    (state) => state.masterfile
  );

  const [itemDisplay, setItemDisplay] = useState<any>([]);

  const itemClassFinder = (itmclacde: string) =>
    itemClassification.data.find((d) => d.itmclacde == itmclacde)?.itmcladsc;
  const subItemClassFinder = (itemsubclasscde: string) =>
    itemSubclassification.data.find((d) => d.itemsubclasscde == itemsubclasscde)
      ?.itemsubclassdsc;

  const fixedallLoadedData = useCallback(() => {
    return allLoadedData.map((item: any) => {
      const updatedItmclacde = itemClassFinder(item.itmclacde);
      const updatedSubclasscde = subItemClassFinder(item.itemsubclasscde);
      return {
        ...item,
        untprc: formatNumberWithCommasAndDecimals(
          item.untprc.replace(",", ""),
          2
        ),
        itmcladsc: updatedItmclacde,
        itemsubclassdsc: updatedSubclasscde,
      };
    });
  }, [allLoadedData]);

  useItemsInitialization(
    itemModalData,
    registerInputs,
    unregisterInputs,
    allLoadedData,
    itemClassification,
    itemSubclassification,
    setItemDisplay,
    setItemModalData,
    editCopy,
    setEditCopy
  );

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
  } = useTablePagination<ItemModel>(setAllLoadedData, "item");

  const round2Decimal = useCallback(
    () => roundDecimalPlaces(itemDisplay, ["untprc", "untcst"]),
    [itemDisplay]
  );

  const onDeleteConfirm = (row: any) => {
    setDeleteData(row);
    modalNameDispatch("Delete Confirmation");
    dispatchModal();
  };

  const renderModals = () => {
    switch (modalName) {
      case "Delete Confirmation":
        return <DeleteItemModal deleteData={deleteData} setAllLoadedData={setAllLoadedData} />;
      default:
        return (
          <ItemsModal
            setAllLoadedData={setAllLoadedData}
            itemModalData={itemModalData}
            allLoadedData={allLoadedData}
            inputValidation={{
              handleSubmit,
              registerInputs,
              unregisterInputs,
              errors,
              clearErrors,
              changeRequiredValue,
            }}
            isCentralConnected={isCentralConnected}
            setItemModalData={setItemModalData}
            editCopy={editCopy}
            status={status}
            activeItemEdit={activeItemEdit}
            setActiveItemEdit={setActiveItemEdit}
          />
        );
    }
  };

  return (
    <>
      <AuthenticationGuard
        redirectTo="/pages/masterfile"
        toastMsg="Please add Item Classification / Item Subclassification first"
        condition={
          itemClassification.data.length !== 0 &&
          itemSubclassification.data.length !== 0
        }
      >
        {renderModals()}
        <section className="h-screen w-full relative">
          {!isCentralConnected.current ? (
            <AddButton
              onClick={() => {
                // onOpenModal("Create new item");
                modalNameDispatch("Add Item");
                dispatchModal();
                setStatus("CREATE");
              }}
            />
          ) : (
            <CentralNote description={"Items"} />
          )}

          <div className="bg-white flex justify-between items-center fixed w-[95%] z-10 left-[3%] top-[1rem]">
            <div className="flex items-center">
              <BackButton />
              <PageTitle name={"Items"} />
            </div>

            <div className="flex items-center">
              <PrinterButton
                otherOnClick={() => {
                  printAction(MODULES.ITEMS);
                  console.log();
                }}
                orientation="landscape"
                printoutData={{
                  companyName: company.data[0].comdsc,
                  title: "Item Masterfile",
                  date: dateNowFormatted(),
                  headers: {
                    itmdsc: {
                      header: "Description",
                      id: "itmdsc",
                    },
                    itmcladsc: {
                      header: "Item Classification",
                      id: "itmcladsc",
                    },
                    itemsubclassdsc: {
                      header: "Item Subclassification",
                      id: "itemsubclassdsc",
                    },
                    untmea: {
                      header: "U/M",
                      id: "untmea",
                    },
                    untcst: {
                      header: "Unit Cost",
                      id: "untcst",
                    },
                    untprc: {
                      header: "Price",
                      id: "untprc",
                    },
                  },
                  data: round2Decimal(),
                }}
              />
            </div>
          </div>

          <POSTable<ItemModel>
            onClick={(row) => {
              modalNameDispatch("Edit Item");
              setItemModalData(row.original);
              setStatus("UPDATE");
              setEditCopy(itemModalData);

              setActiveItemEdit(row.original);
              dispatchModal();
            }}
            columns={[
              {
                accessorKey: "itmdsc",
                header: "Item",
              },
              {
                accessorKey: "itmcladsc",
                id: "itmcladsc", // Make sure to include the 'id' property
                header: "Item Class",
              },
              {
                accessorKey: "itemsubclassdsc",
                id: "itemsubclassdsc", // Make sure to include the 'id' property
                header: "Item Subclass",
              },
              {
                accessorKey: "untprc",
                id: "untprc", // Make sure to include the 'id' property
                header: "Price (PHP)",
                // Cell: ({row}) => {
                //   const {
                //     original: {untprc},
                //   } = row;
                //   return <span>{parseFloat(untprc).toFixed(2)}</span>;
                // },
              },
              {
                accessorKey: "taxcde",
                id: "taxcde", // Make sure to include the 'id' property
                header: "Tax Code",
              },
            ]}
            tableSearchPlaceholder="Search Item Description"
            setColumnFilters={setColumnFilters}
            setSorting={setSorting}
            columnFilters={columnFilters}
            sorting={sorting}
            tableData={fixedallLoadedData()}
            onDeleteConfirm={onDeleteConfirm}
            isCentralConnected={isCentralConnected.current}
            isFetching={isFetching}
            setSearch={setSearch}
            setPagination={setPagination}
            pagination={pagination}
            row={rows}
            pageCount={pageCount}
          />
        </section>
      </AuthenticationGuard>
    </>
  );
}
