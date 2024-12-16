import { DineTypeModel } from "../../../../models/dinetype";

export interface FreeTransaction {
  trndte: string;
  freereason: string;
  ordocnum: string;
  itmdsc: string;
  itmqty: number;
  untprc: number;
  postypefile?: DineTypeModel;
}