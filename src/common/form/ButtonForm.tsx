import {useNavigate} from "react-router";
import {useModal} from "../../hooks/modalHooks";
import {WarningModal} from "../modal/WarningModal";
import {useEffect, useRef, useState} from "react";
import {hasChanges} from "../../helper/Comparison";

interface ButtonFormProps<T> {
  formName: string;
  data?: T;
  dontAddDataOnFirstRender?: boolean;
  okBtnTxt?: string;
  cancelBtnTxt?: string;
  onCancelBtnClick?: () => void;
  isActivated?: boolean | true;
  onOkBtnClick?: () => void;
  isColorSwitched?: boolean;
  isCentralConnected?: boolean;
  isShowWarningCancel?: true | boolean;
  dontEmptyUndefinedData?: true | boolean;
  overrideOnCancelClick?: () => void;
  isNotOnMainModal?: boolean;
  btnType?: 'button' | 'reset' | 'submit';
  children?: React.ReactNode;
  disabled?: boolean;
}

export function ButtonForm<T extends object>(props: ButtonFormProps<T>) {
  const {dispatch, modal} = useModal();
  const Navigate = useNavigate();
  const [showWarningCancel, setShowWarningCancel] = useState(false);
  // used to determine if we need to show the warning modal when cancel button is clicked
  // only show the warning modal if the data has changes; otherwise, cancel directly
  const data = useRef<{
    origData: T | undefined;
    changedData: T | undefined;
  }>({origData: undefined, changedData: undefined});
  const isFirsRender = useRef(true); // is first render of this component ?

  useEffect(() => {
    // set the original data from the passed property data
    if (props.data && !data.current.origData) {
      data.current.origData = props.data;
      data.current.changedData = props.data;
    }
    // if the passed property data is undefined, set the original data to
    // empty object in the first render of the component.
    if (
      props.isShowWarningCancel &&
      !props.data &&
      // !data.current.origData &&
      !props.dontEmptyUndefinedData
    ) {
      isFirsRender.current = true;
      data.current.origData = {} as T;
      data.current.changedData = {} as T;
      return;
    }

    if (props.dontAddDataOnFirstRender && isFirsRender.current) {
      isFirsRender.current = false;
      return;
    }

    data.current.changedData = props.data;
  }, [props.data]);

  const cancel = () => {
    if (props.overrideOnCancelClick) {
      props.overrideOnCancelClick();
    } else {
      props.onCancelBtnClick && props.onCancelBtnClick();

      if (!props.isNotOnMainModal && modal) dispatch();
      if (props.isActivated) Navigate(-1);
    }
  };

  const onCancelClick = () => {
    // cancel directly if isShowWarningCancel is false
    if (!props.isShowWarningCancel) {
      cancel();
      return;
    }

    // only show warning about changes if the program is not connected to central
    if (!props.isCentralConnected) {
      // detect changes in data
      const changes = hasChanges<T>(
        data.current.origData || ({} as T),
        data.current.changedData || ({} as T)
      );
      if (changes) {
        setShowWarningCancel(true);
        return;
      }
    }

    cancel();
  };

  return (
    <>
      {showWarningCancel && (
        <WarningModal
          modalName={"Cancel"}
          onYes={cancel}
          onNo={() => setShowWarningCancel(false)}
        />
      )}
      <div className="flex flex-col justify-center items-center bg-white sticky bottom-0 h-[100px]">
        {props.children && props.children}
        <div id="buttons" className="flex justify-center items-center">
          <button
            type="button"
            disabled={props.disabled}
            className={
              props.isColorSwitched
                ? "px-4 py-2 rounded-lg border border-solid border-gray-300 hover:bg-green-500 hover:text-white my-5 mx-3 transition-all duration-200"
                : "px-4 py-2 rounded-lg border border-solid border-gray-300 hover:bg-blue-500 hover:text-white my-5 mxl-3 transition-all duration-200"
            }
            onClick={onCancelClick}
          >
            {props.cancelBtnTxt
              ? props.isCentralConnected
                ? "Exit"
                : props.cancelBtnTxt
              : props.isCentralConnected
              ? "Exit"
              : "Cancel"}
          </button>
          {!props.isCentralConnected && (
            <button
              form={props.formName}
              type={props.btnType ? props.btnType : "submit"}
              disabled={props.disabled}
              className={
                props.isColorSwitched
                  ? "px-4 py-2 rounded-lg border border-solid border-gray-300 bg-blue-500 text-white my-5 mxl-3 transition-all duration-200"
                  : "px-4 py-2 rounded-lg border border-solid border-green-500 bg-green-500 text-white my-5 mx-3 transition-all duration-200"
              }
              onClick={props.onOkBtnClick}
            >
              {props.okBtnTxt ? props.okBtnTxt : "Update"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
