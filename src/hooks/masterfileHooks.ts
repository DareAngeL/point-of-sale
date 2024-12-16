import {useEffect, useState} from "react";
import {useAllLoadedData, useService} from "./serviceHooks";
import {useChangeNameModal, useModal} from "./modalHooks";
import {BaseModel} from "../models/basemodel";
import {useAppDispatch, useAppSelector} from "../store/store";
import {Action} from "@reduxjs/toolkit";
import {resetLoading} from "../reducer/transactionSlice";
import {ItemModel} from "../models/items";
import {ItemClassificationModel} from "../models/itemclassification";
import {ItemSubclassificationModel} from "../models/itemsubclassification";
import {toast} from "react-toastify";
import {usePDFBuilder} from "../common/pdf/PDFBuilder";
import {
  PDFCanvas,
  PDFHeader,
  PDFOptions,
} from "../common/pdf/PDFBuilderInterface";
import { getItemClassifications } from "../store/actions/itemClassification.action";
import { getItemSubclassifications } from "../store/actions/itemSubclassification.action";
import { getCardType } from "../store/actions/cardType.action";
import { getCompany } from "../store/actions/company.action";
import { getDineType } from "../store/actions/dineType.action";
import { checkGovernmentDiscounts } from "../store/actions/discount.action";
import { getItemCombo } from "../store/actions/items.action";
import { getMEMC } from "../store/actions/memc.action";
import { getMenus } from "../store/actions/menus.action";
import { getPriceList } from "../store/actions/pricelist.action";
import { getPrinterStations } from "../store/actions/printerStation.action";
import { getHeader } from "../store/actions/printout.action";
import { getSysPar } from "../store/actions/systemParameters.action";
import { getTerminals } from "../store/actions/terminal.action";
import { getWarehouse } from "../store/actions/warehouse.action";
import { validateMasterfileDeletion } from "../store/actions/masterfile.action";

export function useMasterfile<T extends BaseModel>() {
  const {dispatch} = useModal();
  const {allLoadedData, setAllLoadedData} = useAllLoadedData<T>();
  const [singleData, setSingleData] = useState<T>();
  const {modalNameDispatch} = useChangeNameModal();
  const appDispatch = useAppDispatch();

  const onOpenModal = (modalName: string) => {
    setSingleData(undefined);
    dispatch();
    modalNameDispatch(modalName || "Add new record");
  };

  const cardOnClick = (id: number) => {
    const findData = allLoadedData.find((d) => d.recid === id);
    setSingleData(findData);
  };

  const onChangeData = (
    name: string,
    value: string,
    checked?: boolean,
    type?: string
  ) => {
    console.log(singleData);
    console.log(name, value);
    setSingleData(
      (prev) =>
        ({
          ...prev,
          [name]: type == "checkbox" ? checked : value,
        } as T)
    );
  };

  const onSubmitData = (data: T) => {
    console.log(data.recid);
    const mapallLoadedData = allLoadedData.map((d) => {
      if (d.recid === singleData?.recid) {
        return singleData;
      }
      return d;
    }) as T[];

    const {recid} = singleData as T;

    console.log("ID ni lord", recid);

    if (!recid) {
      // const clonedData = { ...singleData };
      console.log("data raw nya", data);

      setAllLoadedData((current) => [...current, {...data}] as T[]);
    } else {
      console.log("waw", mapallLoadedData);

      setAllLoadedData(mapallLoadedData);
    }
  };

  const setComeFromFetch = (action: (payload: any) => Action, allLoadedData: any) => {
    useEffect(() => {
      appDispatch(action(allLoadedData));
    }, []);
  };

  return {
    allLoadedData,
    singleData,
    setSingleData,
    setAllLoadedData,
    onOpenModal,
    cardOnClick,
    onChangeData,
    onSubmitData,
    setComeFromFetch,
  };
}

