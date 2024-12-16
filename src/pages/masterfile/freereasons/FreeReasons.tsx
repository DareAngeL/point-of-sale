import {AddButton} from "../../../common/addbutton/AddButton";
import {BackButton} from "../../../common/backbutton/BackButton";
import {ButtonForm} from "../../../common/form/ButtonForm";
import {InputText} from "../../../common/form/InputText";
import {Modal} from "../../../common/modal/Modal";
import {PrinterButton} from "../../../common/printerbutton/PrinterButton";
import {PageTitle} from "../../../common/title/MasterfileTitle";
import {dateNowFormatted} from "../../../helper/Date";
import {useMasterfileDeletionValidation, useServiceMasterfile} from "../../../hooks/masterfileHooks";
import {FreeReasonsTypeModel} from "../../../models/freereasons";
import {useAppSelector} from "../../../store/store";
// import {FreeReasonsTable} from "./FreeReasonsTable";
import {useEffect, useState} from "react";
import {useModal} from "../../../hooks/modalHooks";
import {useFormInputValidation} from "../../../hooks/inputValidation";
import {MODULES} from "../../../enums/activitylogs";
import {useUserActivityLog} from "../../../hooks/useractivitylogHooks";
import { useTablePagination } from "../../../hooks/pagination";
import { POSTable } from "../../../common/table/POSTable";
import { toast } from "react-toastify";
import { InfoCard } from "../InfoCard";
interface FreeReasonsFormRequiredValues {
  "Description *": string;
}

enum FreeReasonsRequiredFields {
  freereason = "freereason"
}

export function FreeReasons() {
  const {
    onSubmit,
    onDelete,
    onOpenModal,
    onChangeData,
    singleData,
    allLoadedData,
    setAllLoadedData,
    setSingleData,
  } = useServiceMasterfile<FreeReasonsTypeModel>("freereason");

  const {
    handleSubmit,
    registerInputs,
    unregisterInputs,
    changeRequiredValue,
    validateInputCharacters,
    clearErrors,
    errors,
  } = useFormInputValidation<FreeReasonsFormRequiredValues>();

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
  } = useTablePagination<FreeReasonsTypeModel>(setAllLoadedData, "freereason");

  const { validateOnDelete } = useMasterfileDeletionValidation("");

  const company = useAppSelector((state) => state.masterfile.company);
  const {createAction, updateAction, deleteAction, printAction} =
    useUserActivityLog();
  const [deleteData, setDeleteData] = useState<any>();
  const [status, setStatus] = useState<any>("");
  const [editCopy, setEditCopy] = useState<any>([]);
  const [openInfoCard, setOpenInfoCard] = useState(false);

  const {dispatch, modal} = useModal();
  const modalName = useAppSelector((state) => state.modal.modalName);

  useEffect(() => {
    registerInputs({
      inputs: [
        {
          path: "Description *",
          name: "freereason",
          value: singleData?.freereason || "",
        },
      ],
    });

    return () => {
      unregisterInputs();
    };
  }, [modal]);

  const onDeleteConfirm = (row: any) => {
    setDeleteData(row);
    onOpenModal("Delete Confirmation");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    changeRequiredValue(name, value);
    onChangeData(name, value);
  };

  const onSubmitForm = () => {
    switch (status) {
      case "CREATE":
        let createRemarks = `ADDED:\nTERMINAL NAME:${singleData?.freereason}`;
        createAction({module: MODULES.FREEREASONS, remarks: createRemarks});
        break;
      case "UPDATE":
        console.log("RUNNING UPDATE");
        updateAction(
          {
            originalData: editCopy,
            changeData: singleData,
            module: MODULES.FREEREASONS,
          },
          {
            itemName: singleData?.freereason,
          }
        );
        break;
      // print in print button
      // delete in delete button

      default:
        console.log("default");
        break;
    }
    onSubmit(undefined, status, () => {
      if (status === "CREATE") {
        setSingleData(undefined);
        setOpenInfoCard(true);
        changeRequiredValue(FreeReasonsRequiredFields.freereason, "");
      }
    });
  };

  useEffect(() => {
    if (editCopy === undefined) {
      console.log("DUPLICATING");
      setEditCopy(singleData);
    }
  }, [singleData]);

  return (
    <>
      {modalName === "Delete Confirmation" ? (
        <Modal title={"Delete Confirmation"}>
          <h1>
            Do you want to delete:{" "}
            <span className="font-bold">
              {deleteData.original.freereason} ?
            </span>
          </h1>
          <ButtonForm
            formName={"ps-form"}
            isActivated={false}
            okBtnTxt="Yes"
            cancelBtnTxt="No"
            isColorSwitched={true}
            onOkBtnClick={async () => {
              dispatch();

              // validate if this freereason can be deleted or not
              if (!await validateOnDelete({
                freereason: deleteData.original.freereason
              })) {
                return toast.info(`"${deleteData.original.freereason}" is already in use for transaction. Unable to delete.`, {
                  hideProgressBar: true,
                  position: 'top-center',
                  autoClose: 2000,
                });
              }

              onDelete(deleteData);
              let data = {
                module: MODULES.FREEREASONS,
                remarks: "",
              };
              data.remarks = `DELETED: \nFREE REASON: ${deleteData?.original.freereason}`;
              deleteAction(data);
            }}
          />
        </Modal>
      ) : (
        <Modal title={"Free Reasons"} 
          onClose={() => {
            clearErrors();
            setOpenInfoCard(false);
          }}
        >
          {openInfoCard && (
            <InfoCard onClose={() => setOpenInfoCard(false)} />
          )}
          <form id="freereason-form" onSubmit={handleSubmit(onSubmitForm)}>
            <InputText
              handleInputChange={(e) => validateInputCharacters(e.target.value, 50) ? handleInputChange(e) : null}
              name={"freereason"}
              value={singleData?.freereason}
              id={"freereason"}
              description={"Description *"}
              error={errors}
              required
            />
          </form>

          <ButtonForm<FreeReasonsTypeModel>
            isShowWarningCancel
            data={singleData}
            formName={"freereason-form"}
            okBtnTxt={"Save"}
            onCancelBtnClick={() => setOpenInfoCard(false)}
          />
        </Modal>
      )}

      <section className="h-screen w-full relative">
        <AddButton
          onClick={() => {
            onOpenModal("Add Free Reason");
            setStatus("CREATE");
          }}
        />

        <div className="bg-white flex justify-between items-center fixed w-[95%] z-10 left-[3%] top-[1rem]">
          <div className="flex items-center">
            <BackButton />
            <PageTitle name={"Free Reasons"} />
          </div>

          <div className="flex items-center">
            <PrinterButton
              otherOnClick={() => {
                printAction(MODULES.FREEREASONS);
              }}
              printoutData={{
                companyName: company.data[0].comdsc,
                title: "Free Reason Masterfile",
                date: dateNowFormatted(),
                headers: {
                  freereason: {
                    header: "Free Reason Code",
                    id: "freereason",
                  },
                },
                data: allLoadedData,
              }}
            />
          </div>
        </div>

        <POSTable<FreeReasonsTypeModel>
          onClick={(row) => {
            onOpenModal("Edit Free Reasons");
            setSingleData(row.original);
            setStatus("UPDATE");
            setEditCopy(singleData);
          } }
          columns={[
            {
              accessorKey: "freereason",
              id: "freereason ", // Make sure to include the 'id' property
              header: "Description",
            },
          ]}
          tableSearchPlaceholder="Search Free Reason"
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
