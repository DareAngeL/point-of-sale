/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import {Tabs} from "antd";
import { ItemComboModel } from "../../../../models/itemCombo";
import { ItemModel } from "../../../../models/items";
import { useModal } from "../../../../hooks/modalHooks";
import { useAppDispatch } from "../../../../store/store";
import { checkBarcode, getItemCombo, putItem, putItemCombo } from "../../../../store/actions/items.action";
import { setItemCombo } from "../../../../reducer/masterfileSlice";
import { MODULES } from "../../../../enums/activitylogs";
import { useUserActivityLog } from "../../../../hooks/useractivitylogHooks";
import { toast } from "react-toastify";
import { ItemClassificationModel } from "../../../../models/itemclassification";
import { ItemFormRequiredFields } from "../Items";

export const useInitItemsModal = (
  itemCombo: {
    data: ItemComboModel[];
    isLoaded: boolean;
  },
  activeItemEdit: ItemModel | undefined,
  activeClass: any,
  setItemModalData: any,
  setSelectedDefault: React.Dispatch<any>,
  setComboItemSelectedItemclass: React.Dispatch<any>,
  setComboItemSelectedItemSubclass: React.Dispatch<any>,
  setSelectedItemCombos: React.Dispatch<any>,
  setSelectedOthers: React.Dispatch<any>,
  setUpgradeList: React.Dispatch<any>,
) => {

  const [openInfoCard, setOpenInfoCard] = useState(false);
  const modalBodyRef = useRef<HTMLDivElement>(null);
  const { modal } = useModal();

  useEffect(() => {
    if (itemCombo.data.length > 0 && activeItemEdit) {
      const updatedData = itemCombo.data
        .filter((item) => {
          if (item.itmcomtyp === "DEFAULT") {
            return item.itmcomcde === activeItemEdit?.itmcde;
          }
        })
        .map((item) => {
          return {
            label: item.itmdsc,
            value: item.itmcde,
          };
        });

      const updatedDataOthers = itemCombo.data
        .filter((item) => {
          if (item.itmcomtyp === "OTHERS") {
            return item.itmcomcde === activeItemEdit?.itmcde;
          }
        })
        .map((item) => {
          return {
            label: item.itmdsc,
            value: item.itmcde,
          };
        });
      const updatedDataUpgrade = itemCombo.data
        .filter((item) => {
          if (item.itmcomtyp === "UPGRADE") {
            return item.itmcomcde === activeItemEdit?.itmcde;
          }
        })
        .map((item) => {
          return {
            label: item.itmdsc,
            value: item.itmcde,
            upgprc: item.upgprc,
          };
        });

      setSelectedItemCombos(updatedData);
      setSelectedOthers(updatedDataOthers);
      setUpgradeList(updatedDataUpgrade);
    }
  }, [activeItemEdit, Tabs]);

  useEffect(() => {
    setSelectedDefault("");
    setComboItemSelectedItemclass(undefined);
    setComboItemSelectedItemSubclass(undefined);
  }, [modal]);

  useEffect(() => {
    setItemModalData((prev: any) => {
      return {
        ...prev,
        itemsubclasscde: activeClass?.itemsubclassfiles[0]?.itemsubclasscde,
      };
    });
  }, [activeClass]);

  return {
    openInfoCard,
    modalBodyRef,
    setOpenInfoCard
  }
}

