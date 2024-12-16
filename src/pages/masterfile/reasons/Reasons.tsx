import {AddButton} from "../../../common/addbutton/AddButton";
import {BackButton} from "../../../common/backbutton/BackButton";
import {PrinterButton} from "../../../common/printerbutton/PrinterButton";
import {dateNowFormatted} from "../../../helper/Date";
import {useMasterfileDeletionValidation, useServiceMasterfile} from "../../../hooks/masterfileHooks";
import {VoidReasonModel} from "../../../models/voidreason";
import {useAppSelector} from "../../../store/store";
import {PageTitle} from "../../../common/title/MasterfileTitle";
import {Modal} from "../../../common/modal/Modal";
import {ButtonForm} from "../../../common/form/ButtonForm";
import {useEffect, useState} from "react";
import {useModal} from "../../../hooks/modalHooks";
import {useFormInputValidation} from "../../../hooks/inputValidation";
import {InputText} from "../../../common/form/InputText";
import {MODULES} from "../../../enums/activitylogs";
import {useUserActivityLog} from "../../../hooks/useractivitylogHooks";
import { useTablePagination } from "../../../hooks/pagination";
import { POSTable } from "../../../common/table/POSTable";
import { toast } from "react-toastify";
import { InfoCard } from "../InfoCard";
interface VoidReasonFormRequiredValues {
  "Description *": string;
}

enum VoidReasonRequiredFields {
  voidcde = "voidcde"
}

export function VoidReason() {
  const {
    onSubmit,
    onDelete,
    onOpenModal,
    onChangeData,
    singleData,
    allLoadedData,
    setAllLoadedData,
    setSingleData,
  } = useServiceMasterfile<VoidReasonModel>("voidreason");

  const {
    handleSubmit,
    errors,
    clearErrors,
    changeRequiredValue,
    registerInputs,
    unregisterInputs,
    validateInputCharacters,
  } = useFormInputValidation<VoidReasonFormRequiredValues>();

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
  } = useTablePagination<VoidReasonModel>(setAllLoadedData, "voidreason");

  const { validateOnDelete } = useMasterfileDeletionValidation("");

  const company = useAppSelector((state) => state.masterfile.company);
  const {createAction, updateAction, deleteAction, printAction} =
    useUserActivityLog();
  const [deleteData, setDeleteData] = useState<any>();
  const [status, setStatus] = useState<any>("");
  const [editCopy, setEditCopy] = useState<any>([]);
  const [openInfoCard, setOpenInfoCard] = useState<boolean>(false);

  const {dispatch, modal} = useModal();
  const modalName = useAppSelector((state) => state.modal.modalName);

  useEffect(() => {
    registerInputs({
      inputs: [
        {
          path: "Description *",
          name: "voidcde",
          value: singleData?.voidcde.toString() || "",
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

  const handleInputChange = ({
    target: {name, value},
  }: React.ChangeEvent<HTMLInputElement>) => {
    changeRequiredValue(name, value);
    onChangeData(name, value);
  };

  const onSubmitForm = () => {
    switch (status) {
      case "CREATE":
        let createRemarks = `ADDED:\nVOID REASON:${singleData?.voidcde} `;
        createAction({module: MODULES.VOIDREASONS, remarks: createRemarks});
        break;
      case "UPDATE":
        console.log("UPDATE");
        updateAction(
          {
            originalData: editCopy,
            changeData: singleData,
            module: MODULES.VOIDREASONS,
          },
          {
            itemName: singleData?.voidcde,
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
        changeRequiredValue(VoidReasonRequiredFields.voidcde, "");
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
            <span className="font-bold">{deleteData.original.voidcde} ?</span>
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
                refundreason: deleteData.original.voidcde
              })) {
                return toast.info(`"${deleteData.original.voidcde}" is already in use. Unable to delete.`, {
                  hideProgressBar: true,
                  position: 'top-center',
                  autoClose: 2000,
                });
              }

              onDelete(deleteData);
              let data = {
                module: MODULES.VOIDREASONS,
                remarks: "",
              };
              data.remarks = `DELETED: \nVOID REASON:${deleteData?.original.voidcde} `;
              deleteAction(data);
            }}
          />
        </Modal>
      ) : (
        <Modal title={"Void/Refund Reasons"} 
          onClose={() => {
            clearErrors();
            setOpenInfoCard(false);
          }}
        >
          <form id="vr-form" onSubmit={handleSubmit(onSubmitForm)}>
            {openInfoCard && (
              <InfoCard onClose={() => setOpenInfoCard(false)} />
            )}

            <div className="py-2">
              <InputText
                handleInputChange={(e) => validateInputCharacters(e.target.value, 50) ? handleInputChange(e) : null}
                name={"voidcde"}
                value={singleData?.voidcde}
                id={"voidcde"}
                description={"Description *"}
                error={errors}
                required
              />
            </div>

            <ButtonForm<VoidReasonModel>
              isShowWarningCancel
              data={singleData}
              formName={"vr-form"}
              okBtnTxt={"Save"}
              onCancelBtnClick={() => setOpenInfoCard(false)}
            />
          </form>
        </Modal>
      )}

      <section className="h-screen w-full relative">
        <AddButton
          onClick={() => {
            onOpenModal("Add Void/Refund Reason");
            setStatus("CREATE");
          }}
        />

        <div className="bg-white flex justify-between items-center fixed w-[95%] z-10 left-[3%] top-[1rem]">
          <div className="flex items-center">
            <BackButton />
            <PageTitle name={"Void/Refund Reasons"} />
          </div>

          <div className="flex items-center">
            <PrinterButton
              otherOnClick={() => {
                printAction(MODULES.VOIDREASONS);
              }}
              printoutData={{
                companyName: company.data[0].comdsc,
                title: "Void Reasons Masterfile",
                date: dateNowFormatted(),
                headers: {
                  voidcde: {
                    header: "Void Code",
                    id: "voidcde",
                  },
                },
                data: allLoadedData,
              }}
            />
          </div>
        </div>

        <POSTable<VoidReasonModel>
          onClick={(row) => {
            onOpenModal("Edit Void/Refund Reasons");
            setSingleData(row.original);
            setStatus("UPDATE");
            setEditCopy(singleData);
          } }
          columns={[
            {
              accessorKey: "voidcde",
              id: "voidcde", // Make sure to include the 'id' property
              header: "Description",
            },
          ]}
          tableSearchPlaceholder="Search Reasons"
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
