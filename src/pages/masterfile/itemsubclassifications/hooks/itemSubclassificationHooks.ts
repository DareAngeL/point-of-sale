import React, { useCallback, useEffect, useState } from "react";
import { ItemSubclassificationRequiredFields, SelectedItemSubClass } from "../ItemSubclassifications";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import { getItemClassifications } from "../../../../store/actions/itemClassification.action";
import { toast } from "react-toastify";
import { MODULES } from "../../../../enums/activitylogs";
import { ItemSubclassificationModel } from "../../../../models/itemsubclassification";
import { useModalHook } from "../../../../hooks";
import { useUserActivityLog } from "../../../../hooks/useractivitylogHooks";
import { deleteItemSubclassifications, getItemSubclassifications, putBulkItemSubclassifications, putItemSubclassifications } from "../../../../store/actions/itemSubclassification.action";
import { ItemClassificationModel } from "../../../../models/itemclassification";

export const useInitalization = (
  checkLinkInputsCentral: any,
  itemSubclassification: ItemSubclassificationModel | undefined, 
  editCopy: any[], 
  setEditCopy: React.Dispatch<any>,
  registerInputs: (obj:any) => void,
  unregisterInputs: () => void
) => {

    const {modal} = useModal();

    useEffect(() => {
        if (modal) {
          checkLinkInputsCentral(); // enable/disable linked inputs to central
          registerInputs({
            inputs: [
              {
                path: "Item Subclassification *",
                name: "itemsubclassdsc",
                value: itemSubclassification?.itemsubclassdsc || "",
              },
              {
                path: "Item Classification *",
                name: "itmclacde",
                value: itemSubclassification?.itmclacde || "",
              },
            ],
          });
    
          return () => {
            unregisterInputs();
          };
        }
    }, [modal]);
    
    useEffect(() => {
        if (editCopy === undefined) {
          setEditCopy(itemSubclassification);
        }
    }, [itemSubclassification]);

}

export const useSetPrinter = () => {
 
  const {onOpenModal} = useModal();

  const openSetPrinter = () => {
    onOpenModal("Set Printer");

    //setSingleData(undefined);
    //dispatch();
    // modalNameDispatch(modalName || "Add new record");
  };

  return {openSetPrinter}
}

