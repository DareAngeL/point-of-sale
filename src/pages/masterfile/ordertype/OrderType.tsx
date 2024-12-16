import {AddButton} from "../../../common/addbutton/AddButton";
import {BackButton} from "../../../common/backbutton/BackButton";
import {ButtonForm} from "../../../common/form/ButtonForm";
import {InputText} from "../../../common/form/InputText";
import {Selection} from "../../../common/form/Selection";
import {Modal} from "../../../common/modal/Modal";
import {PrinterButton} from "../../../common/printerbutton/PrinterButton";
import {PageTitle} from "../../../common/title/MasterfileTitle";
import {dateNowFormatted} from "../../../helper/Date";
import {useMasterfileDeletionValidation, useServiceMasterfile} from "../../../hooks/masterfileHooks";
import {DineTypeModel} from "../../../models/dinetype";
import {useAppSelector} from "../../../store/store";
import {useEffect, useState} from "react";
import {useModal} from "../../../hooks/modalHooks";
import {MODULES} from "../../../enums/activitylogs";
import {useUserActivityLog} from "../../../hooks/useractivitylogHooks";
import {useFormInputValidation} from "../../../hooks/inputValidation";
import {useCentral} from "../../../hooks/centralHooks";
import {CentralNote} from "../../../common/centralnote/CentralNote";
import {useTablePagination} from "../../../hooks/pagination";
import {POSTable} from "../../../common/table/POSTable";
import {Box, IconButton} from "@mui/material";
import {
  UserAccessActions,
  useUserAccessHook,
} from "../../../hooks/userAccessHook";
import {DeleteFilled, EditFilled} from "@ant-design/icons";
import { toast } from "react-toastify";
import { InfoCard } from "../InfoCard";

interface DineTypeFormRequiredValues {
  "Dine Type *": string;
  "Order Type *": string;
}

enum DineTypeRequiredFields {
  postypdsc = "postypdsc",
  ordertyp = "ordertyp",
}

