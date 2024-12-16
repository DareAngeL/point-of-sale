/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useEffect, useRef } from 'react';
import { IMessageEvent, w3cwebsocket as W3CWebSocket } from 'websocket';

export function useWebSocket() {
  const wsClient = useRef<null|W3CWebSocket>(null);

  useEffect(()=>{
    wsClient.current = new W3CWebSocket('ws://localhost:8080/');
    wsClient.current.onclose = () => {
      console.log("SOCKET CONNECTION CLOSED!");
    };

    listen.onopen();
    listen.onerror();

    return () => {
      wsClient.current?.close();
    }
  }, [])

  // always put this to useEffect(()=>{}, [])
  const listen = {

    onopen: (onOpen?:()=>void) => {
      const client = wsClient.current;
      if (!client) console.error("Err: Socket is null");

      client!.onopen = () => {
        console.log('WebSocket Client Connected');
        onOpen && onOpen();
      };
    },

    onmessage: (onMessage: (msg:IMessageEvent)=>void) => {
      const client = wsClient.current;
      if (!client) console.error("Err: Socket is null");

      client!.onmessage = (message) => {
        onMessage(message);
      };
    },

    onerror: (onErr?: (err:Error)=>void) => {
      const client = wsClient.current;
      if (!client) console.error("Err: Socket is null");

      client!.onerror = (error) => {
        console.error(error);
        onErr && onErr(error);
      };
    }
  };

  const sendMsg = (msg: string) => {
    if (wsClient.current && wsClient.current.readyState === wsClient.current?.OPEN) {
      wsClient.current?.send(msg);
      console.log("SEEENDDD");
      
    }
  }

  return {
    listen,
    sendMsg
  }
}