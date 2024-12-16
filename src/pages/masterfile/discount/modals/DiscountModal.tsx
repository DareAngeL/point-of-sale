/* eslint-disable @typescript-eslint/no-explicit-any */
import { FieldErrors, UseFormClearErrors, UseFormHandleSubmit } from "react-hook-form";
import { ButtonForm } from "../../../../common/form/ButtonForm";
import { InputNumber } from "../../../../common/form/InputNumber";
import { InputText } from "../../../../common/form/InputText";
import { RadioButton } from "../../../../common/form/RadioButton";
import { Selection } from "../../../../common/form/Selection";
import { Modal } from "../../../../common/modal/Modal";
import { DiscountModel } from "../../../../models/discount";
import { DiscountFormRequiredValues } from "../Discount";
import { useDiscountModal } from "../hooks/discountModal";
import { useFormInputValidation } from "../../../../hooks/inputValidation";
import { InfoCard } from "../../InfoCard";

interface DiscountModalProps {
  singleData: DiscountModel | undefined;
  setSingleData: React.Dispatch<React.SetStateAction<DiscountModel | undefined>>;
  editCopy: any;
  status: "CREATE" | "UPDATE" | undefined;
  isCentralConnected: React.MutableRefObject<boolean>;
  originalGovDiscHolder: any;
  changeRequiredValue: (name: string, value: string) => Promise<unknown>;
  onChangeData: (
    name: string,
    value: string,
    checked?: boolean | undefined,
    type?: string | undefined
  ) => void;
  onSubmit:(query?: {
    [index: string]: any;
} | undefined, type?: "CREATE" | "UPDATE" | undefined, cb?: ((response: any) => void) | undefined) => void;
  clearErrors: UseFormClearErrors<DiscountFormRequiredValues>;
  handleSubmit: UseFormHandleSubmit<DiscountFormRequiredValues, undefined>;
  errors: FieldErrors<DiscountFormRequiredValues>;
}

