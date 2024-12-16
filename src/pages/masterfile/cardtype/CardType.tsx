import {AddButton} from "../../../common/addbutton/AddButton";
import {BackButton} from "../../../common/backbutton/BackButton";
import {ButtonForm} from "../../../common/form/ButtonForm";
import {InputText} from "../../../common/form/InputText";
import {Modal} from "../../../common/modal/Modal";
import {PrinterButton} from "../../../common/printerbutton/PrinterButton";
import {PageTitle} from "../../../common/title/MasterfileTitle";
import {dateNowFormatted} from "../../../helper/Date";
import {useMasterfileDeletionValidation, useServiceMasterfile} from "../../../hooks/masterfileHooks";
import {CardTypeModel} from "../../../models/cardtype";
import {useAppSelector} from "../../../store/store";
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
interface CardTypeFormRequiredValues {
  "Description *": string;
}

enum CardTypeRequiredFields {
  cardtype = "cardtype"
}

export function CardType() {
  const {
    onSubmit,
    onDelete,
    onOpenModal,
    onChangeData,
    singleData,
    allLoadedData,
    setSingleData,
    setAllLoadedData
  } = useServiceMasterfile<CardTypeModel>("cardtype");

  const {
    handleSubmit,
    registerInputs,
    unregisterInputs,
    changeRequiredValue,
    clearErrors,
    validateInputCharacters,
    errors,
  } = useFormInputValidation<CardTypeFormRequiredValues>();

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
  } = useTablePagination<CardTypeModel>(setAllLoadedData, "cardtype");

  const { validateOnDelete } = useMasterfileDeletionValidation("");

  const { isCentralConnected, checkLinkInputsCentral } = useCentral();

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
    if (modal) checkLinkInputsCentral();

    registerInputs({
      inputs: [
        {
          path: "Description *",
          name: "cardtype",
          value: singleData?.cardtype || "",
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
      case "CREATE": {
        const createRemarks = `ADDED:\nCARD TYPE:${singleData?.cardtype}`;
        createAction({module: MODULES.CARDTYPES, remarks: createRemarks});
        break;
      }
      case "UPDATE":
        console.log("RUNNING UPDATE");
        updateAction(
          {
            originalData: editCopy,
            changeData: singleData,
            module: MODULES.CARDTYPES,
          },
          {
            itemName: singleData?.cardtype,
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
        changeRequiredValue(CardTypeRequiredFields.cardtype, "");
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
            <span className="font-bold">{deleteData.original.cardtype} ?</span>
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
                cardclass: deleteData.original.cardtype
              })) {
                return toast.info(`"${deleteData.original.cardtype}" is already in use. Unable to delete.`, {
                  hideProgressBar: true,
                  position: 'top-center',
                  autoClose: 2000,
                });
              }
              
              onDelete(deleteData);
              const data = {
                module: MODULES.CARDTYPES,
                remarks: "",
              };
              data.remarks = `DELETED: \nTERMINALNAME: ${deleteData?.original.cardtype}`;
              deleteAction(data);
            }}
          />
        </Modal>
      ) : (
        <Modal title={"Card Type"} 
          onClose={() => {
            clearErrors();
            setOpenInfoCard(false);
          }}
        >
          {openInfoCard && (
            <InfoCard onClose={() => setOpenInfoCard(false)} />
          )}
          <form id="ct-form" onSubmit={handleSubmit(onSubmitForm)}>
            <InputText
              handleInputChange={(e) => validateInputCharacters(e.target.value, 50) ? handleInputChange(e) : null}
              name={"cardtype"}
              value={singleData?.cardtype}
              id={"cardtype"}
              description={"Description *"}
              error={errors}
              linkCentral
              required
            />
          </form>

          <ButtonForm<CardTypeModel>
            isShowWarningCancel
            data={singleData}
            formName={"ct-form"}
            okBtnTxt={"Save"}
            isCentralConnected={isCentralConnected.current}
            onCancelBtnClick={() => setOpenInfoCard(false)}
          />
        </Modal>
      )}

      <section className="h-screen w-full relative">
        {isCentralConnected.current ? (
          <CentralNote description="Card Type" />
        ) : (
          <AddButton
            onClick={() => {
              onOpenModal("Add Card Type");
              setStatus("CREATE");
            }}
          />
        )}

        <div className="bg-white flex justify-between items-center fixed w-[95%] z-10 left-[3%] top-[1rem]">
          <div className="flex items-center">
            <BackButton />
            <PageTitle name={"Card Type"} />
          </div>

          <div className="flex items-center">
            <PrinterButton
              otherOnClick={() => {
                printAction(MODULES.CARDTYPES);
              }}
              printoutData={{
                companyName: company.data[0].comdsc,
                title: "Card Type Masterfile",
                date: dateNowFormatted(),
                headers: {
                  cardtype: {
                    header: "Card Type",
                    id: "cardtype",
                  },
                },
                data: allLoadedData,
              }}
            />
          </div>
        </div>

        <POSTable<CardTypeModel>
          onClick={(row) => {
            onOpenModal("Edit Card Type");
            setSingleData(row.original);
            setStatus("UPDATE");
            setEditCopy(singleData);
          } }
          columns={[
            {
              accessorKey: "cardtype",
              id: "cardtype", // Make sure to include the 'id' property
              header: "Description",
            },
          ]}
          tableSearchPlaceholder="Search CardType"
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
