import {useLoaderData, useNavigate} from "react-router";
import {useState} from "react";
import {ApiService} from "../services";
import {toast} from "react-toastify";
import {useModal, usePage} from "./modalHooks";

interface Data {
  data: any;
}

// Always get the first data in the loader api.

export function useLoadedData<T>(){ 

  const data = useLoaderData() as Data;
  const allLoadedData = data.data as T[];

  const [loadedData, setLoadedData] = useState<T>(allLoadedData[0]);

  return {loadedData, setLoadedData};

}

// ------------------------------------------------------------------

// Always get all data in the loader api.

export function useAllLoadedData<T>(){
  
  const data = useLoaderData() as Data;
  const allLoadedDatas = data?.data as T[];

  const [allLoadedData, setAllLoadedData] = useState<T[]>(allLoadedDatas || {});

  return {allLoadedData, setAllLoadedData};
}


// ------------------------------------------------------------------

export function useSubmitData<T>(
  resource: string,
  navigateTo?: string,
  isRedirect?: boolean | true,
  autoCloseModal?: boolean | true
) {
  const {modal, dispatch} = useModal();
  const {pageDispatch: dispatchPage} = usePage();
  const Navigate = useNavigate();

  const putRequestData = async (
    data: T,
    callback: (data: any) => void,
    showToast?: boolean
  ) => {
    const promise = ApiService.put(resource, data);

    toast.promise(
      promise,
      {
        ...(showToast !== undefined && showToast
          ? {
              success: {
                hideProgressBar: true,
                autoClose: 1500,
                position: 'top-center',
                render: "Successfully updated!",
              },
            }
          : showToast === undefined && {
              pending: "Pending request",
              success: {
                hideProgressBar: true,
                autoClose: 1500,
                position: 'top-center',
                render: "Successfully updated!",
              },
            }),
      },
      {
        toastId: "requestData",
        position: 'top-center',
      }
    );

    const promiseResult = await promise;
    const promiseData = promiseResult.data as T;

    callback(promiseData as T);
    if (autoCloseModal !== undefined) {
      autoCloseModal && modal ? dispatch() : dispatchPage(false);
    } else {
      modal ? dispatch() : dispatchPage(false);
    }

    isRedirect && Navigate(navigateTo || "/pages/masterfile");
  };

  const postRequestData = async (data: T) => {
    const promise = ApiService.post(resource, data);

    toast.promise(
      promise,
      {
        pending: "Pending request",
        success: {
          hideProgressBar: true,
          autoClose: 1500,
          position: 'top-center',
          render: "Successfully updated!",
        },
      },
      {
        toastId: "postRequestData",
      }
    );

    const promiseResult = await promise;
    promiseResult.data as T;

    modal ? dispatch() : dispatchPage(false);

    isRedirect && Navigate(navigateTo || "/pages/masterfile");
  };

  return {putRequestData, postRequestData};
}

export function useService<T>(resource: string) {
  const query = (obj: {[key: string]: any}) =>
    `?${Object.keys(obj)
      .map((key) => key + "=" + obj[key])
      .join("&")}`;

  const getData = async (
    url: string,
    cb?: (data: T | null, error: Error | null) => void
  ) => {
    let promise = null;

    try {
      promise = (await ApiService.get(`${resource}/${url}`)) as T;
      cb && cb(promise, null);
    } catch (err) {
      const error = new Error(err as string);
      cb && cb(null, error);
    }

    return promise;
  };

  const postData = async (
    url: string,
    data: T,
    cb?: (data: T | null, error: Error | null, status?: number) => void
  ) => {
    let promise = null;

    try {
      promise = (await ApiService.post(`${resource}/${url}`, data)) as T;
      cb && cb(promise, null);
    } catch (err: any) {
      const error = new Error(err as string);
      cb && cb(null, error, err.response.status);
    }
  };

  const postBulkData = async (
    url: string,
    data: T[],
    cb?: (data: T[] | null, error: Error | null) => void
  ) => {
    let promise = null;

    try {
      promise = (await ApiService.post(`${resource}/${url}`, data)) as any;
      const promisedData = promise.data as T[];
      cb && cb(promisedData, null);
    } catch (err) {
      const error = new Error(err as string);
      cb && cb(null, error);
    }
  };

  const putData = async (
    url: string,
    data: T,
    cb?: (data: T | null, error: Error | null, status?: number) => void,
    headers?: any
  ) => {
    let promise = null;
    try {
      promise = (await ApiService.put(
        `${resource}/${url}`,
        data,
        headers
      )) as any;
      const promisedData = promise.data as T;
      cb && cb(promisedData, null);
    } catch (err: any) {
      const errHolder = err as any;
      const error = new Error(errHolder.response.data.Error as string);
      cb && cb(null, error, err.response.status);
    }
  };

  const deleteData = async (
    url: string,
    cb?: (data: T | null, error: Error | null) => void
  ) => {
    let promise = null;
    try {
      promise = (await ApiService.delete(`${resource}/${url}`)) as any;
      const promisedData = promise.data as T;
      cb && cb(promisedData, null);
    } catch (err) {
      const error = new Error(err as string);
      cb && cb(null, error);
    }

    return await promise;
  };

  return {getData, postData, putData, deleteData, postBulkData, query};
}
