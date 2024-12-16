/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { useService } from "./serviceHooks";
import { MRT_ColumnFiltersState, MRT_SortingState } from "material-react-table";

export function useTablePagination<T>(
  setAllLoadedData: React.Dispatch<React.SetStateAction<T[]>>,
  endpointPath: string,
  _query?: any
) {
  const { getData, query } = useService<any>(endpointPath);

  const origRows = useRef(-1);

  const [rows, setRows] = useState(1);
  const [pageCount, setPageCount] = useState(-1);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    [],
  );
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  const [isFetching, setIsFetching] = useState(false);
  
  useEffect(() => {
    initRows();
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      //#region COLUMN FILTERING
      if (columnFilters.length > 0) {
        origRows.current === -1 ? origRows.current = rows : undefined;

        const newData = await getData(query({
          filters: JSON.stringify(columnFilters),
          page: pagination.pageIndex,
          pageSize: pagination.pageSize,
          ...(_query && {..._query})
        }))

        setAllLoadedData(newData.data.items);
        setRows(newData.data.rows * pagination.pageSize);
        setPageCount(newData.data.rows);
        setIsFetching(false);
        return;
      }
      //#endregion

      //#region SORTING
      if (sorting.length > 0) {
        const newData = await getData(query({
          sort: JSON.stringify(sorting),
          page: pagination.pageIndex,
          pageSize: pagination.pageSize,
          ...(_query && {..._query})
        }));
        
        setAllLoadedData(newData.data.items);
        setRows(newData.data.rows * pagination.pageSize);
        setPageCount(newData.data.rows);
        setIsFetching(false);
        return;
      }
      //#endregion

      //#region DEFAULT FETCHING
      if (origRows.current !== -1) {
        setRows(origRows.current);
        origRows.current = -1;
      }

      const newData = await getData(query({
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
        ...(_query && {..._query})
      }));

      setAllLoadedData(newData.data);
      await initRows();
      setIsFetching(false);
      //#endregion
    }

    const onsearch = async () => {
      if (search === "") {
        const newData = await getData(query({
          page: pagination.pageIndex,
          pageSize: pagination.pageSize
        }));
  
        setAllLoadedData(newData.data);
        await initRows();
        setIsFetching(false);
        return;
      }
      
      console.log("pahina");

      const newData = await getData(`/search/${search}${query(
        {
          page: pagination.pageIndex,
          pageSize: pagination.pageSize,
          ...(_query && {..._query})
        }
      )}`)
      
      setAllLoadedData(newData.data.items);
      setRows(newData.data.rows * pagination.pageSize);
      setPageCount(newData.data.rows);
      setIsFetching(false);
    }

    if (search) {
      onsearch();
      return;
    }

    fetchData();
  }, [
    columnFilters,
    search,
    sorting,
    pagination.pageIndex, 
    pagination.pageSize
  ]);

  const initRows = async () => {
    let queryConstruct = `?pageSize=${pagination.pageSize}&`;

    if (_query) {
      const keys = Object.keys(_query);
      for (const key of keys) {
        queryConstruct += `${key}=${_query[key as any]}&`
      }
    }

    const rows = await getData(`rows/${queryConstruct}`);
    
    setPageCount(rows.data);
    setRows(rows.data * pagination.pageSize);
  }

  return {
    pagination,
    columnFilters,
    sorting,
    rows,
    setPagination,
    setSearch,
    setColumnFilters,
    setSorting,
    initRows,
    isFetching,
    pageCount
  }  
}