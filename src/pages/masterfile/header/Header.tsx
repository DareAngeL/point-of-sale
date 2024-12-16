
import { ButtonForm } from "../../../common/form/ButtonForm";
import { InputText } from "../../../common/form/InputText";
import { Selection } from "../../../common/form/Selection";
import { useLoadedData } from "../../../hooks/serviceHooks";
import { HeaderfileModel } from "../../../models/headerfile";
import {  useAppDispatch, useAppSelector } from "../../../store/store";
import { useFormInputValidation } from "../../../hooks/inputValidation";
import {  VATRegexNoSEDashes } from "../../../data/regex";
import { useEffect, useRef, useState } from "react";
import { useFormSubmit, useInitializeData, useInputChange, useSelectChange } from "./hooks/headerHooks";
import { toast } from "react-toastify";
import { WarehouseModel } from "../../../models/warehouse";
import { getHasTransactions } from "../../../store/actions/posfile.action";

interface HeaderFormRequiredValues {
  "Business Name 1 *": string;
  "Business Name 2 *": string;
  "Address 1 *": string;
  "Address 2 *": string;
  "Branch Code *": string;
  "Branch *": string;
  "Warehouse *": string;
  "Terminal No (max char length: 2) *": number;
  VAT: string;
}

export function Header() {

  const formRef = useRef<HTMLFormElement>(null);

  const { loadedData, setLoadedData } = useLoadedData<HeaderfileModel>();
  const {masterfile, posfile, central} = useAppSelector(state => state)
  const [changedData, ] = useState<any>([]);
  const [filteredWarehouseData, setFilteredWarehouseData] = useState<WarehouseModel[]>([]);
  const {syspar, branch} = masterfile;

  const commonInputNames = [
    "business1",
    "business2",
    "address1",
    "address2",
    "brhcde",
    "postrmno"
  ];

  const { errors, handleSubmit, changeRequiredValue, validateInputCharacters } =
    useFormInputValidation<HeaderFormRequiredValues>(undefined, {
      data: loadedData,
      form: formRef,
      inputNames: syspar.data[0].withtracc 
      ? [...commonInputNames, "warcde"]
      : commonInputNames
    });

  
  const dispatch = useAppDispatch();
  // const { transactions } = order;
  const {hasTransaction} = posfile;

  const {initializeData} = useInitializeData(dispatch);
  const {handleInputChange} = useInputChange(setLoadedData, changeRequiredValue);
  const {handleSelectChange} = useSelectChange(setLoadedData, masterfile, changeRequiredValue);
  const {onSubmit} = useFormSubmit(changedData,loadedData, dispatch);
  
  const filterArray = () => central.warehouses.filter(data => loadedData.brhcde == data.brhcde);

  // on component mount
  useEffect(() => {
    // check if there are transactions to disable editing of necessary fields
    dispatch(getHasTransactions());
  },[]);

  useEffect(() => {
    console.log('Filtering', loadedData, central.warehouses, branch.data);
    setFilteredWarehouseData(filterArray());
  },[loadedData?.brhcde]);

  initializeData();

  return (
    <>
      <div className="relative">
        <span className="text-[10px] text-gray-500">
          Fields with (*) asterisk are required
        </span>
        <form
          id="header-form"
          ref={formRef}
          onSubmit={handleSubmit(onSubmit, () => {
            toast.error("Please input data in required field.", {
              position: "top-center",
              autoClose: 2000,
              hideProgressBar: true,
            });
          })}
          className="relative"
        >
          <InputText
            handleInputChange={(e) => validateInputCharacters(e.target.value, 50) ? handleInputChange(e) : null}
            name={"business1"}
            value={loadedData.business1}
            id={"business1"}
            description={"Business Name 1 *"}
            error={errors}
            required
            disabled={true}
          />

          <InputText
            handleInputChange={(e) => validateInputCharacters(e.target.value, 50) ? handleInputChange(e) : null}
            name={"business2"}
            value={loadedData.business2}
            id={"business2"}
            description={"Business Name 2 *"}
            error={errors}
            required
          />
          <InputText
            handleInputChange={handleInputChange}
            name={"business3"}
            value={loadedData.business3}
            id={"business3"}
            description={"Business Name 3"}
          />
          <InputText
            handleInputChange={(e) => validateInputCharacters(e.target.value, 50) ? handleInputChange(e) : null}
            name={"taxpayer"}
            value={loadedData.taxpayer}
            id={"taxpayer"}
            description={"Tax Payer registered in BIR"}
          />
          <InputText
            handleInputChange={handleInputChange}
            name={"tin"}
            value={loadedData.tin}
            id={"tin"}
            description={"VAT"}
            validate={() => {
              if (loadedData.tin && loadedData.tin.length === 0) return true;
              return (
                VATRegexNoSEDashes.test(loadedData.tin || "") ||
                "Please enter a valid input."
              );
            }}
          />
          <Selection
            handleSelectChange={handleSelectChange}
            description={"Non-VAT"}
            value={loadedData.chknonvat === 1 ? "Yes" : "No"}
            id={"chknonvat"}
            name={"chknonvat"}
            keyValuePair={[
              { key: "Yes", value: "Yes" },
              { key: "No", value: "No" },
            ]}
          />
          <InputText
            handleInputChange={(e) => validateInputCharacters(e.target.value, 50) ? handleInputChange(e) : null}
            name={"address1"}
            value={loadedData.address1}
            id={"address1"}
            description={"Address 1 *"}
            error={errors}
            required
          />
          <InputText
            handleInputChange={(e) => validateInputCharacters(e.target.value, 50) ? handleInputChange(e) : null}
            name={"address2"}
            value={loadedData.address2}
            id={"address2"}
            description={"Address 2 *"}
            error={errors}
            required
          />
          <InputText
            handleInputChange={handleInputChange}
            name={"address3"}
            value={loadedData.address3}
            id={"address3"}
            description={"Address 3"}
          />
          <InputText
            handleInputChange={(e) => validateInputCharacters(e.target.value, 10) ? handleInputChange(e) : null}
            name={"serialno"}
            value={loadedData.serialno}
            id={"serialno"}
            description={"Serial Number (max char. length: 10)"}
            maxLength={10}
          />
          <InputText
            handleInputChange={(e) => validateInputCharacters(e.target.value, 50) ? handleInputChange(e) : null}
            name={"machineno"}
            value={loadedData.machineno}
            id={"machineno"}
            description={"Machine Number (max char. length: 255)"}
            maxLength={50}
          />

          <div className="shadow">
              <div className="m-7">
                <label className="block mb-2 text-xs text-black font-montserrat font-extrabold">
                  Other info
                </label>

                <p className="text-[11px] font-bold bg-yellow-300 p-1 rounded"><span className="text-red-700">*Note:</span> You can only change the branch code, warehouse and terminal no. if there are no transactions yet.</p>

                {syspar.data[0].withtracc ? (
                  <>
                    <Selection
                      handleSelectChange={handleSelectChange}
                      description={"Branch *"}
                      value={loadedData.brhcde}
                      id={"brhcde"}
                      name={"brhcde"}
                      keyValuePair={branch.data.length > 0 ? [
                        ...branch.data.map((branch: any) => ({
                          key: branch.brhdsc,
                          value: branch.brhcde
                        }))
                      ] : [
                        {key: "Something went wrong...",value:""}
                      ]}
                      required
                      error={errors}
                      disabled={hasTransaction.isLoaded && hasTransaction.data.status}
                    />
                    <Selection
                      handleSelectChange={handleSelectChange}
                      description={"Warehouse *"}
                      value={loadedData.warcde}
                      id={"warcde"}
                      name={"warcde"}
                      keyValuePair={central?.warehouses?.length > 0 ?
                        filteredWarehouseData?.map((warehouse: WarehouseModel) => ({
                          key: warehouse.wardsc || undefined,
                          value: warehouse.warcde || undefined
                        }))
                      : [
                        {key: "Something went wrong...",value:""}
                      ]}
                      required
                      error={errors}
                      disabled={hasTransaction.isLoaded && hasTransaction.data.status}
                    />
                  </>
                ) : (
                  <InputText
                    handleInputChange={(e) => validateInputCharacters(e.target.value, 30) ? handleInputChange(e) : null}
                    name={"brhcde"}
                    value={loadedData.brhcde}
                    id={"brhcde"}
                    description={"Branch Code *"}
                    error={errors}
                    required
                    disabled={hasTransaction.isLoaded && hasTransaction.data.status}
                  />
                )}
                
                <InputText
                  handleInputChange={handleInputChange}
                  name={"postrmno"}
                  value={loadedData.postrmno as unknown as number}
                  id={"postrmno"}
                  description={"Terminal No (max char length: 2) *"}
                  disabled={hasTransaction.isLoaded && hasTransaction.data.status}
                  maxLength={2}
                  error={errors}
                  required
                />

                {syspar.data[0].accpac === 1 ? (
                  <InputText
                    handleInputChange={handleInputChange}
                    name={"bnkcde"}
                    value={loadedData.bnkcde}
                    id={"bnkcde"}
                    description={"Bank Code"}
                  />
                ) : (
                  ""
                )}
              </div>
            </div>
        </form>
        <ButtonForm<HeaderfileModel>
          isShowWarningCancel
          data={loadedData}
          formName={"header-form"}
          isActivated={true}
        />
      </div>
    </>
  );
}
