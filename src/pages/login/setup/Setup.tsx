import { useEffect, useState } from "react";
import { Checkbox } from "../../../common/form/Checkbox";
import { InputText } from "../../../common/form/InputText";
import { Selection } from "../../../common/form/Selection";
import { useFormInputValidation } from "../../../hooks/inputValidation";
import { useModal } from "../../../hooks/modalHooks";
import { InputNumber } from "../../../common/form/InputNumber";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { useService } from "../../../hooks/serviceHooks";
import { SystemParametersModel } from "../../../models/systemparameters";
import qz from "qz-tray";
import {
  ALIGNMENT,
  usePrinterCommands,
} from "../../../enums/printerCommandEnums";
import { useAppDispatch } from "../../../store/store";
import { clearHeader } from "../../../store/actions/systemParameters.action";

interface SetupFormRequiredValues {
  "Protocol *": string;
  "IP Address *": string;
  "Port *": string;
  "Printer IP *": string;
  "Printer Name *": string;
  "Printer Type *": string;
  "Printer Paper Size *": number;
  "Font Size *": string;
  "Foreign Language *": string;
}

export function Setup() {
  const [data, setData] = useState<any>({
    protocol: "http",
    ip: "127.0.0.1",
    port: "5875",
    printerip: "127.0.0.1",
    printername: "RECEIPT",
    printertype: "THERMAL",
    printersize: 80,
    printerfontsize: "Normal",
    printerlanguage: "UTF-8",
  });

  const {
    handleSubmit,
    registerInputs,
    unregisterInputs,
    errors,
    changeRequiredValue,
  } = useFormInputValidation<SetupFormRequiredValues>();

  const {
    tableInput,
    openCashDrawer,
    input,
    init,
    clear,
    encode,
    lineBreak,
    divider,
    fullCut,
  } = usePrinterCommands(data.printersize);

  const { dispatch, modal } = useModal();
  const appDispatch = useAppDispatch();
  const navigate = useNavigate();
  const { putData } = useService<SystemParametersModel>("systemparameters");

  const handleInputChange = ({
    target: { name, value, type, checked },
  }: React.ChangeEvent<HTMLInputElement>) => {
    changeRequiredValue(name, value);
    setData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLSelectElement>) => {
    changeRequiredValue(name, value);
    setData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const testPrinterV2 = async () => {
    if (!qz.websocket.isActive()) {
      await qz.websocket.connect();
      // const config = qz.configs.create("PDF");
    }

    const printerlanguage = data.printerlanguage;

    await qz.printers.find(data.printername);
    const config = qz.configs.create(data.printername, {
      copies: 1,
      encoding: printerlanguage, //'UTF-8'
    });

    divider();
    lineBreak();
    input("This is print test.\n", ALIGNMENT.LEFT);
    divider();

    if (printerlanguage === "GB2312" || printerlanguage === "GBK") {
      init();
      input(
        "Simplified Chinese: 这是对单词的长文本测试，以检查其是否适合收据",
        ALIGNMENT.LEFT
      );
    } else if (printerlanguage === "Big5") {
      input("Traditional Chinese: 這是打印測試.", ALIGNMENT.LEFT);
    } else if (printerlanguage === "EUC_KR") {
      input("Korean: 테스팅 국가안전보장에 관련되는 대외정책", ALIGNMENT.LEFT);
    } else if (printerlanguage === "CP864") {
      input("Arabic: هذا اختبار طباعة.", ALIGNMENT.LEFT);
    }

    tableInput(" ", "100.00");
    divider();
    input(`IP: ${data.ip}`, ALIGNMENT.LEFT);
    input(`Printer Name: ${data.printername}`, ALIGNMENT.LEFT);
    divider();

    for (let i = 0; i < 6; i++) {
      lineBreak();
    }

    if (data.cashdrawer) {
      // printData.push('\x10\x14\x01\x00\x05'); // Kick drawer
      openCashDrawer();
    }

    fullCut();

    try {
      await qz.print(config, encode());
      clear();
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmit = async () => {
    localStorage.setItem(
      "lst_conf",
      `${data.protocol}://${data.ip}:${data.port}`
    );
    localStorage.setItem("lst_conf_printer", data.printerip);
    localStorage.setItem("lst_conf_printer_name", data.printername);
    localStorage.setItem("lst_conf_printer_type", data.printertype);
    localStorage.setItem("lst_conf_printer_size", data.printersize);
    localStorage.setItem("lst_conf_printer_font_size", data.printerfontsize);
    localStorage.setItem("withtracc", `${Number(data.withtracc)}`);
    if (data.printerlanguage) {
      localStorage.setItem("lst_conf_printer_language", data.printerlanguage);
    } else {
      localStorage.removeItem("lst_conf_printer_language");
    }
    if (data.fullscreen) {
      localStorage.setItem("lst_conf_fullscreen", data.fullscreen);
    } else {
      localStorage.removeItem("lst_conf_fullscreen");
    }

    await putData(
      "",
      { withtracc: Number(data.withtracc), recid: 1 },
      async (res) => {
        if (res) {
          if (Number(data.withtracc) === 1) {
            appDispatch(clearHeader());
          }

          toast.success("Setup Complete", {
            hideProgressBar: true,
            position: "top-center",
            autoClose: 1500,
          });

          setTimeout(() => {
            dispatch();
            navigate("/pages/login");
            window.location.reload();
          }, 1000);
        }
      }
    );
  };

  useEffect(() => {
    if (modal) {
      setData((prev: any) => ({
        ...prev,
        ["withtracc"]: Number(
          localStorage.getItem("withtracc")
            ? localStorage.getItem("withtracc")
            : 0
        ),
        ["fullscreen"]: localStorage.getItem("lst_conf_fullscreen")
          ? true
          : false,
      }));

      const ip: any = localStorage.getItem("lst_conf")?.match(/([^:]+)/gm);
      const printerip = localStorage.getItem("lst_conf_printer");
      const printername = localStorage.getItem("lst_conf_printer_name");
      const printertype = localStorage.getItem("lst_conf_printer_type");
      const printersize = localStorage.getItem("lst_conf_printer_size");
      const printerlanguage = localStorage.getItem("lst_conf_printer_language");
      const printerfontsize = localStorage.getItem(
        "lst_conf_printer_font_size"
      );

      if (
        localStorage.getItem("lst_conf") &&
        localStorage.getItem("lst_conf_printer") &&
        localStorage.getItem("lst_conf_printer_name")
      ) {
        setData((prev: any) => ({
          ...prev,
          ["protocol"]: ip[0],
          ["ip"]: ip[1].replace("//", ""),
          ["port"]: ip[2],
          ["printerip"]: printerip,
          ["printername"]: printername,
          ["printertype"]: printertype,
          ["printersize"]: printersize,
          ["printerfontsize"]: printerfontsize,
          ["printerlanguage"]: printerlanguage,
        }));
      }

      registerInputs({
        inputs: [
          {
            path: "Protocol *",
            name: "protocol",
            value:
              localStorage.getItem("lst_conf") &&
              localStorage.getItem("lst_conf_printer") &&
              localStorage.getItem("lst_conf_printer_name")
                ? ip[0]
                : data.protocol,
          },
          {
            path: "IP Address *",
            name: "ip",
            value:
              localStorage.getItem("lst_conf") &&
              localStorage.getItem("lst_conf_printer") &&
              localStorage.getItem("lst_conf_printer_name")
                ? ip[1].replace("//", "")
                : data.ip,
          },
          {
            path: "Port *",
            name: "port",
            value:
              localStorage.getItem("lst_conf") &&
              localStorage.getItem("lst_conf_printer") &&
              localStorage.getItem("lst_conf_printer_name")
                ? ip[2]
                : data.port,
          },
          {
            path: "Printer IP *",
            name: "printerip",
            value:
              localStorage.getItem("lst_conf") &&
              localStorage.getItem("lst_conf_printer") &&
              localStorage.getItem("lst_conf_printer_name")
                ? printerip
                : data.printerip,
          },
          {
            path: "Printer Name *",
            name: "printername",
            value:
              localStorage.getItem("lst_conf") &&
              localStorage.getItem("lst_conf_printer") &&
              localStorage.getItem("lst_conf_printer_name")
                ? printername
                : data.printername,
          },
          {
            path: "Printer Type *",
            name: "printertype",
            value:
              localStorage.getItem("lst_conf") &&
              localStorage.getItem("lst_conf_printer") &&
              localStorage.getItem("lst_conf_printer_name")
                ? printertype
                : data.printertype,
          },
          {
            path: "Printer Paper Size *",
            name: "printersize",
            value:
              localStorage.getItem("lst_conf") &&
              localStorage.getItem("lst_conf_printer") &&
              localStorage.getItem("lst_conf_printer_name")
                ? Number(printersize)
                : Number(data.printersize),
          },
          {
            path: "Font Size *",
            name: "printerfontsize",
            value:
              localStorage.getItem("lst_conf") &&
              localStorage.getItem("lst_conf_printer") &&
              localStorage.getItem("lst_conf_printer_name")
                ? printerfontsize
                : data.printerfontsize,
          },
          {
            path: "Foreign Language *",
            name: "printerlanguage",
            value:
              localStorage.getItem("lst_conf") &&
              localStorage.getItem("lst_conf_printer") &&
              localStorage.getItem("lst_conf_printer_name")
                ? printerlanguage
                : data.printerlanguage,
          },
        ],
      });
    }

    return () => {
      unregisterInputs();
    };
  }, [modal]);

  return (
    <>
      <form id="setup-form" onSubmit={handleSubmit(onSubmit)}>
        <Checkbox
          description="Connected to Central"
          name="withtracc"
          id="withtracc"
          value={data.withtracc}
          checked={data.withtracc ? true : false}
          handleInputChange={handleInputChange}
        />

        <Selection
          description="Protocol *"
          name="protocol"
          id="protocol"
          value={data.protocol}
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
          handleSelectChange={handleSelectChange}
        />

        <InputText
          description="IP Address *"
          name="ip"
          id="ip"
          value={data.ip}
          error={errors}
          required
          handleInputChange={handleInputChange}
        />

        <InputText
          description="Printer Name"
          name="printername"
          id="printername"
          value={data.printername}
          handleInputChange={handleInputChange}
        />

        <div className="grid grid-cols-2 items-center">
          <div className="grid-cols-1 flex flex-col items-start">
            <Selection
              description="Printer Type *"
              name="printertype"
              id="printertype"
              value={data.printertype}
              keyValuePair={[
                {
                  key: "DOTMATRIX",
                  value: "DOTMATRIX",
                },
                {
                  key: "THERMAL",
                  value: "THERMAL",
                },
              ]}
              handleSelectChange={handleSelectChange}
              error={errors}
              required
            />
          </div>

          <div className="grid-cols-2 flex flex-col items-start">
            <InputNumber
              description="Printer Paper Size"
              name="printersize"
              id="printersize"
              value={data.printersize}
              handleInputChange={handleInputChange}
            />
          </div>
        </div>

        <Selection
          description="Font Size *"
          name="printerfontsize"
          id="printerfontsize"
          value={data.printerfontsize}
          keyValuePair={[
            {
              key: "Normal",
              value: "Normal",
            },
            {
              key: "Small",
              value: "Small",
            },
          ]}
          handleSelectChange={handleSelectChange}
          error={errors}
          required
        />

        <Selection
          description="Foreign Language *"
          name="printerlanguage"
          id="printerlanguage"
          value={data.printerlanguage}
          keyValuePair={[
            {
              key: "None",
              value: "UTF-8",
            },
            {
              key: "Simplified Chinese",
              value: "GBK",
            },
            {
              key: "Traditional Chinese",
              value: "Big5",
            },
            {
              key: "Korean",
              value: "EUC_KR",
            },
          ]}
          handleSelectChange={handleSelectChange}
          error={errors}
          required
        />

        <div>
          <Checkbox
            description="Test Cash Drawer"
            name="cashdrawer"
            id="cashdrawer"
            value={data.cashdrawer}
            checked={data.cashdrawer ? true : false}
            handleInputChange={handleInputChange}
          />

          <Checkbox
            description="Full Screen"
            name="fullscreen"
            id="fullscreen"
            value={data.fullscreen}
            checked={data.fullscreen ? true : false}
            handleInputChange={handleInputChange}
          />
        </div>
      </form>

      <div className="flex justify-center items-center bg-white sticky bottom-0">
        <button
          type="button"
          className="px-4 py-2 rounded border border-solid border-blue-500 hover:bg-blue-500 hover:text-white my-5 mxl-3"
          onClick={testPrinterV2}
        >
          Printer Test
        </button>
        <button
          form={"setup-form"}
          type="submit"
          className="px-4 py-2 rounded border border-solid border-blue-500 hover:bg-blue-500 hover:text-white my-5 mx-3"
        >
          Update
        </button>
      </div>
    </>
  );
}