export const useSubmitItemsModal = (
  modalBodyRef: React.RefObject<HTMLDivElement> | null,
  setOpenInfoCard: React.Dispatch<React.SetStateAction<boolean>>,
  setItemModalData: React.Dispatch<React.SetStateAction<ItemModel | undefined>>,
  setAllLoadedData: React.Dispatch<React.SetStateAction<ItemModel[]>>,
  changeRequiredValue: any,
  activeItemEdit: ItemModel | undefined,
  activeComtyp: string | undefined,
  selectedItemCombos:  any[],
  selectedOthers: any[],
  setActiveComptyp: React.Dispatch<React.SetStateAction<string | undefined>>,
  upgradeList: any[],
  itemCombo: {
    data: ItemComboModel[];
    isLoaded: boolean;
  },
  itemModalData: ItemModel | undefined,
  editCopy: any,
  status: string,
) => {

  const { dispatch: dispatchModal } = useModal();
  const appDispatch = useAppDispatch();
  const { 
    createAction,
    updateAction  
  } = useUserActivityLog();

  const submitItemCombo = async (response?: any) => {
    // const url = "http://localhost:8080/api/itemcombo";
    const selectedTemplate = response ? response : activeItemEdit;

    switch (activeComtyp) {
      case "Default": {
        const formattedItemCombo = selectedItemCombos.map((item) => {
          return {
            itmcde: item.value,
            itmcomcde: selectedTemplate?.itmcde,
            itmdsc: item.label,
            upgprc: 0,
            itmcomtyp: activeComtyp?.toUpperCase() || "DEFAULT",
            itmnum: selectedTemplate?.itmnum,
            untmea: "PCS",
          };
        });

        console.log("deff: ", formattedItemCombo);
        

        // update
        const existingItems = new Set(
          itemCombo.data
            .filter((item) => item.itmcomtyp === "DEFAULT")
            .map((item) => `${item.itmcde}-${item.itmcomcde}`)
        );

        const filteredList = formattedItemCombo.filter(
          (item) => !existingItems.has(`${item.itmcde}-${item.itmcomcde}`)
        );

        // deletion
        const itemsToDelete = itemCombo.data.filter((item) => {
          return item.itmcomcde === selectedTemplate?.itmcde;
        });

        const existingItems2 = new Set(
          formattedItemCombo.map((item) => `${item.itmcde}-${item.itmcomcde}`)
        );
        const missingItems = itemsToDelete
          .filter(
            (item) => !existingItems2.has(`${item.itmcde}-${item.itmcomcde}`)
          )
          .filter((item) => item.itmcomtyp === "DEFAULT");

        const finalBody = [...filteredList];

        try {
          const response = await appDispatch(putItemCombo({
            itemCombos: finalBody,
            itemsToDelete: missingItems
          }));
          console.log(response.payload);
          appDispatch(setItemCombo(response.payload));
        } catch (error) {
          console.log(error);
        }

        break;
      }
      case "Others": {
        const formattedItemComboOthers = selectedOthers.map((item) => {
          return {
            itmcde: item.value,
            itmcomcde: selectedTemplate?.itmcde,
            itmdsc: item.label,
            upgprc: 0,
            itmcomtyp: activeComtyp?.toUpperCase() || "DEFAULT",
            itmnum: selectedTemplate?.itmnum,
            untmea: "PCS",
          };
        });

        // update
        const existingItemsOthers = new Set(
          itemCombo.data
            .filter((item) => item.itmcomtyp === "OTHERS")
            .map((item) => `${item.itmcde}-${item.itmcomcde}`)
        );

        const filteredListOthers = formattedItemComboOthers.filter(
          (item) => !existingItemsOthers.has(`${item.itmcde}-${item.itmcomcde}`)
        );

        // deletion
        const itemsToDeleteOthers = itemCombo.data.filter((item) => {
          return item.itmcomcde === selectedTemplate?.itmcde;
        });

        const existingItems2Others = new Set(
          formattedItemComboOthers.map(
            (item) => `${item.itmcde}-${item.itmcomcde}`
          )
        );
        const missingItemsOthers = itemsToDeleteOthers
          .filter(
            (item) =>
              !existingItems2Others.has(`${item.itmcde}-${item.itmcomcde}`)
          )
          .filter((item) => item.itmcomtyp === "OTHERS");

        const finalBodyOthers = [...filteredListOthers];

        console.log("ito yung papasok", finalBodyOthers);
        console.log("ito yung lakabas", missingItemsOthers);

        try {
          const response = await appDispatch(putItemCombo({
            itemCombos: finalBodyOthers,
            itemsToDelete: missingItemsOthers
          }));
          console.log(response.payload);
          appDispatch(setItemCombo(response.payload));
        } catch (error) {
          console.log(error);
        }

        break;
      }
      case "Upgrade": {
        const formattedItemComboUpgrade = upgradeList.map((item) => {
          return {
            itmcde: item.value,
            itmcomcde: selectedTemplate?.itmcde,
            itmdsc: item.label,
            upgprc: parseFloat(item.upgprc),
            itmcomtyp: activeComtyp?.toUpperCase() || "DEFAULT",
            itmnum: selectedTemplate?.itmnum,
            untmea: "PCS",
          };
        });

        const existingItemsUpgrade = new Set(
          itemCombo.data
            .filter((item) => item.itmcomtyp === "UPGRADE")
            .map((item) => `${item.itmcde}-${item.itmcomcde}`)
        );

        const filteredListUpgrade = formattedItemComboUpgrade.filter(
          (item) =>
            !existingItemsUpgrade.has(`${item.itmcde}-${item.itmcomcde}`)
        );

        // deletion
        const itemsToDeleteUpgrade = itemCombo.data.filter((item) => {
          return item.itmcomcde === selectedTemplate?.itmcde;
        });

        const existingItems2Upgrade = new Set(
          formattedItemComboUpgrade.map(
            (item) => `${item.itmcde}-${item.itmcomcde}`
          )
        );
        const missingItemsUpgrade = itemsToDeleteUpgrade
          .filter(
            (item) =>
              !existingItems2Upgrade.has(`${item.itmcde}-${item.itmcomcde}`)
          )
          .filter((item) => item.itmcomtyp === "UPGRADE");

        const finalBodyUpgrade = [...filteredListUpgrade];

        console.log("ito yung papasok", finalBodyUpgrade);
        console.log("ito yung lakabas", missingItemsUpgrade);

        try {
          const response = await appDispatch(putItemCombo({
            itemCombos: finalBodyUpgrade,
            itemsToDelete: missingItemsUpgrade
          }));
          console.log(response.payload);
          appDispatch(setItemCombo(response.payload));
        } catch (error) {
          console.log(error);
        }

        break;
      }
      default:
        break;
    }

    setActiveComptyp("Default");
    appDispatch(getItemCombo());
  };

  const onSubmitForm = async () => {
    
    const barcodeResult = await appDispatch(checkBarcode({
      id: itemModalData?.recid || -1, 
      barcode: itemModalData?.barcde || ""
    }));

    if (barcodeResult.payload.isExist) {
      return toast.error("Duplicate entry! Kindly check your inputs", {
        hideProgressBar: true,
        position: 'top-center',
        autoClose: 2000
      });
    }
    
    switch (status) {
      case "CREATE": {
        const createRemarks = `ADDED: \nITEM: ${itemModalData?.itmdsc}\nITEM TYPE: ${itemModalData?.itmtyp}`;
        createAction({module: MODULES.ITEMS, remarks: createRemarks});
        break;
      }
      case "UPDATE":
        updateAction(
          {
            originalData: editCopy,
            changeData: itemModalData,
            module: MODULES.ITEMS,
          },
          {
            itemName: itemModalData?.itmdsc,
            itemCode: itemModalData?.itmcde,
          }
        );
        break;
      // print in print button
      // delete in delete button

      default:
        console.log("default");
        break;
    }

    const fixedItemModalData = {
      ...itemModalData,
      untprc: (itemModalData?.untprc as unknown as string).replaceAll(",", ""),
    }
    const itemResult = await appDispatch(putItem(fixedItemModalData));
    if (itemResult.payload) {
      if (typeof itemResult.payload === "string") {
        return toast.error(itemResult.payload, {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
        });
      }

      if (!activeItemEdit) {
        // for adding new item
        submitItemCombo(itemResult.payload);
      } else {
        // for editing item
        submitItemCombo();
      }

      // update the allLoadedData
      setAllLoadedData((prev) => {
        if (itemModalData?.recid) {
          return prev.map((item) => {
            if (item.recid === itemModalData?.recid) {
              return itemResult.payload;
            }
            return item;
          });
        }

        return [...prev, itemResult.payload];
      });

      if (status === "CREATE") {
        toast.success("Successfully saved.", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
        });
        setItemModalData(undefined);
        setOpenInfoCard(true);
        changeRequiredValue(ItemFormRequiredFields.itemsubclasscde, "");
        changeRequiredValue(ItemFormRequiredFields.itmclacde, "");
        changeRequiredValue(ItemFormRequiredFields.itmdsc, "");
        changeRequiredValue(ItemFormRequiredFields.itmtyp, "");
        changeRequiredValue(ItemFormRequiredFields.taxcde, "");
        changeRequiredValue(ItemFormRequiredFields.untprc, "");

        // smooth scroll to top
        modalBodyRef?.current?.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } else {
        toast.success("Successfully updated.", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
        });
        dispatchModal();
      }

    } else {
      toast.error('Something went wrong.', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
      });
    }


    // if (!activeItemEdit) {
    //   // adding item
      
    // } else {
    //   // editing item
    //   const result = await appDispatch(putItem(itemModalData));
    //   if (result.payload) {
    //     if (typeof result.payload === "string") {
    //       return toast.error(result.payload, {
    //         position: "top-center",
    //         autoClose: 2000,
    //         hideProgressBar: true,
    //       });
    //     }

    //     submitItemCombo();
    //     // update the allLoadedData
    //     setAllLoadedData((prev) => {
    //       return [...prev, result.payload];
    //     });
    //     dispatchModal();
    //   } else {
    //     toast.error('Something went wrong.', {
    //       position: "top-center",
    //       autoClose: 2000,
    //       hideProgressBar: true,
    //     });
    //   }
    // }
  };

  return {
    onSubmitForm,
    submitItemCombo
  }
}

