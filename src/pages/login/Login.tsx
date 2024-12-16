import { useState } from "react";
import { AuthBypModules, AuthModal } from "../../common/modal/AuthModal";
import { useTheme } from "../../hooks/theme";
import { AuthenticationGuard } from "../../security/authentication/AuthGuards";
import { useAppSelector } from "../../store/store";
import { LoginCard } from "./LoginCard";
import { CustomModal } from "../../common/modal/CustomModal";

export function Login() {
  const { account, bypassSecCode } = useAppSelector((state) => state.account);
  const { ButtonStyled, theme } = useTheme();

  const [openAuthModal, setOpenAuthModal] = useState(false);

  const handleExit = () => {
    setOpenAuthModal(false);

    // Exit the application
    window.close();
  }

  return (
    <>
      {openAuthModal && (
        <CustomModal 
          modalName={"Authentication"} 
          maxHeight={""}
          onExitClick={() => setOpenAuthModal(false)}
          isShowXBtn
        >
          <AuthModal 
            useFor={AuthBypModules.EXIT}
            customFn={handleExit}
          />
        </CustomModal>
      )}

      <AuthenticationGuard
        condition={!account.isLoggedIn}
        redirectTo={"/pages/home"}
      >
        <section className="relative flex flex-col justify-center items-center h-screen w-screen">
          <div className="absolute top-7 right-7">
            <ButtonStyled $color={theme.primarycolor}
              className=" px-8 py-1 rounded-md text-[1.2rem] font-montserrat"
              onClick={() => setOpenAuthModal(true)}
            >
              EXIT
            </ButtonStyled>
          </div>

          {bypassSecCode && (
            <div className="bg-yellow-400 rounded p-2">
              Security Code is currently being bypassed for testing purposes.
            </div>
          )}
          <div>
            <h1 className="font-montserrat text-[2rem] font-medium mb-5">
              POS Login
            </h1>
          </div>
          <div className="rounded-md border shadow-md w-[400px] h-auto flex flex-col p-9 bg-[#faf7f7]">
            <LoginCard />
          </div>
          <div className="mt-5">
            <h6 className=" font-montserrat">Version 1.5.0</h6>
          </div>
        </section>
      </AuthenticationGuard>
    </>
  );
}
