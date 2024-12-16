import { ButtonForm } from "../../../../common/form/ButtonForm";
import { Modal } from "../../../../common/modal/Modal";
import { useMasterfileDeletionValidation } from "../../../../hooks/masterfileHooks";
import { useModal } from "../../../../hooks/modalHooks";
import { toast } from "react-toastify";
import { MODULES } from "../../../../enums/activitylogs";
import { useUserActivityLog } from "../../../../hooks/useractivitylogHooks";

interface DiscountDeleteModalProps {
  deleteData: any;
  onDelete: (row: any) => Promise<void>;
}

export function DiscountDeleteModal(props: DiscountDeleteModalProps) {

  const { dispatch } = useModal();
  const { deleteAction } = useUserActivityLog();
  const { validateOnDelete } = useMasterfileDeletionValidation("");

  return (
    <Modal title={"Delete Confirmation"}>
      <h1>
        Do you want to delete:{" "}
        <span className="font-bold">{props.deleteData.original.disdsc} ?</span>
      </h1>
      <ButtonForm
        formName={"ps-form"}
        isActivated={false}
        okBtnTxt="Yes"
        cancelBtnTxt="No"
        isColorSwitched={true}
        onOkBtnClick={async () => {
          dispatch();
          // validate if this dinetype can be deleted or not
          if (!await validateOnDelete({
            discde: props.deleteData.original.discde
          })) {
            return toast.info(`"${props.deleteData.original.disdsc}" is already in use for transaction. Unable to delete.`, {
              hideProgressBar: true,
              position: 'top-center',
              autoClose: 2000,
            });
          }

          props.onDelete(props.deleteData);
          let data = {
            module: MODULES.DISCOUNTS,
            remarks: "",
          };
          data.remarks = `DELETED:\nDISCOUNT: ${
            props.deleteData?.original.disdsc
          }\nDISCOUNT RATE: ${parseFloat(
            props.deleteData?.original.disper
          ).toFixed(2)}`;
          deleteAction(data);
        }}
      />
    </Modal>
  )
}