import {BaseModel} from "./basemodel";

export interface ItemComboModel extends BaseModel {
  // itmcde: string;
  // itmcomcde: string;
  // itmdsc: string;
  // upgprc: number;
  // itmcomtyp: string;
  itmcde: string;
  itmcomcde: string;
  itmdsc: string;
  untmea: string;
  itmcomtyp: string;
  upgprc: string;
  itmcderef: null | string;
  itmnum: string;
  combodocnum: string;
}
