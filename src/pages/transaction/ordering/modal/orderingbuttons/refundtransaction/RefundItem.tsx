import {useState} from "react";
import {ButtonForm} from "../../../../../../common/form/ButtonForm";
import {InputNumber} from "../../../../../../common/form/InputNumber";

interface RefundItemProps {
  quantity: number;
}

export function RefundItem(props: RefundItemProps) {
  const [refItem, setRefItem] = useState<any>({});
  // const {refund} = useAppSelector((state) => state.order);

  const onSuccess = (e: React.FormEvent) => {
    e.preventDefault();
    // console.log("ey", refund);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value, name} = e.target;

    setRefItem((prev: any) => ({
      ...prev,
      [name]: parseInt(value) >= props.quantity ? props.quantity : value,
    }));

    console.log(refItem);
  };

  const onCancel = () => {
    console.log("cancel");
  };

  return (
    <>
      <div>
        <form id="cashform" onSubmit={onSuccess}>
          <InputNumber
            handleInputChange={onChange}
            name={"qtyToReturn"}
            value={refItem.qtyToReturn}
            id={"qtyToReturn"}
            description={"Qty to return"}
          />

          <InputNumber
            handleInputChange={onChange}
            name={"invQty"}
            value={refItem.invQty}
            id={"invQty"}
            description={"Inventory Qty"}
          />
        </form>
      </div>

      <ButtonForm
        formName={"cashform"}
        okBtnTxt="Confirm"
        onCancelBtnClick={onCancel}
      />
    </>
  );
}
