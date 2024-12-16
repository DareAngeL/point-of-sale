import { BaseModel } from "./basemodel";

export interface PriceDetailModel extends BaseModel{
    [index: string]: unknown; // Add index signature
    prccde : string;
    itmcde : string;
    itmdsc : string;
    untmea : string;
    groprc : number;
    curcde : string;
    untcst : number;
    untprc : number;
}