export function useServiceMasterfile<T extends BaseModel>(url: string) {
  const {
    allLoadedData,
    setAllLoadedData,
    singleData,
    onOpenModal,
    setSingleData,
    onChangeData,
    onSubmitData,
  } = useMasterfile<T>();

  const {dispatch} = useModal();
  const {deleteData, putData, postBulkData, query} = useService<T>(url);

  const onSubmit = (
    query?: {[index: string]: any},
    type?: "CREATE" | "UPDATE",
    cb?: (response: any) => void
  ) => {
    const toastLoading = toast.loading("Uploading", {
      hideProgressBar: true,
      position: 'top-center',
    });

    console.log("singleData: ", singleData);
    // return;

    const _query = query
      ? `?${Object.keys(query)
          .map((key) => key + "=" + query[key])
          .join("&")}`
      : "";

    putData(
      `/${_query}`,
      singleData as T,
      async (model: any, error, status) => {
        toast.dismiss(toastLoading);

        if (error) {
          if (status === 409) {
            toast.error("Duplicate entry! Kindly check your inputs", {
              hideProgressBar: true,
              position: 'top-center',
              autoClose: 2000,
            });
            return;
          }

          toast.error("Something went wrong", {
            hideProgressBar: true,
            position: 'top-center',
            autoClose: 2000,
          });
        } else {
          if (type && type === "CREATE") {
            toast.success("Successfully saved.", {
              hideProgressBar: true,
              autoClose: 2000,
              position: 'top-center',
            });
          } else if (type) {
            toast.success("Successfully updated.", {
              hideProgressBar: true,
              autoClose: 2000,
              position: 'top-center',
            });
            dispatch();
          } else {
            dispatch();
          }

          if (cb) {
            cb(model);
          }

          console.log(model);
          onSubmitData(model as T);
        }
      }
    );
  };

  const onSubmitBulk = (
    object: T[],
    cb?: (data: T[]) => void,
    param?: string,
    _query?: {[key: string]: any}
  ) => {
    const toastLoading = toast.loading("Uploading", {
      hideProgressBar: true,
      position: 'top-center',
    });

    postBulkData(
      `bulk/${param}/${_query && query(_query)}`,
      object as T[],
      async (model, error) => {
        toast.dismiss(toastLoading);

        if (error) {
          toast.error("Something went wrong. Unable to add data", {
            hideProgressBar: true,
            position: 'top-center',
            autoClose: 2000,
          });

          console.error(error);
        } else {
          toast.success("Successfully uploaded", {
            hideProgressBar: true,
            position: 'top-center',
          });

          console.log(model);

          if (cb) cb(model as T[]);
          dispatch();
        }
      }
    );
  };

  const onDelete = async (row: any | string, isDontShowToast?: boolean) => {

    let toastLoading: any;
    if (!isDontShowToast) {
      toastLoading = toast.loading("Deleting...", {
        hideProgressBar: true,
        position: 'top-center',
      });
    }

    await deleteData(
      `${typeof row !== "string" ? row.original.recid : row}`,
      async (model, error) => {
        !isDontShowToast && toast.dismiss(toastLoading);

        console.log(model);
        if (error) {
          toast.error("Error : " + error.message, {
            hideProgressBar: true,
            position: 'top-center',
          });
        } else {
          toast.success("Successfully deleted.", {
            hideProgressBar: true,
            position: 'top-center',
          });

          let filtered = allLoadedData;
          if (typeof row !== "string") {
            filtered = allLoadedData.filter((d) => d.recid !== row.original.recid);
          } else {
            filtered = allLoadedData.filter((d) => !Object.values(d).includes(decodeURIComponent(row)));
          }
          setAllLoadedData(filtered);
        }
      }
    );
  };

  return {
    onSubmit,
    onSubmitBulk,
    onDelete,
    onOpenModal,
    onChangeData,
    singleData,
    allLoadedData,
    setSingleData,
    setAllLoadedData,
  };
}

export function masterfileInit() {
  const dispatch = useAppDispatch();

  document.scrollingElement?.scrollTo(0, 0);

  dispatch(getItemClassifications());
  dispatch(getItemSubclassifications());
  dispatch(getPrinterStations());
  dispatch(getPriceList());
  dispatch(getWarehouse());
  dispatch(getDineType());
  dispatch(getCompany());
  dispatch(getTerminals());
  dispatch(getSysPar());
  dispatch(getHeader());
  dispatch(getMenus());
  dispatch(getCardType());
  dispatch(getItemCombo());
  dispatch(getMEMC());
  dispatch(resetLoading());
  dispatch(checkGovernmentDiscounts());
}

