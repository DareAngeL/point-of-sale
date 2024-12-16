import AsyncSelect from "react-select/async";
import { useLazyLoading } from "../../hooks/lazyLoading";
import { isArray } from "lodash";
import { formatNumberWithCommasAndDecimals } from "../../helper/NumberFormat";
import { useEffect } from "react";

interface LazySelectProps {
  mainURLPath: string;
  isMulti: boolean;
  description: string;
  optionsProps: {key:string;value:string}
  filterData?: {key:string;value:string};
  value: any[]|any|undefined;
  onChange: (e: any) => void;
  name?: string;
  id?: string;
  queries?: object;
}

export function LazySelect({
  mainURLPath,
  isMulti,
  optionsProps,
  description,
  filterData,
  value,
  name,
  id,
  queries,
  onChange
}: LazySelectProps) {

  const {
    data,
    nextData,
    initData,
    setData,
    reset,
    query,
    getData,
    setShowInfoNoDataLeft
  } = useLazyLoading(mainURLPath, queries);

  useEffect(() => {
    setShowInfoNoDataLeft(true);
  }, [])  

  return (
    <>
      <label
        htmlFor={id}
        className="block mb-2 text-xs text-black font-montserrat"
      >
        {description}
      </label>
      <AsyncSelect
        isMulti={isMulti}
        cacheOptions
        defaultOptions={
          (filterData ?
             (data.filter((f:any) => {
                return f[filterData.key] !== filterData.value;
              })
              .map((e:any) => {
                // if the options key was not found, it means the 'e' data is not one of the original data
                // this is the data that tells the user that he/she already reached the end of the list.
                const isOptNotFound = !Object.keys(e).includes(optionsProps.key);
                if (isOptNotFound) {
                  return e;
                }

                return {
                  label: e[optionsProps.key],
                  value: e[optionsProps.value],
                };
            }))
            :
            (data.map((e:any) => {
              // if the options key was not found, it means the 'e' data is not one of the original data
              // this is the data that tells the user that he/she already reached the end of the list.
              const isOptNotFound = !Object.keys(e).includes(optionsProps.key);
              if (isOptNotFound) {
                return e;
              }
              
              return {
                label: e[optionsProps.key],
                value: e[optionsProps.value],
              };
            }))
          )
        }
        onChange={async (e) => {
          if (!isArray(e)) {

            if (e.value === 'info') {
              return onChange(null);
            }

            const newEvent = {
              ...e,
              name: name,
              label: e.label,
              value: e.value
            }

            return onChange(newEvent);
          }

          const info = e.find((d:any) => d.value === 'info');
          if (info) return;

          const newEvent = e.map(d => ({
            ...d,
            name: name,
            label: d.label,
            value: d.value
          }))

          onChange(newEvent);
        }}
        loadOptions={(inp, call) => {
          const load = async () => {
            reset();

            const _data = await getData("search"+query({
              ...queries,
              [optionsProps.key]: `search:${inp}`
            })) as any;

            const mappedOpts = _data.data.rows.map((d: any) => ({label: d[optionsProps.key], value: d[optionsProps.value]}));
            const itemsCount = _data.data.count <= 10 ? _data.data.count : (_data.data.count)-(10-mappedOpts.length);
            
            mappedOpts.push({
              label: `There are ${itemsCount <= 0 ? 'no' : formatNumberWithCommasAndDecimals(itemsCount)} item(s) found`,
              value: 'info'
            })

            call(mappedOpts);
          }

          load();
        }}
        onMenuScrollToBottom={async () => {
          await nextData(queries);
        }}
        onMenuClose={() => reset()}
        onMenuOpen={async () => {
          const _data = await initData(queries);
          setData(_data);
        }}
        value={value}
        className="basic-multi-select"
        classNamePrefix="select"
        name={name}
        id={id}
      />
    </>
  )
}