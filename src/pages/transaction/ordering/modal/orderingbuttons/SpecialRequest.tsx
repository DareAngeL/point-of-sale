import React, {useEffect, useState} from "react";
import {ButtonForm} from "../../../../../common/form/ButtonForm";
import {Checkbox} from "../../../../../common/form/Checkbox";
import {InputText} from "../../../../../common/form/InputText";
import {useAppDispatch, useAppSelector} from "../../../../../store/store";
import {useOrderingButtons} from "../../hooks/orderingHooks";
import {toggle} from "../../../../../reducer/modalSlice";
import {useUserActivityLog} from "../../../../../hooks/useractivitylogHooks";
import {METHODS, MODULES} from "../../../../../enums/activitylogs";
import { toast } from "react-toastify";

export function SpecialRequest() {
  const {specialRequest} = useOrderingButtons();
  const {postActivity} = useUserActivityLog();

  const {selectedOrder, transaction} = useAppSelector((state) => state.order);
  const specialRequestSelector = useAppSelector(
    (state) => state.masterfile.specialrequest
  );

  const [specialRequestState, setSpecialRequestState] = useState<{
    [key: string]: any;
  }>({});
  const [uniqueKey, setUniqueKey] = useState("");

  const dispatch = useAppDispatch();

  useEffect(() => {
    setUniqueKey(crypto.randomUUID());
  }, []);

  const handleCheckboxChange = ({
    target: {checked, name},
  }: React.ChangeEvent<HTMLInputElement>) => {
    if (checked) {
      const selectedSr = specialRequestSelector.data.find(
        (sr) => sr.recid == parseInt(name)
      );

      setSpecialRequestState((prev) => ({
        ...prev,
        [name]: {
          modcde: selectedSr?.modcde,
          ordercde: transaction.data?.ordercde,
          orderitmid: selectedOrder.data.orderitmid,
        },
      }));
    } else {
      const updatedSrState = {...specialRequestState};
      delete updatedSrState[name];

      setSpecialRequestState(updatedSrState);
    }
  };

  const handleTextChange = ({
    target: {value},
  }: React.ChangeEvent<HTMLInputElement>) => {


    if (value.length === 0) {
      setSpecialRequestState((prev) => {
        const { [uniqueKey]: _, ...rest } = prev;
        return rest;
      });
    }
    else{

      setSpecialRequestState((prev) => ({
        ...prev,
        [uniqueKey]: {
          modcde: value,
          ordercde: transaction.data?.ordercde,
          orderitmid: selectedOrder.data.orderitmid,
        },
      }));

    }
  };

  return (
    <>
      <form
        id="specialRequest"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        {/* {specialRequestSelector.data.map(sr => sr.modifiergroupfiles.find((d : any) => d.modgrpcde == selectedOrder.data.itemsubclasscde) != undefined ? (
                <>
                    <Checkbox checked={undefined} id={sr.recid + ""} handleInputChange={handleCheckboxChange} name={sr.recid+""} value={sr.modcde} description={sr.modcde} alignment="flex-row justify-between" />
                </>
                ):(<></>))}  */}

        {specialRequestSelector.data.map((sr) => {
          const modifierGroupFiles = sr.modifiergroupfiles;
          if (
            Array.isArray(modifierGroupFiles) &&
            modifierGroupFiles.find(
              (d: any) => d.modgrpcde == selectedOrder.data.itemsubclasscde
            ) !== undefined
          ) {
            return (
              <Checkbox
                checked={undefined} // You might want to replace undefined with the actual checked value
                id={sr.recid + ""}
                handleInputChange={handleCheckboxChange}
                name={sr.recid + ""}
                value={sr.modcde}
                description={sr.modcde}
                alignment="flex-row justify-between"
              />
            );
          } else {
            return <></>;
          }
        })}

        <InputText
          handleInputChange={handleTextChange}
          name={""}
          id={"takeOut"}
          description={"Others"}
          value={specialRequestState[uniqueKey]?.modcde}
        />
      </form>
{/* 
      || (!specialRequestState[uniqueKey]?.modcde || (specialRequestState[uniqueKey]?.modcde.length==0)) */}

      <ButtonForm
        formName={"specialRequest"}
        onOkBtnClick={() => {
          console.log(Object.keys(specialRequestState), specialRequestState, "GEGEGEGEGEG");
          console.log(specialRequestState[uniqueKey]?.modcde, "AHAHAHAHAHA");
          if (Object.keys(specialRequestState).length === 0 ) {
            return toast.error("Please select or add a special request.", {
              autoClose: 2000,
              position: 'top-center',
              hideProgressBar: true
            });
          }

          setUniqueKey(crypto.randomUUID());
          specialRequest(specialRequestState);
          dispatch(toggle());
          postActivity({
            module: MODULES.ORDERING,
            method: METHODS.UPDATE,
            remarks: `ADDED SPECIAL ORDER [ITEM ID:${selectedOrder.data.orderitmid}]:\nSPECIAL REQUEST:${specialRequestState[uniqueKey]?.modcde}`,
          });
        }}
        okBtnTxt="Update"
      />
    </>
  );
}