export function DiscountModal(props: DiscountModalProps) {

  const { validateInputCharacters } = useFormInputValidation<DiscountFormRequiredValues>()

  const { 
    handleInputChange,
    handleSelectChange,
    onSubmitForm,
    openInfoCard,
    modalBodyRef,
    setOpenInfoCard
  } = useDiscountModal(props.singleData, props.setSingleData, props.editCopy, props.status, props.changeRequiredValue, props.onChangeData, props.onSubmit)

  return (
    <Modal title={"Discount"} 
      onClose={() => {
        props.clearErrors();
        setOpenInfoCard(false);
      }}
      bodyRef={modalBodyRef}
    >
      {openInfoCard && (
        <InfoCard onClose={() => setOpenInfoCard(false)} />
      )}
      <span className="text-[10px] text-gray-500">
        Fields with (*) asterisk are required
      </span>
      <form id="d-form" onSubmit={props.handleSubmit(onSubmitForm)}>
        <InputText
          handleInputChange={(e) => validateInputCharacters(e.target.value, 50) ? handleInputChange(e) : null}
          name={"discde"}
          value={props.singleData?.discde}
          id={"discde"}
          description={"Discount Code *"}
          error={props.errors}
          linkCentral={true}
          required
          disabled={
            props.singleData?.govdisc == 1 && props.singleData.recid ? true : false
          }
        />

        <InputText
          handleInputChange={(e) => validateInputCharacters(e.target.value, 50) ? handleInputChange(e) : null}
          name={"disdsc"}
          value={props.singleData?.disdsc}
          id={"disdsc"}
          description={"Discount Description *"}
          error={props.errors}
          linkCentral={true}
          required
          disabled={
            props.singleData?.govdisc == 1 && props.singleData.recid ? true : false
          }
        />

        <Selection
          handleSelectChange={(e) => validateInputCharacters(e.target.value, 50) ? handleSelectChange(e) : null}
          description={"Type *"}
          value={props.singleData?.distyp}
          id={"distyp"}
          name={"distyp"}
          keyValuePair={[
            {key: "Amount", value: "Amount"},
            {key: "Percent", value: "Percent"},
          ]}
          error={props.errors}
          linkCentral={true}
          required
          // disabled={props.singleData?.govdisc == 1 ? true : false}
          disabled={
            props.singleData?.govdisc == 1 && props.singleData.recid ? true : false
          }
        />

        {props.singleData?.distyp ? (
          <>
            {props.singleData?.distyp == "Amount" ? (
              <InputNumber
                handleInputChange={(e) => validateInputCharacters(e.target.value, 50) ? handleInputChange(e) : null}
                name={"disamt"}
                value={props.singleData?.disamt || 0}
                id={"disamt"}
                description={"Amount"}
                linkCentral
                disabled={
                  (props.singleData?.govdisc == 1 && props.singleData.recid)
                    ? true
                    : false
                }
                min="0"
              />
            ) : (
              <InputNumber
                handleInputChange={(e) => validateInputCharacters(e.target.value, 50) ? handleInputChange(e) : null}
                name={"disper"}
                value={props.singleData?.disper || 0}
                linkCentral
                id={"disper"}
                description={"Percent"}
                // disabled={isCentralConnected.current}
                disabled={
                  (props.singleData?.govdisc == 1 && props.singleData.recid)
                    ? true
                    : false
                }
                min="0"
              />
            )}
          </>
        ) : (
          <></>
        )}

        <RadioButton
          name={"exemptvat"}
          id={"exemptvat"}
          radioDatas={[
            {name: "Yes", id: "ExemptYes", value: "Y"},
            {name: "No", id: "ExemptNo", value: "N"},
          ]}
          value={props.singleData?.exemptvat ? props.singleData?.exemptvat : "N"}
          description={"Exempt VAT"}
          handleInputChange={handleInputChange}
          disabled={
            props.originalGovDiscHolder === 1 && props.singleData?.recid ? true : false
          }
        />

        {props.singleData?.exemptvat === "N" && (
          <RadioButton
            name={"nolessvat"}
            id={"nolessvat"}
            radioDatas={[
              {name: "Yes", id: "LessYes", value: 0},
              {name: "No", id: "LessNo", value:1},
            ]}
            value={props.singleData?.nolessvat ? props.singleData?.nolessvat : 0}
            description={"Less VAT Discount"}
            handleInputChange={handleInputChange}
            disabled={
              props.originalGovDiscHolder === 1 && props.singleData?.recid ? true : false
            }
          />
        )}

        <RadioButton
          name={"scharge"}
          id={"scharge"}
          radioDatas={[
            {name: "Yes", id: "SCYes", value: 1},
            {name: "No", id: "SCNo", value: 0},
          ]}
          value={props.singleData?.scharge ? props.singleData?.scharge : 0}
          description={"With Service Charge Discount"}
          handleInputChange={handleInputChange}
          disabled={
            props.originalGovDiscHolder === 1 && props.singleData?.recid ? true : false
          }
        />

        <RadioButton
          name={"govdisc"}
          id={"govdisc"}
          radioDatas={[
            {name: "Yes", id: "GovYes", value: 1},
            {name: "No", id: "GovNo", value: 0},
          ]}
          value={props.singleData?.govdisc ? props.singleData?.govdisc : 0}
          description={"Government Discount"}
          handleInputChange={handleInputChange}
          disabled={
            props.originalGovDiscHolder === 1 && props.singleData?.recid ? true : false
          }
        />

        <RadioButton
          name={"online_deals"}
          id={"online_deals"}
          radioDatas={[
            {name: "Yes", id: "ODYes", value: 1},
            {name: "No", id: "ODNo", value: 0},
          ]}
          value={props.singleData?.online_deals ? props.singleData?.online_deals : 0}
          description={"Online Deals"}
          handleInputChange={handleInputChange}
        />
      </form>

      <ButtonForm<DiscountModel>
        isShowWarningCancel
        dontAddDataOnFirstRender
        data={props.singleData}
        formName={"d-form"}
        okBtnTxt={"Save"}
        isCentralConnected={props.isCentralConnected.current}
        onCancelBtnClick={() => setOpenInfoCard(false)}
      />
    </Modal>
  )
}