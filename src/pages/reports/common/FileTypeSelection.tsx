import {useState} from "react";
import {Checkbox} from "../../../common/form/Checkbox";
import {ButtonForm} from "../../../common/form/ButtonForm";

interface FileTypeSelectionProps {
  handleOnOkBtnClick: (selectedFileTypes: ZReadingFileTypes[]) => void;
  handleOnCancelBtnClick?: () => void;
}

export enum ZReadingFileTypes {
  PDF = "pdf",
  CSV = "csv",
  TXT = "txt",
}

export function FileTypeSelection(props: FileTypeSelectionProps) {
  const [fileTypes, setFileTypes] = useState<ZReadingFileTypes[]>([
    ZReadingFileTypes.PDF,
  ]); // file types to be printed
  const {handleOnOkBtnClick, handleOnCancelBtnClick} = props;

  const handleInputChange = ({
    target: {name},
  }: React.ChangeEvent<HTMLInputElement>) => {
    const type = name as ZReadingFileTypes;
    setFileTypes((prev: ZReadingFileTypes[]) => {
      if (prev.includes(type)) return prev.filter((item) => item !== type);
      return [...prev, type];
    });
  };

  return (
    <>
      <div className="flex flex-col items-start">
        <Checkbox
          checked
          id={ZReadingFileTypes.PDF}
          name={ZReadingFileTypes.PDF}
          description={"PDF File (Default)"}
          disabled
        ></Checkbox>
        <Checkbox
          handleInputChange={handleInputChange}
          checked={undefined}
          id={ZReadingFileTypes.CSV}
          name={ZReadingFileTypes.CSV}
          description={"CSV File (Optional)"}
        />
        <Checkbox
          handleInputChange={handleInputChange}
          checked={undefined}
          id={ZReadingFileTypes.TXT}
          name={ZReadingFileTypes.TXT}
          description={"Text File (Optional)"}
        />
        <div className="w-full flex justify-center">
          <ButtonForm
            formName=""
            okBtnTxt="Ok"
            onOkBtnClick={() => handleOnOkBtnClick(fileTypes)}
            onCancelBtnClick={handleOnCancelBtnClick}
          />
        </div>
      </div>
    </>
  );
}
