
interface PaymentButtonsProps {
  buttonName: string;
  onClick?: () => void;
  width?: string;
  className?: string;
  disabled?: boolean;
}

export function PaymentButtons(props: PaymentButtonsProps) {
  const style = `group p-4 border border-green-700 rounded-lg h-[40px] flex justify-center items-center cursor-pointer hover:bg-green-700 hover:text-white select-none w-[${
    props.width || 0
  }] ${props.className && props.className}`;

  return (
    <>
      <div
        className={style}
        onClick={props.onClick}
        style={{
          pointerEvents: props.disabled ? "none" : "auto",
          opacity: props.disabled ? 0.5 : 1, // Adjust the opacity as needed
        }}
      >
        <p className="text-green-700 font-montserrat font-extrabold text-center group-hover:text-white text-[0.8rem]">
          {props.buttonName}
        </p>
      </div>
    </>
  );
}
