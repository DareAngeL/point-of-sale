import { SystemParametersModel } from "../../models/systemparameters";
import { Checkbox } from "../../common/form/Checkbox";
import { Selection } from "../../common/form/Selection";
import { useEffect, useState } from "react";
import { MallHookupModel } from "../../models/mallhookupfile";
import { useAppDispatch } from "../../store/store";
import { getMallhookupList } from "../../store/actions/systemParameters.action";

interface SystemSettingsProps {
  data: SystemParametersModel;
  setData: (prev: any) => void;
  handleSelectChange: React.ChangeEventHandler<HTMLSelectElement> | undefined;
  handleInputChange: React.ChangeEventHandler<HTMLInputElement> | undefined;
}

export function MallHookUp(props: SystemSettingsProps) {

  const appDispatch = useAppDispatch();
  const [malls, setMalls] = useState<MallHookupModel[]>([]);
  const [activeMall, setActiveMall] = useState<string>("0");

  useEffect(() => {
    const load = async () => {
      const malls = await appDispatch(getMallhookupList());
      setMalls(malls.payload);
      setActiveMall(props.data.active_mall?.toString() || "0");
    }

    load();
  }, []);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setActiveMall(value);
    props.setData((prev: any) => ({
      ...prev,
      active_mall: Number(value)
    }));
  }

  return (
    <>
      <div className="shadow-xl w-[95%] m-auto mb-[1.3rem]  font-montserrat">
        <div className="pb-[10px]">
          <label className="block mb-2 text-black text-[1.2rem] font-montserrat font-extrabold">
            Mall Hookup
          </label>
        </div>

        <div className="mx-3 mb-5">
          <label className="block text-black text-[13px]" htmlFor="active_mall" >Active Mall Hookup</label>
          <Selection 
            handleSelectChange={handleSelectChange} 
            description={""} 
            id={"active_mall"} 
            name={"active_mall"} 
            keyValuePair={[
              {key: "None / No Mall Hook Up", value: "0"},
              ...malls.map((m) => ({key: m.mallname, value: m.recid?.toString()}))
            ]}
            value={activeMall}
          />
        </div>

        <div className="border-bottom border-[1px]" />
        <Checkbox
          description={"Nexbridge"}
          className="ms-5"
          name={"nexbridge"}
          id={"nexbridge"}
          value={props.data.nexbridge?.toString()}
          checked={props.data.nexbridge ? true : false}
          handleInputChange={props.handleInputChange}
        />
      </div>
    </>
  );
}
