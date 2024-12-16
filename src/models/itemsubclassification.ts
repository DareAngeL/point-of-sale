import {BaseModel} from "./basemodel";
import { ItemClassificationModel } from "./itemclassification";
import {ItemModel} from "./items";

export interface ItemSubclassificationModel extends BaseModel {
  itemsubclasscde: string;
  itemsubclassdsc: string;
  itmclacde: string;
  itemfiles: ItemModel[];
  hide_subclass: boolean;
  locationcde: string;
  itemclassfile: ItemClassificationModel | undefined
}
