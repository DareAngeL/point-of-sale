import { useEffect, useRef, useState } from "react";
import { Checkbox } from "../../../common/form/Checkbox";
// import SearchComponent from "../../../common/search/Search";
import { ApiService } from "../../../services";
import { SingleButtonForm } from "../../../common/form/SingleButtonForm";
import { toast } from "react-toastify";
import { Spin } from "antd";
import { useWebSocketContext } from "../../../WebSocketContext";
import { useNavigate } from "react-router";

export function UpdateStructure() {
  const { sendJsonMessage } = useWebSocketContext();
  const navigate = useNavigate();

  const [tableList, setTableList] = useState<
    { isChecked: boolean; name: string }[]
  >([]);
  const [searchedTable, setSearchedTable] = useState<
    { isChecked: boolean; name: string }[]
  >([]);

  const [options, setOptions] = useState<{
    addonlymissingcol: boolean;
    chkalltable: boolean;
  }>({
    addonlymissingcol: true,
    chkalltable: false,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const searchedValue = useRef(""); // used for value checking only

  useEffect(() => {
    const getTableList = async () => {
      const res = await ApiService.get("dbconfig/getablelist");
      setTableList(
        res.data.map((table: string) => {
          return {
            isChecked: false,
            name: table,
          };
        })
      );
    };

    getTableList();
  }, []);

  const onCheckAllTable = ({
    target: { checked },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setSearchedTable((prev) => {
      return prev.map((table) => {
        return {
          ...table,
          isChecked: checked,
        };
      });
    });

    setTableList((prev) => {
      return prev.map((table) => {
        return {
          ...table,
          isChecked:
            searchedTable.length > 0 &&
            searchedTable.find((tbl) => tbl.name === table.name)?.name ===
              table.name
              ? checked
              : searchedTable.length === 0
              ? checked
              : table.isChecked,
        };
      });
    });

    setOptions((prev) => ({
      ...prev,
      chkalltable: checked,
    }));
  };

  const onCheckTable = ({
    target: { name, checked },
  }: React.ChangeEvent<HTMLInputElement>) => {

    if (searchedTable.length > 0) {
      setSearchedTable((prev) => {
        return prev.map((table) => {
          if (table.name === name) {
            return {
              ...table,
              isChecked: checked,
            };
          }

          return table;
        });
      });
    }

    setTableList((prev) => {
      return prev.map((table) => {
        if (table.name === name) {
          return {
            ...table,
            isChecked: checked,
          };
        }

        return table;
      });
    });
  };

  // const onSearchTyping = async (e: ChangeEvent<HTMLInputElement>) => {
  //   const { value } = e.target;
  //   searchedValue.current = value;

  //   if (value === "") {
  //     setSearchedTable([]);
  //     return;
  //   }

  //   setSearchedTable(await new Promise((resolve) => {
  //     resolve(tableList.filter((table) => table.name.includes(value.toLowerCase())));
  //   }));
  // };

  const onConfirm = async () => {
    // get all tables that has been checked
    const checkedTables = tableList
      .filter((table) => table.isChecked)
      .map((table) => table.name);

    if (checkedTables.length === 0) {
      toast.info("Please select tables to update.", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: true,
      });

      return;
    }

    setIsProcessing(true);
    const res = await ApiService.post("dbconfig/updatestructure", {
      tables: checkedTables,
      addonlymissingcols: options?.addonlymissingcol,
    }).catch((err) => {
      reset();
      console.log(err);
      toast.error("Something went wrong. Unable to update structure.", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: true,
      });
    });

    toast.success("Structure updated successfully.", {
      position: "top-center",
      autoClose: 1500,
      hideProgressBar: true,
    });

    setTimeout(() => {
      if (res) {
        reset();
        sendJsonMessage({type: "DB Structure"});
        navigate("/pages/login");
        window.location.reload();
      }

      setIsProcessing(false);
    }, 1500);
  };

  const reset = () => {
    searchedValue.current = "";
    setSearchedTable([]);
    setOptions({
      addonlymissingcol: true,
      chkalltable: false,
    });
    // finds the checked table and uncheck it
    setTableList((prev) => {
      return prev.map((table) => {
        if (table.isChecked) {
          return {
            ...table,
            isChecked: false,
          };
        }

        return table;
      });
    });
  }

  return (
    <>
      {isProcessing ? (
        <div className="flex ">
          <Spin />
          <p className="mx-5">Updating structure...</p>
        </div>
      ) : (
        <>
          <div className="flex justify-evenly shadow-md">
            <Checkbox
              checked={options.addonlymissingcol}
              id={"add-mssng-col"}
              name={"add-mssng-col"}
              description={"Add only missing column"}
              handleInputChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  addonlymissingcol: e.target.checked,
                }))
              }
            />
            <Checkbox
              checked={options.chkalltable}
              id={"chk-all-tbl"}
              name={"chk-all-tbl"}
              description={"Check All Table"}
              handleInputChange={onCheckAllTable}
            />
          </div>
          <div className="mt-5 shadow-md ps-3 pt-3">
            <span className="text-sm font-bold">
              Please select table you want to update
            </span>
            {/* <SearchComponent onType={onSearchTyping} /> */}
            <div className="overflow-y-auto max-h-[250px] mb-2">
              {searchedTable.length > 0 ? (
                searchedTable.map((table, index) => (
                  <Checkbox
                    key={index}
                    checked={table.isChecked}
                    id={table.name}
                    name={table.name}
                    description={table.name}
                    handleInputChange={onCheckTable}
                  />
                ))
              ) : tableList.length === 0 || searchedValue.current !== "" ? (
                <div className="flex justify-center items-center py-3">
                  <p className="text-sm">No tables found.</p>
                </div>
              ) : (
                tableList.map((table, index) => (
                  <Checkbox
                    key={index}
                    checked={table.isChecked}
                    id={table.name}
                    name={table.name}
                    description={table.name}
                    handleInputChange={onCheckTable}
                  />
                ))
              )}
            </div>
          </div>
          <SingleButtonForm
            formName={""}
            labelName={"Confirm"}
            onClick={onConfirm}
          />
        </>
      )}
    </>
  );
}
