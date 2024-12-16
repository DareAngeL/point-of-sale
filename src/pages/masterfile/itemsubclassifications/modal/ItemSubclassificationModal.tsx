
import { ButtonForm } from "../../../../common/form/ButtonForm";
import { InputText } from "../../../../common/form/InputText";
import { Modal } from "../../../../common/modal/Modal";
import { ItemSubclassificationModel } from "../../../../models/itemsubclassification";
import {Selection} from "../../../../common/form/Selection"
import { useFormSubmit, useInputChange, useSelectChange } from "../hooks/itemSubclassificationHooks";
import { useAppSelector } from "../../../../store/store";
import { ItemSubclassificationFormRequiredValues } from "../ItemSubclassifications";
import { Checkbox } from "../../../../common/form/Checkbox";
import { FormEventHandler, useRef } from "react";
import { FieldErrors, SubmitHandler, UseFormClearErrors } from "react-hook-form";
import { useFormInputValidation } from "../../../../hooks/inputValidation";
import { InfoCard } from "../../InfoCard";

interface ItemSubclassificationModalProps {
  itemSubclassification: ItemSubclassificationModel | undefined;
  setItemSubclassification: React.Dispatch<any>;
  setAllLoadedData: React.Dispatch<any>;
  changeRequiredValue: (name: string, value: string) => Promise<unknown>;
  clearErrors: UseFormClearErrors<ItemSubclassificationFormRequiredValues>;
  handleSubmit: (obj: SubmitHandler<ItemSubclassificationFormRequiredValues>) => FormEventHandler<HTMLFormElement> | undefined,
  errors: FieldErrors<ItemSubclassificationFormRequiredValues>,
  editCopy: any[];
  status: string;
  isCentralConnected: React.MutableRefObject<boolean>;
}

export function ItemSubclassificationModal(props: ItemSubclassificationModalProps) {

  const formRef = useRef<HTMLFormElement>(null);
  const {syspar, itemClassification, printerStation} = useAppSelector(state => state.masterfile);

  const {onSubmitForm, openInfoCard, setOpenInfoCard} = useFormSubmit(props.itemSubclassification, props.setItemSubclassification, props.changeRequiredValue, props.setAllLoadedData, props.editCopy, props.status);
  
  const {handleInputChange} = useInputChange(props.setItemSubclassification, props.changeRequiredValue);
  const {handleSelectChange} = useSelectChange(itemClassification, props.setItemSubclassification, props.changeRequiredValue);

  const { validateInputCharacters } = useFormInputValidation<ItemSubclassificationFormRequiredValues>();

  return (

      <Modal title={"Item Subclassification"} onClose={() =>{ 
        props.clearErrors();
        props.setItemSubclassification(undefined);
        setOpenInfoCard(false);
      }}>
          {openInfoCard && (
            <InfoCard onClose={() => setOpenInfoCard(false)} />
          )}

          <span className="text-[10px] text-gray-500">
            Fields with (*) asterisk are required
          </span>
          <form ref={formRef} id="is-form" onSubmit={props.handleSubmit(onSubmitForm)}>
            <InputText
              handleInputChange={(e) => validateInputCharacters(e.target.value, 50) ? handleInputChange(e) : null}
              name={"itemsubclassdsc"}
              value={props.itemSubclassification?.itemsubclassdsc}
              id={"itemsubclassdsc"}
              description={"Item Subclassification *"}
              error={props.errors}
              linkCentral={true}
              required
            />

            <Selection 
              handleSelectChange={handleSelectChange}
              description={"Item Classification *"} 
              id={"itmclacde"} 
              name={"itmclacde"} 
              keyValuePair={itemClassification.data.map(item => {
                return {
                  key: item.itmcladsc,
                  value: item.itmclacde
                }
              })}
              linkCentral={true}
              value={props.itemSubclassification?.itmclacde}
              error={props.errors}
              required
            />

            {(syspar.data[0].allow_printerstation === 1 && syspar.data[0].itemsubclass_printer_station_tag) ? (
              <>
                <Selection 
                  handleSelectChange={handleSelectChange}
                  className="mt-2"
                  description={"Printer Station"} 
                  id={"locationcde"} 
                  name={"locationcde"} 
                  keyValuePair={printerStation.data.filter(d => d.isSticker === 0).map((printerItem) => {
                    return {
                      key: printerItem.locationdsc,
                      value: printerItem.locationcde
                    }
                  })}
                  value={props.itemSubclassification?.locationcde}
                />
              </>
            ) : (<></>)}

            <Checkbox
              handleInputChange={handleInputChange}
              checked={props.itemSubclassification?.hide_subclass}
              id={"hide_subclass"}
              name={"hide_subclass"}
              description={"Hide from ordering screen"}
            />
          </form>

          <ButtonForm<ItemSubclassificationModel>
            isShowWarningCancel
            data={props.itemSubclassification}
            formName={"is-form"}
            okBtnTxt={"Save"}
            onCancelBtnClick={() => setOpenInfoCard(false)}
          />
      </Modal>
  )
}