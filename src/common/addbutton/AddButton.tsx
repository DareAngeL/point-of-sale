import { PlusCircleOutlined } from "@ant-design/icons";
import { UserAccessActions, useUserAccessHook } from "../../hooks/userAccessHook";
import { useTheme } from "../../hooks/theme";

interface AddButtonProps {
  onClick: () => void;
}

export function AddButton(props: AddButtonProps) {
  const { onClick } = props;
  const { ButtonStyled, ButtonTextStyled, theme } = useTheme();

  const { hasActionAccess } = useUserAccessHook();

  return (
    <>
      {hasActionAccess(UserAccessActions.ADD) && (
        <button
          type="button"
          className="fixed right-[80px] bottom-[30px] z-10"
          onClick={onClick}
        >
          <ButtonStyled $color={theme.primarycolor} className="rounded-full w-[50px] h-[50px] flex justify-center items-center">
            <ButtonTextStyled $color={theme.primarycolor}>
              <PlusCircleOutlined className={`text-[3.5rem] m-auto cursor-pointer`} />
            </ButtonTextStyled>
          </ButtonStyled>
        </button>
      )}
    </>
  );
}
