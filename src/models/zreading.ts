import { BaseModel } from "./basemodel";

export interface ZReadingModel extends BaseModel {
  postrntyp: string;
  itmcde: string;
  extprc: number;
  trndte: string;
  logtim: string;
  batchnum: string;
  upload_status: string;
  postrmno: number;
  brhcde: string;
  trnstat: number;
  cashier: string;
}
