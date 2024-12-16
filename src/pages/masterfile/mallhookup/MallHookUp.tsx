import {useNavigate} from "react-router";
import {InputText} from "../../../common/form/InputText";
import {useAppDispatch, useAppSelector} from "../../../store/store";
import {InputNumber} from "../../../common/form/InputNumber";
import {ButtonForm} from "../../../common/form/ButtonForm";
import {Selection} from "../../../common/form/Selection";
import {useEffect, useState} from "react";
import {ApiService} from "../../../services";
import {toast} from "react-toastify";
import {InputPassword} from "../../../common/form/InputPassword";
import {useModal} from "../../../hooks/modalHooks";
import {METHODS, MODULES} from "../../../enums/activitylogs";
import {useUserActivityLog} from "../../../hooks/useractivitylogHooks";
import { getHeader } from "../../../store/actions/printout.action";
import { getSysPar } from "../../../store/actions/systemParameters.action";
interface Data {
  recid?: number;
  tenantid?: number;
  postrmno?: number;
  brcode?: string;
  ncheck?: string;
  classc?: number;
  storno?: number;
  pos_machineno?: string;
  storcde?: string;
  serialno?: string;
  tenantnam?: string;
  tenantcomcde?: string;
  sales_type?: string;
  ftphost?: string;
  ftpuser?: string;
  ftppword?: string;
  ftpport?: number;
  pathfile?: string;
  consolidated_pathfile?: string;
  sftp_robinson?: number;
}