export const useItemsInputFieldsHandler = (
  changeRequiredValue: any, 
  setItemModalData: React.Dispatch<React.SetStateAction<ItemModel | undefined>>,
  itemClassif: ItemClassificationModel[],
  setActiveClass: React.Dispatch<any>,
  upgradePrice: number | undefined,
  selectedDefault: string,
  selectedUpgrade: any[],
  setUpgradePrice: React.Dispatch<any>,
  setSelectedDefault: React.Dispatch<any>,
  setSelectedUpgrade: React.Dispatch<any>,
  upgradeList: any[],
  setUpgradeList: React.Dispatch<React.SetStateAction<any[]>>,
) => {

  const handleInputChange = ({
    target: {name, value, checked, type},
  }: React.ChangeEvent<HTMLInputElement>) => {
    changeRequiredValue(name, value);
    setItemModalData((prev: any) => {
      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
    });
    // onChangeData(name, value, checked, type);

  };

  const handleSelectChange = ({
    target: {name, value},
  }: React.ChangeEvent<HTMLSelectElement>) => {
    if (name == "itmclacde") {
      const findClassifier = itemClassif.find(
        (itemClassifier) => itemClassifier.itmclacde === value
      );
      setActiveClass(findClassifier);
      const _name = "itemsubclasscde" 
      const _value = findClassifier?.itemsubclassfiles[0].itemsubclasscde;

      if (_value) {
        changeRequiredValue(_name, _value);
        setItemModalData((prev: any) => {
          return {
            ...prev,
            [_name]: _value,
          };
        });
        // onChangeData(_name, _value);
      }
    }

    changeRequiredValue(name, value);
    setItemModalData((prev: any) => {
      return {
        ...prev,
        [name]: value,
      };
    });
    // onChangeData(name, value);
  };

  // const handleItemSubClassChange = (value: any) => {
  //   console.log(value);

  //   const selectedItem = allLoadedData.find((item) => item.itmdsc === value);

  //   console.log(selectedItem);
  //   // setPrinterPlacehodler(value);
  //   setSelectedItem(selectedItem as any);
  // };

  const handleAddUpgrade = () => {

    if (!upgradePrice || !selectedDefault || !selectedUpgrade) {
      return toast.error("Complete the fields.", {
        hideProgressBar: true,
        position: 'top-center',
      });
    }
    setUpgradeList((prev) => [
      ...prev,
      {...selectedUpgrade, upgprc: upgradePrice},
    ]);
    setUpgradePrice(0);
    setSelectedDefault("");
    setSelectedUpgrade("");
  };

  const handleRemoveUpgrade = (index: number) => {
    const filteredList = [...upgradeList].filter((item, itemIndex) => {
      console.log(index, itemIndex);
      if (index !== itemIndex) {
        return item;
      }
    });
    
    setUpgradeList(filteredList);
  };

  return {
    handleInputChange,
    handleSelectChange,
    handleAddUpgrade,
    handleRemoveUpgrade
  }
}