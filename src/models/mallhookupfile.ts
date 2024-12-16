import { BaseModel } from "./basemodel";
import { MallHookup2Model } from "./mallhookupfile2";

export interface MallHookupModel extends BaseModel {
  mallname: string;
  mallfields?: MallHookup2Model[];
}