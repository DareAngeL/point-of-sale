import { ChangeEvent, useEffect, useState } from "react";
import { SystemParametersModel } from "../../models/systemparameters";

interface SystemSettingsProps {
  data: SystemParametersModel;
  setData: (prev: any) => void;
  handleInputChange: React.ChangeEventHandler<HTMLInputElement> | undefined;
  isModified: () => void;
  showRequired: boolean;
}

export default function PrinterStationTagging(props: SystemSettingsProps) {

  const [enable, setEnable] = useState<number>(-1);

  useEffect(() => {
    if (!props.data.prntr_stn_tag_modified && enable !== -1) {
      console.log("modified");
      
      props.isModified();
    }
  }, [props.data.allow_printerstation, enable]);

  const handleOnEnableDisable = (e: ChangeEvent<HTMLInputElement>) => (enable: number) => {
    setEnable(enable);
    props.handleInputChange && props.handleInputChange(e);
  }

  return (
    <>
      <div className={`font-montserrat shadow-xl ${props.showRequired && 'shadow-red-500/50 bg-red-100'} ${props.data.prntr_stn_tag_modified && "bg-gray-200"} w-[95%] m-auto mb-[1.3rem] pb-3`}>
        <div className="pb-[10px]">
          <span className="text-red-600 font-bold text-[12px]">* Required</span>
          <label className="block mb-2 text-black text-[1.2rem] font-montserrat font-extrabold">
            Printer Station Setup
          </label>
        </div>

        <div
          className={`${props.data.prntr_stn_tag_modified && "bg-gray-200"}`}
        >
          <p
            className={`mx-3 font-bold text-[12px] p-1`}
          >
            <span className="text-red-600">Note:</span> This is a one time setup
            only.
          </p>

          <fieldset className="flex flex-col ps-2 justify-center ms-3 border-2 max-w-[300px]">
            <legend className="text-[.9rem]">Multiple Printer Station?</legend>
            <div className="mb-2 text-sm">
              <input
                className="w-[30px] h-[15px]"
                type="radio"
                name="enable_pstation"
                id="yes"
                checked={
                  enable === 1 ||
                  (props.data.allow_printerstation === 1 &&
                  props.data.prntr_stn_tag_modified)
                }
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleOnEnableDisable(e)(1)}
                disabled={props.data.prntr_stn_tag_modified}
              />
              <label htmlFor="yes">Yes</label>
            </div>

            <div className="text-sm">
              <input
                className="w-[30px] h-[15px]"
                type="radio"
                name="enable_pstation"
                id="no"
                checked={
                  enable === 0 ||
                  (props.data.allow_printerstation === 0 &&
                  props.data.prntr_stn_tag_modified)
                }
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleOnEnableDisable(e)(0)}
                disabled={props.data.prntr_stn_tag_modified}
              />
              <label htmlFor="no">No</label>
            </div>
          </fieldset>

          {props.data.allow_printerstation === 1 ? (
            <div className="mt-2 ms-3">
              <label className="ms-3 text-[.9rem]">Choose where to tag the printer station:</label>
              <div className="grid grid-rows-1 grid-flow-col">
                <div className="flex items-center text-sm p-[7px]">
                  <input
                    className="w-[30px] h-[15px]"
                    type="radio"
                    name="pttagging"
                    id="itemclass_printer_station_tag"
                    checked={props.data.itemclass_printer_station_tag}
                    onChange={props.handleInputChange}
                    disabled={props.data.prntr_stn_tag_modified}
                  />
                  <label htmlFor="itemclass_printer_station_tag">
                    Item Classification
                  </label>
                </div>

                <div className="flex items-center text-sm p-[7px]">
                  <input
                    className="w-[30px] h-[15px]"
                    type="radio"
                    name="pttagging"
                    id="itemsubclass_printer_station_tag"
                    checked={props.data.itemsubclass_printer_station_tag}
                    onChange={props.handleInputChange}
                    disabled={props.data.prntr_stn_tag_modified}
                  />
                  <label htmlFor="itemsubclass_printer_station_tag">
                    Item Subclassification
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
}
