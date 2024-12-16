/* eslint-disable @typescript-eslint/no-explicit-any */
import Select from "react-select";
import { LazySelect } from "../../../../common/form/LazySelect";
import { InputNumber } from "../../../../common/form/InputNumber";
import { DeleteFilled } from "@ant-design/icons";
import { ItemModel } from "../../../../models/items";

interface UpgradeProps {
  selectedItemCombos: any[];
  setSelectedDefault: React.Dispatch<any>;
  comboItemSelectedItemClass: any;
  comboItemSelectedItemSubclass: any;
  itemModalData: ItemModel | undefined;
  upgradeList: any[];
  setUpgradeList: React.Dispatch<React.SetStateAction<any[]>>;
  selectedDefault: any;
  handleAddUpgrade: any;
  handleRemoveUpgrade: any;
  selectedUpgrade: any;
  setSelectedUpgrade: React.Dispatch<any>;
  upgradePrice: number | undefined;
  setUpgradePrice: React.Dispatch<any>;
}

export function Upgrade({
  selectedDefault,
  selectedItemCombos,
  setSelectedDefault,
  comboItemSelectedItemClass,
  comboItemSelectedItemSubclass,
  itemModalData,
  upgradeList,
  handleAddUpgrade,
  handleRemoveUpgrade,
  selectedUpgrade,
  setSelectedUpgrade,
  upgradePrice,
  setUpgradePrice,
}: UpgradeProps) {
  
  return (
    <>
      <div className="py-3">
        <label
          htmlFor={"selectedFromDefault"}
          className="block mb-2 text-xs text-black font-montserrat"
        >
          {"From Default"}
        </label>
        <Select
          isMulti={false}
          id={"selectedFromDefault"}
          name={"selectedFromDefault"}
          options={selectedItemCombos.map((e) => {
            return {
              label: e.label,
              value: e.value,
            };
          })}
          onChange={(e) => {
            console.log(e);
            setSelectedDefault(e);
          }}
          value={selectedDefault}
          className="basic-multi-select"
          classNamePrefix="select"
        />
      </div>

      <div className="py-3">
        <LazySelect
          isMulti={false}
          mainURLPath="item/filter"
          description="Upgrade To"
          id={"selectedUpgradeTo"}
          name={"selectedUpgradeTo"}
          filterData={{
            key: "itmcde",
            value: selectedDefault && selectedDefault.value
          }}
          onChange={(e) => {
            console.log("asd:", e);
            
            setSelectedUpgrade(e);
          }}
          value={selectedUpgrade}
          optionsProps={{
            key: "itmdsc",
            value: "itmcde",
          }}
          queries={{
            itmclacde: comboItemSelectedItemClass && comboItemSelectedItemClass.value,
            itemsubclasscde: comboItemSelectedItemSubclass && comboItemSelectedItemSubclass.value,
            itmcde: `ne:${itemModalData?.itmcde}`
          }}
        />
      </div>

      <InputNumber
        handleInputChange={(e) => {
          console.log(e.target.value);
          setUpgradePrice(parseFloat(e.target.value));
        }}
        id="upUpgprc"
        name="upUpgprc"
        description="Price"
        value={upgradePrice}
      />
      <div className="flex justify-end">
        <button
          className="bg-green-500 py-1 px-3 text-white transition-all duration-300 hover:bg-white hover:border-green-500 hover:text-green-500 border border-green-500 rounded "
          type="button"
          onClick={handleAddUpgrade}
        >
          Add
        </button>
      </div>

      {upgradeList.length > 0 && (
        <>
          <h3>Upgrade Items</h3>
          <div className="flex p-2 flex-col border border-gray-300 shadow-md rounded-md mt-[10px]">
            {upgradeList.map((item, index) => {
              const {upgprc, label} = item;
              return (
                <div
                  className="flex p-2 border border-black-300 items-center justify-between"
                  key={index}
                >
                  <p>{`${label} - ${upgprc}`}</p>
                  <DeleteFilled
                    onClick={() => {
                      console.log(label);
                      handleRemoveUpgrade(index);
                    }}
                    className="text-red-300 text-xl cursor-pointer hover:text-red-500 hover:opacity-[1] transition-linear"
                  />
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  )
}