export function useItem(allLoadedData: ItemModel[]) {
  const [activeClass, setActiveClass] = useState<ItemClassificationModel>();
  const [tableData, setTableData] = useState<ItemModel[]>([]);

  const subItemclassif: ItemSubclassificationModel[] = useAppSelector(
    (state) => state.masterfile.itemSubclassification.data
  );
  const itemClassif: ItemClassificationModel[] = useAppSelector(
    (state) => state.masterfile.itemClassification.data
  );

  const tableDataSync = () => {
    const itemsWithClassification: ItemModel[] = allLoadedData.map((item) => {
      const classification = itemClassif.find(
        (d) => d.itmclacde == item.itmclacde
      );
      const subclassification = subItemclassif.find(
        (d) => d.itemsubclasscde == item.itemsubclasscde
      );
      return {
        ...item,
        itmclacde: classification?.itmcladsc,
        itemsubclasscde: subclassification?.itemsubclassdsc,
      };
    }) as ItemModel[];

    console.log("pumasok ba here?????");
    console.log(itemsWithClassification);
    setTableData(itemsWithClassification);
  };

  useEffect(() => {
    //TEMPORARY
    const getItemClassification = async () => {
      setActiveClass(itemClassif[0]);
      tableDataSync();
    };
    getItemClassification();
  }, []);

  return {
    activeClass,
    setActiveClass,
    tableData,
    itemClassif,
    tableDataSync,
    setTableData,
  };
}

export interface MasterfilePrintoutData {
  companyName: string;
  title: string;
  date: string;
  headers: {
    [key: string]: {header: string; id: string};
  };
  data: any[];
}

export function useMasterfilePrintout(orientation?: "portrait" | "landscape") {
  const {buildPDF} = usePDFBuilder();

  const pdfOptions: PDFOptions = {
    orientation: orientation || "portrait",
    format: "letter",
    showHeaderEveryPage: true,
    includePageNumber: true,
    margin: {
      top: 30,
      bottom: 30,
      left: 30,
      right: 30,
    },
    fontSize: 10,
  };

  const generatePrintout = (printoutData: MasterfilePrintoutData) => {
    buildPDF(pdfOptions, (canvas: PDFCanvas) => {
      const headers = Object.keys(printoutData.headers).map(
        (key) => printoutData.headers[key].header
      );
      // header of the pdf
      canvas.createHeader?.((header: PDFHeader) => {
        header.createText([
          {
            text: printoutData.companyName,
            fontSize: 14,
            fontWeight: "bold",
            align: "left",
          },
          {
            text: [printoutData.title, `Date Printed: ${printoutData.date}`],
            fontWeight: "normal",
            align: "left",
          },
        ]);
        header.createHorizontalLine({width: "full_width"});
        header.createInlineTexts({
          text: headers,
          txtSpacing: 10,
          align: "left",
          fontWeight: "bold",
          lineItemsAlign: "justify",
        });

        header.createHorizontalLine({width: "full_width"});
      });
      // body of the pdf
      for (const data of printoutData.data) {
        const items = [];

        for (const keys in printoutData.headers) {
          items.push(data[keys] || "");
        }

        canvas.createInlineTexts({
          text: items,
          txtSpacing: 20,
          align: "left",
          lineItemsAlign: "justify",
        });
      }

      canvas.close();
      canvas.print?.();
    });
  };

  return {
    generatePrintout,
  };
}

export function useMasterfileDeletionValidation(url: string) {
  const appDispatch = useAppDispatch();

  const validateOnDelete = async (_query: {[index: string]: any}) => {
    const loading = toast.loading("Validating...", {
      toastId: 'validating',
      autoClose: 2000,
      hideProgressBar: true,
      position: "top-center"
    })

    const response = await appDispatch(validateMasterfileDeletion({
      url: url,
      query: queryStr(_query)
    }));

    toast.dismiss(loading);

    if (!response || !response.payload) return false;
    return response.payload.isAbleToDelete;
  }

  const queryStr = (obj: {[key: string]: any}) =>
    `?${Object.keys(obj)
      .map((key) => key + "=" + obj[key])
      .join("&")}`;

  return {
    validateOnDelete,
  }
}