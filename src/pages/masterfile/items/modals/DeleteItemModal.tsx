import { toast } from "react-toastify";
import { ButtonForm } from "../../../../common/form/ButtonForm";
import { Modal } from "../../../../common/modal/Modal";
import { useMasterfileDeletionValidation } from "../../../../hooks/masterfileHooks";
import { useModal } from "../../../../hooks/modalHooks";
import { useUserActivityLog } from "../../../../hooks/useractivitylogHooks";
import { MODULES } from "../../../../enums/activitylogs";
import { useAppDispatch } from "../../../../store/store";
import { deleteItem } from "../../../../store/actions/items.action";
import { ItemModel } from "../../../../models/items";

interface DeleteItemModalProps {
  deleteData: any,
  setAllLoadedData: React.Dispatch<React.SetStateAction<ItemModel[]>>,
}

export function DeleteItemModal({
  deleteData,
  setAllLoadedData,
}: DeleteItemModalProps) {

  const { dispatch } = useModal();
  const { validateOnDelete } = useMasterfileDeletionValidation("");
  const { deleteAction } = useUserActivityLog();
  const appDispatch = useAppDispatch();

  return (
    <Modal title={"Delete Confirmation"}>
      <h1>
        Do you want to delete:{" "}
        <span className="font-bold">{deleteData.original.itmdsc} ?</span>
      </h1>
      <ButtonForm
        formName={"ps-form"}
        isActivated={false}
        okBtnTxt="Yes"
        cancelBtnTxt="No"
        isColorSwitched={true}
        onOkBtnClick={async () => {
          dispatch();
          // validate if this item can be deleted or not
          if (!await validateOnDelete({
            itmcde: deleteData.original.itmcde
          })) {
            return toast.info(`"${deleteData.original.itmdsc}" is already in use for transaction. Unable to delete.`, {
              hideProgressBar: true,
              position: 'top-center',
              autoClose: 2000,
            });
          }

          // onDelete(deleteData);
          const deleteResult = await appDispatch(deleteItem(deleteData.original.recid));
          if (!deleteResult.payload) {
            return toast.error(`Failed to delete "${deleteData.original.itmdsc}".`, {
              hideProgressBar: true,
              position: 'top-center',
              autoClose: 2000,
            });
          }

          setAllLoadedData((prev) => prev.filter((item) => item.recid !== deleteData.original.recid));

          toast.success(`Successfully deleted.`, {
            hideProgressBar: true,
            position: 'top-center',
            autoClose: 2000,
          });
          
          const data = {
            module: MODULES.ITEMS,
            remarks: "",
          };
          data.remarks = `DELETED: \nITEM: ${
            deleteData?.original.itmdsc
          }\nITEM TYPE: ${deleteData?.original.itmtyp}\nITEM CLASS: ${
            deleteData?.original.itmcladsc
          }\nITEM SUBCLASS: ${
            deleteData?.original.itemsubclassdsc
          }\nMEASURE: ${deleteData?.original.untmea}\nCOST: ${parseFloat(
            deleteData?.original.untcst
          ).toFixed(2)}\nPRICE: ${parseFloat(
            deleteData?.original.untprc
          ).toFixed(2)}\nREORDER: ${parseInt(
            deleteData?.original.crilvl
          )}`;
          deleteAction(data);
        }}
      />
    </Modal>
  )
}