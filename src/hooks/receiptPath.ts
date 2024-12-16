import { useAppDispatch } from "../store/store";
import { saveReceipt } from "../store/actions/printout.action";

interface PathProps {
  base64String: string;
  code: string | undefined;
}

const createFileFromBase64 = (base64String: string, fileName: string) => {
  const byteCharacters = atob(base64String);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], {type: "application/pdf"});

  const file = new File([blob], fileName, {type: "application/pdf"});

  return file;
};

export const useReceiptPath = () => {

  const appDispatch = useAppDispatch();

  const handleReceiptPath = async (
    data: PathProps,
    trantype?: 'void' | 'refund' | string,
    fileName?: string,
    date?: string,
    usePassedDate?: boolean
  ) => {

    if (data.base64String && data.base64String.length > 0) {
      const file = createFileFromBase64(
        data.base64String,
        `${fileName || data.code}.pdf`
      );
      const formData = new FormData();
      formData.append("file", file);

      console.log("Date to pre oh", date);
      try {
        const response = await appDispatch(saveReceipt({
          trantype: trantype || "OR",
          date: date,
          usePassedDate,
          formData,
          config: {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
          // time:
        }))
        console.log(response);
      } catch (error) {
        console.log(error);
      }
    }
  };
  return {handleReceiptPath};
};
