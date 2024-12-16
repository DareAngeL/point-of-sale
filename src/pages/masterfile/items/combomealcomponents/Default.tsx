/* eslint-disable @typescript-eslint/no-explicit-any */
import { LazySelect } from "../../../../common/form/LazySelect";
import { ItemModel } from "../../../../models/items";

interface DefaultProps {
  itemModalData: ItemModel | undefined;
  comboItemSelectedItemClass: any;
  comboItemSelectedItemSubclass: any;
  selectedItemCombos: any;
  setSelectedItemCombos: any;
  setSelectedDefault: any;
}

export function Default({
  itemModalData,
  comboItemSelectedItemClass,
  comboItemSelectedItemSubclass,
  selectedItemCombos,
  setSelectedItemCombos,
  setSelectedDefault,
}: DefaultProps) {


  return (
    <>
      <div className="py-3 " style={{width: "400px"}}>
        <LazySelect
          id="selectedItemDefault"
          mainURLPath="item/filter"
          description="Add Item"
          isMulti
          onChange={(e)=>{
            setSelectedItemCombos([...e]);
            setSelectedDefault("");
          }}
          value={selectedItemCombos}
          optionsProps={{
            key: "itmdsc",
            value: "itmcde"
          }}
          queries={{
            itmclacde: comboItemSelectedItemClass && comboItemSelectedItemClass.value,
            itemsubclasscde: comboItemSelectedItemSubclass && comboItemSelectedItemSubclass.value,
            itmcde: `ne:${itemModalData?.itmcde}`
          }}
        />
      </div>
    </>
  )
}