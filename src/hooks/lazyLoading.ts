/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react"
import { useService } from "./serviceHooks";

export function useLazyLoading(url: string, _query?: object, _pageSize?: number) {

  const [data, setData] = useState<any[]|any>([]);
  const [fetching, setFetching] = useState(false);
  const [showInfoNoDataLeft, setShowInfoNoDataLeft] = useState(false);
  const { getData, query } = useService(url);

  const page = useRef(0);
  const pageSize = useRef(_pageSize || 10);

  useEffect(() => {
    const fetch = async () => {
      const _data = await initData(_query);
      
      setData(_data || []);
    }

    fetch();
  }, [])

  const reset = () => {
    page.current = 0;
    pageSize.current = _pageSize || 10;
    setData([]);
  }

  const initData = async (_query?: object) => {
    setFetching(true);

    let res;
    try {
      res = await getData(query({
        page: page.current,
        pageSize: pageSize.current,
        ...(_query && _query)
      })) as any;
    } catch (err) {
      console.error(err)
    }
    setFetching(false);

    return res && res.data ? res.data : undefined;
  }

  const nextData = async (_query?: object) => {
    page.current++;
    
    const _data = await initData(_query);

    if (_data && _data.length > 0) {
      setData((prev: any) => {
        return [...prev, ..._data];
      });
    } else {
      if (showInfoNoDataLeft) {
        setData((prev: any[]) => {
          // if the info already added then don't add the info
          const existingInfo = prev.find(f => f.label && f.value === 'info');
          if (existingInfo) return prev;
          // else add the info that the user already reached the end of the data
          return [...prev, {
            label: "----- No more data to load. -----",
            value: "info"
          }];
        });
      }

      page.current--;
    }
  }

  return {
    data,
    fetching,
    initData,
    nextData,
    setData,
    reset,
    query,
    getData,
    setShowInfoNoDataLeft,
  }
}