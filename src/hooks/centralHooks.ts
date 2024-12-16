/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
// import { useService } from "./reportHooks";
import { centralMasterfilesObj } from "../data/centraldata";
import { useAppDispatch } from "../store/store";
import { getCentralBranches, getCentralConnection, getCentralMasterfileLogs, getCentralTenant, getPOSMasterfilelog, saveBranches } from "../store/actions/central.action";
import { getSysPar } from "../store/actions/systemParameters.action";
import { SystemParametersModel } from "../models/systemparameters";
import { HeaderfileModel } from "../models/headerfile";
import { getHeader } from "../store/actions/printout.action";
import { setWarehouse } from "../reducer/centralSlice";

export function useCentral() {
  const isCentralConnected = useRef<boolean>(
    Number(localStorage.getItem("withtracc")) === 1 ? true : false
  );
  const [hasConnectionToRemoteCentral, setHasConnectionToRemoteCentral] = useState<boolean>(false);
  const [hasUpdate, setHasUpdate] = useState<boolean>(false);
  const [UnSyncMasterfiles, setUnSyncMasterfiles] = useState<string[]>([]);
  const [content, setContent] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const syspar = useRef<SystemParametersModel>();
  const header = useRef<HeaderfileModel>();
  const appDispatch = useAppDispatch();

  const testCentralRemoteConnection = async () => {
    if (!isCentralConnected.current) return false;
    
    try {
      syspar.current = (await appDispatch(getSysPar())).payload[0];
      header.current = (await appDispatch(getHeader())).payload[0];
      const serverprotocol = syspar.current?.serverprotocol;
      const serveripaddress = syspar.current?.serveripaddress;
      const serverport = syspar.current?.serverport;

      const result = await appDispatch(getCentralConnection({
        url: `${serverprotocol}://${serveripaddress}:${serverport}/api/getconnection`,
        opts: 
        {
          headers: {
            // Etong option pwede mo to lagyan ng token para hindi pwedeng ma access agad yung central server
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "X-Total-Count",
            // "Content-Length": Buffer.byteLength(
            //   JSON.stringify({ connect: "connect" })
            // ),
          },
          params: { data: JSON.stringify({ connect: "connect" }) },
        }
      }));

      if (result.payload) {
        return true;
      }

      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  const checkLinkInputsCentral = () => {
    // if central is connected, set all input elements to disabled
    if (isCentralConnected.current) {
      // get all input elements by class
      const inputElements = document.getElementsByClassName("link-central");
      const elems = Array.from(inputElements);

      elems.forEach((elem) => {
        elem.setAttribute("disabled", "true");
        // modify also the class name
        elem.classList.add(
          "bg-gray-200",
          "hover:cursor-not-allowed",
          "hover:bg-gray-200"
        );
      });
    }
  };

  /**
   * 
   * Checks the central if there's any update in the data of all connected masterfiles
   **/
  const checkMasterFile = async () => {
    try {
      if (Number(localStorage.getItem("withtracc")) === 1) {

        const { 
          result, 
          serveripaddress, 
          serverport, 
          serverprotocol, 
          options 
        } = await getCentralMasterfileLog();

        if (result.payload) {
          // get all branches from central server
          const branches = await appDispatch(getCentralBranches({
            url: `${serverprotocol}://${serveripaddress}:${serverport}/api/fetchserverbranch`,
            opts: {
              ...options,
              params: {data: JSON.stringify({connect: "connect"})}
            }
          }));

          const warehouses = await appDispatch(getCentralTenant({
            url: `${serverprotocol}://${serveripaddress}:${serverport}/api/fetchservertenant`,
            opts: {
              ...options,
              params: {data: JSON.stringify({connect: "connect"})}
            }
          }));

          console.log("Warehouses", warehouses);
          // save the branches

          console.log("Warehouse Payload",warehouses.payload);
          appDispatch(setWarehouse(warehouses.payload.war))
          await appDispatch(saveBranches(branches.payload.brn));
          await checkMasterFileLOG(result.payload);
        }
      }
    } catch (error: any) {
      if (error.code == "EPROTO") {
        // WRONG PROTOCOL (HTTP or HTTPS)
        toast.error(
          "Unable to connect to server due to <b>incorrect protocol</b>.",
          {
            hideProgressBar: true,
            position: 'top-center',
            autoClose: 1500,
          }
        );
      } else if (error.code == "ENETUNREACH") {
        // NO INTERNET
        toast.error(
          "Unable to connect to server due to <b>no internet connection</b>.",
          {
            hideProgressBar: true,
            position: 'top-center',
            autoClose: 1500,
          }
        );
      } else if (error.code == "ENOTFOUND") {
        // ERROR IN IP ADDRESS
        toast.error(
          "Unable to connect to server due to <b>incorrect ip address</b>.",
          {
            hideProgressBar: true,
            position: 'top-center',
            autoClose: 1500,
          }
        );
      } else if (error.code == "ERR_SOCKET_BAD_PORT") {
        // ERROR IN PORT
        toast.error(
          "Unable to connect to server due to <b>incorrect port</b>.",
          {
            hideProgressBar: true,
            position: 'top-center',
            autoClose: 1500,
          }
        );
      } else if (error.code == "ECONNREFUSED") {
        toast.error("Connection is being refuse by the server.", {
          hideProgressBar: true,
          position: 'top-center',
          autoClose: 1500,
        });
      } else if (error.code == "ETIMEDOUT") {
        toast.error("Connection timeout.", {
          hideProgressBar: true,
          position: 'top-center',
          autoClose: 1500,
        });
      } else if (error.code === "ERR_BAD_REQUEST") {
        toast.error("Unsupported protocol.", {
          hideProgressBar: true,
          position: 'top-center',
          autoClose: 1500,
        });
      } else {
        console.log(error);
        toast.error("Something went wrong.", {
          hideProgressBar: true,
          position: 'top-center',
          autoClose: 1500,
        });
      }
    }
  };

  const getCentralMasterfileLog = async () => {
    const serverprotocol = syspar.current?.serverprotocol;
    const serveripaddress = syspar.current?.serveripaddress;
    const serverport = syspar.current?.serverport;

    const options = {
      headers: {
        // Etong option pwede mo to lagyan ng token para hindi pwedeng ma access agad yung central server
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "X-Total-Count",
        // "Content-Length": Buffer.byteLength(
        //   JSON.stringify({ connect: "connect" })
        // ),
      },
    }

    const result = await appDispatch(getCentralMasterfileLogs({
      url: `${serverprotocol}://${serveripaddress}:${serverport}/api/getmasterfilelog`,
      opts: {
        ...options,
        params: {data: JSON.stringify({ connect: "connect" })}
      } 
    }));

    return { 
      result, 
      serverprotocol, 
      serveripaddress, 
      serverport, 
      options 
    } 
  }

  const checkMasterFileLOG = async (result: any) => {
    const response = result;
    const arrMasterFileValue = [];
    const masterfilelog = await appDispatch(getPOSMasterfilelog());
    const masterFiles = centralMasterfilesObj as any;

    for (const masterfile of Object.keys(masterFiles)) {
      const posLog = masterfilelog.payload.filter(
        (e: any) => e.tablename === masterfile
      );
      let traccLog = response.poslog.filter(
        (e: any) => e.tablename === masterfile
      ).sort((a: any, b: any) => b.recid - a.recid);
      
      const centralBranch = header.current?.brhcde;
      traccLog = masterfile === "pricelist" ? traccLog.filter((e: any) => e.brhcde === centralBranch) : traccLog;
      if (traccLog.length > 0) {
        if (posLog.length > 0) {
          if (
            parseFloat(traccLog[0]["filelog"]) >
            parseFloat(posLog[0]["filelog"])
          ) {
            arrMasterFileValue.push(masterfile);
          }
        } else {
          arrMasterFileValue.push(masterfile);
        }
      }
    }

    if (arrMasterFileValue.length > 0) {
      const content = [];
      for (const masterFileValue of arrMasterFileValue) {
        content.push(
          masterFiles[
            Object.keys(masterFiles).find(
              (key) => key === masterFileValue
            ) as any
          ]
        );
      }
      setHasUpdate(true);
      setUnSyncMasterfiles(arrMasterFileValue);
      setContent(content);
    } else {
      setHasUpdate(false);
    }
  }

  useEffect(() => {
    const getAPI = async () => {
      setIsChecking(true);
      const hasConnection = await testCentralRemoteConnection()
      setHasConnectionToRemoteCentral(hasConnection);

      if (hasConnection) {
        await checkMasterFile();
      }

      setIsChecking(false);
    };
    getAPI();
  }, []);

  return {
    isCentralConnected,
    hasConnectionToRemoteCentral,
    checkLinkInputsCentral,
    checkMasterFileLOG,
    getCentralMasterfileLog,
    isChecking,
    hasUpdate,
    UnSyncMasterfiles,
    content,
    checkMasterFile,
  };
}
