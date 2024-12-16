import {PrinterButton} from "../../../common/printerbutton/PrinterButton";
import {BackButton} from "../../../common/backbutton/BackButton";
import {ItemClassificationModel} from "../../../models/itemclassification";
import {AddButton} from "../../../common/addbutton/AddButton";
import {useAppSelector} from "../../../store/store";
import {dateNowFormatted} from "../../../helper/Date";
import {PageTitle} from "../../../common/title/MasterfileTitle";
import {SetPrinterButton} from "../../../common/setprinterbutton/SetPrinterButton";
import {useState} from "react";
import {useFormInputValidation} from "../../../hooks/inputValidation";
import {useUserActivityLog} from "../../../hooks/useractivitylogHooks";
import {MODULES} from "../../../enums/activitylogs";
import {useCentral} from "../../../hooks/centralHooks";
import {CentralNote} from "../../../common/centralnote/CentralNote";
import { useTablePagination } from "../../../hooks/pagination";
import { POSTable } from "../../../common/table/POSTable";
import { useAllLoadedData } from "../../../hooks/serviceHooks";
import { useDeleteConfirmation, useInitalization, useModal } from "./hooks/itemclassificationHooks";
import { DeleteConfirmationModal } from "./modals/DeleteConfirmationModal";
import { ItemClassificationModal } from "./modals/ItemClassificationModal";
import { SetPrinterModal } from "./modals/SetPrinterModalV2";

export interface ItemClassificationFormRequiredValues {
  "Description *": string;
}

export enum ItemClassificationRequiredFields {
  itmcladsc = "itmcladsc",
}

export function ItemClassification() {

  const {allLoadedData, setAllLoadedData} = useAllLoadedData<ItemClassificationModel>();

  const {
    clearErrors,
    changeRequiredValue,
    errors,
    handleSubmit,
    registerInputs,
    unregisterInputs,
  } = useFormInputValidation<ItemClassificationFormRequiredValues>();
  
  const [editCopy, setEditCopy] = useState<any>([]);
  const [status, setStatus] = useState<any>("");
  const [itemClassification, setItemClassification] = useState<ItemClassificationModel>();
  const [deleteData, setDeleteData] = useState<any>();

  const {checkLinkInputsCentral, isCentralConnected} = useCentral();

  const {onDeleteConfirm} = useDeleteConfirmation(setDeleteData);
  const {modal, onOpenModal} = useModal();

  useInitalization(editCopy, itemClassification, setEditCopy, modal, checkLinkInputsCentral, registerInputs, unregisterInputs); 

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
    pageCount
  } = useTablePagination<ItemClassificationModel>(setAllLoadedData, "itemclassification");

 
  const {syspar, company} = useAppSelector((state) => state.masterfile);
  const modalName = useAppSelector((state) => state.modal.modalName);

  const {printAction} =
    useUserActivityLog();


  const openSetPrinter = () => {
    onOpenModal("Set Printer");
  };

  const renderModals = () => {
    console.log(modalName);
    switch (modalName) {
      case "Delete Confirmation":
        return (<DeleteConfirmationModal deleteData={deleteData} setAllLoadedData={setAllLoadedData} />);
      case "Set Printer":
        return (
          <SetPrinterModal allLoadedData={allLoadedData} setAllLoadedData={setAllLoadedData} editCopy={editCopy} setEditCopy={setEditCopy } checkLinkInputsCentral={checkLinkInputsCentral} />
        );
      default:
        return (
          <ItemClassificationModal
            setItemClassification={setItemClassification}
            setAllLoadedData={setAllLoadedData}
            itemClassification={itemClassification}
            editCopy={editCopy}
            isCentralConnected={isCentralConnected}
            status={status}
            changeRequiredValue={changeRequiredValue}
            clearErrors={clearErrors} 
            handleSubmit={handleSubmit}
            errors={errors}
          />
        );
    }
  };

  return (
    <>
      {renderModals()}
      <section className="h-screen w-full relative">
        {!isCentralConnected.current ? (
          <AddButton
            onClick={() => {
              onOpenModal("Add Item Classification");
              setStatus("CREATE");
            }}
          />
        ) : (
          <CentralNote description={"Item Classifications"} />
        )}

        <div className="bg-white flex justify-between items-center fixed w-[95%] z-10 left-[3%] top-[1rem]">
          <div className="flex items-center">
            <BackButton />
            <PageTitle name={"Item Classifications"} />
          </div>

          <div className="flex items-center">
            {(syspar.data[0].allow_printerstation === 1 && syspar.data[0].itemclass_printer_station_tag) ? (
              <div className="pr-[3px]">
                <SetPrinterButton
                  onClick={() => {
                    openSetPrinter();
                    setStatus("SETPRINTER");
                  }}
                />
              </div>
            ) : (<></>)}
            <PrinterButton
              otherOnClick={() => printAction(MODULES.ITEMCLASSIFICATION)}
              printoutData={{
                companyName: company.data[0].comdsc,
                title: "Item Classification Masterfile",
                date: dateNowFormatted(),
                headers: {
                  itmcladsc: {
                    header: "Item Classification",
                    id: "itemclassification",
                  },
                },
                data: allLoadedData,
              }}
            />
          </div>
        </div>

        <POSTable<ItemClassificationModel>
          onClick={(row) => {
            onOpenModal("Edit Item Classification");
            setItemClassification(row.original);
            setStatus("UPDATE");
            setEditCopy(itemClassification);
          } }
          columns={[
            {
              accessorKey: "itmcladsc",
              id: "itmcladsc", // Make sure to include the 'id' property
              header: "Description",
            },
          ]}
          tableSearchPlaceholder="Search Item Classification"
          setColumnFilters={setColumnFilters}
          setSorting={setSorting}
          columnFilters={columnFilters}
          sorting={sorting}
          tableData={allLoadedData}
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
    </>
  );
}
