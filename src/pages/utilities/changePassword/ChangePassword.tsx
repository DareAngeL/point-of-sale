import { useEffect, useState } from "react";
import { InputPassword } from "../../../common/form/InputPassword";
import { ButtonForm } from "../../../common/form/ButtonForm";
import { useUserActivityLog } from "../../../hooks/useractivitylogHooks";
import { METHODS, MODULES } from "../../../enums/activitylogs";
import { toast } from "react-toastify";
import { useFormInputValidation } from "../../../hooks/inputValidation";
import { useService } from "../../../hooks/serviceHooks";
import { useAppSelector } from "../../../store/store";
import { useNavigate } from "react-router";
import { useModal } from "../../../hooks/modalHooks";

interface ChangePasswordRequiredValues {
  "Old Password *": string;
  "New Password *": string;
  "Re-type Password *": string;
}

export default function ChangePassword() {
  const [formValue, setFormValue] = useState<any>();
  const { postActivity } = useUserActivityLog();
  const { putData } = useService<any>("userFile");
  const navigate = useNavigate();
  const { dispatch } = useModal();
  const { account } = useAppSelector((state) => state.account);

  const {
    registerInputs,
    changeRequiredValue,
    unregisterInputs,
    errors,
    handleSubmit,
  } = useFormInputValidation<ChangePasswordRequiredValues>();

  useEffect(() => {
    registerInputs({
      inputs: [
        {
          name: "old_usrpwd",
          path: "Old Password *",
          value: "",
        },
        {
          name: "usrpwd",
          path: "New Password *",
          value: "",
        },
        {
          name: "c_usrpwd",
          path: "Re-type Password *",
          value: "",
        },
      ]
    });

    return () => {
      unregisterInputs();
    }
  }, []);

  const handleInputChange = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    changeRequiredValue(name, value);
    setFormValue((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const checkNewPassword = () => {
    if (formValue.usrpwd !== formValue.c_usrpwd) {
      toast.error("New Password and Re-type Password does not match", {
        hideProgressBar: true,
        autoClose: 1500,
        position: "top-center",
      });
      return false;
    } else if (formValue.usrpwd === formValue.old_usrpwd) {
      toast.error("New Password and Old Password should not be the same", {
        hideProgressBar: true,
        autoClose: 1500,
        position: "top-center",
      });
      return false;
    }
    return true;
  };

  const onSubmit = () => {
    if (!checkNewPassword()) return;

    console.log(account.data);

    toast.promise(putData(
      "changepassword",
      {
        usrcde: account.data?.usrcde,
        oldpass: formValue.old_usrpwd,
        newpass: formValue.usrpwd,
      },
      (data, err) => {
        if (err) {
          toast.error("Something went wrong, unable to change password", {
            hideProgressBar: true,
            position: 'top-center',
            autoClose: 1500,
          });
          console.error(err);
          return;
        }

        if (!data.changed) {
          toast.error(data.msg, {
            hideProgressBar: true,
            autoClose: 2000,
            position: "top-center",
          });
          return;
        }

        setFormValue({});
        changeRequiredValue("old_usrpwd", "");
        changeRequiredValue("usrpwd", "");
        changeRequiredValue("c_usrpwd", "");
        navigate(-1);
        dispatch(); // close the modal

        // logs the user activity
        postActivity({
          module: MODULES.CHANGE_PASSWORD,
          method: METHODS.CREATE,
          remarks: `Change Password from ${formValue.old_usrpwd} to ${formValue.usrpwd}`,
        });

        toast.success("Password successfully changed", {
          hideProgressBar: true,
          autoClose: 2000,
          position: "top-center",
        });
      },
      {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JSON.parse(sessionStorage.getItem("account") || "").payload.token}`,
      }
    ), {
      pending: "Changing password...",
      error: "Something went wrong, unable to change password",
    }, {
      hideProgressBar: true,
      autoClose: 1500,
      position: "top-center",
    });
  };

  return (
    <>
      <form id="cp-form" onSubmit={handleSubmit(onSubmit)}>
        <InputPassword
          description="Old Password *"
          name="old_usrpwd"
          id="old_usrpwd"
          required={true}
          value={formValue?.old_usrpwd}
          handleInputChange={handleInputChange}
          error={errors}
        />

        <InputPassword
          description="New Password *"
          name="usrpwd"
          id="usrpwd"
          required={true}
          value={formValue?.usrpwd}
          handleInputChange={handleInputChange}
          error={errors}
        />

        <InputPassword
          description="Re-type Password *"
          name="c_usrpwd"
          id="c_usrpwd"
          required={true}
          value={formValue?.c_usrpwd}
          handleInputChange={handleInputChange}
          error={errors}
        />
      </form>

      <ButtonForm
        isShowWarningCancel
        data={formValue}
        formName="cp-form"
        okBtnTxt="Add Data"
        isActivated={true}
      />
    </>
  );
}
