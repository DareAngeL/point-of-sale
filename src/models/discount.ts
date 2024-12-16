import {BaseModel} from "./basemodel";

export interface DiscountModel extends BaseModel {
  chkpos: number;
  disamt: number;
  discde: string;
  disdsc: string;
  disper: number;
  distyp: string;
  exemptvat: string;
  nolessvat: number;
  govdisc: number;
  hookupdisc: string;
  scharge: number;
  online_deals: number;
}

export interface DiscountOrderModel extends BaseModel {
  itmcde: string;
  orderitmid: string;
  discde: string;
  distyp: string;
  disamt: number;
  disper: number;
  tempid: string;
  ordercde: string;
  amtdis: number;
  salwoutvat: number;
  lessvatadj: number;
  exemptvat: string;
  disid: string;
  nolessvat: number;
  govdisc: number;
  scharge: number;
}