export const usePrinterInitialization = (
  callback: () => void,
  registerInputs: ({ inputs, }: {
      inputs: {
          path: "Select Printer Station *" | "Select Item Subclassification *";
          name: string;
          value: string | undefined;
          validate?: ((value: string | undefined) => string | boolean) | undefined;
      }[];
  }) => void,
  unregisterInputs: () => void,
  x: string | undefined,
  allLoadedData: ItemSubclassificationModel[], 
  setAllLoadedData: React.Dispatch<any>, 
  selectedPrinter: string, 
  selectionType: string,
  itmsubclassSelectionType: string,
  selectedItemClass: SelectedItemSubClass | null | undefined, 
  itemClassToChange: any[]
) => {
  
    const {dispatchModal} = useModal();
    const dispatch = useAppDispatch();
    const {itemClassification} = useAppSelector(state=> state.masterfile)

    useEffect(() => {
      callback();
  
      if (!itemClassification.isLoaded) {
        dispatch(getItemClassifications());
      }
    }, []);

    useEffect(() => {
      unregisterInputs();

      if (selectionType === "Custom" && itmsubclassSelectionType === "Single") {
        registerInputs({
          inputs: [
            {
              name: "selectedPrinter",
              path: "Select Printer Station *",
              value: selectedPrinter,
            },
            {
              name: "itemsubclasscde",
              path: "Select Item Subclassification *",
              value: x,
            },
          ]
        })
      } else {
        registerInputs({
          inputs: [
            {
              name: "selectedPrinter",
              path: "Select Printer Station *",
              value: selectedPrinter,
            },
          ]
        })
      }

      return () => {
        unregisterInputs();
      }
    }, [selectionType, itmsubclassSelectionType])

    const handleSetPrinter = async () => {

        if (allLoadedData.length === 0) {
          toast.error("No Item Class To Update.", {
            hideProgressBar: true,
            position: 'top-center',
          });
        } else if (selectedPrinter.length === 0) {
          toast.error("Please select printer.", {
            hideProgressBar: true,
            position: 'top-center',
          });
        } else if (
          selectionType === "Custom" &&
          !selectedItemClass &&
          itemClassToChange.length === 0
        ) {
          toast.error("Please select item class.", {
            hideProgressBar: true,
            position: 'top-center',
          });
        } else {
          switch (selectionType) {
            case "All":
              try {
                const updatedData = await dispatch(putBulkItemSubclassifications({
                  itemClass: allLoadedData,
                  printerName: selectedPrinter,
                }))
                // updates the lazy loaded data
                setAllLoadedData((prev: any) => {
                  return prev.map((item: any) => {
                    const updatedItem = updatedData.payload.find((i: any) => i.recid === item.recid);
                    if (updatedItem) {
                      return updatedItem;
                    } else {
                      return item;
                    }
                  });
                });

                await dispatch(getItemSubclassifications())
    
                toast.success("Item Classes Updated", {
                  hideProgressBar: true,
                  position: 'top-center',
                });
              } catch (error) {
                console.log(error);
                toast.error("Something went wrong.", {
                  hideProgressBar: true,
                  position: 'top-center',
                });
              }
              dispatchModal();
              // setSelectedPrinter("");
              // setSelectedItemClass(null);
              // setItemClassToChange([]);
              // setSelectionType("All");
              callback();
              return;
            case "Custom":
              if (itmsubclassSelectionType === "Multiple" && itemClassToChange.length > 0) {
                try {
                  const updatedItems = await dispatch(putBulkItemSubclassifications({
                    itemClass: itemClassToChange,
                    printerName: selectedPrinter,
                  }));

                  // updates the lazy loaded data
                  setAllLoadedData((prev: any) => {
                    return prev.map((item: any) => {
                      const updatedItem = updatedItems.payload.find((i: any) => i.recid === item.recid);
                      if (updatedItem) {
                        return updatedItem;
                      } else {
                        return item;
                      }
                    });
                  });

                  await dispatch(getItemSubclassifications());
    
                  toast.success("Item Classes Updated", {
                    hideProgressBar: true,
                    position: 'top-center',
                  });
                } catch (error) {
                  console.log(error);
                  toast.error("Something went wrong.", {
                    hideProgressBar: true,
                    position: 'top-center',
                  });
                }
              } else {
                // Single Selection
                try {
                  const resultData = await dispatch(putItemSubclassifications({
                    ...selectedItemClass as ItemSubclassificationModel,
                    locationcde: selectedPrinter
                  }));

                  // updates the lazy loaded data
                  setAllLoadedData((prev:any) => {
                    return prev.map((item: any) => {
                      if (item.recid === resultData.payload.recid) {
                        return resultData.payload;
                      } else {
                        return item;
                      }
                    });
                  });
    
                  toast.success("Item Sub Class Updated", {
                    hideProgressBar: true,
                    position: 'top-center',
                  });
                } catch (error) {
                  console.log(error);
    
                  toast.error("Something went wrong.", {
                    hideProgressBar: true,
                    position: 'top-center',
                  });
                }
              }
              dispatchModal();
              // setSelectedPrinter("");
              // setSelectedItemClass(null);
              // setItemClassToChange([]);
              // setSelectionType("All");

              callback(); // --- This is the function that will execute all of the above functions commented
              return;
          }
        }
      };

      return {handleSetPrinter}

}

export const useDeleteConfirmation = (setDeleteData: React.Dispatch<any>)=> {

  const {onOpenModal} = useModal();  

  const onDeleteConfirm = (row: any) => {
    setDeleteData(row);
    onOpenModal("Delete Confirmation");
  };

  return {onDeleteConfirm}

}

