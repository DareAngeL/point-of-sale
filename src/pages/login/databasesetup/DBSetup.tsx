import { useEffect, useState } from "react";
import { useFormInputValidation } from "../../../hooks/inputValidation";
import { useModal } from "../../../hooks/modalHooks";
import { InputText } from "../../../common/form/InputText";
import { InputPassword } from "../../../common/form/InputPassword";
import { ButtonForm } from "../../../common/form/ButtonForm";
import { useService } from "../../../hooks/reportHooks";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

interface DBSetupFormRequiredValues {
  "Username *": string;
  "Password *": string;
  "Host *": string;
  "Database *": string;
  "Service Name *": string;
}

export function DBSetup() {
  const [data, setData] = useState<any>();

  const {
    handleSubmit,
    registerInputs,
    unregisterInputs,
    errors,
    changeRequiredValue,
  } = useFormInputValidation<DBSetupFormRequiredValues>();

  const { dispatch: dispatchModal, modal } = useModal();
  const navigate = useNavigate();

  const { getData, postData } = useService();

  const handleInputChange = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    changeRequiredValue(name, value);
    setData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = () => {
    const loading = toast.loading("Switching Database...", {
      position: 'top-center',
    });
    postData("switchdb", data, async (res: any, error) => {
      toast.dismiss(loading);
      
      if (error) return toast.error("Cannot connect to the server", {
        position: 'top-center',
        autoClose: 2000,
        hideProgressBar: true,
      });

      if (!res.data.success) {
        toast.error(res.data.message, {
          hideProgressBar: true,
          position: 'top-center',
          autoClose: 1500,
        });
      } else {
        toast.success(res.data.message, {
          hideProgressBar: true,
          position: 'top-center',
          autoClose: 1500,
        });
        dispatchModal();
        navigate(-1);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    });
  };

  useEffect(() => {
    if (modal) {
      const fetchAPI = async () => {
        const res: any = await getData("getdbinfo", {}, () => {});
        setData({
          servicename: res.data.servicename,
          username: res.data.username,
          password: res.data.password,
          host: res.data.host,
          database: res.data.database,
        });

        registerInputs({
          inputs: [
            {
              path: "Username *",
              name: "username",
              value: res.data.username,
            },
            {
              path: "Password *",
              name: "password",
              value: res.data.password,
            },
            {
              path: "Host *",
              name: "host",
              value: res.data.host,
            },
            {
              path: "Database *",
              name: "database",
              value: res.data.database,
            },
            {
              path: "Service Name *",
              name: "servicename",
              value: "PosbackendOTC",
            },
          ],
        });
      };

      fetchAPI();
    }

    return () => {
      unregisterInputs();
    };
  }, [modal]);

  return (
    <>
      <form id="dbsetup-form" onSubmit={handleSubmit(onSubmit)}>
        <InputText
          description="Username *"
          name="username"
          id="username"
          value={data?.username}
          error={errors}
          required
          handleInputChange={handleInputChange}
        />

        <InputPassword
          description="Password *"
          name="password"
          id="password"
          value={data?.password}
          error={errors}
          required
          handleInputChange={handleInputChange}
        />

        <InputText
          description="Host *"
          name="host"
          id="host"
          value={data?.host}
          error={errors}
          required
          handleInputChange={handleInputChange}
        />

        <InputText
          description="Database *"
          name="database"
          id="database"
          value={data?.database}
          error={errors}
          required
          handleInputChange={handleInputChange}
        />

        <InputText
          description="Service Name *"
          name="servicename"
          id="servicename"
          value={data?.servicename}
          disabled
          error={errors}
          required
          handleInputChange={handleInputChange}
        />
      </form>
      <ButtonForm
        isShowWarningCancel
        dontEmptyUndefinedData
        data={data}
        formName="dbsetup-form"
        okBtnTxt="Save"
        isActivated={true}
      />
    </>
  );
}
