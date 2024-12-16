import {AddButton} from "../../../common/addbutton/AddButton";
import {BackButton} from "../../../common/backbutton/BackButton";
import {ButtonForm} from "../../../common/form/ButtonForm";
import {InputText} from "../../../common/form/InputText";
import {Modal} from "../../../common/modal/Modal";
import {PrinterButton} from "../../../common/printerbutton/PrinterButton";
import {PageTitle} from "../../../common/title/MasterfileTitle";
import {dateNowFormatted} from "../../../helper/Date";
import {useServiceMasterfile} from "../../../hooks/masterfileHooks";
import {useAppSelector} from "../../../store/store";
import {useEffect, useState} from "react";
import {useModal} from "../../../hooks/modalHooks";
import {useFormInputValidation} from "../../../hooks/inputValidation";
import {MODULES} from "../../../enums/activitylogs";
import {useUserActivityLog} from "../../../hooks/useractivitylogHooks";
import {CashIOReasonModel} from "../../../models/cashioreason";
import {Selection} from "../../../common/form/Selection";
import { useTablePagination } from "../../../hooks/pagination";
import { POSTable } from "../../../common/table/POSTable";
import { InfoCard } from "../InfoCard";

interface CashIOReasonFormRequiredValues {
  "Reason *": string;
  "Type *": string;
}

enum CashIOReasonRequiredFields {
  cashioreason = "cashioreason",
  type = "type"
}

export function CashIOReasons() {
  const {
    onSubmit,
    onDelete,
    onOpenModal,
    onChangeData,
    singleData,
    allLoadedData,
    setAllLoadedData,
    setSingleData,
  } = useServiceMasterfile<CashIOReasonModel>("cashioreason");

  const {
    handleSubmit,
    registerInputs,
    unregisterInputs,
    changeRequiredValue,
    clearErrors,
    validateInputCharacters,
    errors,
  } = useFormInputValidation<CashIOReasonFormRequiredValues>();

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
  } = useTablePagination<CashIOReasonModel>(setAllLoadedData, "cashioreason");

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
          path: "Reason *",
          name: "cashioreason",
          value: singleData?.cashioreason || "",
        },
        {
          path: "Type *",
          name: "type",
          value: singleData?.type || "",
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

  const handleSelectChange = ({
    target: {name, value},
  }: React.ChangeEvent<HTMLSelectElement>) => {
    changeRequiredValue(name, value);
    onChangeData(name, value);
  };

  const onSubmitForm = () => {
    switch (status) {
      case "CREATE":
        let createRemarks = `ADDED:\nTERMINAL NAME:${singleData?.cashioreason}`;
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
            itemName: singleData?.cashioreason,
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
      setSingleData(undefined);
      setOpenInfoCard(true);
      changeRequiredValue(CashIOReasonRequiredFields.cashioreason, "");
      changeRequiredValue(CashIOReasonRequiredFields.type, "");
    });
  };

  console.log(deleteData);

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
              {deleteData.original.cashioreason} ?
            </span>
          </h1>
          <ButtonForm
            formName={"ps-form"}
            isActivated={false}
            okBtnTxt="Yes"
            cancelBtnTxt="No"
            isColorSwitched={true}
            onOkBtnClick={() => {
              dispatch();
              onDelete(deleteData);
              let data = {
                module: MODULES.CASHIOREASON,
                remarks: "",
              };
              data.remarks = `DELETED: \nCASH I/O REASON: ${deleteData?.original.cashioreason}`;
              deleteAction(data);
            }}
          />
        </Modal>
      ) : (
        <Modal title={"Cash In/Out Reasons"} 
          onClose={() => {
            clearErrors();
            setOpenInfoCard(false);
          }}
        >
          {openInfoCard && (
            <InfoCard onClose={() => setOpenInfoCard(false)} />
          )}
          <form id="cashioreason-form" onSubmit={handleSubmit(onSubmitForm)}>
            <InputText
              handleInputChange={(e) => validateInputCharacters(e.target.value, 50) ? handleInputChange(e) : null}
              name={"cashioreason"}
              value={singleData?.cashioreason}
              id={"cashioreason"}
              description={"Reason *"}
              error={errors}
              required
            />
            <Selection
              id="type"
              name="type"
              handleSelectChange={handleSelectChange}
              description="Type *"
              value={singleData?.type}
              keyValuePair={[
                {
                  value: "CASHIN",
                  key: "CASH IN",
                },
                {
                  value: "CASHOUT",
                  key: "CASH OUT",
                },
              ]}
              error={errors}
            />
          </form>

          <ButtonForm<CashIOReasonModel>
            isShowWarningCancel
            data={singleData}
            formName={"cashioreason-form"}
            okBtnTxt={"Save"}
            onCancelBtnClick={() => setOpenInfoCard(false)}
          />
        </Modal>
      )}

      <section className="h-screen w-full relative">
        <AddButton
          onClick={() => {
            onOpenModal("Add Cash In/Out Reason");
            setStatus("CREATE");
          }}
        />

        <div className="bg-white flex justify-between items-center fixed w-[95%] z-10 left-[3%] top-[1rem]">
          <div className="flex items-center">
            <BackButton />
            <PageTitle name={"Cash In/Out Reasons"} />
          </div>

          <div className="flex items-center">
            <PrinterButton
              otherOnClick={() => {
                printAction(MODULES.FREEREASONS);
              }}
              printoutData={{
                companyName: company.data[0].comdsc,
                title: "Cash In/Out Reason Masterfile",
                date: dateNowFormatted(),
                headers: {
                  cashioreason: {
                    header: "Cash In/Out Reason",
                    id: "cashioreason",
                  },
                  type: {
                    header: "Type",
                    id: "type",
                  },
                },
                data: allLoadedData,
              }}
            />
          </div>
        </div>

        <POSTable<CashIOReasonModel>
          onClick={(row) => {
            onOpenModal("Edit Cash In/Out Reason");
            setSingleData(row.original);
            setStatus("UPDATE");
            setEditCopy(singleData);
          } }
          columns={[
            {
              accessorKey: "cashioreason",
              id: "cashioreason", // Make sure to include the 'id' property
              header: "Cash In/Out Reasons",
            },
            {
              accessorKey: "type",
              id: "type", // Make sure to include the 'id' property
              header: "Type",
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
