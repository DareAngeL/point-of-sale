import { BaseModel } from "./basemodel";

export interface DineTypeModel extends BaseModel{
    postypcde : string;
    postypdsc : string;
    ordertyp : string;
}