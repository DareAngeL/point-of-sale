import {AddButton} from "../../../common/addbutton/AddButton";
import {BackButton} from "../../../common/backbutton/BackButton";
import {Modal} from "../../../common/modal/Modal";
import {PrinterButton} from "../../../common/printerbutton/PrinterButton";
import {dateNowFormatted} from "../../../helper/Date";
import {useMasterfileDeletionValidation, useServiceMasterfile} from "../../../hooks/masterfileHooks";
import {PaymentTypeModel} from "../../../models/paymenttype";
import {useAppSelector} from "../../../store/store";
import {InputText} from "../../../common/form/InputText";
import {ButtonForm} from "../../../common/form/ButtonForm";
import {PageTitle} from "../../../common/title/MasterfileTitle";
import {useEffect, useState} from "react";
import {useModal} from "../../../hooks/modalHooks";
import {useFormInputValidation} from "../../../hooks/inputValidation";
import {MODULES} from "../../../enums/activitylogs";
import {useUserActivityLog} from "../../../hooks/useractivitylogHooks";
import { useCentral } from "../../../hooks/centralHooks";
import { CentralNote } from "../../../common/centralnote/CentralNote";
import { useTablePagination } from "../../../hooks/pagination";
import { POSTable } from "../../../common/table/POSTable";
import { toast } from "react-toastify";
import { InfoCard } from "../InfoCard";

interface PaymentTypeFormRequiredValues {
  "Description *": string;
}

enum PaymentTypeRequiredFields {
  paytyp = "paytyp"
}

export function PaymentType() {
  const {
    onSubmit,
    onDelete,
    onOpenModal,
    onChangeData,
    singleData,
    allLoadedData,
    setAllLoadedData,
    setSingleData,
  } = useServiceMasterfile<PaymentTypeModel>("otherpayment");

  const { isCentralConnected, checkLinkInputsCentral } = useCentral();

  const {
    handleSubmit,
    registerInputs,
    unregisterInputs,
    changeRequiredValue,
    clearErrors,
    validateInputCharacters,
    errors,
  } = useFormInputValidation<PaymentTypeFormRequiredValues>();

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
  } = useTablePagination<PaymentTypeModel>(setAllLoadedData, "otherpayment");

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
    if (modal) checkLinkInputsCentral();
    
    registerInputs({
      inputs: [
        {
          path: "Description *",
          name: "paytyp",
          value: singleData?.paytyp || "",
        },
      ],
    });

    return () => {
      unregisterInputs();
    };
  }, [modal]);

  const onDeleteConfirm = (row: any) => {
    console.log(row);
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
        let createRemarks = `ADDED:\nPAYMENT TYPE:${singleData?.paytyp}`;
        createAction({module: MODULES.PAYMENTTYPES, remarks: createRemarks});
        break;
      case "UPDATE":
        console.log("RUNNING UPDATE");
        updateAction(
          {
            originalData: editCopy,
            changeData: singleData,
            module: MODULES.PAYMENTTYPES,
          },
          {
            itemName: singleData?.paytyp,
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
        changeRequiredValue(PaymentTypeRequiredFields.paytyp, "");
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
            <span className="font-bold">{deleteData.original.paytyp} ?</span>
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
                itmcde: deleteData.original.paytyp
              })) {
                return toast.info(`"${deleteData.original.paytyp}" is already in use. Unable to delete.`, {
                  hideProgressBar: true,
                  position: 'top-center',
                  autoClose: 2000,
                });
              }

              onDelete(deleteData);
              let data = {
                module: MODULES.PAYMENTTYPES,
                remarks: "",
              };
              data.remarks = `DELETED: \nTERMINALNAME: ${deleteData?.original.paytyp}`;
              deleteAction(data);
            }}
          />
        </Modal>
      ) : (
        <Modal title={"Payment Type"} 
          onClose={() => {
            clearErrors();
            setOpenInfoCard(false);
          }}
        >
          {openInfoCard && (
            <InfoCard onClose={() => setOpenInfoCard(false)} />
          )}
          <form onSubmit={handleSubmit(onSubmitForm)} id="pt-form">
            <InputText
              handleInputChange={(e) => validateInputCharacters(e.target.value, 50) ? handleInputChange(e) : null}
              name={"paytyp"}
              value={singleData?.paytyp}
              id={"paytyp"}
              description={"Description *"}
              error={errors}
              linkCentral
              required
            />
          </form>

          <ButtonForm<PaymentTypeModel>
            isShowWarningCancel
            isCentralConnected={isCentralConnected.current}
            data={singleData}
            formName={"pt-form"}
            okBtnTxt={"Save"}
            onCancelBtnClick={() => setOpenInfoCard(false)}
          />
        </Modal>
      )}

      <section className="h-screen w-full relative">
        {isCentralConnected.current ? (
          <CentralNote description="Payment Type" />
        ) : (
          <AddButton
            onClick={() => {
              onOpenModal("Add Payment Type");
              setStatus("CREATE");
            }}
          />
        )}

        <div className="bg-white flex justify-between items-center fixed w-[95%] z-10 left-[3%] top-[1rem]">
          <div className="flex items-center">
            <BackButton />
            <PageTitle name={"Payment Type"} />
          </div>

          <div className="flex items-center">
            <PrinterButton
              otherOnClick={() => {
                printAction(MODULES.PAYMENTTYPES);
              }}
              printoutData={{
                companyName: company.data[0].comdsc,
                title: "Other Payment Types Masterfile",
                date: dateNowFormatted(),
                headers: {
                  paytyp: {
                    header: "Payment Type",
                    id: "paytyp",
                  },
                },
                data: allLoadedData,
              }}
            />
          </div>
        </div>

        <POSTable<PaymentTypeModel>
          onClick={(row) => {
            onOpenModal("Edit Payment Type");
            setSingleData(row.original);
            setStatus("UPDATE");
            setEditCopy(singleData);
          } }
          columns={[
            {
              accessorKey: "paytyp",
              id: "paytyp", // Make sure to include the 'id' property
              header: "Description",
            },
          ]}
          tableSearchPlaceholder="Search Payment Type"
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
        />
      </section>
    </>
  );
}
