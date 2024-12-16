import { DeleteFilled } from "@ant-design/icons";

interface PaymentTypeCardProps {
    paymentType : string;
    onClick : () => void;
}

export default function PaymentTypeCard(props: PaymentTypeCardProps) {

    const { paymentType, onClick } = props;

    return (
        <>
            <div className="flex flex-row justify-between mt-3 text-black h-[50px] shadow" onClick={onClick}>
                <h4 className="px-2 my-auto">{paymentType}</h4>
                <DeleteFilled className="my-auto text-[1.5rem] text-red-400 mr-5"/>
            </div>
        </>
    )
}