import {useLoadedData} from "../../../hooks/serviceHooks";
import {FooterModel} from "../../../models/footer";
import {InputText} from "../../../common/form/InputText";
import {Selection} from "../../../common/form/Selection";
import {InputDateV2} from "../../../common/form/InputDate";
import {InputNumber} from "../../../common/form/InputNumber";
import {ButtonForm} from "../../../common/form/ButtonForm";
import {useState} from "react";
import { useFormSubmit, useInputChange, useMonitorChanges, useSelectChange } from "./hooks/footerHooks";
import { useFormInputValidation } from "../../../hooks/inputValidation";

export function Footer() {

  const { validateInputCharacters } = useFormInputValidation();

  // This came from a react router loader.
  const {loadedData, setLoadedData} = useLoadedData<FooterModel>();

  const [changedData, setChangedData] = useState<any>([]);
  
  // Custom hooks.
  const {handleInputChange, handleInputDateChange} = useInputChange(setLoadedData);
  const {handleSelectChange} = useSelectChange(setLoadedData);
  const {handleSubmit} = useFormSubmit(changedData,loadedData);
  useMonitorChanges(loadedData, setChangedData);

  return (
    <>
      <form id="footer-form" onSubmit={handleSubmit}>
        <Selection
          handleSelectChange={handleSelectChange}
          description={"Official Receipt"}
          value={loadedData.officialreceipt}
          id={"officialreceipt"}
          name={"officialreceipt"}
          keyValuePair={[
            {
              key: "Yes",
              value: 1,
            },
            {
              key: "No",
              value: 0,
            },
          ]}
        />
        <InputText
          handleInputChange={(e) => validateInputCharacters(e.target.value, 50) ? handleInputChange(e) : null}
          name={"supname"}
          value={loadedData.supname}
          id={"supname"}
          description={"Supplier Name"}
        />
        <InputText
          handleInputChange={(e) => validateInputCharacters(e.target.value, 50) ? handleInputChange(e) : null}
          name={"supaddress"}
          value={loadedData.supaddress}
          id={"supaddress"}
          description={"Supplier Address"}
        />
        <InputText
          handleInputChange={(e) => validateInputCharacters(e.target.value, 15) ? handleInputChange(e) : null}
          name={"supvarregtin"}
          value={loadedData.supvarregtin}
          id={"supvarregtin"}
          description={"Supplier VAT Registered TIN"}
        />
        <InputText
          handleInputChange={(e) => validateInputCharacters(e.target.value, 15) ? handleInputChange(e) : null}
          name={"supnonvatregtin"}
          value={loadedData.supnonvatregtin}
          id={"supnonvatregtin"}
          description={"Supplier Non-VAT Registered TIN"}
        />
        <InputText
          handleInputChange={(e) => validateInputCharacters(e.target.value, 50) ? handleInputChange(e) : null}
          name={"accrenum"}
          value={loadedData.accrenum}
          id={"accrenum"}
          description={"Accredited No."}
        />
        <InputDateV2
          handleInputChange={handleInputDateChange}
          name={"accredate"}
          value={loadedData.accredate}
          id={"accredate"}
          description={"Accredited Date"}
        />
        <InputText
          handleInputChange={(e) => validateInputCharacters(e.target.value, 50) ? handleInputChange(e) : null}
          name={"permitnum"}
          value={loadedData.permitnum}
          id={"permitnum"}
          description={"Permit No."}
        />
        <InputNumber
          handleInputChange={handleInputChange}
          name={"validyr"}
          value={loadedData.validyr}
          id={"validyr"}
          description={"Years Validity"}
        />
        <InputDateV2
          handleInputChange={handleInputDateChange}
          name={"dateissued"}
          value={loadedData.dateissued}
          id={"dateissued"}
          description={"Date Issued"}
        />
        <div className="shadow">
          <div className="m-7">
            <InputText
              handleInputChange={(e) => validateInputCharacters(e.target.value, 50) ? handleInputChange(e) : null}
              name={"footermsg1"}
              value={loadedData.footermsg1}
              id={"footermsg1"}
              description={"Line Message 1"}
            />
            <InputText
              handleInputChange={(e) => validateInputCharacters(e.target.value, 50) ? handleInputChange(e) : null}
              name={"footermsg2"}
              value={loadedData.footermsg2}
              id={"footermsg2"}
              description={"Line Message 2"}
            />
            <InputText
              handleInputChange={(e) => validateInputCharacters(e.target.value, 50) ? handleInputChange(e) : null}
              name={"footermsg3"}
              value={loadedData.footermsg3}
              id={"footermsg3"}
              description={"Line Message 3"}
            />
            <InputText
              handleInputChange={(e) => validateInputCharacters(e.target.value, 50) ? handleInputChange(e) : null}
              name={"footermsg4"}
              value={loadedData.footermsg4}
              id={"footermsg4"}
              description={"Line Message 4"}
            />
            <InputText
              handleInputChange={(e) => validateInputCharacters(e.target.value, 50) ? handleInputChange(e) : null}
              name={"footermsg5"}
              value={loadedData.footermsg5}
              id={"footermsg5"}
              description={"Line Message 5"}
            />
          </div>
        </div>
      </form>

      <ButtonForm<FooterModel>
        isShowWarningCancel
        data={loadedData}
        formName={"footer-form"}
        isActivated={true}
      />
    </>
  );
}