export function MallHookUp() {
  const [loadedData, setLoadedData] = useState<Data>();

  const navigate = useNavigate();
  const {dispatch} = useModal();
  const useDispatch = useAppDispatch();
  const [mallHookUp, setMallHookUp] = useState("Not Set");
  const [activeMall, setActiveMall] = useState(0);
  const {postActivity} = useUserActivityLog();
  const syspar = useAppSelector((state) => state.masterfile.syspar);
  const header = useAppSelector((state) => state.masterfile.header);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;

    setLoadedData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const {name, value} = e.target;

    setLoadedData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const promise = ApiService.put("headerfile", {
      recid: 1,
      tenantid: loadedData?.tenantid,
      postrmno: loadedData?.postrmno,
      brcode: loadedData?.brcode,
      ncheck: loadedData?.ncheck,
      classc: loadedData?.classc,
      storno: loadedData?.storno,
      pos_machineno: loadedData?.pos_machineno,
      storcde: loadedData?.storcde,
      serialno: loadedData?.serialno,
      tenantnam: loadedData?.tenantnam,
      tenantcomcde: loadedData?.tenantcomcde,
      sales_type: loadedData?.sales_type,
    });

    const promise2 = ApiService.put("systemparameters", {
      recid: 1,
      ftphost: loadedData?.ftphost,
      ftpuser: loadedData?.ftpuser,
      ftppword: loadedData?.ftppword,
      ftpport: loadedData?.ftpport,
      pathfile: loadedData?.pathfile,
      consolidated_pathfile: loadedData?.consolidated_pathfile,
      sftp_robinson: loadedData?.sftp_robinson,
    });

    await Promise.all([promise, promise2]).then((values) =>
      values.map((promiseResult) => promiseResult.data as Data)
    );

    toast.promise(promise2, {
      pending: "Pending request",
      success: {
        hideProgressBar: true,
        autoClose: 1500,
        position: 'top-center',
        render: "Successfully updated!",
      },
    });

    postActivity({
      method: METHODS.UPDATE,
      module: MODULES.MALLHOOKUP,
      remarks: `UPDATED:\nSTORE CODE:${loadedData?.storcde}`,
    });

    navigate("/pages/masterfile");
    useDispatch(getHeader());
    useDispatch(getSysPar());
    dispatch();
  };

  useEffect(() => {
    // dispatch1(setHeader(loadedData));
    setLoadedData({
      tenantid: header.data[0].tenantid,
      postrmno: header.data[0].postrmno as unknown as number,
      brcode: header.data[0].brcode,
      ncheck: header.data[0].ncheck,
      classc: header.data[0].classc,
      storno: header.data[0].storno,
      pos_machineno: header.data[0].pos_machineno,
      storcde: header.data[0].storcde,
      serialno: header.data[0].serialno,
      tenantnam: header.data[0].tenantnam,
      tenantcomcde: header.data[0].tenantcomcde,
      sales_type: header.data[0].sales_type,
      ftphost: syspar.data[0].ftphost,
      ftpuser: syspar.data[0].ftpuser,
      ftppword: syspar.data[0].ftppword,
      ftpport: syspar.data[0].ftpport,
      pathfile: syspar.data[0].pathfile,
      consolidated_pathfile: syspar.data[0].consolidated_pathfile,
      sftp_robinson: syspar.data[0].sftp_robinson,
    });

    if (syspar?.data[0].robinson) {
      setMallHookUp("Robinsons");
      setActiveMall(1);
    } else if (syspar?.data[0].sm) {
      setMallHookUp("SM");
      setActiveMall(1);
    } else if (syspar?.data[0].ayala) {
      setMallHookUp("Ayala");
      setActiveMall(1);
    } else if (syspar?.data[0].megaworld) {
      setMallHookUp("Megaworld");
      setActiveMall(1);
    } else if (syspar?.data[0].ortigas) {
      setMallHookUp("Ortigas");
      setActiveMall(1);
    } else if (syspar?.data[0].shangrila) {
      setMallHookUp("Shangrila");
      setActiveMall(1);
    } else if (syspar?.data[0].sm_mall_2022) {
      setMallHookUp("SM");
      setActiveMall(1);
    } else if (syspar?.data[0].ayala_mall_2022) {
      setMallHookUp("Ayala");
      setActiveMall(1);
    }else if (syspar?.data[0].sta_lucia) {
      setMallHookUp("Sta. Lucia");
      setActiveMall(1);
    }
  }, []);

  return (
    <>
      <form id="mallhookup-form" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-2 text-lg text-black font-montserrat font-extrabold">
            {syspar?.data[0].nexbridge
              ? activeMall
                ? `${mallHookUp} + Nexbridge`
                : "Nexbridge"
              : mallHookUp}
          </label>
        </div>
        {/* begin form robinson or megaworld or ortigas */}
        {syspar.data[0].robinson === 1 ||
        syspar.data[0].megaworld === 1 ||
        syspar.data[0].ortigas === 1 ? (
          <InputText
            handleInputChange={handleInputChange}
            name={"tenantid"}
            value={loadedData?.tenantid}
            id={"tenantid"}
            description={"Tenant ID"}
            maxLength={10}
          />
        ) : (
          ""
        )}

        {syspar.data[0].megaworld === 1 ? (
          <InputText
            handleInputChange={handleInputChange}
            name={"tenantcomcde"}
            value={loadedData?.tenantcomcde}
            id={"tenantcomcde"}
            description={"Tenant Code"}
          />
        ) : (
          ""
        )}

        {syspar.data[0].robinson === 1 ||
        syspar.data[0].megaworld === 1 ||
        syspar.data[0].ortigas === 1 ? (
          <InputText
            handleInputChange={handleInputChange}
            name={"postrmno"}
            value={loadedData?.postrmno}
            id={"postrmno"}
            description={"POS Terminal No."}
            maxLength={2}
          />
        ) : (
          ""
        )}
        {/* end form robinson or megaworld or ortigas */}

        {/* begin form sm */}
        {syspar.data[0].sm === 1 ? (
          <>
            <InputText
              handleInputChange={handleInputChange}
              name={"brcode"}
              value={loadedData?.brcode}
              id={"brcode"}
              description={"Branch Code / Mall Code"}
              maxLength={17}
            />
            <InputText
              handleInputChange={handleInputChange}
              name={"ncheck"}
              value={loadedData?.ncheck}
              id={"ncheck"}
              description={"New Tenant No."}
              maxLength={17}
            />
            <InputNumber
              handleInputChange={handleInputChange}
              name={"classc"}
              value={loadedData?.classc}
              id={"classc"}
              description={"Class Code"}
            />
            <InputText
              handleInputChange={handleInputChange}
              name={"storno"}
              value={loadedData?.storno}
              id={"storno"}
              description={"Outlet Number"}
            />
            <InputText
              handleInputChange={handleInputChange}
              name={"pos_machineno"}
              value={loadedData?.pos_machineno}
              id={"pos_machineno"}
              description={"Machine Number"}
            />
            <InputText
              handleInputChange={handleInputChange}
              name={"sales_type"}
              value={loadedData?.sales_type}
              id={"sales_type"}
              description={"Sales Type"}
            />
          </>
        ) : (
          ""
        )}
        {/* end form sm */}

        {/* begin form sm */}
        {syspar.data[0].sm_mall_2022 === 1 ? (
          <>
            <InputText
              handleInputChange={handleInputChange}
              name={"storno"}
              value={loadedData?.storno}
              id={"storno"}
              description={"Store Number"}
            />
            <InputText
              handleInputChange={handleInputChange}
              name={"serialno"}
              value={loadedData?.serialno}
              id={"serialno"}
              description={"Serial Number"}
              maxLength={10}
            />
          </>
        ) : (
          ""
        )}
        {/* end form sm */}

        {/* begin form ayala */}
        {syspar.data[0].ayala_mall_2022 === 1 ? (
          <>
            <InputText
              handleInputChange={handleInputChange}
              name={"tenantcomcde"}
              value={loadedData?.tenantcomcde}
              id={"tenantcomcde"}
              description={"Tenant Compay Code"}
            />
            <InputText
              handleInputChange={handleInputChange}
              name={"tenantnam"}
              value={loadedData?.tenantnam}
              id={"tenantnam"}
              description={"Tenant Name"}
            />
            <InputNumber
              handleInputChange={handleInputChange}
              name={"storno"}
              value={loadedData?.storno}
              id={"storno"}
              description={"Contract No."}
            />
            <InputNumber
              handleInputChange={handleInputChange}
              name={"postrmno"}
              value={loadedData?.postrmno}
              id={"postrmno"}
              description={"POS Terminal No."}
            />
          </>
        ) : (
          ""
        )}
      

      {syspar.data[0].sta_lucia === 1 ? (
          <>
            <InputText
              handleInputChange={handleInputChange}
              name={"tenantcomcde"}
              value={loadedData?.tenantcomcde}
              id={"tenantcomcde"}
              description={"Tenant Compay Code"}
            />
          </>
        ) : (
          ""
        )}


        {/* end form ayala */}

        {/* begin form ayala new req */}
        {syspar.data[0].ayala === 1 ? (
          <>
            <InputNumber
              handleInputChange={handleInputChange}
              name={"postrmno"}
              value={loadedData?.postrmno}
              id={"postrmno"}
              description={"POS Terminal No."}
            />
            <InputNumber
              handleInputChange={handleInputChange}
              name={"storno"}
              value={loadedData?.storno}
              id={"storno"}
              description={"Contract Number"}
            />
            <InputText
              handleInputChange={handleInputChange}
              name={"tenantnam"}
              value={loadedData?.tenantnam}
              id={"tenantnam"}
              description={"Tenant/Warehouse Name"}
            />
          </>
        ) : (
          ""
        )}
        {/* end form ayala new req */}

        {/* begin form shangrila or nexbridge */}
        {syspar.data[0].shangrila === 1 || syspar.data[0].nexbridge === 1 ? (
          <>
            <InputText
              handleInputChange={handleInputChange}
              name={"storcde"}
              value={loadedData?.storcde}
              id={"storcde"}
              description={"Store Code"}
            />
            {syspar.data[0].shangrila === 1 ? (
              <InputText
                handleInputChange={handleInputChange}
                name={"storno"}
                value={loadedData?.storno}
                id={"storno"}
                description={"Department No."}
              />
            ) : (
              ""
            )}
          </>
        ) : (
          ""
        )}
        {/* end form shangrila or nexbridge */}

        {/* begin form robinson */}
        {syspar.data[0].robinson === 1 ? (
          <>
            <Selection
              handleSelectChange={handleSelectChange}
              name={"sftp_robinson"}
              value={loadedData?.sftp_robinson}
              id={"sftp_robinson"}
              description={"Protocol"}
              keyValuePair={[
                {
                  key: "SFTP",
                  value: 1,
                },
                {
                  key: "FTP",
                  value: 0,
                },
              ]}
            />
            <InputText
              handleInputChange={handleInputChange}
              name={"ftphost"}
              value={loadedData?.ftphost}
              id={"ftphost"}
              description={"Host"}
            />
            <InputText
              handleInputChange={handleInputChange}
              name={"ftpuser"}
              value={loadedData?.ftpuser}
              id={"ftpuser"}
              description={"Username"}
            />
            <InputPassword
              handleInputChange={handleInputChange}
              name={"ftppword"}
              value={loadedData?.ftppword}
              id={"ftppword"}
              description={"Password"}
            />
            <InputNumber
              handleInputChange={handleInputChange}
              name={"ftpport"}
              value={loadedData?.ftpport}
              id={"ftpport"}
              description={"Port"}
            />
          </>
        ) : (
          ""
        )}
        {/* end form robinson */}

        {syspar?.data[0].sm === 1 ||
        syspar?.data[0].sm_mall_2022 ||
        syspar?.data[0].ayala === 1 ||
        syspar?.data[0].shangrila === 1 ||
        syspar?.data[0].robinson === 1 ? (
          <div className="shadow">
            <div className="m-7">
              <label className="block mb-2 text-lg text-black font-montserrat font-extrabold">
                Other
              </label>

              <InputText
                handleInputChange={handleInputChange}
                name={"pathfile"}
                value={loadedData?.pathfile}
                id={"pathfile"}
                description={"FTP Path File"}
              />

              {syspar.data[0].multitrmnal && mallHookUp === "Ayala" ? (
                <InputText
                  handleInputChange={handleInputChange}
                  name={"consolidated_pathfile"}
                  value={loadedData?.consolidated_pathfile}
                  id={"consolidated_pathfile"}
                  description={"Consolidated Path File"}
                />
              ) : (
                ""
              )}
            </div>
          </div>
        ) : (
          ""
        )}
      </form>

      <ButtonForm<Data>
        isShowWarningCancel
        dontEmptyUndefinedData
        data={loadedData}
        formName={"mallhookup-form"}
      />
    </>
  );
}
