import { useState, useEffect, ChangeEventHandler } from "react";
import { Checkbox } from "../../../common/form/Checkbox";
import * as _ from "lodash";
import "./Users.css";
import { PasswordApprover } from "./useraccessform/PasswordApprover";
import { Ordering } from "./useraccessform/Ordering";
import { UserCrud } from "./useraccessform/UserCrud";
import { MultipleUserAccess } from "./useraccessform/MultipleUserAccess";

interface UserAccessFormProps {
  data: any;
  onChangeData: any;
  menus: any;
  handleInputChange: ChangeEventHandler<HTMLInputElement> | undefined;
}


/**
 * OBSOLETE; DUE TO UNPRECEDENTED BUGS
 * THIS IS THE OLDER VERSION OF THE COMPONENT
 * THIS IS CURRENTLY NOT IN USE, PLEASE SEE THE VERSION 2 INSTEAD
 * NEW VERSION NAME: UserAccessFormV2.tsx
 */
export function UserAccessForm(props: UserAccessFormProps) {
  const catOrder = [
    "cashiering_removeitem",
    "cashiering_adddiscount",
    "cashiering_freeitem",
    "cashiering_freetransaction",
    "cashiering_priceoverride",
    "cashiering_canceltransaction",
    "cashiering_reprinttransaction",
    "cashiering_reprintvoid",
    "cashiering_voidtran",
    "cashiering_recalltran",
    "cashiering_zreading",
  ];
  const [opened, setOpened] = useState<any>();
  const [ordering, setOrdering] = useState(false);
  const [userAccessForm, setUserAccessForm] = useState<any>({});
  const [displayMenus, setDisplayMenus] = useState<any>();

  const checkAll = (
    {
      target: { name, value, checked, type },
    }: React.ChangeEvent<HTMLInputElement>,
    menus: any,
    ord?: string
  ) => {
    const ordering = () => {
      menus[menus.length - 1].forEach((el: any) => {
        setUserAccessForm((prev: any) => ({
          ...prev,
          [el.menfield]: {
            [`${el.menfield}_allowadd`]: checked && el.allowadd === 1 ? 1 : 0,
            [`${el.menfield}_allowadd`]: checked && el.allowadd === 1 ? 1 : 0,
            [`${el.menfield}_allowedit`]: checked && el.allowedit === 1 ? 1 : 0,
            [`${el.menfield}_allowdelete`]:
              checked && el.allowdelete === 1 ? 1 : 0,
            [`${el.menfield}_allowimport`]:
              checked && el.allowimport === 1 ? 1 : 0,
            [`${el.menfield}_allowresend`]:
              checked && el.allowresend === 1 ? 1 : 0,
            [`${el.menfield}_allowvoid`]: checked && el.allowvoid === 1 ? 1 : 0,
            [`${el.menfield}_allowprint`]:
              checked && el.allowprint === 1 ? 1 : 0,
          },
        }));
      });
    };

    props.onChangeData(name, value, checked, type);

    if (ord === "ORDERING") {
      setOpened((prev: any) => ({ ...prev, ["ORDERING"]: checked }));
      setOrdering(checked);
      ordering();
    } else {
      if (ord === "CASHIER BASIC ACCESS") {
        setOrdering(checked);
        ordering();
      }
      menus.forEach((el: any) => {
        setUserAccessForm((prev: any) => ({
          ...prev,
          [el.menfield]: {
            [`${el.menfield}_allowadd`]: checked && el.allowadd === 1 ? 1 : 0,
            [`${el.menfield}_allowadd`]: checked && el.allowadd === 1 ? 1 : 0,
            [`${el.menfield}_allowedit`]: checked && el.allowedit === 1 ? 1 : 0,
            [`${el.menfield}_allowdelete`]:
              checked && el.allowdelete === 1 ? 1 : 0,
            [`${el.menfield}_allowimport`]:
              checked && el.allowimport === 1 ? 1 : 0,
            [`${el.menfield}_allowresend`]:
              checked && el.allowresend === 1 ? 1 : 0,
            [`${el.menfield}_allowvoid`]: checked && el.allowvoid === 1 ? 1 : 0,
            [`${el.menfield}_allowprint`]:
              checked && el.allowprint === 1 ? 1 : 0,
          },
        }));
      });
    }
  };

  const toggleFunc = (index: any) => {
    if (opened[`ind${index}`]) {
      setOpened((prev: any) => ({
        ...prev,
        [`image${index}`]: "./src/assets/images/add.png",
        [`ind${index}`]: false,
      }));
    } else {
      setOpened((prev: any) => ({
        ...prev,
        [`image${index}`]: "./src/assets/images/minus.png",
        [`ind${index}`]: true,
      }));
    }
  };

  const toggleSub = (menu: any, index: any) => {
    if (opened[`${menu.menfield}${index}`]) {
      setOpened((prev: any) => ({
        ...prev,
        [`${menu.menfield}`]: "./src/assets/images/add.png",
        [`${menu.menfield}${index}`]: false,
      }));
    } else {
      setOpened((prev: any) => ({
        ...prev,
        [`${menu.menfield}`]: "./src/assets/images/minus.png",
        [`${menu.menfield}${index}`]: true,
      }));
    }
  };

  const groupBy = (array: any, key: any) => {
    let counter = 0;
    const ordring: Array<[]> = [];
    const records: any = array.reduce((result: any, currentValue: any) => {
      if (currentValue.allowadd === 1) {
        counter++;
      }
      if (currentValue.allowedit === 1) {
        counter++;
      }
      if (currentValue.allowprint === 1) {
        counter++;
      }
      if (currentValue.allowvoid === 1) {
        counter++;
      }
      if (currentValue.allowdelete === 1) {
        counter++;
      }
      if (currentValue.allowimport === 1) {
        counter++;
      }
      if (currentValue.allowresend === 1) {
        counter++;
      }

      if (catOrder.indexOf(currentValue["menfield"]) > -1) {
        ordring.push({
          ...currentValue,
          ["multiple"]: counter > 1 ? true : false,
        });
        counter = 0;
      } else {
        (result[currentValue[key]] = result[currentValue[key]] || []).push({
          ...currentValue,
          ["multiple"]: counter > 1 ? true : false,
        });
        counter = 0;
      }

      return result;
    }, {});

    records["CASHIER BASIC ACCESS"][records["CASHIER BASIC ACCESS"].length] =
      ordring;
    return records;
  };

  useEffect(() => {
    setDisplayMenus(props.menus);

    //#region loadUserAccessForm
    let record = _.orderBy(props.menus, "order", "asc");

    setOpened((prev: any) => ({
      ...prev,
      ["ORDERINGIMG"]: "./src/assets/images/add.png",
      ["ORDERING"]: false,
    }));

    record.forEach((el: any, ind: any) => {
      setOpened((prev: any) => ({
        ...prev,
        [`${el.menfield}`]: "./src/assets/images/add.png",
        [`${el.menfield}${ind}`]: false,
      }));
      setUserAccessForm((prev: any) => ({
        ...prev,
        [`${el.menfield}`]: {
          [`${el.menfield}`]: el.menfield,
          [`${el.menfield}_mencap`]: el.mencap,
          [`${el.menfield}_allowadd`]: false,
          [`${el.menfield}_allowedit`]: false,
          [`${el.menfield}_allowvoid`]: false,
          [`${el.menfield}_allowprint`]: false,
          [`${el.menfield}_allowdelete`]: false,
          [`${el.menfield}_allowimport`]: false,
          [`${el.menfield}_allowresend`]: false,
        },
      }));
    });

    const tmpmenus = groupBy(record, "mengrp");
    const arrMenus: Array<[]> = [];
    Object.keys(tmpmenus).forEach((value: any, index: any) => {
      setOpened((prev: any) => ({
        ...prev,
        [`image${index}`]: "./src/assets/images/add.png",
        [`image${index}1`]: "./src/assets/images/add.png",
      }));
      arrMenus.push(tmpmenus[value]);
    });
    setDisplayMenus(arrMenus);

    if (props.data?.useraccessfiles.length > 0) {
      props.data?.useraccessfiles.map((el: any) => {
        setUserAccessForm((prev: any) => ({
          ...prev,
          [`${el.menfield}`]: {
            recid: el.recid,
            [`${el.menfield}_module`]: el.menfield,
            [`${el.menfield}_allowadd`]: el.allowadd,
            [`${el.menfield}_allowedit`]: el.allowedit,
            [`${el.menfield}_allowvoid`]: el.allowvoid,
            [`${el.menfield}_allowprint`]: el.allowprint,
            [`${el.menfield}_allowdelete`]: el.allowdelete,
            [`${el.menfield}_allowimport`]: el.allowimport,
            [`${el.menfield}_allowresend`]: el.allowresend,
          },
        }));
      });

      displayMenus.forEach((men: any) => {
        let x = 0;
        setOpened((prev: any) => ({
          ...prev,
          [men[0].mengrp]: true,
        }));
        men.map((men1: any) => {
          if (men1.recid) {
            if (
              men1.allowadd === 1 &&
              !userAccessForm[men1.menfield][`${men1.menfield}_allowadd`]
            ) {
              x++;
            }

            if (
              men1.allowedit === 1 &&
              !userAccessForm[men1.menfield][`${men1.menfield}_allowedit`]
            ) {
              x++;
            }

            if (
              men1.allowvoid === 1 &&
              !userAccessForm[men1.menfield][`${men1.menfield}_allowvoid`]
            ) {
              x++;
            }

            if (
              men1.allowprint === 1 &&
              !userAccessForm[men1.menfield][`${men1.menfield}_allowprint`]
            ) {
              x++;
            }

            if (
              men1.allowdelete === 1 &&
              !userAccessForm[men1.menfield][`${men1.menfield}_allowdelete`]
            ) {
              x++;
            }

            if (
              men1.allowimport === 1 &&
              !userAccessForm[men1.menfield][`${men1.menfield}_allowimport`]
            ) {
              x++;
            }

            if (
              men1.allowresend === 1 &&
              !userAccessForm[men1.menfield][`${men1.menfield}_allowresend`]
            ) {
              x++;
            }
          } else {
            setOrdering(true);
            men1.forEach((men2: any) => {
              if (
                men2.allowadd === 1 &&
                !userAccessForm[men2.menfield][`${men2.menfield}_allowadd`]
              ) {
                x++;
              }

              if (
                men2.allowedit === 1 &&
                !userAccessForm[men2.menfield][`${men2.menfield}_allowedit`]
              ) {
                x++;
              }

              if (
                men2.allowvoid === 1 &&
                !userAccessForm[men2.menfield][`${men2.menfield}_allowvoid`]
              ) {
                x++;
              }

              if (
                men2.allowprint === 1 &&
                !userAccessForm[men2.menfield][`${men2.menfield}_allowprint`]
              ) {
                x++;
              }

              if (
                men2.allowdelete === 1 &&
                !userAccessForm[men2.menfield][`${men2.menfield}_allowdelete`]
              ) {
                x++;
              }

              if (
                men2.allowimport === 1 &&
                !userAccessForm[men2.menfield][`${men2.menfield}_allowimport`]
              ) {
                x++;
              }

              if (
                men2.allowresend === 1 &&
                userAccessForm[men2.menfield][`${men2.menfield}_allowresend`]
              ) {
                x++;
              }
            });
            if (x > 0) {
              setOrdering(false);
            }
          }
        });
        if (x > 0) {
          setOpened((prev: any) => ({
            ...prev,
            [men[0].mengrp]: false,
          }));
        }
      });
    }
    //#endregion
  }, []);

  return (
    <>
      {displayMenus &&
        displayMenus.map((menu: any, i: any) => (
          <>
            {menu[0].mengrp === "PASSWORD APPROVER" ? (
              <PasswordApprover
                menu={menu}
                data={props.data}
                opened={opened}
                index={i}
                toggleFunc={toggleFunc}
                checkAll={checkAll}
                handleInputChange={props.handleInputChange}
              />
            ) : (
              <div className="flex flex-col items-start">
                <div className="flex items-center">
                  <img
                    className="w=[20px] h-[20px] relative cursor-pointer"
                    src={opened["image" + i]}
                    onClick={() => toggleFunc(i)}
                    alt=""
                  />

                  <Checkbox
                    description={menu[0].mengrp}
                    name={menu[0].mengrp}
                    id={menu[0].mengrp}
                    value={opened[menu[0].mengrp]}
                    checked={opened[menu[0].mengrp] ? true : false}
                    handleInputChange={(e) => checkAll(e, menu, menu[0].mengrp)}
                  />
                </div>

                <div
                  className={`${opened["ind" + i] ? "panel active" : "panel"}`}
                >
                  {menu.map((men: any, x: any) => (
                    <>
                      <UserCrud
                        userAccessForm={userAccessForm}
                        men={men}
                        handleInputChange={props.handleInputChange}
                      />
                      <Ordering
                        menu={menu}
                        men={men}
                        checkAll={checkAll}
                        opened={opened}
                        ordering={ordering}
                      />

                      {men.multiple && men.mencap ? (
                        <div
                          className={`flex items-center mt-[20px] mb-[20px] w-full text-[12px] ${
                            !opened[men.menfield + x]
                              ? "border-b border-solid border-black"
                              : ""
                          }`}
                          onClick={() => toggleSub(men, x)}
                        >
                          <img
                            className="w=[20px] h-[20px] relative cursor-pointer"
                            src={opened[men.menfield]}
                            alt=""
                          />
                          <span className="ml-[10px]">{men.mencap}</span>
                        </div>
                      ) : (
                        <></>
                      )}

                      <MultipleUserAccess
                        men={men}
                        userAccessForm={userAccessForm}
                        opened={opened}
                        index={x}
                        handleInputChange={props.handleInputChange}
                      />
                    </>
                  ))}
                </div>
              </div>
            )}
          </>
        ))}
    </>
  );
}
