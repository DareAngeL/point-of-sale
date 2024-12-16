import { RefObject, useEffect, useState } from "react";
import { FieldValues, Path, PathValue, useForm } from "react-hook-form";
import { toast } from "react-toastify";

export function useFormInputValidation<T extends FieldValues>(prop?: any, autoRegisterInputs?: {form: RefObject<HTMLFormElement>, inputNames: string[], data: any}) {
  const {
    handleSubmit,
    register,
    formState: { errors },
    clearErrors,
    setValue,
    unregister,
  } = useForm<T>(prop);

  const allowedCharacters = /^[a-zA-Z0-9%&().,/-\s]*$/;

  const [inputs, setInputs] = useState<
    { path: Path<T>; name: string; value: PathValue<T, Path<T>> }[]
  >([]);

  // we use useEffect() to have a reference of the form when mounted
  useEffect(() => {
    // to use autoRegisterInputs, the inputs should have been already rendered, so we can fetch it and register it.
    const autoReg = (elems: HTMLCollectionOf<any>) => {
      if (autoRegisterInputs) {
        const forRegInputs = [];
        for (let i=0; i < (elems||[]).length; i++) {
          const elem = elems && elems[i];

          if (!elem) continue;
          if (!(autoRegisterInputs as any).inputNames.includes(elem.name)) continue;

          const labelElem = (autoRegisterInputs as any).form.current?.querySelector(`label[for="${elem.id}"]`);
          forRegInputs.push(
            {
              path: labelElem?.textContent as unknown as Path<T>,
              name: elem.name,
              value: (autoRegisterInputs as any).data ? (autoRegisterInputs as any).data[elem.name] : "",
            }
          )
        }
        
        console.log("asd", forRegInputs);

        return forRegInputs;
      }

      return [];
    }

    if (autoRegisterInputs) {
      const inputs = autoRegisterInputs.form.current?.getElementsByTagName("input");
      const selects = autoRegisterInputs.form.current?.getElementsByTagName("select");

      const inputsReg = autoReg(inputs || [] as unknown as HTMLCollectionOf<HTMLInputElement>);
      const selectsReg = autoReg(selects || [] as unknown as HTMLCollectionOf<HTMLSelectElement>);
      
      registerInputs({inputs: [...inputsReg, ...selectsReg]});

      return () => {
        unregisterInputs();
      }
    }

  }, []);

  const registerInputs = ({
    inputs,
  }: {
    inputs: {
      path: Path<T>;
      name: string;
      value: PathValue<T, Path<T>>;
      validate?: (value: PathValue<T, Path<T>>) => boolean | string;
    }[];
  }) => {
    setInputs(inputs);

    console.log(inputs);

    for (let i = 0; i < inputs.length; i++) {
      const { path, value, validate } = inputs[i];
      const validationRules: Record<string, any> = { required: true };

      console.log(value, validate, path, validationRules);

      if (validate) {
        validationRules.validate = validate;
      }

      register(path, validationRules);
      setValue(path, value);
    }
  };

  const unregisterInputs = (paths?: Path<T>[]) => {
    if (paths) {
      unregister(paths);
      return;
    }

    unregister(inputs.map((input) => input.path));
  };

  const changeRequiredValue = (
    name: string,
    value: PathValue<T, Path<T>>
  ) => {
    return new Promise((resolve) => {
      const path = inputs.find((input) => input.name === name)?.path || undefined;

      if (!path) { 
        resolve(false);
        return;
      }

      setValue(path, value);
      resolve(true);
    });
  };

  const validateValue = (value: any, regex: any) => {
    if (regex.test(value)) {
      return true; // Validation success
    }
    return false;
  };

  const validateInputCharacters = (value: string, charsMaxLen?: number) => {

    if (charsMaxLen && value.length > charsMaxLen) {
      toast.error(`Please limit your input to ${charsMaxLen} characters.`, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        toastId: "charsMaxLen",
      });

      return false;
    }

    const isValid = validateValue(value, allowedCharacters);
    if (!isValid) {
      toast.error("Please use only the following approved special characters: % & ( ) / - .", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        toastId: "allowedCharacters",
      });

      return false;
    } 

    return true;
  };

  return {
    validateInputCharacters,
    validateValue,
    handleSubmit,
    errors,
    clearErrors,
    changeRequiredValue,
    registerInputs,
    register,
    unregisterInputs,
  };
}
