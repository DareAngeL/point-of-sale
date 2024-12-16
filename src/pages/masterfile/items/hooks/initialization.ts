import { useEffect } from "react";
import { useCentral } from "../../../../hooks/centralHooks";
import { useModal } from "../../../../hooks/modalHooks";
import { ItemModel } from "../../../../models/items";
import { ItemClassificationModel } from "../../../../models/itemclassification";
import { ItemSubclassificationModel } from "../../../../models/itemsubclassification";

export function useItemsInitialization(
  itemModalData: ItemModel | undefined,
  registerInputs: ({
    inputs,
  }: {
    inputs: {
      path:
        | "Item *"
        | "Item Type *"
        | "Item Classification *"
        | "Item Subclassification *"
        | "Selling Price *"
        | "Tax Code *";
      name: string;
      value: string;
      validate?: ((value: string) => string | boolean) | undefined;
    }[];
  }) => void,
  unregisterInputs: () => void,
  allLoadedData: ItemModel[],
  itemClassification: {
    data: ItemClassificationModel[];
    isLoaded: boolean;
  },
  itemSubclassification: {
    data: ItemSubclassificationModel[];
    isLoaded: boolean;
  },
  setItemDisplay: React.Dispatch<any>,
  setItemModalData: React.Dispatch<React.SetStateAction<ItemModel | undefined>>,
  editCopy: any,
  setEditCopy: React.Dispatch<any>,
) {

  const { checkLinkInputsCentral } = useCentral();
  const { modal } = useModal();

  useEffect(() => {
    if (modal) {
      checkLinkInputsCentral();
      // register fields to validation
      registerInputs({
        inputs: [
          {
            path: "Item *",
            name: "itmdsc",
            value: itemModalData?.itmdsc || "",
          },
          {
            path: "Item Type *",
            name: "itmtyp",
            value: itemModalData?.itmtyp || "",
          },
          {
            path: "Item Classification *",
            name: "itmclacde",
            value: itemModalData?.itmclacde || "",
          },
          {
            path: "Item Subclassification *",
            name: "itemsubclasscde",
            value: itemModalData?.itemsubclasscde || "",
          },
          {
            path: "Selling Price *",
            name: "untprc",
            value: itemModalData?.untprc ? itemModalData?.untprc.toString() : "",
          },
          {
            path: "Tax Code *",
            name: "taxcde",
            value: itemModalData?.taxcde || "",
          },
        ],
      });
    } else {
      setItemModalData(undefined);
    }

    return () => {
      // unregister
      unregisterInputs();
    };
  }, [modal]);

  useEffect(() => {
    const x = allLoadedData.map((item) => {
      const findItemClass = itemClassification.data.find(
        (d) => d.itmclacde == item.itmclacde
      );
      const findItemSubclass = itemSubclassification.data.find(
        (d) => d.itemsubclasscde == item.itemsubclasscde
      );

      // console.log(findItemSubclass);

      return {
        ...item,
        itmcladsc: findItemClass?.itmcladsc,
        itemsubclassdsc: findItemSubclass?.itemsubclassdsc,
      };
    });

    console.log("api", allLoadedData);

    setItemDisplay(x);
  }, [allLoadedData]);

  useEffect(() => {
    if (editCopy === undefined) {
      console.log("DUPLICATING");
      setEditCopy(itemModalData);
    }
  }, [itemModalData]);
}
