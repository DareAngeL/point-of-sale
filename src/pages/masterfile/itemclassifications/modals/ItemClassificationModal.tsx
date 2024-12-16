import { FieldErrors, SubmitHandler } from "react-hook-form";
import { ButtonForm } from "../../../../common/form/ButtonForm";
import { InputText } from "../../../../common/form/InputText";
import { Modal } from "../../../../common/modal/Modal";
import { ItemClassificationModel } from "../../../../models/itemclassification";
import { PrinterStationModel } from "../../../../models/printerstation";
import { useAppSelector } from "../../../../store/store";
import { ItemClassificationFormRequiredValues } from "../ItemClassification";
import { useFormSubmit, useInputChange, useSelectChange } from "../hooks/itemclassificationHooks";
import { FormEventHandler } from "react";
import { useFormInputValidation } from "../../../../hooks/inputValidation";
import { InfoCard } from "../../InfoCard";
import { Checkbox } from "../../../../common/form/Checkbox";

interface ItemClassificationModalProps{
  setItemClassification: React.Dispatch<any>,
  setAllLoadedData: React.Dispatch<React.SetStateAction<ItemClassificationModel[]>>,
  changeRequiredValue: (name: string, value: string) => Promise<unknown>,
  clearErrors: () => void,
  handleSubmit: (obj: SubmitHandler<ItemClassificationFormRequiredValues>) => FormEventHandler<HTMLFormElement> | undefined,
  errors: FieldErrors<ItemClassificationFormRequiredValues>,
  itemClassification: ItemClassificationModel | undefined,
  editCopy: any[],
  isCentralConnected: React.MutableRefObject<boolean>,
  status: string
}

export function ItemClassificationModal(props: ItemClassificationModalProps){

    const printers: PrinterStationModel[] = useAppSelector(
        (state) => state.masterfile.printerStation.data
    );

    const {syspar} = useAppSelector(state => state.masterfile)
    const { validateInputCharacters } = useFormInputValidation<ItemClassificationFormRequiredValues>();
    
    const {handleInputChange} = useInputChange(props.changeRequiredValue, props.setItemClassification);
    const {handleSelectChange} = useSelectChange(props.changeRequiredValue, props.setItemClassification);
    const {onSubmitForm, openInfoCard, setOpenInfoCard} = useFormSubmit(props.itemClassification, props.setItemClassification, props.changeRequiredValue, props.setAllLoadedData, props.editCopy, props.status);

    return(
        <Modal id="itemclass-modal" title={"Item Classification"} onClose={() => {
          props.clearErrors();
          props.setItemClassification(undefined);
          setOpenInfoCard(false);
        }}>
            {openInfoCard && (
              <InfoCard onClose={() => setOpenInfoCard(false)} />
            )}

            <form id="ic-form" onSubmit={props.handleSubmit(onSubmitForm)}>
              <InputText
                handleInputChange={(e) => validateInputCharacters(e.target.value, 50) ? handleInputChange(e) : null}
                name={"itmcladsc"}
                value={props.itemClassification?.itmcladsc}
                id={"itmcladsc"}
                description={"Description *"}
                error={props.errors}
                linkCentral={true}
              />

              {(syspar.data[0].allow_printerstation === 1 && syspar.data[0].itemclass_printer_station_tag) ? (
                <>
                  <label htmlFor="locationcde" className="text-[12px]">
                    Printer Station
                  </label>

                  <select
                    name="locationcde"
                    id="locationcde"
                    className={`bg-white border text-black sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 cursor-pointer`}
                    onChange={handleSelectChange}
                    value={props.itemClassification?.locationcde}
                  >
                    <option value="" disabled selected>
                      Select Printer
                    </option>
                    {printers.filter(d => d.isSticker === 0).map((printerItem, index) => {
                      const {locationdsc, locationcde} = printerItem;
                      return (
                        <option value={locationcde} key={index}>
                          {locationdsc}
                        </option>
                      );
                    })}
                  </select>
                </>
              ) : (<></>)}

              <Checkbox
                handleInputChange={handleInputChange}
                checked={props.itemClassification?.inactive_class === 1}
                id={"inactive_class"}
                name={"inactive_class"}
                description={"Set as Inactive"}
              />
            </form>

            <ButtonForm<ItemClassificationModel>
              isShowWarningCancel
              data={props.itemClassification}
              formName={"ic-form"}
              // {...(!(syspar.data[0].allow_printerstation === 1 && syspar.data[0].itemclass_printer_station_tag) && {isCentralConnected: props.isCentralConnected.current})}
              okBtnTxt={"Save"}
              onCancelBtnClick={() => setOpenInfoCard(false)}
            />
        </Modal>
    )
}