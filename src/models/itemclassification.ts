import {BaseModel} from "./basemodel";
import {ItemSubclassificationModel} from "./itemsubclassification";

export interface ItemClassificationModel extends BaseModel {
  itmclacde: string;
  itmcladsc: string;
  itemsubclassfiles: ItemSubclassificationModel[];
  locationcde: string;
  inactive_class: number;
}
