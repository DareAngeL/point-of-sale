import { toast } from "react-toastify";
import { ButtonForm } from "../../../../common/form/ButtonForm";
import { Modal } from "../../../../common/modal/Modal";
import { MODULES } from "../../../../enums/activitylogs";
import { useMasterfileDeletionValidation } from "../../../../hooks/masterfileHooks";
import { useUserActivityLog } from "../../../../hooks/useractivitylogHooks";
import { useDeleteData, useModal } from "../hooks/itemSubclassificationHooks";
import { ItemSubclassificationModel } from "../../../../models/itemsubclassification";


interface DeleteConfirmationModalProps {
  deleteData: any;
  setAllLoadedData: React.Dispatch<React.SetStateAction<ItemSubclassificationModel[]>>;
}

export function DeleteConfirmationModal(props: DeleteConfirmationModalProps){

  const {dispatchModal} = useModal();
  const {deleteAction} =
    useUserActivityLog();

  const {onDeleteData} = useDeleteData();

  const { validateOnDelete } = useMasterfileDeletionValidation("itemsubclass");
  
    return (
        
        <Modal title={"Delete Confirmation"}>
            <h1>
              Do you want to delete:{" "}
              <span className="font-bold">
                {props.deleteData.original.itemsubclassdsc} ?
              </span>
            </h1>
            <ButtonForm
              formName={"ps-form"}
              isActivated={false}
              okBtnTxt="Yes"
              cancelBtnTxt="No"
              isColorSwitched={true}
              onOkBtnClick={async () => {
                dispatchModal();

                if (!await validateOnDelete({
                  itemsubclasscde: props.deleteData.original.itemsubclasscde
                })) {
                  return toast.info(`"${props.deleteData.original.itemsubclassdsc}" is already in use. Unable to delete.`, {
                    hideProgressBar: true,
                    position: 'top-center',
                    autoClose: 2000,
                  });
                }

                await onDeleteData(props.deleteData, props.setAllLoadedData); 
                toast.success("Successfully deleted.", {
                  hideProgressBar: true,
                  position: 'top-center',
                  autoClose: 2000,
                });

                let data = {
                  module: MODULES.ITEMSUBCLASSIFICATIONS,
                  remarks: "",
                };
                data.remarks = `DELETED: \nITEM SUBCLASS: ${props.deleteData?.original.itemsubclassdsc}\nITEM CLASS: ${props.deleteData?.original.itmcladsc}\nHIDE SUBCLASS: ${props.deleteData?.original.hide_subclass}`;
                deleteAction(data);
              }}
            />
        </Modal>
    )
}