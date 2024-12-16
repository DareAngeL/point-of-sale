import React, { createContext, useContext } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

type WebSocketContextType = {
    sendJsonMessage: (json: any) => void;
    lastJsonMessage: any | null;
    readyState: ReadyState
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
    children: React.ReactNode
}

export const WebsocketProvider: React.FC<WebSocketProviderProps> = ({children}) => {

    const {sendJsonMessage, lastJsonMessage, readyState} = useWebSocket("ws://localhost:8080")

    return (
        <WebSocketContext.Provider value={{sendJsonMessage, lastJsonMessage, readyState}}>

            {children}

        </WebSocketContext.Provider>
    )

}

export const useWebSocketContext = (): WebSocketContextType => {

    const context = useContext(WebSocketContext);

    if(context === undefined){
        throw new Error('useWebSocket mus be used within a WebSocketProvider');
    }
    return context;

}