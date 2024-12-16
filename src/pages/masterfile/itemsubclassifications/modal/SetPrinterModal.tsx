import React, { useState } from "react";
import { Modal } from "../../../../common/modal/Modal";
import { ItemSubclassificationModel } from "../../../../models/itemsubclassification";
import { SelectedItemSubClass } from "../ItemSubclassifications";
import { useFormInputValidation } from "../../../../hooks/inputValidation";
import {  useItemSubclassChange, usePrinterInitialization } from "../hooks/itemSubclassificationHooks";
import { RadioButton } from "../../../../common/form/RadioButton";
import { DeleteFilled } from "@ant-design/icons";
import { ButtonForm } from "../../../../common/form/ButtonForm";
import { useAppSelector } from "../../../../store/store";
import { Selection } from "../../../../common/form/Selection";
import { Empty } from "antd";
import { Checkbox } from "../../../../common/form/Checkbox";

interface SetPrinterModalProps {
  allLoadedData: ItemSubclassificationModel[]; 
  setAllLoadedData: React.Dispatch<any>;
  editCopy: any[];
  setEditCopy: React.Dispatch<any>;
  checkLinkInputsCentral: any;
}

interface PrinterStationRequiredValues {
  "Select Printer Station *": string;
  "Select Item Subclassification *"?: string;
}

export function SetPrinterModal(props: SetPrinterModalProps) {

  const {printerStation, itemSubclassification} = useAppSelector(state => state.masterfile)
  
  const [x, setX] = useState<string | undefined>("");
  const [isItemClassOpen, setIsItemClassOpen] = useState<boolean>(false);
  const [selectedPrinter, setSelectedPrinter] = useState<string>("");
  const [selectionType, setSelectionType] = useState<string>("All");
  const [itmsubclassSelectionType, setItmsubclassSelectionType] = useState<string>("Single");
  const [selectedItemClass, setSelectedItemClass] = useState<
    SelectedItemSubClass | null | undefined
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
    itemSubclassification.data, 
    props.setAllLoadedData, 
    selectedPrinter, 
    selectionType,
    itmsubclassSelectionType,
    selectedItemClass, 
    itemClassToChange
  );

  const {
    itemClassToAdd, 
    handleOnDeleteMultipleItemsubclassSelection, 
    clearMultipleSelection, 
    handleOnCancelMultipleSelection, 
    handleSingleItemSubClassChange, 
    handleMultipleSubclassChange, 
    handleOnConfirmMultipleSelection
  } = useItemSubclassChange(itemSubclassification.data, itemClassToChange, changeRequiredValue, setX, setSelectedItemClass, setItemClassToChange);

  return (
      <Modal title={"Set Printer"} onExit={() => clearErrors()}>
          {/* 2nd modal */}
          {isItemClassOpen && (
            <Modal
              title={"Item Sub Class Select"}
              customFunction={() => setIsItemClassOpen(false)}
            >
              <div className="flex flex-col gap-2">
                {itemSubclassification.data
                  .map((item, index) => {
                    return (
                      <>
                        <Checkbox
                          key={index}
                          checked={itemClassToAdd.some((changedItem) => changedItem.itemsubclasscde === item.itemsubclasscde)}
                          id={item.itemsubclasscde}
                          name={item.itemsubclasscde}
                          description={item.itemsubclassdsc}
                          handleInputChange={() => {
                            handleMultipleSubclassChange(item);
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
                  
                  {itemSubclassification.data
                  .filter(
                    (item) =>
                      !itemClassToChange.some(
                        (changedItem) =>
                          changedItem.itemsubclassdsc.toLowerCase() ===
                          item.itemsubclassdsc.toLowerCase()
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
                      name={"ItmSubclassSelectionType"}
                      id={"ItmSubclassSelectionType"}
                      radioDatas={[
                        {name: "Single Selection", id: "Single", value: "Single"},
                        {name: "Multiple Selection", id: "Multiple", value: "Multiple"},
                      ]}
                      value={itmsubclassSelectionType}
                      description={"Item Subclassification Selection Type"}
                      handleInputChange={(e) => setItmsubclassSelectionType(e.target.value)}
                      isLandscape={true}
                    />

                    {itmsubclassSelectionType === "Single" && (
                      <Selection 
                        handleSelectChange={(e) => handleSingleItemSubClassChange(e.target.value)} 
                        description={"Select Item Subclassification *"} 
                        id={"itemsubclasscde"} 
                        name={"itemsubclasscde"} 
                        keyValuePair={itemSubclassification.data.map((item) => {
                          const {itemsubclassdsc, itemsubclasscde} = item;
                          return {key: itemsubclassdsc, value: itemsubclasscde};
                        })}
                        value={x}
                        error={errors}
                        required
                      /> 
                    )}

                    {itmsubclassSelectionType === "Multiple" && (
                      <div className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => {
                            setIsItemClassOpen(!isItemClassOpen);
                          }}
                          className="px-4 py-2 rounded border border-solid border-blue-500 hover:bg-blue-500 hover:text-white my-5 mx-3"
                        >
                          Select Item Subclassification
                        </button>

                        {itemClassToChange.map((item, index) => {
                          return (
                            <div
                              className="flex items-center justify-between bg-slate-100 rounded border shadow-md text-[1.2rem] h-[50px] transition-all duration-300 hover:bg-slate-600 hover:text-white px-2"
                              key={index}
                            >
                              <p>{item?.itemsubclassdsc}</p>
                              <DeleteFilled
                                className="text-red-500 cursor-pointer "
                                onClick={() => {
                                  const updatedItemClassToChange = [
                                    ...itemClassToChange,
                                  ];
                                  updatedItemClassToChange.splice(index, 1);
                                  setItemClassToChange(updatedItemClassToChange);
                                  handleOnDeleteMultipleItemsubclassSelection(updatedItemClassToChange);
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