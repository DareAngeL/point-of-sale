import { useEffect, useState } from "react";
import { ButtonForm } from "../../../common/form/ButtonForm";
import { InputText } from "../../../common/form/InputText";
import { Modal } from "../../../common/modal/Modal";
import { useFormInputValidation } from "../../../hooks/inputValidation";
import { useModal } from "../../../hooks/modalHooks";
import { InputPesoNumber } from "../../../common/form/InputPesoNumber";
import { useMemcHook } from "./memcHook";
import { useUserActivityLog } from "../../../hooks/useractivitylogHooks";
import { MODULES } from "../../../enums/activitylogs";
import { MemcTypeModel } from "../../../models/memc";
import { InfoCard } from "../InfoCard";

interface MemcRequiredValues {
  "Description *": string;
  "Value *": number;
}

interface MemcProps {
  onSubmit: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  checkLinkInputsCentral: any;
  isCentralConnected: boolean;
  status: string;
  editCopy: any;
  setSingleData: React.Dispatch<React.SetStateAction<MemcTypeModel | undefined>>;
  singleData?: {
    code?: string;
    value?: string;
    recid?: number;
    codedsc?: string;
  };
}

enum MemcRequiredFields {
  codedsc = "codedsc",
  value = "value",

}

export function MemcModal(props: MemcProps) {
  const { handleInputChange, singleData } = props;
  const { modal } = useModal();
  const { formatMEMCValue } = useMemcHook();

  const { createAction, updateAction } = useUserActivityLog();

  const [openInfoCard, setOpenInfoCard] = useState(false);

  const {
    handleSubmit,
    registerInputs,
    unregisterInputs,
    changeRequiredValue,
    clearErrors,
    validateInputCharacters,
    errors,
  } = useFormInputValidation<MemcRequiredValues>();

  useEffect(() => {
    if (modal) {
      props.checkLinkInputsCentral();

      registerInputs({
        inputs: [
          {
            path: "Description *",
            name: "codedsc",
            value: singleData?.codedsc || "",
          },
          {
            path: "Value *",
            name: "value",
            value: singleData?.value || "",
          },
        ]
      });
  
      return () => {
        unregisterInputs();
      }
    }
  }, [modal]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    changeRequiredValue(name, value);
    handleInputChange(e);
  }

  // const onSubmitForm = () => onSubmit();

  const onSubmitForm = () => {
    switch (props.status) {
      case "CREATE": {
        const createRemarks = `ADDED:\nMEMC:${singleData?.codedsc}\nVALUE:${singleData?.value} `;
        createAction({module: MODULES.MEMC, remarks: createRemarks});
        break;
      }
      case "UPDATE":
        console.log("RUNNING UPDATE");
        updateAction(
          {
            originalData: props.editCopy,
            changeData: singleData,
            module: MODULES.MEMC,
          },
          {
            itemName: singleData?.codedsc,
            itemCode: singleData?.code,
          }
        );
        break;
      // print in print button
      // delete in delete button

      default:
        console.log("default");
        break;
    }
    props.onSubmit(undefined, props.status, () => {
      if (props.status === "CREATE") {
        props.setSingleData(undefined);
        setOpenInfoCard(true);
        changeRequiredValue(MemcRequiredFields.codedsc, "");
        changeRequiredValue(MemcRequiredFields.value, "");
      }
    });
  };

  return (
    <Modal title={"MEMC"} 
      onClose={()=>{
        clearErrors();
        setOpenInfoCard(false);
      }}
    >
      {openInfoCard && (
        <InfoCard onClose={() => setOpenInfoCard(false)} />
      )}
      <span className="text-[10px] text-gray-500">Fields with (*) asterisk are required</span>
      <form onSubmit={handleSubmit(onSubmitForm)} id="m-form">
        <InputText
          handleInputChange={(e) => validateInputCharacters(e.target.value, 50) ? onInputChange(e) : null}
          name={"codedsc"}
          value={singleData?.codedsc}
          id={"codedsc"}
          description={"Description *"}
          error={errors}
          linkCentral
          required
        />
        <InputPesoNumber
          handleInputChange={onInputChange}
          name={"value"}
          value={formatMEMCValue(singleData?.value||'0')}
          id={"value"}
          description={"Value *"}
          error={errors}
          disabled={props.isCentralConnected}
          required
        />

        <ButtonForm
          isShowWarningCancel
          data={singleData}
          isCentralConnected={props.isCentralConnected}
          formName={"m-form"}
          okBtnTxt={"Save"}
          onCancelBtnClick={() => setOpenInfoCard(false)}
        />
      </form>
    </Modal>
  );
}