export const useDeleteData = () => {

  const dispatch = useAppDispatch();

  const onDeleteData = async (deleteData: any, setAllLoadedData: React.Dispatch<React.SetStateAction<ItemSubclassificationModel[]>>) => {

    console.log("deleteed", deleteData.original);
    await dispatch(deleteItemSubclassifications(deleteData.original.recid))
    setAllLoadedData((prev) => prev.filter((item) => item.recid !== deleteData.original.recid));
    await dispatch(getItemSubclassifications());
  }

  return {onDeleteData}

}

export const useInputChange = (setItemSubclassification: React.Dispatch<any>, changeRequiredValue: (name: string, value: string) => Promise<unknown>) => {

    const handleInputChange = ({
        target: {name, value, checked, type},
    }: React.ChangeEvent<HTMLInputElement>) => {
        changeRequiredValue(name, value);
        
        setItemSubclassification(
          (prev: any) =>
            ({
              ...prev,
              [name]: type == "checkbox" ? checked : value,
            })
        );
    };

    return {handleInputChange}

}

export const useItemSubclassChange = (
  allLoadedData: ItemSubclassificationModel[],
  itemClassToChange: ItemSubclassificationModel[],
  changeRequiredValue: (name: string, value: string | undefined) => Promise<unknown>,
  setX: React.Dispatch<any>,
  setSelectedItemClass: React.Dispatch<any>, 
  setItemClassToChange: React.Dispatch<any>
) => {

  const [itemClassToAdd, setItemClassToAdd] = useState<ItemSubclassificationModel[]>(itemClassToChange);

  const handleSingleItemSubClassChange = (value: any) => {
      const selectedItem = allLoadedData.find((item) => item.itemsubclasscde === value);
      console.log(selectedItem);
      setX(value);
      setSelectedItemClass(selectedItem as any);
      changeRequiredValue("itemsubclasscde", selectedItem?.itemsubclasscde);
  };

  const handleMultipleSubclassChange = (model: ItemSubclassificationModel | undefined) => {
      if (!model) return;

      if (itemClassToAdd.find((item) => item.itemsubclasscde === model.itemsubclasscde)) {
        setItemClassToAdd((prev) => prev.filter((item) => item.itemsubclasscde !== model.itemsubclasscde));
      } else {
        setItemClassToAdd((prev) => [...prev, model]);
      }
  }

  const handleOnConfirmMultipleSelection = () => {
      setItemClassToChange(itemClassToAdd);
  }

  const handleOnDeleteMultipleItemsubclassSelection = (model: ItemSubclassificationModel[]) => {
    setItemClassToAdd(model);
  }

  const handleOnCancelMultipleSelection = () => {
    setItemClassToAdd(itemClassToChange);
  }

  const clearMultipleSelection = () => {
    setItemClassToAdd([]);
  }

  return {itemClassToAdd, clearMultipleSelection, handleOnDeleteMultipleItemsubclassSelection, handleSingleItemSubClassChange, handleMultipleSubclassChange, handleOnConfirmMultipleSelection, handleOnCancelMultipleSelection}
}

export const useModal = () => {

  const {isOn: modal} = useAppSelector(state => state.modal);
  const {onOpenModal, dispatchModal} = useModalHook();

  return {onOpenModal, modal, dispatchModal}

}

export const useSelectChange = (itemClassification: {data: ItemClassificationModel[];isLoaded: boolean;}, setItemSubclassification: React.Dispatch<any>, changeRequiredValue: (name: string, value: string) => Promise<unknown>) => {

    const handleSelectChange = ({
      target: {name, value},
    }: React.ChangeEvent<HTMLSelectElement>) => {
      changeRequiredValue(name, value);
      setItemSubclassification((prev: any) => (
        {
          ...prev,
          [name]: value,
          ...(name === "itmclacde" && {itemclassfile: itemClassification.data.find((item) => item.itmclacde === value)}),
        }
      ));
      // onChangeData(name, value);
    };

    return {handleSelectChange}

}

