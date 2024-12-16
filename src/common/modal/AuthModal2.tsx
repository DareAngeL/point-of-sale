import {useAppDispatch} from "../../store/store";
import {toggle} from "../../reducer/modalSlice";
import { useFormInputValidation } from "../../hooks/inputValidation";
import { InputText } from "../form/InputText";
import { useEffect, useState } from "react";
import { InputPassword } from "../form/InputPassword";
import { useSwipeCardFeature } from "../../hooks/swipeCard";
import { useTheme } from "../../hooks/theme";
import { useAuthorizedUserOperation } from "../../hooks/authorizedser2";

export enum AuthBypModules {
  ORDERING,
  REPORTS,
  UTILITIES,
  OPERATIONS,
  EXIT
}

interface AuthProps {
  customFn?: () => void;
  useFor: AuthBypModules;
  handleOnAuthorized?: () => void;
}

interface AuthRequiredValues {
  "User Code *": string;
  "Password *": string;
}

export function AuthModalOperation({customFn, handleOnAuthorized}: AuthProps) {
  const dispatch = useAppDispatch();
  const { authorize } = useAuthorizedUserOperation();
  const { authSwipeCardInfo } = useSwipeCardFeature();
  const { ButtonStyled, theme } = useTheme();

  const [cred, setCred] = useState({
    usrcde: "",
    usrpwd: "",
  })
  const [swipeCard, setSwipeCard] = useState({
    descrption: "",
    value: ""
  });

  const {
    handleSubmit,
    registerInputs,
    unregisterInputs,
    changeRequiredValue,
    errors
  } = useFormInputValidation<AuthRequiredValues>()

  useEffect(() => {
    registerInputs({
      inputs: [
        {
          path: "User Code *",
          name: "usrcde",
          value: cred.usrcde,
        },
        {
          path: "Password *",
          name: "usrpwd",
          value: cred.usrpwd,
        },
      ]
    })

    return () => {
      unregisterInputs()
    }
  }, [])

  const onSubmit = async (_cred?: any) => {

    if (swipeCard.value !== "") {
      const cardCreds = authSwipeCardInfo(swipeCard.value);

      if (!cardCreds) {
        setSwipeCard({
          descrption: "",
          value: ""
        })
        return;
      }
    }

    if (!_cred.swipeCard) {
      _cred = {
        usrcde: _cred['User Code *'],
        usrpwd: _cred['Password *']
      }
    }

    const isAuthorized = await authorize(_cred ? _cred : cred);

    if (!isAuthorized) {
      setSwipeCard({
        descrption: "",
        value: ""
      });
      return;
    }

    if (customFn) {
      customFn();
    } else {

    //   switch (useFor) {
    //     case AuthBypModules.ORDERING:
    //       handleOrderingAuthBypass()
    //     break;
    //   }

      if (handleOnAuthorized) {
        return handleOnAuthorized?.();
      }
      
      dispatch(toggle());
    }
  };

  const handleOnChangeInput = ({target}: React.ChangeEvent<HTMLInputElement>) => {
    const { name , value } = target;

    changeRequiredValue(name, value);
    setCred((prev) => {
      return {
        ...prev,
        [name]: value
      }
    })
  }

  const onSwipeCardChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    setSwipeCard(() => {
      return {
        descrption: value !== "" ? "Swipe Card" : "",
        value
      }
    });

    if (value.includes("?")) {
      const cardCreds = authSwipeCardInfo(value);

      if (!cardCreds) {
        setSwipeCard({
          descrption: "",
          value: ""
        })
        return;
      }

      // if card credential is valid
      onSubmit({
        swipeCard: cardCreds
      });
    }
  }

  return (
    <>
      {/* <div className=""> */}
        <form className="rounded-md border shadow-md w-[400px] h-auto flex flex-col p-9 bg-white" onSubmit={handleSubmit(onSubmit)}>
          <div className="border-b-[1px] mb-2">
            <InputPassword
              handleInputChange={onSwipeCardChange}
              name={"swipe"}
              value={swipeCard.value}
              id={"swipe"}
              description={swipeCard.descrption}
              placeholder="Swipe Card"
              autoFocus
            />
          </div>
          <div>
            <InputText
              handleInputChange={handleOnChangeInput}
              name={"usrcde"}
              value={cred.usrcde}
              id={"usrcde"}
              description={"User Code *"}
              error={errors}
              required
            />
          </div>
          <div className="mt-2">
            <InputPassword
              handleInputChange={handleOnChangeInput}
              name={"usrpwd"}
              value={cred.usrpwd}
              id={"usrpwd"}
              description={"Password *"}
              error={errors}
              required
            />
          </div>
          <div className="mt-8 flex justify-center">
            <ButtonStyled
              $color={theme.primarycolor}
              className="rounded-full bg-slate-600 w-[200px] h-[50px] hover:bg-[#3e516b] text-white"
              type="submit"
            >
              Confirm
            </ButtonStyled>
          </div>
        </form>
      {/* </div> */}
    </>
  );
}
