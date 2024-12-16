import { SubmitHandler } from "react-hook-form";
import { MODULES } from "../../../../enums/activitylogs";
import { useUserActivityLog } from "../../../../hooks/useractivitylogHooks";
import { PrinterStationModel } from "../../../../models/printerstation";
import { putPrinterStation } from "../../../../store/actions/printerStation.action";
import { useAppDispatch } from "../../../../store/store";
import { PrinterStationFormRequiredValues } from "../PrinterStation";
import { useModal } from "../../../../hooks/modalHooks";
import { toast } from "react-toastify";

export function usePrinterStationModal(
  printerStationModalData: PrinterStationModel | undefined,
  setPrinterStationModalData: React.Dispatch<React.SetStateAction<PrinterStationModel | undefined>>,
  setAllLoadedData: React.Dispatch<React.SetStateAction<PrinterStationModel[]>>,
  status: string,
  editCopy: any,
  changeRequiredValue: (name: string, value: string) => Promise<unknown>,
) {

  const appDispatch = useAppDispatch();
  const { dispatch: modalDispatch } = useModal();
  const { updateAction, createAction } = useUserActivityLog();

  const handleInputChange = ({
    target: {name, value},
  }: React.ChangeEvent<HTMLInputElement>) => {
    changeRequiredValue(name, value);
    // onChangeData(name, value);
    setPrinterStationModalData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = ({
    target: {name, value},
  }: React.ChangeEvent<HTMLSelectElement>) => {
    changeRequiredValue(name, value);
    setPrinterStationModalData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  }

  const onSubmitForm: SubmitHandler<PrinterStationFormRequiredValues> = () => {
    switch (status) {
      case "CREATE": {
        const createRemarks = `ADDED:\nSTATION NAME: ${printerStationModalData?.locationdsc}\nPRINTER NAME: ${printerStationModalData?.printername}\nPRINTER TYPE: ${printerStationModalData?.printertype}\nPRINTER SIZE: ${printerStationModalData?.printersize}`;
        console.log(createRemarks);
        createAction({ module: MODULES.PRINTERSTATION, remarks: createRemarks });
        break;
      }
      case "UPDATE":
        updateAction(
          {
            originalData: editCopy,
            changeData: printerStationModalData,
            module: MODULES.PRINTERSTATION,
          },
          {
            itemName: printerStationModalData?.printername,
            itemCode: printerStationModalData?.locationcde,
          }
        );
        break;
      // print in print button
      // delete in delete button
      default:
        console.log("default");
        break;
    }

    submit();
    // onSubmit();
  };

  const submit = async () => {
    const data = await appDispatch(putPrinterStation(printerStationModalData));
    if (data && data.payload) {
      let isUpdate = false;

      setAllLoadedData((prev: any) => {
        const temp = prev.map((item: any) => {
          if (item.recid === data.payload.recid) {
            isUpdate = true;
            return data.payload;
          }
          return item;
        });

        if (!isUpdate) {
          temp.push(data.payload);
        }

        return temp;
      });
    }

    toast.success("Successfully uploaded!", {
      hideProgressBar: true,
      position: 'top-center',
      autoClose: 2000,
    });
    modalDispatch();
  }

  return {
    handleInputChange,
    handleSelectChange,
    onSubmitForm,
  }
}