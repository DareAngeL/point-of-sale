import {BackButton} from "../../../common/backbutton/BackButton";
import {TerminalTable} from "./TerminalTable";
import {AddButton} from "../../../common/addbutton/AddButton";
import {useServiceMasterfile} from "../../../hooks/masterfileHooks";
import {TerminalModel} from "../../../models/terminal";
import {PageTitle} from "../../../common/title/MasterfileTitle";
import {PrinterButton} from "../../../common/printerbutton/PrinterButton";
import {useAppSelector} from "../../../store/store";
import {dateNowFormatted} from "../../../helper/Date";
import {useEffect} from "react";
import {useAppDispatch} from "../../../store/store";
import {Modal} from "../../../common/modal/Modal";
import {InputText} from "../../../common/form/InputText";
import {ButtonForm} from "../../../common/form/ButtonForm";
import {useState} from "react";
import {useModal} from "../../../hooks/modalHooks";
import {SubmitHandler} from "react-hook-form";
import {useFormInputValidation} from "../../../hooks/inputValidation";
import {ipRegex} from "../../../data/regex";
import {MODULES} from "../../../enums/activitylogs";
import {useUserActivityLog} from "../../../hooks/useractivitylogHooks";
import { getTerminals } from "../../../store/actions/terminal.action";

interface TerminalFormRequiredValues {
  "Terminal Name *": string;
  "Terminal IP *": string;
}

export function Terminal() {
  const {
    onSubmit,
    onDelete,
    onOpenModal,
    onChangeData,
    singleData,
    allLoadedData,
    setSingleData,
  } = useServiceMasterfile<TerminalModel>("terminal");

  const {
    handleSubmit,
    registerInputs,
    unregisterInputs,
    errors,
    changeRequiredValue,
    clearErrors,
  } = useFormInputValidation<TerminalFormRequiredValues>();

  const company = useAppSelector((state) => state.masterfile.company);
  const dispatch = useAppDispatch();
  const terminal = useAppSelector((state) => state.masterfile.terminal);
  const {createAction, updateAction, deleteAction, printAction} =
    useUserActivityLog();
  const [deleteData, setDeleteData] = useState<any>();
  const [status, setStatus] = useState<any>("");
  const [editCopy, setEditCopy] = useState<any>([]);

  const {dispatch: dispatchModal, modal} = useModal();
  const modalName = useAppSelector((state) => state.modal.modalName);

  const onDeleteConfirm = (row: any) => {
    setDeleteData(row);
    onOpenModal("Delete Confirmation");
  };

  useEffect(() => {
    if (!terminal.isLoaded) {
      dispatch(getTerminals());
    }
  }, []);

  useEffect(() => {
    if (modal) {
      registerInputs({
        inputs: [
          {
            path: "Terminal Name *",
            name: "terminalname",
            value: singleData?.terminalname || "",
          },
          {
            path: "Terminal IP *",
            name: "terminalip",
            value: singleData?.terminalip || "",
            validate: (value) =>
              ipRegex.test(value) || "Please enter a valid IP address.",
          },
        ],
      });
    }

    return () => {
      unregisterInputs();
    };
  }, [modal]);

  const handleInputChange = ({
    target: {name, value},
  }: React.ChangeEvent<HTMLInputElement>) => {
    changeRequiredValue(name, value);
    onChangeData(name, value);
  };

  const onSubmitForm: SubmitHandler<TerminalFormRequiredValues> = (_) => {
    console.log(status, "STATUS");
    console.log(singleData);
    console.log(editCopy);

    switch (status) {
      case "CREATE":
        let createRemarks = `ADDED:\nTERMINAL NAME:${singleData?.terminalname}\nIP:${singleData?.terminalip} `;
        createAction({module: MODULES.TERMINALS, remarks: createRemarks});
        break;
      case "UPDATE":
        console.log("RUNNING UPDATE");
        updateAction(
          {
            originalData: editCopy,
            changeData: singleData,
            module: MODULES.TERMINALS,
          },
          {
            itemName: singleData?.terminalname,
          }
        );
        break;
      // print in print button
      // delete in delete button

      default:
        console.log("default");
        break;
    }
    onSubmit(undefined, status);
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
              {deleteData.original.terminalname} ?
            </span>
          </h1>
          <ButtonForm
            formName={"ps-form"}
            isActivated={false}
            okBtnTxt={"Confirm"}
            isColorSwitched={true}
            onOkBtnClick={() => {
              dispatchModal();
              onDelete(deleteData);
              let data = {
                module: MODULES.TERMINALS,
                remarks: "",
              };
              data.remarks = `DELETED: \nTERMINALNAME: ${deleteData?.original.terminalname}\nTERMINAL IP: ${deleteData?.original.terminalip}`;
              deleteAction(data);
            }}
          />
        </Modal>
      ) : (
        <Modal
          title={"Terminal"}
          isActivated={false}
          onClose={() => clearErrors()}
        >
          <form id="t-form" onSubmit={handleSubmit(onSubmitForm)}>
            <InputText
              handleInputChange={handleInputChange}
              name={"terminalname"}
              value={singleData?.terminalname || ""}
              id={"terminalname"}
              description={"Terminal Name *"}
              error={errors}
              required
            />
            <InputText
              handleInputChange={handleInputChange}
              name={"terminalip"}
              value={singleData?.terminalip || ""}
              id={"terminalip"}
              description={"Terminal IP *"}
              error={errors}
              required
            />
          </form>
          <ButtonForm<TerminalModel>
            isShowWarningCancel
            data={singleData}
            formName={"t-form"}
            okBtnTxt={singleData?.recid ? "Update Data" : "Add Data"}
          />
        </Modal>
      )}

      <section className="h-screen w-full relative">
        <AddButton
          onClick={() => {
            onOpenModal("Add new terminal");
            setStatus("CREATE");
          }}
        />

        <div className="bg-white flex justify-between items-center fixed w-[95%] z-10 left-[3%] top-[1rem]">
          <div className="flex items-center">
            <BackButton />
            <PageTitle name={"Terminal"} />
          </div>
          <PrinterButton
            otherOnClick={() => {
              printAction(MODULES.TERMINALS);
            }}
            printoutData={{
              companyName: company.data[0].comdsc,
              title: "Terminal Masterfile",
              date: dateNowFormatted(),
              headers: {
                terminalname: {
                  header: "Terminal Name",
                  id: "terminalname",
                },
                terminalip: {
                  header: "Terminal IP",
                  id: "terminalip",
                },
              },
              data: allLoadedData,
            }}
          />
        </div>

        <TerminalTable
          tableData={allLoadedData}
          onClick={(row) => {
            onOpenModal(row.original.terminalname);
            setSingleData(row.original);
            setStatus("UPDATE");
            console.log(singleData, "SET UPDATE");
            setEditCopy(singleData);
          }}
          onDeleteConfirm={onDeleteConfirm}
        />
      </section>
    </>
  );
}