export const useFormSubmit = (itemSubclassification: ItemSubclassificationModel | undefined, setItemSubclassification: React.Dispatch<ItemSubclassificationModel|undefined>, changeRequiredValue: (name: string, value: string) => Promise<unknown>,  setAllLoadedData: React.Dispatch<any>, editCopy: any[], status: string) => {

  const [openInfoCard, setOpenInfoCard] = useState(false);

  const {createAction, updateAction} =
    useUserActivityLog();

  const {dispatchModal} = useModalHook();
  const itemSubclassDispatch = useAppDispatch();
  // const showToast = true;

  const onSubmitForm = async () => {
      switch (status) {
        case "CREATE":
          let createRemarks = `DELETED: \nITEM SUBCLASS: ${itemSubclassification?.itemsubclassdsc}\nITEM CLASS CODE: ${itemSubclassification?.itmclacde}\nHIDE SUBCLASS: ${itemSubclassification?.hide_subclass}`;
          createAction({
            module: MODULES.ITEMSUBCLASSIFICATIONS,
            remarks: createRemarks,
          });
          break;
        case "UPDATE":
          updateAction(
            {
              originalData: editCopy,
              changeData: itemSubclassification,
              module: MODULES.ITEMSUBCLASSIFICATIONS,
            },
            {
              itemName: itemSubclassification?.itemsubclassdsc,
              itemCode: itemSubclassification?.itemsubclasscde,
            }
          );
          break;
        // print in print button
        // delete in delete button
        default:
          console.log("default");
          break;
      }

      const data = await itemSubclassDispatch(putItemSubclassifications(itemSubclassification));

      if (data.payload === 409) {
        return toast.error("Duplicate entry! Kindly check your inputs.", {
          hideProgressBar: true,
          position: 'top-center',
          autoClose: 2000,
        });
      }

      if (status === "CREATE") {
        toast.success("Successfully saved.", {
          hideProgressBar: true,
          position: 'top-center',
          autoClose: 2000,
        });

        setItemSubclassification(undefined);
        setOpenInfoCard(true);
        changeRequiredValue(ItemSubclassificationRequiredFields.itemsubclassdsc, "");
        changeRequiredValue(ItemSubclassificationRequiredFields.itmclacde, "");
      } else {
        dispatchModal();
        toast.success("Successfully updated.", {
          hideProgressBar: true,
          position: 'top-center',
          autoClose: 2000,
        });
      }

      itemSubclassDispatch(getItemSubclassifications());
      setAllLoadedData((prev: any) => {
        if (itemSubclassification?.recid) {
          return prev.map((item: any) => {
            if (item.recid === itemSubclassification?.recid) {
              console.log("axd:RETURN ERE", itemSubclassification);
              
              return itemSubclassification;
            } else {
              return item;
            }
          }); 
        }

        return [...prev, data.payload];
      });
      // onSubmit();
      // IMPLEMENT API THROUGH REDUX
    };

    return {onSubmitForm, setOpenInfoCard, openInfoCard}
}

export const useItemSubclassUtilities = (allLoadedData: ItemSubclassificationModel[]) => {

  const {itemClassification} = useAppSelector(state => state.masterfile)

  const itemClassFinder = (itmclacde: string) =>
  itemClassification.data.find((d) => d.itmclacde == itmclacde)?.itmcladsc;

  const fixallLoadedData = useCallback(() => {
      return allLoadedData.map((item: any) => {
          const updatedItmclacde = itemClassFinder(item.itmclacde);
          return {...item, itmcladsc: updatedItmclacde};
      });
  }, [allLoadedData]);

  return {fixallLoadedData}

}