import { BaseModel } from "./basemodel";

export interface SpecialRequestModel extends BaseModel {
  modcde: string;
  modgrpcde: string;
  modifiergroupfiles: any;
}

export interface SpecialRequestDetailModel extends BaseModel {
  modcde : string;
  ordercde : string;
  modprc : number;
  orderitmid : string;
  tempid : string;

}