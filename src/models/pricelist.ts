import {BaseModel} from "./basemodel";
import {PriceDetailModel} from "./pricedetail";

export interface PricelistModel extends BaseModel {
  prccde: string;
  prcdsc: string;
  brhcde: string;
  pricecodefile2s: PriceDetailModel[];
  // ordertyp: string;
  postypcde: string;
}
