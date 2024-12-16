/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { useChangeNameModal, useModal } from "../../../../hooks/modalHooks";
import { DiscountModel } from "../../../../models/discount";

export function useDiscountInitialization(
  singleData: DiscountModel | undefined,
  setSingleData: React.Dispatch<
    React.SetStateAction<DiscountModel | undefined>
  >,
  editCopy: any,
  setEditCopy: React.Dispatch<any>,
  checkLinkInputsCentral: () => void,
  registerInputs: ({
    inputs,
  }: {
    inputs: {
      path: "Discount Code *" | "Discount Description *" | "Type *";
      name: string;
      value: string;
      validate?: ((value: string) => string | boolean) | undefined;
    }[];
  }) => void,
  unregisterInputs: () => void,
  setOriginalGovDiscHolder: React.Dispatch<any>
) {
  const { modal } = useModal();
  const { modalName } = useChangeNameModal();

  useEffect(() => {
    if (!modal) return;
    checkLinkInputsCentral();

    registerInputs({
      inputs: [
        {
          path: "Discount Code *",
          name: "discde",
          value: singleData?.discde.toString() || "",
        },
        {
          path: "Discount Description *",
          name: "disdsc",
          value: singleData?.disdsc.toString() || "",
        },
        {
          path: "Type *",
          name: "distyp",
          value: singleData?.distyp || "",
        },
      ],
    });

    setOriginalGovDiscHolder(
      typeof singleData?.govdisc === "string"
        ? parseInt(singleData?.govdisc)
        : singleData?.govdisc
    );

    return () => {
      unregisterInputs();
    };
  }, [modal]);

  useEffect(() => {
    if (!singleData) {
      if (modalName !== "Delete Confirmation") {
        console.log("open go");
        setSingleData({
          chkpos: 0,
          disamt: 0,
          discde: "",
          disdsc: "",
          disper: 0,
          distyp: "",
          exemptvat: "N",
          nolessvat: 0,
          govdisc: 0,
          hookupdisc: "",
          scharge: 0,
          online_deals: 0,
        });
      }
    }

    if (editCopy === undefined) {
      console.log("DUPLICATING");
      setEditCopy(singleData);
    }
  }, [singleData]);

  return {};
}
