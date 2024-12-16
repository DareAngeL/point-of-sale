import { useAppSelector } from "../../../../../store/store";

interface OrderingButtonsProps {
  description: string;
  onClick: () => void;
  color?: string;
}

export function OrderingButtons(props: OrderingButtonsProps) {

  const { isTransactionProcessing, hasTransaction } = useAppSelector(state => state.order);

  const disabled = props.description === 'Other Transaction' ? false 
    : 
    isTransactionProcessing || (
      (props.description === 'Reprint Transaction' ||
      props.description === 'Reprint Void' ||
      props.description === 'Reprint Refund' ||
      props.description === 'Void Transaction' ||
      props.description === 'Refund Transaction')
      ? hasTransaction :  !hasTransaction
    );

  switch (props.color) {
    case "danger":
      return (
        <button 
          onClick={props.onClick}
          className={`${disabled ? 'border-gray-700 bg-gray-500' : 'border-red-700 bg-red-500 hover:bg-red-300 hover:text-red'} transition-all duration-300 ease-in-out  group border rounded-lg h-full w-[82px] flex justify-center items-center select-none`}
          disabled={isTransactionProcessing||!hasTransaction}
        >
          <div className={`${disabled ? 'bg-gray-100 ' : 'bg-red-100 group-hover:bg-red-700'} flex items-center rounded-lg w-[95%] ms-auto h-[97%] font-black mb-auto`}>
            <p className={`${disabled ? 'text-gray-700' : 'text-red-700 group-hover:text-white'} text-center text-[0.9rem] font-bold`}>
              {props.description}
            </p>
          </div>
        </button>
      );
    case "orange":
      return (
        <button 
          onClick={props.onClick}
          className={`${disabled ? 'border-gray-600 bg-gray-600' : 'border-orange-600 bg-orange-600 hover:bg-orange-300 hover:text-white'} transition-all duration-300 ease-in-out  group border rounded-lg h-full w-[82px] flex justify-center items-center select-none`}
          disabled={disabled}
        >
          <div className={`${disabled ? 'bg-gray-100' : 'bg-orange-100 group-hover:bg-orange-600'} flex justify-center items-center rounded-lg w-[95%] ms-auto h-[97%] mb-auto font-black`}>
            <p className={`${disabled ? 'text-gray-700' : 'text-orange-700 group-hover:text-white'} text-center text-[0.9rem] font-bold`}>
              {props.description}
            </p>
          </div>
        </button>
      );
    default:
      return (
        <button 
          onClick={props.onClick}
          className={`${disabled ? 'border-gray-700 bg-gray-700' : 'border-green-700 bg-green-700 hover:bg-green-300'} transition-all duration-300 ease-in-out  group border rounded-lg h-full w-[82px] flex justify-center items-center select-none`}
          disabled={disabled}
        >
          <div className={`${disabled ? 'bg-gray-100' : 'bg-green-100 group-hover:bg-green-700'} flex justify-center items-center rounded-lg w-[95%] ms-auto h-[97%] mb-auto`}>
            <p className={`${disabled ? 'text-gray-700' : 'text-green-700 group-hover:text-white'}  text-center text-[0.9rem] font-bold`}>
              {props.description}
            </p>
          </div>
        </button>
      );
  }
}
