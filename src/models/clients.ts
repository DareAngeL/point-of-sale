import {BaseModel} from "./basemodel";

export interface Clients extends BaseModel {
    ipaddress: string | undefined;
    port: string | undefined;
    terminal_name: string | undefined;
    has_zread?: number | 0
}
