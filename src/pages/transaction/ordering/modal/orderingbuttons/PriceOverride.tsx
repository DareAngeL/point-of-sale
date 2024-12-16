import {useState} from "react";
import {ButtonForm} from "../../../../../common/form/ButtonForm";
import {useOrderingButtons} from "../../hooks/orderingHooks";
import {InputNumber} from "../../../../../common/form/InputNumber";

export function PriceOverride() {
  const [price, setPrice] = useState(0);

  const {priceOverride} = useOrderingButtons();

  const onNumberInputChange = ({
    target: {value},
  }: React.ChangeEvent<HTMLInputElement>) => setPrice(parseFloat(value) < 1 ? 1 : parseFloat(value));

  return (
    <>
      <form
        id="priceoverride"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <InputNumber
          handleInputChange={onNumberInputChange}
          name={""}
          value={price}
          id={""}
          description={"Override Price"}
        />
      </form>

      <ButtonForm
        formName={"priceoverride"}
        okBtnTxt="Confirm"
        onOkBtnClick={() => {
          priceOverride(price);
        }}
      />
    </>
  );
}
