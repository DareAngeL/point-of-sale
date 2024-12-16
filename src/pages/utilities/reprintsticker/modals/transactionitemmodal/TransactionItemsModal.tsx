import { useState } from "react";
import { Checkbox } from "../../../../../common/form/Checkbox";
import { CustomModal } from "../../../../../common/modal/CustomModal";
import { PosfileModel } from "../../../../../models/posfile"
import { ButtonForm } from "../../../../../common/form/ButtonForm";
import { useReprintStickerHook } from "./hooks/reprintStickerHook";
import { Empty } from "antd";

interface TransactionItemsModalProps {
  items: PosfileModel[];
  ordocnum: string;
  open: boolean;
  onClose: () => void;
}

export function ReprintStickerItemsModal(props: TransactionItemsModalProps) {

  const [checkItems, setCheckItems] = useState<string[]>([]);

  const { processStickerPrinting } = useReprintStickerHook();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, checked} = e.target;
    if (checked) {
      setCheckItems([...checkItems, name]);
    } else {
      setCheckItems(checkItems.filter((item) => item !== name));
    }
  }

  if (!props.open) return null;

  return (
    <>
      <CustomModal modalName={props.ordocnum} maxHeight={""} height={200} onExitClick={props.onClose} isShowXBtn>
        <div className="flex flex-col w-full">
          {props.items.length === 0 && (
            <Empty
              className="mt-5"
              description="Empty List"
            />
          )}

          {props.items.length > 0 && (
            <>
              <label className="text-[18px]">List of Items:</label>
              {props.items.filter(d => d.isaddon === 0 && !d.itmcomtyp).map((item, index) => (
                <Checkbox
                  key={index}
                  checked={checkItems.includes(item.orderitmid || '')} 
                  id={item.orderitmid || ''} 
                  name={item.orderitmid || ''} 
                  description={item.itmdsc || ''}
                  handleInputChange={handleInputChange}
                />
              ))}
            </>
          )}

          <ButtonForm 
            formName={""}
            okBtnTxt="Reprint Sticker"
            onOkBtnClick={() => processStickerPrinting(props.items, checkItems)}
            overrideOnCancelClick={() => {
              setCheckItems([]);
              props.onClose();
            }}
          />
        </div>
      </CustomModal>
    </>
  )
}