import {useState, useEffect, useRef, ElementRef} from "react";
import {Selection} from "../../../common/form/Selection";
import "./import.css";
import {Checkbox} from "../../../common/form/Checkbox";
import {ArrowLeftOutlined} from "@ant-design/icons";
import {useService} from "../../../hooks/reportHooks";
import {ManagerReportService} from "../../reports/services/ManagerReportService";
import moment from "moment";
import {useAppDispatch, useAppSelector} from "../../../store/store";
import {METHODS, MODULES} from "../../../enums/activitylogs";
import {useUserActivityLog} from "../../../hooks/useractivitylogHooks";
import {toast} from "react-toastify";
import {useModal} from "../../../hooks/modalHooks";
import { getMasterFile } from "../../../store/actions/masterfile.action";
import { postImport } from "../../../store/actions/import.action";
import { useTheme } from "../../../hooks/theme";

export default function Import() {
  const { theme, ButtonStyled, DisabledButtonStyled } = useTheme();
  
  const getmasterfile = useAppSelector((state) => state.masterfile.file);
  const {removeXbuttonDispatch} = useModal();
  const appDispatch = useAppDispatch();
  const {getData} = useService<any>();
  const {dyanmicDownloadByHtmlTag} = ManagerReportService();
  const [formValue, setFormValue] = useState<any>();
  const [file, setFile] = useState<File | any>();
  const [isImporting, setIsImporting] = useState(false);
  // const [availableMasterfile, setAvailableMasterfile] = useState<any>({});
  const uploadElRef = useRef<ElementRef<"input">>(null);

  const {postActivity} = useUserActivityLog();

  const handleSelectChange = ({
    target: {name, value},
  }: React.ChangeEvent<HTMLSelectElement>) => {
    setFormValue((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInputChange = ({
    target: {name, value, type, checked, files},
  }: React.ChangeEvent<HTMLInputElement>) => {
    setFormValue((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "file" && files) {
      setFile(files[0]);
    }
  };

  const backButton = () => {
    setFormValue((prev: any) => ({
      ...prev,
      ["dataResult"]: [],
    }));
  };

  const downloadTemplate = async () => {
    await getData(
      "getexporttemplate",
      {selectedImported: formValue?.masterFileSelect},
      (res) => {
        dyanmicDownloadByHtmlTag({
          fileName: `${formValue?.masterFileSelect} (${moment().format(
            "MM-DD-YYYY"
          )})`,
          text: res.data,
        });
      }
    );

    postActivity({
      method: METHODS.READ,
      module: MODULES.IMPORT,
      remarks: `DOWNLOAD TEMPLATE of ${formValue?.masterFileSelect}`,
    });
  };

  const uploadTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    const isFirstLineHeader = formValue?.firstlineheader;
    const selectedImported = formValue?.masterFileSelect;
    const isUtf8file = formValue?.utf8file;

    const queryString = `isFirstLineHeader=${isFirstLineHeader}&selectedImported=${selectedImported}&isUtf8file=${isUtf8file}`;

    // changed to proper values
    let reportType = "1";
    let type = "ej";
    let trndte = "";
    let zreaddate = "";
    let ornum = "1111";
    let voidnum = "2222";
    let refnum = "3333";
    let stickerpath = "./uploads/stickerprint/";

    const formData = new FormData();
    formData.append("reportType", reportType);
    formData.append("type", type);
    formData.append("trndte", trndte);
    formData.append("zreaddate", zreaddate);
    formData.append("ornum", ornum);
    formData.append("voidnum", voidnum);
    formData.append("refnum", refnum);
    formData.append("file", file);
    formData.append("stickerpath", stickerpath);
    const toastloading = toast.loading("Processing Import...", {
      position: 'top-center',
    });
    setIsImporting(true);
    removeXbuttonDispatch(true);

    try {
      const response = await appDispatch(postImport({
        query: queryString,
        data: formData,
        config: {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      }))

      postActivity({
        method: METHODS.CREATE,
        module: MODULES.IMPORT,
        remarks: `IMPORT FILE ${file.name}`,
      });
      console.log(response);

      setTimeout(() => {
        setIsImporting(false);
        removeXbuttonDispatch(false);
        toast.dismiss(toastloading);
      }, 1500);
      setTimeout(() => {
        toast.success("Imported successfully.", {autoClose: 1500, position: 'top-center',});
      }, 1000);
    } catch (error: any) {
      console.log(error);
      let errorMessage: string = "";

      if (error.response.status === 409) {
        errorMessage = error.response.data.msg;
      } else {
        errorMessage =
          error.response.data.msg.length !== 0
            ? error.response.data.msg[0].message
            : "Failed to Import";
      }
      setTimeout(() => {
        setIsImporting(false);
        toast.dismiss(toastloading);
        removeXbuttonDispatch(false);
      }, 1500);
      setTimeout(() => {
        toast.error(errorMessage, {autoClose: 2000, position: 'top-center',});
      }, 1500);
    }

    // axios
    //   .post("http://localhost:8080/api/importfile", formData, {
    //     headers: {
    //       "Content-Type": "multipart/form-data",
    //     },
    //   })
    //   .then((res) => {
    //     console.log(res);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  };

  // const uploadTemplate = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   const formData = new FormData();
  //   formData.append("file", file);

  //   // uploadFile(file, {
  //   //   isFirstLineHeader: formValue?.firstlineheader,
  //   //   selectedImported: formValue?.masterFileSelect,
  //   //   isUtf8file: formValue?.utf8file,
  //   // });
  //   // console.log(formData.get("file"));
  //   ApiService.post("importfile", formData);
  //   // file: formData.get("file"),
  //   // data: {
  //   //   isFirstLineHeader: formValue?.firstlineheader,
  //   //   selectedImported: formValue?.masterFileSelect,
  //   //   isUtf8file: formValue?.utf8file,
  //   // },
  //   // headers: { "Content-Type": "multipart/form-data" },
  //   // });

  //   // const loading = toast.loading("", {
  //   //   position: "top-center",
  //   // });

  //   // toast.dismiss(loading);

  //   postActivity({
  //     method: METHODS.CREATE,
  //     module: MODULES.IMPORT,
  //     remarks: `IMPORT FILE ${file.name}`,
  //   });
  // };

  const exportError = async () => {
    let txtfileData = "";
    for (let message of formValue.dataResult) {
      txtfileData += `[LINE: ${message.line}] ${message.message} \n`;
    }

    dyanmicDownloadByHtmlTag({
      fileName: `errorlog.txt`,
      text: txtfileData,
    });
  };

  useEffect(() => {
    setFormValue((prev: any) => ({
      ...prev,
      ["masterFileSelect"]: "",
      ["file"]: "",
      ["firstlineheader"]: true,
      ["utf8file"]: false,
      ["dataResult"]: [],
    }));

    if (!getmasterfile.isLoaded) {
      appDispatch(getMasterFile());
    }
  }, []);

  useEffect(() => {}, []);

  return (
    <>
      {formValue?.dataResult.length > 0 ? (
        <>
          <div className="body-container result">
            <article>
              <header>
                <div>
                  <div
                    className="flex justify-center items-center w-[50px] cursor-pointer"
                    onClick={backButton}
                  >
                    <ArrowLeftOutlined className="text-[2rem]" />
                  </div>
                </div>
                <div>
                  <label>RESULT</label>
                </div>
              </header>

              {/* {data.map(async (message: any, index: number) => {
                <li key={index}>[LINE: {{ message.line }}] {{ message.message }}</li>
              })} */}
            </article>
          </div>

          <div className="body-container">
            <div className="p-[7px] flex flex-col text-center">
              <button
                onClick={exportError}
                className="bg-[#339932] cursor-pointer text-[#ffffff] w-[250px] h-[30px]"
              >
                EXPORT TO FILE
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="body-container">
            {isImporting && (
              <div className="absolute top-0 right-0 z-10 h-[100%] w-[100%] bg-gray-300 opacity-75">
                {/* Your content goes here */}
              </div>
            )}

            <article>
              <header className="text-center" style={{backgroundColor: theme.primarycolor}}>IMPORT INTO FILE (TARGET)</header>

              <div className="p-[7px] flex flex-col">
                <Selection
                  description="Select Master File"
                  isWidthFull={true}
                  name={"masterFileSelect"}
                  id={"masterFileSelect"}
                  keyValuePair={Object.entries(getmasterfile.data)
                    .filter(([key]) => key !== "warehouse")
                    .map((value: any) => {
                      return {
                        key: value[1],
                        value: value[0],
                      };
                    })}
                  handleSelectChange={handleSelectChange}
                  value={formValue?.masterFileSelect}
                />

                <div className="text-center mt-2">
                  {!formValue?.masterFileSelect && (
                    <DisabledButtonStyled
                      className={`outline-1 w-[250px] h-[30px] rounded-md text-[#ffffff] cursor-not-allowed`}
                    >
                      CREATE TEMPLATE
                    </DisabledButtonStyled>
                  )}
                  {formValue?.masterFileSelect && (
                     <ButtonStyled $color={theme.primarycolor}
                      onClick={downloadTemplate}
                      className={`outline-1 w-[250px] h-[30px] rounded-md text-[#ffffff]`}
                    >
                      CREATE TEMPLATE
                    </ButtonStyled>
                  )}
                </div>
              </div>
            </article>
          </div>

          <div className="body-container">
            <article>
              <header className="text-center" style={{backgroundColor: theme.primarycolor}}>
                IMPORT FILE DATA DIRECTORY AND FILE NAME (SOURCE)
              </header>

              <div className="p-[7px] flex flex-col">
                <form id="import-mf" onSubmit={uploadTemplate}>
                  <input
                    type="file"
                    name="file"
                    id="file"
                    className="w-full"
                    ref={uploadElRef}
                    onChange={handleInputChange}
                  />

                  <div className="flex">
                    <Checkbox
                      description="First line contains Header Information."
                      name="firstlineheader"
                      id="firstlineheader"
                      handleInputChange={handleInputChange}
                      checked={formValue?.firstlineheader}
                    />
                  </div>

                  <div className="flex">
                    <Checkbox
                      description="UTF-8 File"
                      name="utf8file"
                      id="utf8file"
                      handleInputChange={handleInputChange}
                      checked={formValue?.utf8file}
                    />
                  </div>
                </form>

                <div className="text-center">     
                  {!uploadElRef.current?.value && (
                      <DisabledButtonStyled
                        className={`outline-1 w-[250px] h-[30px] rounded-md text-[#ffffff] cursor-not-allowed`}
                      >
                        IMPORT
                      </DisabledButtonStyled>
                  )}
                  {uploadElRef.current?.value && (
                      <ButtonStyled $color={theme.primarycolor}
                        form="import-mf"
                        type="submit"
                        className={`outline-1 w-[250px] h-[30px] rounded-md text-[#ffffff]`}
                      >
                        IMPORT
                      </ButtonStyled>
                  )}
                </div>
              </div>
            </article>
          </div>
        </>
      )}
    </>
  );
}
