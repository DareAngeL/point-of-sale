import { BaseModel } from "../../../../models/basemodel";

export interface OrderingModel extends BaseModel{
    tabletrncde : string;
    ordercde : string;
    cusdsc : string;
    status : string;
    opentime : string;
    closetime : string;
    postypcde : string;
    warcde : string;
    paxcount : number;
}