import { useUserActivityLog } from "../../../../hooks/useractivitylogHooks";
import { DiscountModel } from "../../../../models/discount";
import { MODULES } from "../../../../enums/activitylogs";
import { DiscountRequiredFields } from "../Discount";
import { useRef, useState } from "react";

export function useDiscountModal(
  singleData: DiscountModel | undefined,
  setSingleData: React.Dispatch<React.SetStateAction<DiscountModel | undefined>>,
  editCopy: any,
  status: "CREATE" | "UPDATE" | undefined,
  changeRequiredValue: (name: string, value: string) => Promise<unknown>,
  onChangeData: (
    name: string,
    value: string,
    checked?: boolean | undefined,
    type?: string | undefined
  ) => void,
  onSubmit: (query?: {
    [index: string]: any;
  } | undefined, type?: "CREATE" | "UPDATE" | undefined, cb?: ((response: any) => void) | undefined) => void
) {

  const [openInfoCard, setOpenInfoCard] = useState(false);
  const { updateAction, createAction } = useUserActivityLog();

  const modalBodyRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    changeRequiredValue(name, value);
    onChangeData(name, value);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    changeRequiredValue(name, value);
    onChangeData(name, value);
  };

  const onSubmitForm = () => {
    switch (status) {
      case "CREATE":
        let createRemarks = `ADDED:\nDISCOUNT:${singleData?.disdsc}\nDISCOUNT TYPE:${singleData?.distyp}`;
        createAction({ module: MODULES.DISCOUNTS, remarks: createRemarks });
        break;
      case "UPDATE":
        updateAction(
          {
            originalData: editCopy,
            changeData: singleData,
            module: MODULES.DISCOUNTS,
          },
          {
            itemName: singleData?.disdsc,
            itemCode: singleData?.discde,
          }
        );
        break;
      // print in print button
      // delete in delete button
      default:
        console.log("default");
        break;
    }
    
    onSubmit(undefined, status, () => {
      if (status === "CREATE") {
        // scroll to top smoothly
        modalBodyRef.current?.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        setSingleData(undefined);
        setOpenInfoCard(true);
        changeRequiredValue(DiscountRequiredFields.discde, "");
        changeRequiredValue(DiscountRequiredFields.disdsc, "");
        changeRequiredValue(DiscountRequiredFields.distyp, "");
      }
    });
  };

  return {
    handleInputChange,
    handleSelectChange,
    onSubmitForm,
    openInfoCard,
    modalBodyRef,
    setOpenInfoCard,
  };
}
