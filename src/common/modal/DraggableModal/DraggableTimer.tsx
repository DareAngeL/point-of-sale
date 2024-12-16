import { useEffect, useState } from "react";
import { DraggableModal } from "./DraggableModal";
import { useWebSocketContext } from "../../../WebSocketContext";


export const DraggableTimer = () => {

    const [open, setOpen] = useState(false);
    const {lastJsonMessage} = useWebSocketContext();
    const [count, setCount] = useState("00:00");

    useEffect(() => {

        if(lastJsonMessage?.operationCountdownDialog){
            console.log(lastJsonMessage, "gege");
            setOpen(true)
        }

        if(lastJsonMessage?.operationCountdownDialog == false){
            setOpen(false);
        }

        if(lastJsonMessage?.operationCountdown){
            setCount(`${lastJsonMessage.operationCountdown}`)
        }
    },[lastJsonMessage]);
    
    return (
        <DraggableModal isOpen={open}>
            <div className="font-bold flex justify-center items-center">
                Time remaining before end time
            </div>
            <div className=" text-red-500 font-semibold flex justify-center items-center">
                {count}
            </div>
        </DraggableModal>
    );
}