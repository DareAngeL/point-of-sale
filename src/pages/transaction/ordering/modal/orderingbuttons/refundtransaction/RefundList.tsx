import { PaymentButtons } from "../../../common/buttons/PaymentButtons";
import { RefundTable } from "./RefundTable";

export function RefundList(){

    
    return (
        <>
            <PaymentButtons buttonName={"Refund all items"} />
            <RefundTable />
        </>
    )
}