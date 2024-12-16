import { useNavigate } from "react-router";
import { AddButton } from "../../../common/addbutton/AddButton";
import { BackButton } from "../../../common/backbutton/BackButton";
import { ButtonForm } from "../../../common/form/ButtonForm";
import { InputText } from "../../../common/form/InputText";
import { Modal } from "../../../common/modal/Modal";
import { PrinterButton } from "../../../common/printerbutton/PrinterButton";
import { dateNowFormatted } from "../../../helper/Date";
import { useServiceMasterfile } from "../../../hooks/masterfileHooks";
import { WarehouseModel } from "../../../models/warehouse";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { PageTitle } from "../../../common/title/MasterfileTitle";
import { WarehouseTable } from "./WarehouseTable";
import { useEffect, useState } from "react";
import { useModal } from "../../../hooks/modalHooks";
import { useFormInputValidation } from "../../../hooks/inputValidation";
import { setWarehouse } from "../../../reducer/masterfileSlice";
import { MODULES } from "../../../enums/activitylogs";
import { useUserActivityLog } from "../../../hooks/useractivitylogHooks";
import { useCentral } from "../../../hooks/centralHooks";
import { CentralNote } from "../../../common/centralnote/CentralNote";
interface WarehouseFormRequiredValues {
  "Warehouse *": string;
}

export function Warehouse() {
  // const { allLoadedData, singleData, onOpenModal, onChangeData, setSingleData } =
  //   useMasterfile<WarehouseModel>();
  const {
    onDelete,
    onSubmit,
    onOpenModal,
    onChangeData,
    singleData,
    allLoadedData,
    setSingleData,
  } = useServiceMasterfile<WarehouseModel>("warehouse");

  const {
    handleSubmit,
    registerInputs,
    unregisterInputs,
    changeRequiredValue,
    clearErrors,
    errors,
  } = useFormInputValidation<WarehouseFormRequiredValues>();

  const { isCentralConnected } = useCentral();

  const navigate = useNavigate();

  const company = useAppSelector((state) => state.masterfile.company);
  const warehouse = useAppSelector((state) => state.masterfile.warehouse.data);

  const { createAction, updateAction, deleteAction, printAction } =
    useUserActivityLog();
  const appDispatcher = useAppDispatch();
  const [deleteData, setDeleteData] = useState<any>();
  const [status, setStatus] = useState<any>("");
  const [editCopy, setEditCopy] = useState<any>([]);

  const { dispatch, modal } = useModal();
  const modalName = useAppSelector((state) => state.modal.modalName);

  useEffect(() => {
    registerInputs({
      inputs: [
        {
          path: "Warehouse *",
          name: "wardsc",
          value: singleData?.wardsc || "",
        },
      ],
    });

    return () => {
      unregisterInputs();
    };
  }, [modal]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    changeRequiredValue(name, value);
    onChangeData(name, value);
  };

  const onDeleteConfirm = (row: any) => {
    console.log(row);
    setDeleteData(row);
    onOpenModal("Delete Confirmation");
  };

  const onCardClick = (warcde: string) => {
    navigate(`/pages/warehousedetail/${warcde}`);
  };

  const onSubmitForm = () => {
    console.log("SUBMITTING");

    switch (status) {
      case "CREATE":
        let createRemarks = `ADDED:\nWAREHOUSE:${singleData?.wardsc}\n`;
        createAction({ module: MODULES.WAREHOUSE, remarks: createRemarks });
        break;
      case "UPDATE":
        console.log("RUNNING UPDATE");
        updateAction(
          {
            originalData: editCopy,
            changeData: singleData,
            module: MODULES.WAREHOUSE,
          },
          {
            itemName: singleData?.wardsc,
          }
        );
        break;
      // print in print button
      // delete in delete button
      default:
        console.log("default");
        break;
    }

    onSubmit();
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
            Do you want to delete: {/*Fixed the original*/}
            <span className="font-bold">
              {deleteData && deleteData.original.wardsc} ?
            </span>
          </h1>
          <ButtonForm
            formName={"ps-form"}
            isActivated={false}
            okBtnTxt={"Confirm"}
            isColorSwitched={true}
            onOkBtnClick={() => {
              dispatch();
              onDelete(deleteData && deleteData.original.warcde);
              const data = {
                module: MODULES.WAREHOUSE,
                remarks: "",
              };
              data.remarks = `DELETED: \nWAREHOUSE: ${deleteData?.original.wardsc}`;
              deleteAction(data);
            }}
          />
        </Modal>
      ) : (
        modal && (
          <Modal title={"Warehouse"} onClose={() => clearErrors()}>
            <form id="warehouse-form" onSubmit={handleSubmit(onSubmitForm)}>
              <InputText
                handleInputChange={handleInputChange}
                name={"wardsc"}
                value={singleData?.wardsc}
                id={"wardsc"}
                description={"Warehouse *"}
                error={errors}
                required
              />
            </form>

            <ButtonForm<WarehouseModel>
              isShowWarningCancel
              data={singleData}
              formName="warehouse-form"
              okBtnTxt="Add Data"
            />
          </Modal>
        )
      )}

      <section className="h-screen w-full relative">
        {!isCentralConnected.current ? (
          <AddButton
            onClick={() => {
              onOpenModal("Create new warehouse");
              setStatus("CREATE");
            }}
          />
        ) : (
          <CentralNote description="Warehouse" />
        )}

        <div className="bg-white flex justify-between items-center fixed w-[95%] z-10 left-[3%] top-[1rem]">
          <div className="flex items-center">
            <BackButton />
            <PageTitle name={"Warehouse"} />
          </div>

          <div className="flex items-center">
            <PrinterButton
              otherOnClick={() => {
                printAction(MODULES.WAREHOUSE);
              }}
              printoutData={{
                companyName: company.data[0].comdsc,
                title: "Warehouse/Tenant Master file",
                date: dateNowFormatted(),
                headers: {
                  wardsc: {
                    header: "Description",
                    id: "wardsc",
                  },
                  itemsubclass: {
                    header: "Item Subclassification",
                    id: "itemsubclass",
                  },
                },
                data: allLoadedData,
              }}
            />
          </div>
        </div>

        <WarehouseTable
          tableData={allLoadedData}
          onClick={(row) => {
            setSingleData(row.original);
            appDispatcher(setWarehouse([...warehouse, row.original]));
            onCardClick(row.original.warcde);
            setStatus("UPDATE");
            setEditCopy(singleData);
          }}
          // onDelete={(row) => onDelete(row.original.warcde)}
          // onDeleteConfirm={(row) => onDeleteConfirm(row)}
          onDeleteConfirm={onDeleteConfirm}
          isCentralConnected={isCentralConnected.current}
        />
      </section>
    </>
  );
}
