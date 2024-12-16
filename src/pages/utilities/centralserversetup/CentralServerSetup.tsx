import { useEffect, useRef, useState } from "react";
import { BackButton } from "../../../common/backbutton/BackButton";
import { Selection } from "../../../common/form/Selection";
import { PageTitle } from "../../../common/title/MasterfileTitle";
import { InputText } from "../../../common/form/InputText";
import { InputPassword } from "../../../common/form/InputPassword";
import { useFormInputValidation } from "../../../hooks/inputValidation";
import { toast } from "react-toastify";
import {
  useLoadedData,
  useService,
  useSubmitData,
} from "../../../hooks/serviceHooks";
import { SystemParametersModel } from "../../../models/systemparameters";
import { usePage } from "../../../hooks/modalHooks";
import { useAppDispatch } from "../../../store/store";
import { isPage } from "../../../reducer/pageSlice";
import moment from "moment";
import { getCentralConnection } from "../../../store/actions/central.action";

interface CServerSetupFormRequiredValues {
  "Protocol *": string;
  "IP address *": string;
  "Port *": string;
  "Host *": string;
  "Username *": string;
  "Password *": string;
  "SFTP Port *": string;
}

export function CentralServerSetup() {
  
  const { loadedData, setLoadedData } = useLoadedData<SystemParametersModel>();
  const { putRequestData: requestData } = useSubmitData<SystemParametersModel>(
    "systemparameters",
    "/pages/utilities",
    true
  );

  const { putData } = useService<SystemParametersModel>("systemparameters");
  const [disableSave, setDisableSave] = useState(true);
  const { pageActive } = usePage();
  const appDispatch = useAppDispatch();

  const formRef = useRef<HTMLFormElement>(null);
  const { 
    handleSubmit, 
    errors, 
    changeRequiredValue,
  } =
    useFormInputValidation<CServerSetupFormRequiredValues>(undefined, {
      data: loadedData,
      form: formRef,
      inputNames: [
        "serverprotocol",
        "serveripaddress",
        "serverport",
        "serverhost",
        "serverusername",
        "serverpassword",
        "serverfileport",
      ]
    });

  useEffect(() => {
    console.log("passx: ", loadedData?.serverpassword);
  }, [loadedData])

  const handleSelectChange = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLSelectElement>) => {
    changeRequiredValue(name, value);
    setLoadedData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInputChange = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    changeRequiredValue(name, value);
    setLoadedData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const testConnection = async () => {
    const loading = toast.loading("Checking Central Connections ...", {
      position: "top-center",
    });
    try {
      const serverprotocol = loadedData.serverprotocol;
      const serveripaddress = loadedData.serveripaddress;
      const serverport = loadedData.serverport;

      const result = await appDispatch(getCentralConnection({
        url: `${serverprotocol}://${serveripaddress}:${serverport}/api/getconnection`,
        opts: 
        {
          headers: {
            // Etong option pwede mo to lagyan ng token para hindi pwedeng ma access agad yung central server
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "X-Total-Count",
            // "Content-Length": Buffer.byteLength(
            //   JSON.stringify({ connect: "connect" })
            // ),
          },
          params: { data: JSON.stringify({ connect: "connect" }) },
        }
      }));

      if (result.payload) {
        await putData(
          "",
          { central_lastcon: moment().format("YYYY-MM-DD"), recid: 1 },
          async (res) => {
            console.log(res);
            toast.success("Success!", {
              hideProgressBar: true,
              position: 'top-center',
              autoClose: 1500,
            });
            setDisableSave(false);
          }
        );
      }
    } catch (error: any) {
      if (error.code == "EPROTO") {
        // WRONG PROTOCOL (HTTP or HTTPS)
        toast.error(
          "Unable to connect to server due to <b>incorrect protocol</b>.",
          {
            hideProgressBar: true,
            autoClose: 1500,
            position: 'top-center',
          }
        );
      } else if (error.code == "ENETUNREACH") {
        // NO INTERNET
        toast.error(
          "Unable to connect to server due to <b>no internet connection</b>.",
          {
            hideProgressBar: true,
            autoClose: 1500,
            position: 'top-center',
          }
        );
      } else if (error.code == "ENOTFOUND") {
        // ERROR IN IP ADDRESS
        toast.error(
          "Unable to connect to server due to <b>incorrect ip address</b>.",
          {
            hideProgressBar: true,
            autoClose: 1500,
            position: 'top-center',
          }
        );
      } else if (error.code == "ERR_SOCKET_BAD_PORT") {
        // ERROR IN PORT
        toast.error(
          "Unable to connect to server due to <b>incorrect port</b>.",
          {
            hideProgressBar: true,
            autoClose: 1500,
            position: 'top-center',
          }
        );
      } else if (error.code == "ECONNREFUSED") {
        toast.error("Connection is being refuse by the server.", {
          hideProgressBar: true,
          autoClose: 1500,
          position: 'top-center',
        });
      } else if (error.code == "ETIMEDOUT") {
        toast.error("Connection timeout.", {
          hideProgressBar: true,
          autoClose: 1500,
          position: 'top-center',
        });
      } else {
        toast.error("Something went wrong.", {
          hideProgressBar: true,
          autoClose: 1500,
          position: 'top-center',
        });
      }
    }
    toast.dismiss(loading);
  };

  const onSubmit = () => {
    requestData(loadedData, setLoadedData);
    appDispatch(isPage({ isPage: false }));
  };

  useEffect(() => {
    if (!pageActive) {
      appDispatch(isPage({ isPage: true }));
    }
  }, []);

  return (
    <>
      <div className="flex items-center border-b-2 p-2">
        <BackButton onClick={() => appDispatch(isPage({ isPage: false }))} />
        <PageTitle name={"Central Server Setup"} />
      </div>

      <form
        ref={formRef}
        id="cserversetup-form"
        onSubmit={handleSubmit(onSubmit)}
        className="top-[1rem] max-w-screen overflow-y-auto h-[78vh]"
      >
        <div className="shadow-xl w-[95%] m-auto mb-[1.3rem]">
          <label className="block mb-2 text-black text-[1.2rem] font-montserrat font-extrabold">
            Connection Setup
          </label>

          <div className="m-[10px]">
            <Selection
              description="Protocol *"
              name="serverprotocol"
              id="serverprotocol"
              value={loadedData?.serverprotocol}
              handleSelectChange={handleSelectChange}
              keyValuePair={[
                {
                  key: "http",
                  value: "http",
                },
                {
                  key: "https",
                  value: "https",
                },
              ]}
              error={errors}
              required
            />

            <InputText
              description="IP address *"
              name="serveripaddress"
              id="serveripaddress"
              value={loadedData?.serveripaddress}
              handleInputChange={handleInputChange}
              error={errors}
              required
            />

            <InputText
              description="Port *"
              name="serverport"
              id="serverport"
              value={loadedData?.serverport}
              handleInputChange={handleInputChange}
              error={errors}
              required
            />
          </div>
        </div>

        <div className="shadow-xl w-[95%] m-auto mb-[1.3rem]">
          <label className="block mb-2 text-black text-[1.2rem] font-montserrat font-extrabold">
            File Transfer Setup
          </label>

          <div className="m-[10px]">
            <Selection
              description="Host *"
              name="serverhost"
              id="serverhost"
              value={loadedData?.serverhost}
              handleSelectChange={handleSelectChange}
              keyValuePair={[
                {
                  key: "local",
                  value: "local",
                },
                {
                  key: "sftp",
                  value: "sftp",
                },
              ]}
              error={errors}
              required
            />

            {loadedData?.serverhost === "sftp" ? (
              <>
                <InputText
                  description="Username *"
                  name="serverusername"
                  id="serverusername"
                  value={loadedData?.serverusername}
                  handleInputChange={handleInputChange}
                  error={errors}
                  required
                />

                <InputPassword
                  description="Password *"
                  name="serverpassword"
                  id="serverpassword"
                  value={loadedData?.serverpassword}
                  handleInputChange={handleInputChange}
                  error={errors}
                  required
                />

                <InputText
                  description="SFTP Port *"
                  name="serverfileport"
                  id="serverfileport"
                  value={loadedData?.serverfileport}
                  handleInputChange={handleInputChange}
                  error={errors}
                  required
                />
              </>
            ) : (
              <></>
            )}
          </div>
        </div>
      </form>

      <div className="sticky bottom-0 flex justify-center items-center bg-white">
        <button
          className={
            "px-4 py-2 rounded border border-solid border-blue-500 hover:bg-blue-500 hover:text-white my-5 mx-3"
          }
          onClick={handleSubmit(testConnection)}
        >
          Test Connection
        </button>
        <button
          form={"cserversetup-form"}
          type="submit"
          className={`px-4 py-2 my-5 rounded border border-solid border-blue-500 hover:text-white  ${
            disableSave
              ? "cursor-not-allowed bg-[#ccc]"
              : "cursor-pointer hover:bg-blue-500"
          }`}
          disabled={disableSave}
        >
          Save
        </button>
      </div>
    </>
  );
}
