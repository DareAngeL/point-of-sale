/* eslint-disable @typescript-eslint/no-explicit-any */
import { LazySelect } from "../../../../common/form/LazySelect";
import { ItemModel } from "../../../../models/items";

interface OthersProps {
  selectedOthers: any[];
  setSelectedOthers: React.Dispatch<React.SetStateAction<any[]>>;
  comboItemSelectedItemClass: any;
  comboItemSelectedItemSubclass: any;
  itemModalData: ItemModel | undefined;
}

export function Others({
  selectedOthers,
  setSelectedOthers,
  comboItemSelectedItemClass,
  comboItemSelectedItemSubclass,
  itemModalData: singleData,
}: OthersProps) {


  return (
    <>
      <div className="py-3" style={{width: "400px"}}>
        <LazySelect
          mainURLPath="item/filter"
          isMulti={true}
          description="Add Item"
          onChange={(e)=>{
            setSelectedOthers([...e]);
          }}
          value={selectedOthers}
          optionsProps={{
            key: "itmdsc",
            value: "itmcde"
          }}
          queries={{
            itmclacde: comboItemSelectedItemClass && comboItemSelectedItemClass.value,
            itemsubclasscde: comboItemSelectedItemSubclass && comboItemSelectedItemSubclass.value,
            itmcde: `ne:${singleData?.itmcde}`
          }}
        />
      </div>
    </>
  )
}