import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";
import { objToQueryStr } from "../../helper/StringHelper";

export const homeInit = createAsyncThunk(
  "service/home/init",
  async (usrcde: string) => {
    try {
      const response = await ApiService.get(
        `homeinit${objToQueryStr({ usrcde })}`
      );
      return response.data;
    } catch (e) {
      console.error(
        "There's an error while fetching the home initiation, please check the network: ",
        e
      );
      throw e;
    }
  }
);
