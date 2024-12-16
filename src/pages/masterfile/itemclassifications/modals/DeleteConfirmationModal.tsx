import { ButtonForm } from "../../../../common/form/ButtonForm";
import { MODULES } from "../../../../enums/activitylogs";
import { useDeleteData, useModal } from "../hooks/itemclassificationHooks";
import { useUserActivityLog } from "../../../../hooks/useractivitylogHooks";
import { useMasterfileDeletionValidation } from "../../../../hooks/masterfileHooks";
import { toast } from "react-toastify";
import { Modal } from "../../../../common/modal/Modal";
import { ItemClassificationModel } from "../../../../models/itemclassification";

interface DeleteConfirmationModalProps {
    deleteData: any;
    setAllLoadedData: React.Dispatch<React.SetStateAction<ItemClassificationModel[]>>;
}


export function DeleteConfirmationModal(props: DeleteConfirmationModalProps) {

    
    const {dispatchModal} = useModal();
    const {deleteAction} = useUserActivityLog();
    const {onDeleteData} = useDeleteData();
    const { validateOnDelete } = useMasterfileDeletionValidation("itemclass");
    
    const deleteItem = async () => {

        dispatchModal();

        if (!await validateOnDelete({
          itmclacde: props.deleteData.original.itmclacde
        })) {
          return toast.info(`"${props.deleteData.original.itmcladsc}" is already in use. Unable to delete.`, {
            hideProgressBar: true,
            position: 'top-center',
            autoClose: 2000,
          });
        }

        // onDelete(deleteData);
        await onDeleteData(props.deleteData, props.setAllLoadedData);
        toast.success('Successfully deleted.', {
          hideProgressBar: true,
          position: 'top-center',
          autoClose: 2000,
        });

        let data = {
            module: MODULES.ITEMCLASSIFICATION,
            remarks: "",
        };

        data.remarks = `DELETED:\nITEM CODE: ${props.deleteData?.original.itmclacde}\nITEM CLASSIFICATION: ${props.deleteData?.original.itmcladsc}`;

        deleteAction(data);
    }
    
    console.log("GAGO");
    

    return (
        <Modal title={"Delete Confirmation"}>
            <h1>
              Do you want to delete:{" "}
              <span className="font-bold">
                {props.deleteData.original.itmcladsc} ?
              </span>
            </h1>
            <ButtonForm
              formName={"ps-form"}
              isActivated={false}
              okBtnTxt="Yes"
              cancelBtnTxt="No"
              isColorSwitched={true}
              onOkBtnClick={()=>deleteItem()}
            />
        </Modal>
    )
}