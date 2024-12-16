import {BackButton} from "../../../common/backbutton/BackButton";
import {PrinterStationModel} from "../../../models/printerstation";
import {useAppSelector} from "../../../store/store";
import {AddButton} from "../../../common/addbutton/AddButton";
import {dateNowFormatted} from "../../../helper/Date";
import {PrinterButton} from "../../../common/printerbutton/PrinterButton";
import {PageTitle} from "../../../common/title/MasterfileTitle";
import {useState} from "react";
import {useChangeNameModal, useModal} from "../../../hooks/modalHooks";
import {useFormInputValidation} from "../../../hooks/inputValidation";
import {useUserActivityLog} from "../../../hooks/useractivitylogHooks";
import {MODULES} from "../../../enums/activitylogs";
import { useTablePagination } from "../../../hooks/pagination";
import { POSTable } from "../../../common/table/POSTable";
import { useAllLoadedData } from "../../../hooks/serviceHooks";
import { PrinterStationDeleteModal } from "./modals/PrinterStationDeleteModal";
import { PrinterStationModal } from "./modals/PrinterStationModal";
import { usePrinterStationInitialization } from "./hooks/initialization";

export interface PrinterStationFormRequiredValues {
  "Station Name *": string;
  "Terminal IP *": string;
  "Printer Name *": string;
  "Printer Size *": string;
}

export function PrinterStation() {

  const { allLoadedData, setAllLoadedData } = useAllLoadedData<PrinterStationModel>();
  const [printerStationModalData, setPrinterStationModalData] = useState<PrinterStationModel>();

  const {
    handleSubmit,
    registerInputs,
    unregisterInputs,
    errors,
    clearErrors,
    changeRequiredValue,
  } = useFormInputValidation<PrinterStationFormRequiredValues>();

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
  } = useTablePagination<PrinterStationModel>(setAllLoadedData, "printerstation");

  const {company} = useAppSelector((state) => state.masterfile);

  const { printAction } =
    useUserActivityLog();

  const [deleteData, setDeleteData] = useState<any>();
  const [editCopy, setEditCopy] = useState<any>([]);
  const [status, setStatus] = useState<any>("");

  const { dispatch: modalDispatch } = useModal();
  const { modalNameDispatch } = useChangeNameModal();
  const modalName = useAppSelector((state) => state.modal.modalName);

  usePrinterStationInitialization(
    editCopy,
    printerStationModalData,
    setPrinterStationModalData,
    setEditCopy,
    registerInputs,
    unregisterInputs
  );

  const onDeleteConfirm = (row: any) => {
    modalNameDispatch("Delete Confirmation");
    modalDispatch();
    setDeleteData(row);
  };

  return (
    <>
      {modalName === "Delete Confirmation" ? (
        <PrinterStationDeleteModal 
          deleteData={deleteData}
          setAllLoadedData={setAllLoadedData}
        />
      ) : (
        <PrinterStationModal
          printerStationModalData={printerStationModalData}
          setPrinterStationModalData={setPrinterStationModalData}
          setAllLoadedData={setAllLoadedData}
          status={status}
          editCopy={editCopy}
          handleSubmit={handleSubmit}
          changeRequiredValue={changeRequiredValue}
          errors={errors}
          clearErrors={clearErrors}
        />
      )}

      <section className="h-screen w-full relative">
        <AddButton
          onClick={() => {
            setStatus("CREATE");
            modalNameDispatch("Add new printer station");
            modalDispatch();
          }}
        />

        <div className="bg-white flex justify-between items-center fixed w-[95%] z-10 left-[3%] top-[1rem]">
          <div className="flex items-center">
            <BackButton />
            <PageTitle name={"Printer Stations"} />
          </div>

          <PrinterButton
            otherOnClick={() => printAction(MODULES.PRINTERSTATION)}
            printoutData={{
              companyName: company.data[0].comdsc,
              title: "Printer Station Masterfile",
              date: dateNowFormatted(),
              headers: {
                locationdsc: {
                  header: "Station Name",
                  id: "stationname",
                },
                printername: {
                  header: "Printer Name",
                  id: "printername",
                },
                terminalip: {
                  header: "Terminal IP",
                  id: "terminalip",
                },
              },
              data: allLoadedData, // TODO - CHANGE THIS - only the loaded data will be printed if we use allLoadedData
            }}
          />
        </div>

        <POSTable<PrinterStationModel>
          onClick={(row) => {
            modalNameDispatch(row.original.locationdsc);
            modalDispatch();
            setPrinterStationModalData(row.original);
            setStatus("UPDATE");
            setEditCopy(printerStationModalData);
          } }
          columns={[
            {
              accessorKey: "locationdsc",
              header: "Printer Description",
            },
          ]}
          tableSearchPlaceholder="Search Printer Station"
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
        />
      </section>
    </>
  );
}
