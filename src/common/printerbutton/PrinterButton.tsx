import {PrinterOutlined} from "@ant-design/icons";
import {
  MasterfilePrintoutData,
  useMasterfilePrintout,
} from "../../hooks/masterfileHooks";
import { useTheme } from "../../hooks/theme";

interface PrinterButtonProps {
  printoutData: MasterfilePrintoutData; // use to set the data to be printed
  orientation?: "portrait" | "landscape";
  otherOnClick?: () => void;
}

export function PrinterButton(props: PrinterButtonProps) {
  const {printoutData, orientation, otherOnClick} = props;
  const {generatePrintout} = useMasterfilePrintout(orientation);
  const { ButtonStyled, theme } = useTheme();

  const onclick = () => {
    generatePrintout(printoutData);
    otherOnClick && otherOnClick();
  };

  return (
    <>
      <ButtonStyled $color={theme.primarycolor}
        className="font-montserrat text-[2rem] bg-slate-600 w-[50px] h-[50px]  text-center text-white rounded flex justify-center items-center cursor-pointer"
        onClick={onclick}
      >
        <PrinterOutlined className="text-center" />
      </ButtonStyled>
    </>
  );
}
