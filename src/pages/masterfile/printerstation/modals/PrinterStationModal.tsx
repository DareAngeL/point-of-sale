import { UseFormHandleSubmit } from "react-hook-form";
import { ButtonForm } from "../../../../common/form/ButtonForm";
import { InputText } from "../../../../common/form/InputText";
import { Modal } from "../../../../common/modal/Modal";
import { PrinterStationModel } from "../../../../models/printerstation";
import { usePrinterStationModal } from "../hooks/printerStationModal";
import { PrinterStationFormRequiredValues } from "../PrinterStation";
import { Selection } from "../../../../common/form/Selection";
import { InputNumber } from "../../../../common/form/InputNumber";

interface PrinterStationModalProps {
  printerStationModalData: PrinterStationModel | undefined;
  setPrinterStationModalData: React.Dispatch<React.SetStateAction<PrinterStationModel | undefined>>;
  setAllLoadedData: React.Dispatch<React.SetStateAction<PrinterStationModel[]>>;
  status: string;
  editCopy: any;
  handleSubmit: UseFormHandleSubmit<PrinterStationFormRequiredValues, undefined>;
  changeRequiredValue: (name: string, value: string) => Promise<unknown>;
  errors: any;
  clearErrors: () => void;
}

export function PrinterStationModal(props: PrinterStationModalProps) {

  const {
    handleInputChange,
    handleSelectChange,
    onSubmitForm,
  } = usePrinterStationModal(props.printerStationModalData, props.setPrinterStationModalData, props.setAllLoadedData, props.status, props.editCopy, props.changeRequiredValue);

  return (
    <Modal title={"Printer Station"} onClose={() => props.clearErrors()}>
      <span className="text-[10px] text-gray-500">
        Fields with (*) asterisk are required
      </span>
      <form id="ps-form" onSubmit={props.handleSubmit(onSubmitForm)}>
        <InputText
          handleInputChange={handleInputChange}
          name={"locationdsc"}
          value={props.printerStationModalData?.locationdsc}
          id={"locationdsc"}
          description={"Station Name *"}
          error={props.errors}
          required
        />
        <InputText
          handleInputChange={handleInputChange}
          name={"terminalip"}
          value={props.printerStationModalData?.terminalip || ""}
          id={"terminalip"}
          description={"Terminal IP *"}
          error={props.errors}
          required
        />
        <InputText
          handleInputChange={handleInputChange}
          name={"printername"}
          value={props.printerStationModalData?.printername}
          id={"printername"}
          description={"Printer Name *"}
          error={props.errors}
          required
        />
        <InputText
          handleInputChange={handleInputChange}
          name={"printersize"}
          value={props.printerStationModalData?.printersize}
          id={"printersize"}
          description={"Printer Size *"}
          error={props.errors}
          required
        />

        <Selection 
          handleSelectChange={handleSelectChange}
          description={"Sticker Printer"} 
          id={"isSticker"}
          name={"isSticker"}
          value={props.printerStationModalData?.isSticker || 0}
          keyValuePair={[{key: "Yes", value: 1}, {key: "No", value: 0}]}
        />

        {parseInt(props.printerStationModalData?.isSticker as unknown as string) === 1 && (
          <>
            <InputNumber
              handleInputChange={handleInputChange}
              name={"stckheight"}
              value={(props.printerStationModalData?.stckheight||0)*1}
              id={"stckheight"}
              description={"Sticker Height"}
            />
            <InputNumber
              handleInputChange={handleInputChange}
              name={"stckwidth"}
              value={(props.printerStationModalData?.stckwidth||0)*1}
              id={"stckwidth"}
              description={"Sticker Width"}
            />
            <InputNumber
              handleInputChange={handleInputChange}
              name={"stckfontsize"}
              value={(props.printerStationModalData?.stckfontsize||0)*1}
              id={"stckfontsize"}
              description={"Sticker Font Size"}
            />
          </>
        )}
      </form>

      <ButtonForm<PrinterStationModel>
        isShowWarningCancel
        data={props.printerStationModalData}
        formName={"ps-form"}
        okBtnTxt={props.printerStationModalData?.recid ? "Update Data" : "Add Data"}
      />
    </Modal>
  )
}