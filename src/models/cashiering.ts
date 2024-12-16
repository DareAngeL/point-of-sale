import { BaseModel } from "./basemodel";

export interface CashieringModel extends BaseModel {
  cashier: string;
  extprc: number;
  itmcde: string;
  logtim: string;
  postrmno: number;
  postrntyp: string;
  trndte: string;
  brhcde: string;
  trnstat: number;
  bnkcde: string;
}