export function OrderType() {
  const {
    onSubmit,
    onDelete,
    onOpenModal,
    onChangeData,
    singleData,
    allLoadedData,
    setAllLoadedData,
    setSingleData,
  } = useServiceMasterfile<DineTypeModel>("dinetype");

  const {
    handleSubmit,
    registerInputs,
    unregisterInputs,
    changeRequiredValue,
    clearErrors,
    validateInputCharacters,
    errors,
  } = useFormInputValidation<DineTypeFormRequiredValues>();

  const { validateOnDelete } = useMasterfileDeletionValidation("dinetype");

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
  } = useTablePagination<DineTypeModel>(setAllLoadedData, "dinetype");

  const {hasActionAccess} = useUserAccessHook();
  const {isCentralConnected} = useCentral();

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
    if (!modal) return;

    registerInputs({
      inputs: [
        {
          path: "Dine Type *",
          name: "postypdsc",
          value: singleData?.postypdsc.toString() || "",
        },
        {
          path: "Order Type *",
          name: "ordertyp",
          value: singleData?.ordertyp.toString() || "",
        },
      ],
    });

    return () => {
      unregisterInputs();
    };
  }, [modal]);

  const onDeleteConfirm = (row: any) => {
    console.log("row yarn", row);
    setDeleteData(row);
    onOpenModal("Delete Confirmation");
  };

  const handleSelectChange = ({
    target: {name, value},
  }: React.ChangeEvent<HTMLSelectElement>) => {
    changeRequiredValue(name, value);
    onChangeData(name, value);
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
        let createRemarks = `ADDED:\nDINE TYPE: ${singleData?.postypdsc}\nORDER TYPE: ${singleData?.ordertyp} `;
        createAction({module: MODULES.DINETYPE, remarks: createRemarks});
        break;
      case "UPDATE":
        console.log("RUNNING UPDATE");
        updateAction(
          {
            originalData: editCopy,
            changeData: singleData,
            module: MODULES.DINETYPE,
          },
          {
            itemName: singleData?.postypdsc,
            itemCode: singleData?.postypcde,
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
        changeRequiredValue(DineTypeRequiredFields.postypdsc, "");
        changeRequiredValue(DineTypeRequiredFields.ordertyp, "");
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
            <span className="font-bold">{deleteData.original.postypdsc} ?</span>
          </h1>
          <ButtonForm
            formName={"ps-form"}
            isActivated={false}
            okBtnTxt="Yes"
            cancelBtnTxt="No"
            isColorSwitched={true}
            onOkBtnClick={async () => {
              dispatch();
              // validate if this dinetype can be deleted or not
              if (!await validateOnDelete({
                postypcde: deleteData.original.postypcde
              })) {
                return toast.info(`"${deleteData.original.postypdsc}" is already in use for transaction. Unable to delete.`, {
                  hideProgressBar: true,
                  position: 'top-center',
                  autoClose: 2000,
                });
              }

              onDelete(deleteData);
              let data = {
                module: MODULES.DINETYPE,
                remarks: "",
              };
              data.remarks = `DELETED: \nDINE TYPE: ${deleteData?.original.postypdsc}\nORDER TYPE: ${deleteData?.original.ordertyp}`;
              deleteAction(data);
            }}
          />
        </Modal>
      ) : (
        <Modal title={"Dine Type"} 
          onClose={() => {
            clearErrors();
            setOpenInfoCard(false);
          }}
        >
          {openInfoCard && (
            <InfoCard onClose={() => setOpenInfoCard(false)} />
          )}
          <span className="text-[10px] text-gray-500">
            Fields with (*) asterisk are required
          </span>
          <form id="dt-form" onSubmit={handleSubmit(onSubmitForm)}>
            <InputText
              handleInputChange={(e) => validateInputCharacters(e.target.value, 50) ? handleInputChange(e) : null}
              name={"postypdsc"}
              value={singleData?.postypdsc}
              id={"postypdsc"}
              description={"Dine Type *"}
              error={errors}
              linkCentral={true}
              required
            />
            <Selection
              handleSelectChange={handleSelectChange}
              description={"Order Type *"}
              value={singleData?.ordertyp}
              id={"ordertyp"}
              name={"ordertyp"}
              keyValuePair={[
                {key: "DINEIN", value: "DINEIN"},
                {key: "TAKEOUT", value: "TAKEOUT"},
              ]}
              error={errors}
              linkCentral={true}
              required
            />
          </form>

          <ButtonForm<DineTypeModel>
            isShowWarningCancel
            data={singleData}
            formName={"dt-form"}
            okBtnTxt={"Save"}
            onCancelBtnClick={() => setOpenInfoCard(false)}
          />
        </Modal>
      )}

      <section className="h-screen w-full relative">
        {!isCentralConnected.current ? (
          <AddButton
            onClick={() => {
              setStatus("CREATE");
              onOpenModal("Add Order Type");
            }}
          />
        ) : (
          <CentralNote description={"Dine Type"} />
        )}

        <div className="bg-white flex justify-between items-center fixed w-[95%] z-10 left-[3%] top-[1rem]">
          <div className="flex items-center">
            <BackButton />
            <PageTitle name={"Order Type"} />
          </div>

          <div className="flex items-center">
            <PrinterButton
              otherOnClick={() => {
                printAction(MODULES.DINETYPE);
              }}
              printoutData={{
                companyName: company.data[0].comdsc,
                title: "Order Type Masterfile",
                date: dateNowFormatted(),
                headers: {
                  postypdsc: {
                    header: "Dine Type Description",
                    id: "dinetype",
                  },
                  ordertyp: {
                    header: "Order Type",
                    id: "ordertype",
                  },
                },
                data: allLoadedData,
              }}
            />
          </div>
        </div>

        <POSTable<DineTypeModel>
          columns={[
            {
              accessorKey: "postypdsc",
              header: "Dine Type",
            },
            {
              accessorKey: "ordertyp",
              id: "ordertyp", // Make sure to include the 'id' property
              header: "Order Type",
            },
          ]}
          renderRowActions={({row}) => (
            <Box>
              {row.original.postypdsc.toLowerCase() === "dine in" ||
              row.original.postypdsc.toLowerCase() === "take out"
                ? ""
                : !isCentralConnected.current &&
                  hasActionAccess(UserAccessActions.EDIT) && (
                    <IconButton
                      onClick={() => {
                        onOpenModal("Edit Order Type");
                        setSingleData(row.original);
                        setStatus("UPDATE");
                        setEditCopy(singleData);
                      }}
                      color="secondary"
                    >
                      <EditFilled className=" text-green-300" />
                    </IconButton>
                  )}

              {row.original.postypdsc.toLowerCase() === "dine in" ||
              row.original.postypdsc.toLowerCase() === "take out"
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
          tableSearchPlaceholder="Search Dine Type"
          setColumnFilters={setColumnFilters}
          setSorting={setSorting}
          columnFilters={columnFilters}
          sorting={sorting}
          tableData={allLoadedData}
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
