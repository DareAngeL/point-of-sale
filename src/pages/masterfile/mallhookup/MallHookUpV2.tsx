/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {InputText} from "../../../common/form/InputText";
import {useAppDispatch, useAppSelector} from "../../../store/store";
import {InputNumber} from "../../../common/form/InputNumber";
import {Selection} from "../../../common/form/Selection";
import {useEffect, useState} from "react";
import { getMallFields, updateMallFields } from "../../../store/actions/mallhookup.action";
import { ButtonForm } from "../../../common/form/ButtonForm";
import { MallHookup2Model } from "../../../models/mallhookupfile2";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { useModal } from "../../../hooks/modalHooks";
import { InputPassword } from "../../../common/form/InputPassword";
import { useRobinsonEssentials } from "./hooks/useRobinsonEssentials";

export function MallHookUpV2() {

  const navigate = useNavigate();
  const appDispatch = useAppDispatch();
  const { dispatch: dispatchModal, removeXbuttonDispatch } = useModal();
  const {syspar, mallHookUp} = useAppSelector((state) => state.masterfile);
  const [dataToDisplay, setDataToDisplay] = useState<any[]>([]);

  const { isTestingConnection, handleOnTestConnection } = useRobinsonEssentials(appDispatch, removeXbuttonDispatch);

  useEffect(() => {
    const load = async () => {
      appDispatch(getMallFields(syspar.data[0].active_mall||0));
    }

    load();
  }, []);

  useEffect(() => {
    if (mallHookUp.data) {
      const selectionFields = mallHookUp.data.mallfields?.filter(a => a.input_type.toLocaleUpperCase() === 'SELECT');

      const selData = selectionFields?.reduce((acc, field) => {
        return {
          ...acc,
          [field.label!]: 
            acc[field.label!] ? 
              [...acc[field.label!], {recid: field.recid!, isSelect: field.is_select===1, option: field.value}] 
              : 
              [{recid: field.recid!, isSelect: field.is_select===1, option: field.value}]
        }
      }, {} as {[field_label: string]: {recid: number, isSelect: boolean, option: string}[]});

      let fieldsToDisplay = [...mallHookUp.data.mallfields?.filter(a => a.input_type.toLocaleUpperCase() !== 'SELECT')||[]] as any[];
      // insert selection fields to the fieldsToDisplay
      selectionFields?.forEach((field) => {
        // check if the field is already in the fieldsToDisplay
        if (fieldsToDisplay.find(a => {
          if (!a.recid) {
            const key = Object.keys(a)[0];
            return key === field.label
          }
          
          return false;
        })) {
          return;
        }

        fieldsToDisplay.splice(field.recid!, 0, {[field.label]: selData?.[field.label]});
      });
      // sort fieldsToDisplay
      fieldsToDisplay = fieldsToDisplay.sort((a, b) => {
        let recidA, recidB;

        if (a.recid) {
          recidA = a.recid;
        }
        else {
          const opts = a[Object.keys(a)[0]];
          recidA = opts[opts.length-1].recid;
        }

        if (b.recid) {
          recidB = b.recid;
        }
        else {
          const opts = b[Object.keys(b)[0]];
          recidB = opts[opts.length-1].recid;
        }

        return recidA - recidB;
      });

      setDataToDisplay(fieldsToDisplay);
      
    }
  }, [mallHookUp]);

  const handleOnInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;

    setDataToDisplay((prev) => {
      if (prev.find(a => a.label === name)) {
        return prev.map(a => {
          if (a.label === name) {
            return {
              ...a,
              value
            }
          }

          return a;
        });
      }

      return prev;
    });
  }

  const handleOnSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const {name, value} = e.target;

    setDataToDisplay((prev) => {
      const selData = prev.find(a => a[name]);
      if (selData) {
        return prev.map(a => {
          if (a[name]) {
            return {
              ...a,
              [name]: a[name].map((b:any) => {
                if (b.option === value) {
                  return {
                    ...b,
                    isSelect: true
                  }
                }

                return {
                  ...b,
                  isSelect: false
                }
              })
            }
          }

          return a;
        });
      }

      return prev;
    });
  }

  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const mappedData = dataToDisplay.reduce((acc, data) => {
      if (!data.recid) {
        const key = Object.keys(data)[0];
        data[key].forEach((a:any) => {
          acc.push({
            recid: a.recid,
            label: key,
            is_select: a.isSelect ? 1 : 0,
            value: a.option
          })
        });

        return acc;
      }

      return [...acc, data];
    }, [] as MallHookup2Model[]);

    const response = await appDispatch(updateMallFields(mappedData));

    if (response.meta.requestStatus === 'fulfilled') {
      toast.success("Mall Hookup updated successfully", {
        hideProgressBar: true,
        position: 'top-center',
        autoClose: 2000,
      });

      dispatchModal();
      navigate(-1);
    } else {
      toast.error("Failed to update Mall Hookup", {
        hideProgressBar: true,
        position: 'top-center',
        autoClose: 2000,
      });
    }
  }
  
  return (
    <>
      <form id="mallhookup-form" onSubmit={handleOnSubmit}>
        <div>
          <label className="block mb-2 text-lg text-black font-montserrat font-extrabold">
            {syspar?.data[0].nexbridge
              ? mallHookUp.data?.mallname
                ? `${mallHookUp.data.mallname} + Nexbridge`
                : "Nexbridge"
              : mallHookUp.data?.mallname}
          </label>
        </div>

        <div className="relative">
          {isTestingConnection && <div className="absolute w-[100vw] h-full bg-gray-100 opacity-50 z-20"/>}
          {dataToDisplay.map((data) => {
            if (data.recid) {
              switch (data.input_type.toLocaleUpperCase()) {
                case "NUMBER":
                  return (
                    <InputNumber
                      key={data.recid}
                      id={data.recid!.toString()}
                      name={data.label!}
                      value={Number(data.value)}
                      handleInputChange={handleOnInputChange}
                      description={data.label}
                    />
                  );
  
                case "TEXT":
                  return (
                    <InputText
                      key={data.recid}
                      id={data.recid!.toString()}
                      name={data.label!}
                      value={data.value}
                      handleInputChange={handleOnInputChange}
                      description={data.label}
                    />
                  );
                case "PASSWORD":
                  return (
                    <InputPassword
                      key={data.recid}
                      id={data.recid!.toString()}
                      name={data.label!}
                      value={data.value}
                      handleInputChange={handleOnInputChange}
                      description={data.label}
                    />
                  );
                default:
                  return <></>;
              }
            }
            else {
              const label = Object.keys(data)[0];
              return (
                <Selection
                  key={label}
                  id={label}
                  name={label}
                  value={data[label].find((a:any) => a.isSelect)?.option}
                  handleSelectChange={handleOnSelectChange}
                  description={label}
                  keyValuePair={data[label].map((a:any) => ({key: a.option, value: a.option}))}
                />
              )
            }

          })}
        </div>

        {mallHookUp.data?.mallname === "Robinsons" ? (
          <div className="flex flex-col justify-center items-center bg-white sticky bottom-0 h-[100px]">
            <div id="buttons" className="flex justify-center items-center">
              <button
                type="button"
                className={`px-4 py-2 mx-2 rounded-lg border border-solid border-gray-300 hover:bg-red-500 hover:text-white my-5 transition-all duration-200`}
                onClick={() => {
                  navigate(-1)
                  dispatchModal();
                }}
                disabled={isTestingConnection}
              >
                Exit
              </button>
              <button
                type="button"
                className={`px-4 py-2 mx-2 rounded-lg border border-solid ${isTestingConnection ? 'border-gray-500 bg-gray-500' : 'border-blue-500 bg-blue-500'} text-white my-5 transition-all duration-200`}                
                onClick={handleOnTestConnection}
                disabled={isTestingConnection}
              >
                Test Connection
              </button>
              <button
                form="mallhookup-form"
                type="submit"
                className={`px-4 py-2 mx-2 rounded-lg border border-solid ${isTestingConnection ? 'border-gray-500 bg-gray-500' : 'border-green-500 bg-green-500'} text-white my-5 transition-all duration-200`}
                // onClick={props.onOkBtnClick}
                disabled={isTestingConnection}
              >
                Update
              </button>
            </div>
          </div>
        ) : (
          <ButtonForm
            isShowWarningCancel
            dontEmptyUndefinedData
            formName={"mallhookup-form"}
          />
        )}
      </form>
    </>
  )
}
