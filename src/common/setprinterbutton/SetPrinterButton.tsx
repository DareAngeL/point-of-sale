import { useTheme } from "../../hooks/theme";

interface SetPrinterButtonProps {
  onClick: () => void;
}

export function SetPrinterButton(props: SetPrinterButtonProps) {
  const {onClick} = props;
  const { ButtonStyled, theme } = useTheme();

  return (
    <>
      <ButtonStyled $color={theme.primarycolor}
        className="font-monserrat rounded items-center text-center ms-auto w-[120px] h-[50px] cursor-pointer flex justify-center transition-all duration-300"
        onClick={onClick}
      >
        <p>SET PRINTER</p>
      </ButtonStyled>
    </>
  );
}
