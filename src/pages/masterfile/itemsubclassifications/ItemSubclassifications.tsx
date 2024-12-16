
import {BackButton} from "../../../common/backbutton/BackButton";
import {ItemSubclassificationModel} from "../../../models/itemsubclassification";
import { useAppSelector} from "../../../store/store";
import {AddButton} from "../../../common/addbutton/AddButton";
import {dateNowFormatted} from "../../../helper/Date";
import {PrinterButton} from "../../../common/printerbutton/PrinterButton";
import {PageTitle} from "../../../common/title/MasterfileTitle";
import {SetPrinterButton} from "../../../common/setprinterbutton/SetPrinterButton";
import {useState} from "react";
import {MODULES} from "../../../enums/activitylogs";
import {useUserActivityLog} from "../../../hooks/useractivitylogHooks";
import {useCentral} from "../../../hooks/centralHooks";
import {CentralNote} from "../../../common/centralnote/CentralNote";
import { useTablePagination } from "../../../hooks/pagination";
import { POSTable } from "../../../common/table/POSTable";
import { AuthenticationGuard } from "../../../security/authentication/AuthGuards";
import { useAllLoadedData } from "../../../hooks/serviceHooks";
import { useDeleteConfirmation, useInitalization, useItemSubclassUtilities, useModal, useSetPrinter } from "./hooks/itemSubclassificationHooks";
import { DeleteConfirmationModal } from "./modal/DeleteConfirmationModal";
import { ItemSubclassificationModal } from "./modal/ItemSubclassificationModal";
import { SetPrinterModal } from "./modal/SetPrinterModal";
import { useFormInputValidation } from "../../../hooks/inputValidation";

export interface ItemSubclassificationFormRequiredValues {
  "Item Subclassification *": string;
  "Item Classification *": string;
}

export enum ItemSubclassificationRequiredFields {
  itemsubclassdsc = "itemsubclassdsc",
  itmclacde = "itmclacde"
}

export interface SelectedItemSubClass {
  recid: number;
  itemsubclassdsc: string;
  locationcde: string;
}

export function ItemSubclassification() {

  const {allLoadedData, setAllLoadedData} = useAllLoadedData<ItemSubclassificationModel>();

  const [deleteData, setDeleteData] = useState<any>();
  const [status, setStatus] = useState<any>("");
  const [editCopy, setEditCopy] = useState<any>([]);
  
  // const {itemSubclassification: itemSubclass} = useAppSelector(state => state.masterfile)

  const [itemSubclassification, setItemSubclassification] = useState<ItemSubclassificationModel>();

  const {checkLinkInputsCentral, isCentralConnected} = useCentral();
  const {openSetPrinter} = useSetPrinter();
  const {onDeleteConfirm} = useDeleteConfirmation(setDeleteData);

  const {fixallLoadedData} = useItemSubclassUtilities(allLoadedData);
  
  const {onOpenModal} = useModal();

  const {
    handleSubmit,
    errors,
    clearErrors,
    changeRequiredValue,
    registerInputs,
    unregisterInputs
  } = useFormInputValidation<ItemSubclassificationFormRequiredValues>();

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
  } = useTablePagination<ItemSubclassificationModel>(setAllLoadedData, "itemsubclassification");

  const company = useAppSelector((state) => state.masterfile.company);
  const {syspar} = useAppSelector((state) => state.masterfile);
  const modalName = useAppSelector((state) => state.modal.modalName);

  const itemClassification = useAppSelector(
    (state) => state.masterfile.itemClassification
  );
  
  const {printAction} =
    useUserActivityLog();

  useInitalization(checkLinkInputsCentral, itemSubclassification, editCopy, setEditCopy, registerInputs, unregisterInputs);

  const renderModals = () => {
    switch (modalName) {
      case "Delete Confirmation":
        return (<DeleteConfirmationModal deleteData={deleteData} setAllLoadedData={setAllLoadedData} />);
      case "Set Printer":
        return (<SetPrinterModal allLoadedData={allLoadedData} 
          setAllLoadedData={setAllLoadedData} editCopy={editCopy} setEditCopy={setEditCopy } checkLinkInputsCentral={checkLinkInputsCentral} />);
      default:
        return (
          <ItemSubclassificationModal 
            itemSubclassification={itemSubclassification}
            setItemSubclassification={setItemSubclassification}
            editCopy={editCopy}
            status={status}
            isCentralConnected={isCentralConnected}
            changeRequiredValue={changeRequiredValue}
            clearErrors={clearErrors}
            handleSubmit={handleSubmit}
            errors={errors} 
            setAllLoadedData={setAllLoadedData}          
          />
        );
    }
  };

  return (
    <>
      <AuthenticationGuard 
        redirectTo="/pages/masterfile"
        toastMsg="Please add Item Classification first"
        condition={itemClassification.data.length !== 0}
      >
        {renderModals()}
        <section className="h-screen w-full relative">
          {!isCentralConnected.current ? (
            <AddButton
              onClick={() => {
                onOpenModal("Add Item Subclassification");
                setStatus("CREATE");
              }}
            />
          ) : (
            <CentralNote description={"Item Subclassifications"} />
          )}

          <div className="bg-white flex justify-between items-center fixed w-[95%] z-10 left-[3%] top-[1rem]">
            <div className="flex items-center">
              <BackButton />
              <PageTitle name={"Item Subclassifications"} />
            </div>

            <div className="flex items-center">
              {(syspar.data[0].allow_printerstation === 1 && syspar.data[0].itemsubclass_printer_station_tag) ? (
                <div className="pr-[3px]">
                  <SetPrinterButton onClick={openSetPrinter} />
                </div>
              ) : (<></>)}

              <PrinterButton
                otherOnClick={() => {
                  printAction(MODULES.ITEMSUBCLASSIFICATIONS);
                }}
                printoutData={{
                  companyName: company.data[0].comdsc,
                  title: "Item Subclassification Masterfile",
                  date: dateNowFormatted(),
                  headers: {
                    itemsubclassdsc: {
                      header: "Item Subclassification",
                      id: "itemsubclassification",
                    },
                    itmcladsc: {
                      header: "Item Classification",
                      id: "itemclassification",
                    },
                  },
                  data: fixallLoadedData(),
                }}
              />
            </div>
          </div>

          <POSTable<ItemSubclassificationModel>
            onClick={(row) => {
              onOpenModal("Edit Item Subclassification");
              setItemSubclassification(row.original);
              setStatus("UPDATE");
              setEditCopy(itemSubclassification);
            } }
            columns={[
              {
                accessorKey: "itemsubclassdsc",
                header: "Item Subclassification",
              },
              {
                accessorKey: "itemclassfile.itmcladsc",
                id: "itmcladsc", // Make sure to include the 'id' property
                header: "Item Classification",
              },
            ]}
            tableSearchPlaceholder="Search Item Sub-classification"
            setColumnFilters={setColumnFilters}
            setSorting={setSorting}
            columnFilters={columnFilters}
            sorting={sorting}
            tableData={fixallLoadedData()}
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