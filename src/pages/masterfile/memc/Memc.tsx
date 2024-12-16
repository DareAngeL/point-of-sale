import {BackButton} from "../../../common/backbutton/BackButton";
import {MemcModal} from "./MemcModal";
import {AddButton} from "../../../common/addbutton/AddButton";
import {dateNowFormatted} from "../../../helper/Date";
import {useAppSelector} from "../../../store/store";
import {MemcTypeModel} from "../../../models/memc";
import {useMasterfileDeletionValidation, useServiceMasterfile} from "../../../hooks/masterfileHooks";
import {PrinterButton} from "../../../common/printerbutton/PrinterButton";
import {PageTitle} from "../../../common/title/MasterfileTitle";
import {useState, useEffect} from "react";
import {useModal} from "../../../hooks/modalHooks";
import {Modal} from "../../../common/modal/Modal";
import {ButtonForm} from "../../../common/form/ButtonForm";
import {MODULES} from "../../../enums/activitylogs";
import {useUserActivityLog} from "../../../hooks/useractivitylogHooks";
import { useCentral } from "../../../hooks/centralHooks";
import { CentralNote } from "../../../common/centralnote/CentralNote";
import { useTablePagination } from "../../../hooks/pagination";
import { POSTable } from "../../../common/table/POSTable";
import { formatNumberWithCommasAndDecimals } from "../../../helper/NumberFormat";
import { useMemcHook } from "./memcHook";
import { toast } from "react-toastify";

export function Memc() {
  const {
    onSubmit,
    onDelete,
    onOpenModal,
    onChangeData,
    singleData,
    allLoadedData,
    setAllLoadedData,
    setSingleData,
  } = useServiceMasterfile<MemcTypeModel>("memc");

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
  } = useTablePagination<MemcTypeModel>(setAllLoadedData, "memc");

  const { validateOnDelete } = useMasterfileDeletionValidation("memc");

  const { formatMEMCValue } = useMemcHook();

  const company = useAppSelector((state) => state.masterfile.company);

  const { isCentralConnected, checkLinkInputsCentral } = useCentral();

  const {deleteAction, printAction} =
    useUserActivityLog();

  const [deleteData, setDeleteData] = useState<any>();
  const [status, setStatus] = useState<any>("");
  const [editCopy, setEditCopy] = useState<any>([]);

  const {dispatch} = useModal();
  const modalName = useAppSelector((state) => state.modal.modalName);

  const onDeleteConfirm = (row: any) => {
    setDeleteData(row);
    onOpenModal("Delete Confirmation");
  };

  const handleInputChange = ({
    target: {name, value},
  }: React.ChangeEvent<HTMLInputElement>) => onChangeData(name, value);

  

  useEffect(() => {
    if (editCopy === undefined) {
      console.log("DUPLICATING");
      setEditCopy(singleData);
    }
  }, [singleData]);

  console.log(deleteData);

  return (
    <>
      {modalName === "Delete Confirmation" ? (
        <Modal title={"Delete Confirmation"}>
          <h1>
            Do you want to delete:{" "}
            <span className="font-bold">{deleteData.original.codedsc} ?</span>
          </h1>
          <ButtonForm
            formName={"ps-form"}
            isActivated={false}
            okBtnTxt="Yes"
            cancelBtnTxt="No"
            isColorSwitched={true}
            onOkBtnClick={async () => {
              dispatch();

              if (!await validateOnDelete({
                code: deleteData.original.code
              })) {
                return toast.info(`"${deleteData.original.codedsc}" is already in use. Unable to delete.`, {
                  hideProgressBar: true,
                  position: 'top-center',
                  autoClose: 2000,
                });
              }
              
              onDelete(deleteData);
              let data = {
                module: MODULES.MEMC,
                remarks: "",
              };
              data.remarks = `DELETED: \nMEMC: ${deleteData?.original.codedsc}\nVALUE: ${deleteData?.original.value}\nCODE: ${deleteData?.original.code}`;
              deleteAction(data);
            }}
          />
        </Modal>
      ) : (
        <MemcModal
          singleData={singleData}
          onSubmit={onSubmit}
          editCopy={editCopy}
          setSingleData={setSingleData}
          status={status}
          isCentralConnected={isCentralConnected.current}
          handleInputChange={handleInputChange}
          checkLinkInputsCentral={checkLinkInputsCentral}
        />
      )}

      <section className="h-screen w-full relative">
        {!isCentralConnected.current ? (
          <AddButton
            onClick={() => {
              onOpenModal("Add MEMC");
              setStatus("CREATE");
            }}
          />
        ) : (
          <CentralNote description="MEMC" />
        )}

        <div className="bg-white flex justify-between items-center fixed w-[95%] z-10 left-[3%] top-[1rem]">
          <div className="flex items-center">
            <BackButton />
            <PageTitle name={"MEMC"} />
          </div>

          <div className="flex items-center">
            <PrinterButton
              otherOnClick={() => {
                printAction(MODULES.MEMC);
              }}
              printoutData={{
                companyName: company.data[0].comdsc,
                title: "MEMC Masterfile",
                date: dateNowFormatted(),
                headers: {
                  codedsc: {
                    header: "Code",
                    id: "code",
                  },
                  value: {
                    header: "Value",
                    id: "values",
                  },
                },
                data: allLoadedData,
              }}
            />
          </div>
        </div>
        
        <POSTable<MemcTypeModel>
          onClick={(row) => {
            onOpenModal("Edit MEMC");
            setSingleData(row.original);
            setStatus("UPDATE");
            setEditCopy(singleData);
          } }
          columns={[
            {
              accessorKey: "codedsc",
              id: "codedsc", // Make sure to include the 'id' property
              header: "MEMC",
            },
            {
              accessorKey: "value",
              id: "value", // Make sure to include the 'id' property
              header: "Value (PHP)",
            },
          ]}
          tableSearchPlaceholder="Search MEMC"
          isCentralConnected={isCentralConnected.current}
          setColumnFilters={setColumnFilters}
          setSorting={setSorting}
          columnFilters={columnFilters}
          sorting={sorting}
          tableData={allLoadedData.map(d => (
            {
              ...d, 
              value: formatNumberWithCommasAndDecimals(formatMEMCValue(d.value), 2)
            }))}
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
