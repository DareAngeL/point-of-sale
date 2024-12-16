import { ChangeEventHandler } from "react";
import { InputPassword } from "../../../common/form/InputPassword";

interface PasswordFormProps {
  data: any;
  errors: any;
  handleInputChange: ChangeEventHandler<HTMLInputElement> | undefined;
}

export function PasswordForm(props: PasswordFormProps) {
  return (
    <>
      {!props.data?.recid ? (
        <>
          <InputPassword
            description="Password *"
            name="usrpwd"
            id="usrpwd"
            value={props.data?.usrpwd}
            error={props.errors}
            required
            handleInputChange={props.handleInputChange}
          />

          <InputPassword
            description="Re-type Password *"
            name="c_usrpwd"
            id="c_usrpwd"
            value={props.data?.c_usrpwd}
            error={props.errors}
            required
            handleInputChange={props.handleInputChange}
          />
        </>
      ) : (
        <></>
      )}
    </>
  );
}
