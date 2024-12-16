/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChangeEventHandler,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ExpandableMultiSelection } from "./common/ExpandableMultiSelection";
import _ from "lodash";
import { Menus } from "../../../models/menus";
import { Checkbox } from "../../../common/form/Checkbox";

interface UserAccessFormV2Props {
  usrcde: string;
  data: any;
  onChangeData: any;
  menus: Menus[];
  onClosedModal?: () => void;
  handleInputChange: ChangeEventHandler<HTMLInputElement> | undefined;
}

export function UserAccessFormV2(props: UserAccessFormV2Props) {
  const [data, setData] = useState<any>(props.data);
  const [menus, setMenus] = useState<any>({});
  const [expanded, setExpanded] = useState<string[]>([]); // list of expanded menu the value is the mengrp property
  const [subMenuExpanded, setSubMenuExpanded] = useState<string[]>([]); // list of expanded submenu the value is the menfield property

  useEffect(() => {
    const displayableMenu: any = {};

    props.menus.forEach((menu: Menus) => {
      // get all the menu properties that has allow in it
      // will be used to display the add,edit,delete,print,etc.
      const allowProps: any[] = [];
      for (const key in menu) {
        if (key.includes("allow") && menu[key] === 1) {
          allowProps.push(key.replace("allow", ""));
        }
      }

      // add the allow props to the menu
      const menuCopy = _.cloneDeep(menu);
      menuCopy["allowprops"] = allowProps;

      if (menu.mengrp) {
        if (displayableMenu[menu.mengrp]) {
          displayableMenu[menu.mengrp].push(menuCopy);
        } else {
          displayableMenu[menu.mengrp] = [menuCopy];
        }
      }
    });

    setMenus(displayableMenu);
  }, []);

  useEffect(() => {
    setData(props.data);
  }, [props.data]);

  const addNewAccess = (
    submenu: any,
    useraccess: any[],
    checked?: boolean,
    allowProps?: string
  ) => {
    const newUserAccess = _.cloneDeep(submenu);
    delete newUserAccess.mencap;
    delete newUserAccess.mengrp;
    delete newUserAccess.usrtyp;
    delete newUserAccess.order;
    delete newUserAccess.recid;

    for (const subMenuKey in newUserAccess as any) {
      if (subMenuKey.includes("allow")) {
        if (allowProps) {
          newUserAccess[subMenuKey] = 0;
          if (subMenuKey === allowProps) {
            newUserAccess[allowProps] = newUserAccess[allowProps] === 1 ? 0 : 1;
          }
        } else {
          if (newUserAccess[subMenuKey] === 1) {
            newUserAccess[subMenuKey] = checked ? 1 : 0;
          }
        }
      }
    }

    newUserAccess["usrcde"] = props.usrcde;
    newUserAccess.module = null;

    useraccess.push(newUserAccess);
  };

  const isCheckAll = useMemo(
    () => (menus: any[]) => {
      const checkedAllArr: any[] = [];

      if (!data) return false;

      for (const menu of menus) {
        for (const key in menu) {
          if (key.includes("allow")) {
            if (menu[key] === 1) {
              if (!data.useraccessfiles) continue;
              
              const userAccess = data.useraccessfiles.find(
                (userAccess: any) => userAccess.menfield === menu.menfield
              );

              if (!userAccess) {
                checkedAllArr.push(false);
                continue;
              }

              if (userAccess[key] === 1) {
                checkedAllArr.push(true);
                continue;
              }

              checkedAllArr.push(false);
            }
          }
        }
      }

      return (
        checkedAllArr.length > 0 &&
        checkedAllArr.every((checked: boolean) => checked === true)
      );
    },
    [data]
  );

  const onSelectUnselectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    const name = e.target.name;

    let _data = _.cloneDeep(data);

    if (_data === undefined || _data.useraccessfiles === undefined) {
      _data = {
        useraccessfiles: [],
      };
    }

    const newMenus = _.cloneDeep(menus);
    let newUserAccesFiles: any[] = _data.useraccessfiles;

    for (const key in newMenus) {
      const isApprover = name === "approver"
      if (key === name || isApprover) {
        const menus = Object.values(newMenus[isApprover ? "PASSWORD APPROVER" : key]);

        for (const submenu of menus as any) {
          const newCopyUserAccess = newUserAccesFiles.find(
            (userAccess: any) => userAccess.menfield === submenu.menfield
          );

          if (!newCopyUserAccess) {
            addNewAccess(submenu, newUserAccesFiles, checked);
            continue;
          }

          for (const subMenuKey in submenu as any) {
            if (subMenuKey.includes("allow")) {
              if (submenu[subMenuKey] === 1) {
                newCopyUserAccess[subMenuKey] = checked ? 1 : 0;
              }
            }
          }

          newUserAccesFiles = newUserAccesFiles.map((userAccess: any) => {
            if (userAccess.menfield === submenu.menfield) {
              return newCopyUserAccess;
            }

            return userAccess;
          });
        }
      }
    }

    setData((prev: any) => {

      const newUserInfo = name==="approver" ? {
        ...prev,
        approver: checked ? 1 : 0,
        useraccessfiles: newUserAccesFiles,
      } : {
        ...prev,
        useraccessfiles: newUserAccesFiles,
      }

      return newUserInfo;
    });

    if (name === "approver")
      props.onChangeData("approver", checked ? 1 : 0)
    props.onChangeData("useraccessfiles", newUserAccesFiles);
  }

  const isSubMenuCheckAll = useMemo(() => (menu: any) => {
    const checkedAllArr: any[] = [];

    if (!data) return false;

    for (const key in menu) {
      if (key.includes("allow")) {
        if (menu[key] === 1) {
          if (!data.useraccessfiles) {
            checkedAllArr.push(false);
            continue;
          }

          const userAccess = data.useraccessfiles.find(
            (userAccess: any) => userAccess.menfield === menu.menfield
          );

          if (!userAccess) {
            checkedAllArr.push(false);
            continue;
          }

          if (userAccess[key] === 1) {
            checkedAllArr.push(true);
            continue;
          }

          checkedAllArr.push(false);
        }
      }
    }

    return checkedAllArr.every((checked: boolean) => checked === true);
  }, [data]);

  const onSelectUnselectSubmenuAll = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = e.target.checked;
    const name = e.target.name;

    let _data = _.cloneDeep(data);
    if (data === undefined || _data.useraccessfiles === undefined) {
      _data = {
        useraccessfiles: [],
      };
    }

    const newMenus = _.cloneDeep(menus);

    const newUserAccessFiles = _.cloneDeep(_data.useraccessfiles);
    let newCopyUserAccess = newUserAccessFiles.find(
      (userAccess: any) => userAccess.menfield === name
    );

    Object.values(newMenus).forEach((menu: any) => {
      const foundMenu = menu.find((m: any) => m.menfield === name);
      
      if (foundMenu) {
        if (!newCopyUserAccess) {
          addNewAccess(foundMenu, newUserAccessFiles, checked);

          newCopyUserAccess = newUserAccessFiles.find(
            (userAccess: any) => userAccess.menfield === name
          );

          setData((prev: any) => {
            return {
              ...prev,
              useraccessfiles: newUserAccessFiles,
            };
          });

          props.onChangeData("useraccessfiles", newUserAccessFiles);
          return;
        }

        for (const key in foundMenu) {
          if (key.includes("allow")) {
            if (foundMenu[key] === 1) {
              newCopyUserAccess[key] = checked ? 1 : 0;
            }
          }
        }

        setData((prev: any) => {
          return {
            ...prev,
            useraccessfiles: prev.useraccessfiles.map((userAccess: any) => {
              if (userAccess.menfield === newCopyUserAccess.menfield) {
                return newCopyUserAccess;
              }

              return userAccess;
            }),
          };
        });

        props.onChangeData("useraccessfiles", newUserAccessFiles);
      }
    });
  };

  const isAddEditDeleteSelected = useMemo(() => (menu: any, prop: string) => {
    if (!data) return false;

    if (!data.useraccessfiles) return false;

    const userAccess = data.useraccessfiles.find(
      (userAccess: any) => userAccess.menfield === menu.menfield
    );

    if (!userAccess) return false;

    if (userAccess[prop] === 1) return true;

    return false;
  }, [data]);

  const onAddEditDeleteSelectUnselect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const prop = e.target.name;
    const menfield = e.target.value;

    const newMenus = _.cloneDeep(menus);

    let _data = _.cloneDeep(data);
    if (data === undefined || _data.useraccessfiles === undefined) {
      _data = {
        useraccessfiles: [],
      };
    }

    Object.values(newMenus).forEach((menu: any) => {
      const foundMenu = menu.find((m: any) => m.menfield === menfield);

      if (foundMenu) {
        const newCopyUserAccess = _data.useraccessfiles.find(
          (userAccess: any) => userAccess.menfield === foundMenu.menfield
        );

        if (!newCopyUserAccess) {
          addNewAccess(foundMenu, _data.useraccessfiles, true, prop);
          setData((prev: any) => {
            return {
              ...prev,
              useraccessfiles: _data.useraccessfiles,
            };
          });

          props.onChangeData("useraccessfiles", _data.useraccessfiles);
          return;
        }

        if (newCopyUserAccess[prop] === 1) {
          newCopyUserAccess[prop] = 0;
        } else {
          newCopyUserAccess[prop] = 1;
        }

        setData((prev: any) => {
          return {
            ...prev,
            useraccessfiles: prev.useraccessfiles.map((userAccess: any) => {
              if (userAccess.menfield === newCopyUserAccess.menfield) {
                return newCopyUserAccess;
              }

              return userAccess;
            }),
          };
        });

        props.onChangeData("useraccessfiles", _data.useraccessfiles);
      }
    });
  };

  return (
    <>
      <Checkbox
        handleInputChange={(e) => {
          setData((prev: any) => {
            return {
              ...prev,
              prntrange: e.target.checked ? 1 : 0,
            };
          });

          props.onChangeData("prntrange", e.target.checked ? 1 : 0);
        }}
        id={"date-range"}
        name={"date-range"}
        className="ms-1"
        value={"date-range"}
        description={"ALLOW PRINTING OF DATE RANGE"}
        checked={data && data.prntrange === 1 ? true : false}
      />
      {Object.keys(menus).map((_key: string, i: number) => (
        // MENUS
        <>
          {_key !== "WAITER BASIC ACCESS" && (
            <ExpandableMultiSelection
              key={i}
              title={_key}
              name={_key === "PASSWORD APPROVER" ? "approver" : _key }
              id={_key}
              value={""}
              checked={isCheckAll(menus[_key])}
              handleInputChange={onSelectUnselectAll}
              onExpand={() => {
                setExpanded((prev) => {
                  const mengrp = _key;

                  const isExpanded = prev.includes(mengrp);
                  if (isExpanded) {
                    return prev.filter((item) => item !== _key);
                  } else {
                    return [...prev, _key];
                  }
                });
              }}
              expanded={expanded.includes(_key)}
            >
              {/* SUBMENUS */}
              {_key === "PASSWORD APPROVER" && (
                <label className="text-[12px]">
                  Note: The access below required a password of a supervisor
                </label>
              )}
              {menus[_key].map((menu: any, i: number) => (
                <ExpandableMultiSelection
                  key={i}
                  title={menu.mencap}
                  name={menu.menfield}
                  id={menu.menfield}
                  value={menu.menfield}
                  showIcons={_key === "PASSWORD APPROVER"}
                  checked={isSubMenuCheckAll(menu)}
                  handleInputChange={onSelectUnselectSubmenuAll}
                  onExpand={() => {
                    setSubMenuExpanded((prev) => {
                      const menfield = menu.menfield;

                      const isExpanded = prev.includes(menfield);
                      if (isExpanded) {
                        return prev.filter((item) => item !== menfield);
                      } else {
                        return [...prev, menfield];
                      }
                    });
                  }}
                  expanded={subMenuExpanded.includes(menu.menfield)}
                  underline
                >
                  {menu.allowprops.map((allowProp: string) => (
                    <div className="flex flex-col">
                      <Checkbox
                        checked={isAddEditDeleteSelected(
                          menu,
                          "allow" + allowProp
                        )}
                        handleInputChange={onAddEditDeleteSelectUnselect}
                        id={menu.menfield + allowProp}
                        name={"allow" + allowProp}
                        value={menu.menfield}
                        description={allowProp.toLocaleUpperCase()}
                      />
                    </div>
                  ))}
                </ExpandableMultiSelection>
              ))}
            </ExpandableMultiSelection>
          )}
        </>
      ))}
    </>
  );
}
