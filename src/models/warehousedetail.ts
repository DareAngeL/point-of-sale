import { BaseModel } from "./basemodel";

export interface WarehouseDetailsModel extends BaseModel{
    warcde? : string;
    postypcde : string;
    prccde : string;
    is_active? : number;
}