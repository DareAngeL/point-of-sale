import { ButtonForm } from "../../../common/form/ButtonForm";
import { toast } from "react-toastify";
import { useModal } from "../../../hooks/modalHooks";
import { useService } from "../../../hooks/reportHooks";
import { useNavigate } from "react-router";

export function ClearTransaction() {
  const { getData } = useService();
  const { dispatch } = useModal();
  const navigate = useNavigate();

  const onOkBtnClick = async () => {
    const loading = toast.loading("Resetting Masterfile...", {
      position: 'top-center',
    });
    await getData("cleartransaction", {}, (res: any) => {
      if (res.data.success) {
        toast.success(res.data.message, {
          position: 'top-center',
        });
        toast.dismiss(loading);
        dispatch();
        navigate("/pages/login");
        window.location.reload();
      }
    });
  };

  return (
    <>
      <div>
        <label>This will reset all your transaction data. Are you sure?</label>

        <ButtonForm
          formName=""
          okBtnTxt="Yes"
          cancelBtnTxt="No"
          onOkBtnClick={onOkBtnClick}
        />
      </div>
    </>
  );
}
