import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import { addOrReplaceItemClassification } from "../../../../reducer/masterfileSlice";
import { ItemClassificationModel } from "../../../../models/itemclassification";
import { useModalHook } from "../../../../hooks";
import { toast } from "react-toastify";
// import { SelectedItemClass } from "../modals/SetPrinterModal";
import { useUserActivityLog } from "../../../../hooks/useractivitylogHooks";
import { MODULES } from "../../../../enums/activitylogs";
import { deleteItemClassifications, getItemClassifications, putBulkItemClassifications, putItemClassifications } from "../../../../store/actions/itemClassification.action";
import { SelectedItemClass } from "../modals/SetPrinterModalV2";
import { ItemClassificationRequiredFields } from "../ItemClassification";

export const usePrinterInitialization = (
  callback: () => void,
  registerInputs: ({ inputs, }: {
      inputs: {
          path: "Select Printer Station *" | "Select Item Classification *";
          name: string;
          value: string | undefined;
          validate?: ((value: string | undefined) => string | boolean) | undefined;
      }[];
  }) => void,
  unregisterInputs: () => void,
  x: string | undefined,
  allLoadedData: ItemClassificationModel[], 
  setAllLoadedData: React.Dispatch<any>, 
  selectedPrinter: string, 
  selectionType: string,
  itmClassSelectionType: string,
  selectedItemClass: SelectedItemClass | null | undefined, 
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

      if (selectionType === "Custom" && itmClassSelectionType === "Single") {
        registerInputs({
          inputs: [
            {
              name: "selectedPrinter",
              path: "Select Printer Station *",
              value: selectedPrinter,
            },
            {
              name: "itmclacde",
              path: "Select Item Classification *",
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
    }, [selectionType, itmClassSelectionType])

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
                const updatedData = await dispatch(putBulkItemClassifications({
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

                await dispatch(getItemClassifications());
    
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
              if (itmClassSelectionType === "Multiple" && itemClassToChange.length > 0) {
                try {
                  const updatedItems = await dispatch(putBulkItemClassifications({
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

                  await dispatch(getItemClassifications());
    
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
                  const resultData = await dispatch(putItemClassifications({
                    ...selectedItemClass as ItemClassificationModel,
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

export const useInitalization = (
    editCopy: any[], itemClassification: ItemClassificationModel | undefined, 
    setEditCopy: React.Dispatch<any>, 
    modal: boolean, 
    checkLinkInputsCentral: () => void,
    registerInputs: (obj: any) => void,
    unregisterInputs: () => void
  ) => {

    useEffect(() => {
        if (editCopy === undefined) {
          setEditCopy(itemClassification);
        }
      }, [itemClassification]);

      useEffect(() => {
        if (modal) {
          checkLinkInputsCentral(); // enable/disable linked inputs to central
    
          registerInputs({
            inputs: [
              {
                path: "Description *",
                name: "itmcladsc",
                value: itemClassification?.itmcladsc || "",
              },
            ],
          });
        }

        return () => {
          unregisterInputs();
        };
      }, [modal]);
}

export const useDeleteConfirmation = (setDeleteData: React.Dispatch<any>) => {

    const {onOpenModal} = useModal();

    const onDeleteConfirm = (row: any) => {
        setDeleteData(row);
        onOpenModal("Delete Confirmation");
    }

    return {onDeleteConfirm}

}

export const useInputChange = (changeRequiredValue: any, setItemClassification: React.Dispatch<any>) => {
    const handleInputChange = ({
        target: {name, value, checked, type},
    }: React.ChangeEvent<HTMLInputElement>) => {
        changeRequiredValue(name, value);

        if (type === "checkbox") {
            setItemClassification((prev: any) => (
                {
                    ...prev,
                    [name]: checked ? 1 : 0
                }
            ));
            return;
        }

        setItemClassification((prev: any) => (
            {
                ...prev,
                [name]: value
            }
        ));

        // onChangeData(name, value);
    };

    return {handleInputChange}
}

export const useSelectChange = (changeRequiredValue: any, setItemClassification: React.Dispatch<any>) => {
    const handleSelectChange = ({
        target: {name, value},
      }: React.ChangeEvent<HTMLSelectElement>) => {
        console.log(name, value);
    
        changeRequiredValue(name, value);

        setItemClassification((prev: any) => (
            {
                ...prev,
                [name]: value
            }
        ));
      };

      return {handleSelectChange}

}


export const useModal = () => {

    const {isOn: modal} = useAppSelector(state => state.modal);
    const {onOpenModal, dispatchModal} = useModalHook();

    return {onOpenModal, modal, dispatchModal}

}

export const useFormSubmit = (itemClassification: ItemClassificationModel | undefined, setItemClassification: React.Dispatch<ItemClassificationModel|undefined>, changeRequiredValue: (name: string, value: string) => Promise<unknown>, setAllLoadedData: React.Dispatch<React.SetStateAction<ItemClassificationModel[]>>, editCopy: any[], status: string) => {

    const [openInfoCard, setOpenInfoCard] = useState(false);

    const {createAction, updateAction} =
    useUserActivityLog();

    const {dispatchModal} = useModalHook();
    const itemClassDispatch = useAppDispatch();

    const onSubmitForm = async () => {
        switch (status) {
          case "CREATE":
            let createRemarks = `ADDED:\nITEM CLASSIFICATION: ${itemClassification?.itmcladsc}`;
            console.log(createRemarks);
            createAction({
              module: MODULES.PRINTERSTATION,
              remarks: createRemarks,
            });
            break;
          case "UPDATE":
            updateAction(
              {
                originalData: editCopy,
                changeData: itemClassification,
                module: MODULES.ITEMCLASSIFICATION,
              },
              {
                itemName: itemClassification?.itmcladsc,
                itemCode: itemClassification?.itmclacde,
              }
            );
            break;
    
          default:
            console.log("default");
            break;
        }

        const data = await itemClassDispatch(putItemClassifications(itemClassification));

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

          setItemClassification(undefined);
          changeRequiredValue(ItemClassificationRequiredFields.itmcladsc, "");
          setOpenInfoCard(true);
        } else {
          toast.success("Successfully updated.", {
            hideProgressBar: true,
            position: 'top-center',
            autoClose: 2000,
          });

          dispatchModal();
        }
        
        itemClassDispatch(addOrReplaceItemClassification(data.payload));
        
        // since the data is lazy loaded, we need to update the data via setAllLoadedData
        // so the data will be displayed in the table
        setAllLoadedData((prev: any) => {
            let isUpdated = false;

            const mappedData = prev.map((item: any) => {
              if (item.recid === data.payload.recid) {
                isUpdated = true;
                return data.payload;
              } else {
                return item;
              }
            });

            if (!isUpdated) {
              mappedData.push(data.payload);
            }

            return mappedData;
          });
        // navigate("/1es/masterfile");
        // onSubmit(); API -- masterfileHooks.ts -- Make an API connection
    };

    return {onSubmitForm, openInfoCard, setOpenInfoCard}

}

export const useSetPrinter = (allLoadedData: ItemClassificationModel[], setAllLoadedData:React.Dispatch<any>, selectedPrinter: string, selectionType: string, selectedItemClass: SelectedItemClass | null | undefined, itemClassToChange: any[], callback: () => void) => {

    const {dispatchModal} = useModal();
    const appDispatch = useAppDispatch();

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
                const response = await appDispatch(putBulkItemClassifications({
                  itemClass: allLoadedData,
                  printerName: selectedPrinter,
                }))
                
                console.log(response);
                setAllLoadedData(response.payload);
    
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
              callback();
              return;
            case "Custom":
              if (itemClassToChange.length > 0) {
                try {
                  const response = await appDispatch(putBulkItemClassifications({
                    itemClass: allLoadedData,
                    printerName: selectedPrinter,
                  }))
                  console.log(response);
                  setAllLoadedData(response.payload);
    
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
                try {
                  const response = await appDispatch(putItemClassifications({
                    ...selectedItemClass as ItemClassificationModel,
                    locationcde: selectedPrinter
                  }))
                  console.log(response);
                  // const newallLoadedData = [...allLoadedData, {...response.data}];
    
                  // const filteredallLoadedData = newallLoadedData.filter(
                  //   (item) => item.recid !== response.data.recid
                  // );
                  const newallLoadedData = allLoadedData.filter(
                    (item) => item.recid !== response.payload.recid
                  );
    
                  newallLoadedData.push({...response.payload});
    
                  setAllLoadedData(newallLoadedData);
    
                  toast.success("Item Class Updated", {
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
              callback();
              return;
          }
        }
    };

    return {handleSetPrinter}

}

export const useItemClassChange = (
  allLoadedData: ItemClassificationModel[],
  itemClassToChange: ItemClassificationModel[],
  changeRequiredValue: (name: string, value: string | undefined) => Promise<unknown>,
  setX: React.Dispatch<any>,
  setSelectedItemClass: React.Dispatch<any>, 
  setItemClassToChange: React.Dispatch<any>
) => {

  const [itemClassToAdd, setItemClassToAdd] = useState<ItemClassificationModel[]>(itemClassToChange);

  const handleSingleItemClassChange = (value: any) => {
      const selectedItem = allLoadedData.find((item) => item.itmclacde === value);
      console.log(selectedItem);
      setX(value);
      setSelectedItemClass(selectedItem as any);
      changeRequiredValue("itmclacde", selectedItem?.itmclacde);
  };

  const handleMultipleItemClassChange = (model: ItemClassificationModel | undefined) => {
      if (!model) return;

      if (itemClassToAdd.find((item) => item.itmclacde === model.itmclacde)) {
        setItemClassToAdd((prev) => prev.filter((item) => item.itmclacde !== model.itmclacde));
      } else {
        setItemClassToAdd((prev) => [...prev, model]);
      }
  }

  const handleOnConfirmMultipleSelection = () => {
      setItemClassToChange(itemClassToAdd);
  }

  const handleOnDeleteMultipleItemClassSelection = (model: ItemClassificationModel[]) => {
    setItemClassToAdd(model);
  }

  const handleOnCancelMultipleSelection = () => {
    setItemClassToAdd(itemClassToChange);
  }

  const clearMultipleSelection = () => {
    setItemClassToAdd([]);
  }

  return {itemClassToAdd, clearMultipleSelection, handleOnDeleteMultipleItemClassSelection, handleSingleItemClassChange, handleMultipleItemClassChange, handleOnConfirmMultipleSelection, handleOnCancelMultipleSelection}
}

export const useDeleteData = () => {

  const dispatch = useAppDispatch();

  const onDeleteData = async (deleteData: any, setAllLoadedData: React.Dispatch<React.SetStateAction<ItemClassificationModel[]>>) => {

    await dispatch(deleteItemClassifications(deleteData.original.recid));
    setAllLoadedData((prev) => prev.filter((item) => item.recid !== deleteData.original.recid));
    await dispatch(getItemClassifications());
  }

  return {onDeleteData}

}
