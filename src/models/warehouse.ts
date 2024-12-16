import { BaseModel } from "./basemodel";
import { WarehouseDetailsModel } from "./warehousedetail";

export interface WarehouseModel extends BaseModel{
    warcde : string;
    wardsc : string;
    brhcde : string;
    warehousefile2s : WarehouseDetailsModel[];
}