import { useAppDispatch, useAppSelector } from "../../store/store";
import React, { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router";
import { Modal } from "../../common/modal/Modal";
import { useChangeNameModal, useModal } from "../../hooks/modalHooks";
import { SecurityCode } from "./securitycode/SecurityCode";
import { useService } from "../../hooks/reportHooks";
import { useService as useServiceHook } from "../../hooks/serviceHooks";
import { useUserActivityLog } from "../../hooks/useractivitylogHooks";
import { METHODS, MODULES } from "../../enums/activitylogs";
import { InputPassword } from "../../common/form/InputPassword";
import { useSwipeCardFeature } from "../../hooks/swipeCard";
import { login } from "../../store/actions/user.action";
import { useTheme } from "../../hooks/theme";
import { getTheme } from "../../store/actions/utilities/theme.action";
import { removeXButton } from "../../reducer/modalSlice";
import { toast } from "react-toastify";
import { useServerSetup } from "./setup/hooks/serverSetup";

export function LoginCard() {
  const { allowAccess } = useAppSelector((state) => state.account);
  const { ButtonStyled, theme } = useTheme();

  const { dispatch: dispatchModal } = useModal();
  const { modalNameDispatch } = useChangeNameModal();
  const appDispatch = useAppDispatch();
  const navigate = useNavigate();
  const [acc, setAccount] = useState<{ usrcde: string; usrpwd: string }>({
    usrcde: "",
    usrpwd: "",
  });
  const refModal = useRef(false);
  const [isSecurityCode, setIsSecurityCode] = useState(false);
  const { postData } = useService<any>();
  const [, setSecurityDisabled] = useState(false);
  const [securityData, setSecurityData] = useState<any>();

  const {authSwipeCardInfo} = useSwipeCardFeature();
  const [swipeCard, setSwipeCard] = useState({
    descrption: "",
    value: ""
  });

  const dispatch = useAppDispatch(); 
  
  const { getData } = useServiceHook<any>("gethddserial");

  const { bypassSecCode } = useAppSelector((state) => state.account);

  const { postActivity } = useUserActivityLog();
  const { initServerSetup } = useServerSetup();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setAccount((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (acc.usrcde === "SETUP" && acc.usrpwd === "admin12345") {
      if (!allowAccess) {
        return toast.error("Database structure is not updated. Please contact your administrator.", {
          hideProgressBar: true,
          position: "top-center",
          autoClose: 2000,
        });
      }

      navigate("./setup");
      modalNameDispatch("Server Setup");
      dispatchModal();
    } else if (acc.usrcde === "DBSETUP" && acc.usrpwd === "admin12345") {
      if (!allowAccess) {
        return toast.error("Database structure is not updated. Please contact your administrator.", {
          hideProgressBar: true,
          position: "top-center",
          autoClose: 2000,
        });
      }

      navigate("./dbsetup");
      modalNameDispatch("DB Connection");
      dispatchModal();
    } else if (acc.usrcde === "DBCONFIG" && acc.usrpwd === "admin12345") {
      navigate("./dbconfig");
      modalNameDispatch("Database Config");
      dispatchModal();
    } else if (acc.usrcde === "CSETUP" && acc.usrpwd === "admin12345") {
      if (!allowAccess) {
        return toast.error("Database structure is not updated. Please contact your administrator.", {
          hideProgressBar: true,
          position: "top-center",
          autoClose: 2000,
        });
      }

      navigate("./customerwindowsetup");
      modalNameDispatch("Customer Window Setup");
      dispatchModal();
    } else {
      if (!allowAccess) {
        return toast.error("Database structure is not updated. Please contact your administrator.", {
          hideProgressBar: true,
          position: "top-center",
          autoClose: 2000,
        });
      }

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

      appDispatch(login(acc));
    }
    postActivity({
      method: METHODS.LOGIN,
      module: MODULES.LOGIN,
      remarks: `LOGIN:\nUSERCODE:${acc.usrcde}`,
    });
  };

  const enterSecurityCode = () => {
    setIsSecurityCode(true);
  };

  const isFirstTime = () => {
    const isFileExists = localStorage.getItem("isFirstRun");

    if(isFileExists){
      return false;
    }

    localStorage.setItem("isFirstRun", "1");
    return true;
  }

  useEffect(() => {
    appDispatch(getTheme());
    initServerSetup();
    
    if (allowAccess) {
      if (isFirstTime() && !refModal.current) {
        navigate("./operationsetup");
        dispatch(removeXButton(true));
        modalNameDispatch("Operation Setup");
        dispatchModal();
        refModal.current = true;
      }
  
      if (localStorage.getItem("lst_conf")) {
        const fetchAPI = async () => {
          
          // GET THE INITIAL SERIAL NUMBER
          let _serial = localStorage.getItem("serialnum");
  
          // IF THE INTIAL SERIAL NUMBER FETCHED IS VALID IGNORE THIS FUNCTION, OTHERWISE, REFETCH;
          if(!_serial){
            await getData("", async (res) => {
              if (res.data.length > 0) {
                localStorage.setItem("serialnum", res.data);
              }
            });
    
            _serial = localStorage.getItem("serialnum");
    
            if(!_serial) return;
          }
          
          if (!localStorage.getItem("lstpos")) {
            await postData(
              "securitycode",
              { createposfile: true },
              async (res) => {
                localStorage.setItem("lstpos", res.data.encrypted);
              }
            );
          }
  
          await postData(
            "securitycode",
            {
              ischeck: true,
              lstpos: localStorage.getItem("lstpos"),
              imei: _serial,
            },
            async (res) => {
              if (
                res.data.expired ||
                res.data.incorrect ||
                res.data.missing ||
                res.data.override ||
                res.data.serial
              ) {
                localStorage.setItem("lstpos", res.data.encrypted);
                setSecurityDisabled(true);
                setSecurityData(res.data);
                setIsSecurityCode(true);
              } else if (res.data.expiring) {
                setSecurityDisabled(false);
                setSecurityData(res.data);
                setIsSecurityCode(true);
              }
            }
          );
  
        };
  
        fetchAPI();
      }
    }
  }, [allowAccess]);

  const onSwipeCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      appDispatch(login({
        swipeCard: cardCreds
      }))
    }

  }

  return (
    <>
    {/* BYPASSED SECURITY CODE */}
      {bypassSecCode ? false : isSecurityCode ? (
        <SecurityCode
          data={securityData}
          isSecurityCode={isSecurityCode}
          setIsSecurityCode={setIsSecurityCode}
        />
      ) : (
        <></>
      )}

      <Modal title="" isActivated={true}>
        <Outlet></Outlet>
      </Modal>

      <form id="login" onSubmit={onSubmit}>
        <div>
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
          <label
            htmlFor="email"
            className="block mb-2 text-xs text-black font-montserrat"
          >
            User Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="usrcde"
            id="usrcde"
            className="bg-white border text-black sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
            placeholder="User code"
            onChange={handleChange}
          />
        </div>
        <div className="mt-5">
          <label
            htmlFor="email"
            className="block mb-2 text-xs text-black font-montserrat"
          >
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="usrpwd"
            id="usrpwd"
            className="bg-white border text-black sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
            placeholder="Password"
            onChange={handleChange}
          />
        </div>
        <div className="mt-8 flex justify-center items-center flex-col">
          <ButtonStyled $color={theme.primarycolor}
            className="rounded-full bg-slate-600 w-[200px] h-[50px] hover:bg-[#3e516b] text-white mb-[7px]"
            form="login"
          >
            Login
          </ButtonStyled>

          <button
            className="w-[200px] h-[50px] bg-transparent text-black"
            form=""
            onClick={enterSecurityCode}
          >
            Enter Security Code
          </button>
        </div>
      </form>
    </>
  );
}
