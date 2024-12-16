import React, { useState } from "react";
import { Modal } from "../../../../common/modal/Modal";
import { useFormInputValidation } from "../../../../hooks/inputValidation";
import { RadioButton } from "../../../../common/form/RadioButton";
import { DeleteFilled } from "@ant-design/icons";
import { ButtonForm } from "../../../../common/form/ButtonForm";
import { useAppSelector } from "../../../../store/store";
import { Selection } from "../../../../common/form/Selection";
import { Empty } from "antd";
import { Checkbox } from "../../../../common/form/Checkbox";
import { useItemClassChange, usePrinterInitialization } from "../hooks/itemclassificationHooks";
import { ItemClassificationModel } from "../../../../models/itemclassification";

export interface SelectedItemClass {
  recid: number;
  itmcladsc: string;
  locationcde: string;
}

interface SetPrinterModalProps {
  allLoadedData: ItemClassificationModel[]; 
  setAllLoadedData: React.Dispatch<any>;
  editCopy: any[];
  setEditCopy: React.Dispatch<any>;
  checkLinkInputsCentral: any;
}

interface PrinterStationRequiredValues {
  "Select Printer Station *": string;
  "Select Item Classification *"?: string;
}

export function SetPrinterModal(props: SetPrinterModalProps) {

  const {printerStation, itemClassification} = useAppSelector(state => state.masterfile)
  
  const [x, setX] = useState<string | undefined>("");
  const [isItemClassOpen, setIsItemClassOpen] = useState<boolean>(false);
  const [selectedPrinter, setSelectedPrinter] = useState<string>("");
  const [selectionType, setSelectionType] = useState<string>("All");
  const [itmclassSelectionType, setItmclassSelectionType] = useState<string>("Single");
  const [selectedItemClass, setSelectedItemClass] = useState<
    SelectedItemClass | null | undefined
  >(null);
  const [itemClassToChange, setItemClassToChange] = useState<any[]>([]);

  const {
    handleSubmit,
    errors,
    clearErrors,
    changeRequiredValue,
    registerInputs,
    unregisterInputs
  } = useFormInputValidation<PrinterStationRequiredValues>();

  const resetData = () => {
    clearMultipleSelection();
    setSelectedPrinter("");
    setSelectedItemClass(null);
    setItemClassToChange([]);
    setSelectionType("All");
    setX("");
  }

  const {handleSetPrinter} = usePrinterInitialization(
    resetData, 
    registerInputs,
    unregisterInputs,
    x,
    itemClassification.data, 
    props.setAllLoadedData, 
    selectedPrinter, 
    selectionType,
    itmclassSelectionType,
    selectedItemClass, 
    itemClassToChange
  );

  const {
    itemClassToAdd, 
    handleOnDeleteMultipleItemClassSelection, 
    clearMultipleSelection, 
    handleOnCancelMultipleSelection, 
    handleSingleItemClassChange, 
    handleMultipleItemClassChange, 
    handleOnConfirmMultipleSelection
  } = useItemClassChange(itemClassification.data, itemClassToChange, changeRequiredValue, setX, setSelectedItemClass, setItemClassToChange);

  return (
      <Modal title={"Set Printer"} onExit={() => clearErrors()}>
          {/* 2nd modal */}
          {isItemClassOpen && (
            <Modal
              title={"Item Sub Class Select"}
              customFunction={() => setIsItemClassOpen(false)}
            >
              <div className="flex flex-col gap-2">
                {itemClassification.data
                  .map((item, index) => {
                    return (
                      <>
                        <Checkbox
                          key={index}
                          checked={itemClassToAdd.some((changedItem) => changedItem.itmclacde === item.itmclacde)}
                          id={item.itmclacde}
                          name={item.itmclacde}
                          description={item.itmcladsc}
                          handleInputChange={() => {
                            handleMultipleItemClassChange(item);
                          }}
                        />
                      </>
                    );
                  })}

                  <ButtonForm 
                    formName={""} 
                    okBtnTxt="Confirm"
                    onOkBtnClick={() => {
                      handleOnConfirmMultipleSelection();
                      setIsItemClassOpen(false)
                    }}
                    overrideOnCancelClick={() => {
                      handleOnCancelMultipleSelection();
                      setIsItemClassOpen(false);
                    }}
                  />
                  
                  {itemClassification.data
                  .filter(
                    (item) =>
                      !itemClassToChange.some(
                        (changedItem) =>
                          changedItem.itmclacde.toLowerCase() ===
                          item.itmclacde.toLowerCase()
                      )
                  ).length === 0 && (
                    <Empty description="No more to add" />
                  )}
              </div>
            </Modal>
          )}
          {/* 1st modal */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-gray-500">
              Fields with (*) asterisk are required
            </span>
            <form id="pr-form" onSubmit={handleSubmit(handleSetPrinter)}>
              <Selection
                handleSelectChange={(e) => {
                  changeRequiredValue(e.target.name, e.target.value);
                  setSelectedPrinter(e.target.value);
                }}
                description={"Select Printer Station *"}
                id={"selectedPrinter"}
                name={"selectedPrinter"}
                keyValuePair={printerStation.data.map((printerItem) => {
                  const {locationdsc, locationcde} = printerItem;
                  return {key: locationdsc, value: locationcde};
                })}
                value={selectedPrinter}
                error={errors}
                required
              />

              <RadioButton
                name={"SelectionType"}
                id={"SelectionType"}
                radioDatas={[
                  {name: "All", id: "All", value: "All"},
                  {name: "Custom", id: "Custom", value: "Custom"},
                ]}
                value={selectionType}
                description={"Selection Type"}
                handleInputChange={(e) => setSelectionType(e.target.value)}
                isLandscape={true}
              />

              {selectionType === "Custom" && (
                <>
                  <div className="border-[1px] p-2 rounded">
                    <RadioButton
                      name={"ItmClassSelectionType"}
                      id={"ItmClassSelectionType"}
                      radioDatas={[
                        {name: "Single Selection", id: "Single", value: "Single"},
                        {name: "Multiple Selection", id: "Multiple", value: "Multiple"},
                      ]}
                      value={itmclassSelectionType}
                      description={"Item Classification Selection Type"}
                      handleInputChange={(e) => setItmclassSelectionType(e.target.value)}
                      isLandscape={true}
                    />

                    {itmclassSelectionType === "Single" && (
                      <Selection 
                        handleSelectChange={(e) => handleSingleItemClassChange(e.target.value)} 
                        description={"Select Item Classification *"} 
                        id={"itmclacde"} 
                        name={"itmclacde"} 
                        keyValuePair={itemClassification.data.map((item) => {
                          const {itmclacde, itmcladsc} = item;
                          return {key: itmcladsc, value: itmclacde};
                        })}
                        value={x}
                        error={errors}
                        required
                      /> 
                    )}

                    {itmclassSelectionType === "Multiple" && (
                      <div className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => {
                            setIsItemClassOpen(!isItemClassOpen);
                          }}
                          className="px-4 py-2 rounded border border-solid border-blue-500 hover:bg-blue-500 hover:text-white my-5 mx-3"
                        >
                          Select Item Classification
                        </button>

                        {itemClassToChange.map((item, index) => {
                          return (
                            <div
                              className="flex items-center justify-between bg-slate-100 rounded border shadow-md text-[1.2rem] h-[50px] transition-all duration-300 hover:bg-slate-600 hover:text-white px-2"
                              key={index}
                            >
                              <p>{item?.itmcladsc}</p>
                              <DeleteFilled
                                className="text-red-500 cursor-pointer "
                                onClick={() => {
                                  const updatedItemClassToChange = [
                                    ...itemClassToChange,
                                  ];
                                  updatedItemClassToChange.splice(index, 1);
                                  setItemClassToChange(updatedItemClassToChange);
                                  handleOnDeleteMultipleItemClassSelection(updatedItemClassToChange);
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}

              <ButtonForm
                formName={"pr-form"}
                isActivated={false}
                okBtnTxt={"Confirm"}
                onCancelBtnClick={() => {
                  resetData();
                }}
                // onOkBtnClick={() => {
                //   handleSetPrinter();
                // }}
              />
            </form>
          </div>
      </Modal>

  )
}