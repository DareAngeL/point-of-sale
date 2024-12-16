import { toast } from "react-toastify";
import { ButtonForm } from "../../../../common/form/ButtonForm";
import { Modal } from "../../../../common/modal/Modal";
import { useMasterfileDeletionValidation } from "../../../../hooks/masterfileHooks";
import { useModal } from "../../../../hooks/modalHooks";
import { MODULES } from "../../../../enums/activitylogs";
import { useUserActivityLog } from "../../../../hooks/useractivitylogHooks";
import { useAppDispatch } from "../../../../store/store";
import { deletePrinterStation } from "../../../../store/actions/printerStation.action";

export function PrinterStationDeleteModal(
  {
    deleteData,
    setAllLoadedData,
  }: any,
) {

  const appDispatch = useAppDispatch();
  const { dispatch } = useModal();
  const { deleteAction } = useUserActivityLog();
  const { validateOnDelete } = useMasterfileDeletionValidation("printerstation");

  const handleDeleteData = async () => {
    dispatch();

    // validate if this printerstation can be deleted or not
    if (!await validateOnDelete({
      locationcde: deleteData.original.locationcde
    })) {
      return toast.info(`"${deleteData.original.locationdsc}" is already in use. Unable to delete.`, {
        hideProgressBar: true,
        position: 'top-center',
        autoClose: 2000,
      });
    }

    await appDispatch(deletePrinterStation(deleteData.original.recid));
    setAllLoadedData((prev:any) => prev.filter((data:any) => data.recid !== deleteData.original.recid));

    toast.success(`${deleteData.original.locationdsc} is successfully deleted`, {
      hideProgressBar: true,
      position: 'top-center',
      autoClose: 2000,
    });

    let data = {
      module: MODULES.PRINTERSTATION,
      remarks: "",
    };

    data.remarks = `DELETED:\nSTATION NAME: ${deleteData?.original.locationdsc}\nPRINTER NAME: ${deleteData?.original.printername}\nPRINTER TYPE: ${deleteData?.original.printertype}\nPRINTER SIZE: ${deleteData?.original.printersize}`;
    console.log(data.remarks);
    deleteAction(data);
  }

  console.log("asddata:", deleteData);
  

  return (
    <Modal title={"Delete Confirmation"}>
      <h1>
        Do you want to delete:{" "}
        <span className="font-bold">
          {deleteData?.original?.locationdsc} ?
        </span>
      </h1>
      <ButtonForm
        formName={"ps-form"}
        isActivated={false}
        okBtnTxt={"Confirm"}
        isColorSwitched={true}
        onOkBtnClick={handleDeleteData}
      />
    </Modal>
  )
}