import {useAppSelector} from "../store/store";
import {toast} from "react-toastify";
import {useService} from "./reportHooks";

interface Dates {
  dateFrom: String;
  dateTo: String;
}

interface Parameters {
  mallName: string;
  successMessage: string;
  errorMessage: string;
  dateFrom: String;
  dateTo: String;
  fileType: "csv" | "txt";
  url?: string;
}

export const useRegenerateMallFiles = () => {
  const {postData} = useService();
  const {syspar} = useAppSelector((state) => state.masterfile);

  const postApiService = ({
    mallName,
    dateFrom,
    dateTo,
    errorMessage,
    successMessage,
    fileType,
  }: Parameters) => {
    const apiParameters = {
      dateFrom,
      dateTo,
      mallName,
      fileType,
      basePath: syspar.data[0].pathfile,
    };
    postData(`regeneratemallfiles`, apiParameters, async (res: any, err) => {
      if (err) {
        console.log(res.data);
        toast.error(errorMessage, {
          hideProgressBar: true,
          position: 'top-center',
          autoClose: 1500,
        });
      } else {
        console.log(res.data);
        const {data, msg} = res.data;
        if (data.length === 0) {
          toast.info(msg, {
            hideProgressBar: true,
            position: 'top-center',
            autoClose: 2500,
          });
        } else {
          toast.success(successMessage, {
            hideProgressBar: true,
            position: 'top-center',
            autoClose: 1500,
          });
        }
      }
    });
  };

  const handleRegenerateMallFiles = ({dateFrom, dateTo}: Dates) => {
    const settings = syspar.data[0];
    console.log(settings);

    if (settings.nexbridge === 1) {
      if (settings.enable_separate_hookup === 1) {
        // set up web socket
        postApiService({
          mallName: "Nexbridge",
          dateFrom,
          dateTo,
          successMessage: "Text file successfully sent to local server",
          errorMessage:
            "Text file is not sent to local server. Please contact your POS provider.",
          fileType: "txt",
        });
      } else {
        postApiService({
          mallName: "Nexbridge",
          dateFrom,
          dateTo,
          successMessage: "File successfully saved to server",
          errorMessage:
            "File is not saved to server. Please contact your POS provider.",
          fileType: "csv",
        });
      }
    }
    switch (true) {
      case settings.robinson === 1:
        postApiService({
          dateFrom,
          dateTo,
          mallName: "Robinson",
          successMessage: "Sales file successfully sent to RLC server",
          errorMessage:
            "Sales file is not sent to RLC server. Please contact your POS vendor",
          fileType: "csv",
        });
        break;
      case settings.sm === 1 || settings.sm_mall_2022 === 1:
        if (settings.enable_separate_hookup === 1) {
          // need to set up web socket
          postApiService({
            mallName: "SM",
            dateFrom,
            dateTo,
            successMessage: "Text file successfully sent to local server",
            errorMessage:
              "Text file is not sent to local server. Please contact your POS provider.",
            fileType: "txt",
          });
        } else {
          postApiService({
            mallName: "SM",
            dateFrom,
            dateTo,
            successMessage: "File successfully saved to SM server",
            errorMessage:
              "File is not saved to SM server. Please contact your POS provider.",
            fileType: "csv",
          });
        }
        break;
      case settings.ortigas === 1:
        postApiService({
          mallName: "Ortigas",
          dateFrom,
          dateTo,
          successMessage: "File successfully saved.",
          errorMessage: "File is not saved. Something went wrong...",
          fileType: "csv",
        });
        break;
      case settings.ayala === 1:
        if (settings.enable_separate_hookup === 1) {
          // need to set up web socket

          postApiService({
            mallName: "Ayala Mall",
            dateFrom,
            dateTo,
            successMessage: "Text file successfully sent to local server",
            errorMessage:
              "Text file is not sent to local server. Please contact your POS provider.",
            fileType: "txt",
          });
        } else {
          postApiService({
            mallName: "Ayala Mall",
            dateFrom,
            dateTo,
            successMessage: "File successfully saved.",
            errorMessage: "File is not saved. Something went wrong...",
            fileType: "csv",
          });
        }
        break;
      case settings.ayala_mall_2022 === 1:
        if (settings.enable_separate_hookup === 1) {
          postApiService({
            mallName: "Ayala Mall 2022",
            dateFrom,
            dateTo,
            successMessage: "Text file successfully sent to local server",
            errorMessage:
              "Text file is not sent to local server. Please contact your POS provider.",
            fileType: "txt",
          });
        } else {
          postApiService({
            mallName: "Ayala Mall 2022",
            dateFrom,
            dateTo,
            successMessage: "File successfully saved to Local",
            errorMessage:
              "File is not saved to Local. Please contact your POS provider.",
            fileType: "csv",
          });
        }
        break;
      case settings.megaworld === 1:
        if (settings.enable_separate_hookup === 1) {
          // need to set up web socket
          postApiService({
            mallName: "Megaworld",
            dateFrom,
            dateTo,
            successMessage: "Text file successfully sent to Megaworld server",
            errorMessage:
              "Text file is not sent to Megaworld server. Please contact your POS provider.",
            fileType: "txt",
          });
        } else {
          postApiService({
            mallName: "Megaworld",
            dateFrom,
            dateTo,
            successMessage: "Text file successfully sent to Megaworld server",
            errorMessage:
              "Text file is not sent to Megaworld server. Please contact your POS provider.",
            fileType: "csv",
          });
        }
        break;
      case settings.naia === 1:
        postApiService({
          mallName: "NAIA",
          dateFrom,
          dateTo,
          successMessage: "File successfully saved to Local",
          errorMessage:
            "File is not saved to Local. Please contact your POS provider.",
          fileType: "csv",
        });
        break;
      case settings.shangrila === 1:
        if (settings.enable_separate_hookup === 1) {
          postApiService({
            mallName: "Shangrila",
            dateFrom,
            dateTo,
            successMessage: "Text file successfully sent to local server",
            errorMessage:
              "Text file is not sent to local server. Please contact your POS provider.",
            fileType: "csv",
          });
        } else {
          postApiService({
            mallName: "Shangrila",
            dateFrom,
            dateTo,
            successMessage: "File successfully saved to server",
            errorMessage:
              "File is not saved to server. Please contact your POS provider.",
            fileType: "csv",
          });
        }
        break;
      case settings.mitsukoshi === 1:
        if (settings.enable_separate_hookup === 1) {
          // set up web
          postApiService({
            mallName: "Mitsukoshi",
            dateFrom,
            dateTo,
            successMessage: "Text file successfully sent to local server",
            errorMessage:
              "Text file is not sent to local server. Please contact your POS provider.",
            fileType: "txt",
          });
        } else {
          if (settings.mitsukoshi_setup_type === "default") {
            postApiService({
              mallName: "Mitsukoshi",
              dateFrom,
              dateTo,
              successMessage: "File successfully saved to server",
              errorMessage:
                "File is not saved to server. Please contact your POS provider.",
              fileType: "csv",
            });
          } else if (settings.mitsukoshi_setup_type === "consolidator") {
            postApiService({
              mallName: "Mitsukoshi",
              dateFrom,
              dateTo,
              successMessage:
                "Daily Sales file successfully saved to API server",
              errorMessage:
                "Daily Sales file is not saved to API server. Please contact your POS provider.",
              fileType: "csv",
            });
          } else if (settings.mitsukoshi_setup_type === "client") {
            postApiService({
              mallName: "Mitsukoshi",
              dateFrom,
              dateTo,
              successMessage:
                "Daily Sales file successfully saved to API server",
              errorMessage:
                "Daily Sales file is not saved to API server. Please contact your POS provider.",
              fileType: "csv",
            });
          }
        }
        break;
      default:
        console.log("no case");
        toast.error("ERROR: No CASE FOUND", {
          hideProgressBar: true,
          position: 'top-center',
          autoClose: 1500,
        });
        break;
    }
  };
  return {handleRegenerateMallFiles};
};
