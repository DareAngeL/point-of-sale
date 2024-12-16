import {ReactNode} from "react";
import {Navigate} from "react-router";
import {useAppSelector} from "../../store/store";
import { toast } from "react-toastify";

export type AuthenticationProps = {
  condition?: boolean;
  redirectTo: string;
  isAccount?: boolean;
  children?: ReactNode;
  toastMsg?: string
};

export function AuthenticationGuard({
  condition,
  redirectTo,
  isAccount,
  children,
  toastMsg
}: AuthenticationProps): JSX.Element {
  const {account} = useAppSelector((state) => state.account);

  const redirect = () => {
    if (toastMsg) {
      toast.info(toastMsg, {
        autoClose: 2000,
        position: "top-center",
        hideProgressBar: true
      })
    }

    return <Navigate to={redirectTo} replace />
  }

  

  if (isAccount) {
    return account.isLoggedIn ? (
      <>{children}</>
    ) : (
      <Navigate to={redirectTo} replace />
    );
  } else {
    return condition ? <>{children}</> : redirect();
  }
}