import {ArrowUpOutlined, ArrowDownOutlined} from "@ant-design/icons";
import {setDenom, setOneDenom} from "../../../../../reducer/transactionSlice";
import {useDispatch} from "react-redux";
import {useEffect, useState} from "react";
interface Props {
  value: string;
  quantity: number;
}

function CashDeclarationNumberButton({value, quantity}: Props) {
  const dispatch = useDispatch();
  const [denomQuantity, setDenomQuantity] = useState<number>(quantity);

  useEffect(() => {
    if (denomQuantity > 0) {
      dispatch(setOneDenom({denomQuantity, denomValue: value}));
    } else {
      dispatch(setOneDenom({denomQuantity: 0, denomValue: value}));
    }
  }, [denomQuantity]);

  return (
    <button type="button" className="btn-declaration">
      <p className="text-gray-500">{value}</p>
      <div className="text-black-1000 controls">
        <input
          onChange={(e) => {
            if (quantity === 0) {
              setDenomQuantity(parseInt(e.target.value.replaceAll("0", "")));
              return;
            }
            
            setDenomQuantity(parseInt(e.target.value));
          }}
          className="w-10 h-10 text-right border-none outline-none"
          type="text"
          value={quantity}
        />

        <div className="arrow-container">
          <ArrowUpOutlined
            className="arrow-up"
            onClick={() => dispatch(setDenom({name: value, isAdd: true}))}
          />
          <ArrowDownOutlined
            className="arrow-down"
            onClick={() => dispatch(setDenom({name: value, isAdd: false}))}
          />
        </div>
      </div>
    </button>
  );
}

export default CashDeclarationNumberButton;
