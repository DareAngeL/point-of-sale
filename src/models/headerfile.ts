import { BaseModel } from "./basemodel";

export interface HeaderfileModel extends BaseModel {
  recid?: number;
  business1?: string;
  business2?: string;
  business3?: string;
  taxpayer?: string;
  tin?: string;
  address1?: string;
  address2?: string;
  address3?: string;
  serialno?: string;
  machineno?: string;
  tenantid?: number | undefined;
  postrmno?: string | undefined;
  brcode?: string;
  ncheck?: string;
  classc?: number;
  storno?: number;
  comdsc?: string;
  comcde?: string;
  brhcde?: string;
  brhdsc?: string;
  chknonvat?: number;
  pos_machineno?: string;
  storcde?: string;
  tenantnam?: string;
  tenantcomcde?: string;
  bnkcde?: string;
  sales_type?: string;
  warcde?: string;
}
