import {createAsyncThunk} from "@reduxjs/toolkit";
import {ApiService} from "../../services";
import { objToQueryStr } from "../../helper/StringHelper";

export const getMEMC = createAsyncThunk("service/memc", async () => {
  try {
    const response = await ApiService.get("memc");
    return response.data;
  } catch (error) {
    console.error("Error while fetching MEMC: ", error)
    throw new Error('Failed to fetch MEMC data');
  }
});

export const getSingleMEMC = createAsyncThunk("service/memc/single", async (obj: object) => {
  try {
    const query = objToQueryStr(obj);
    const response = await ApiService.get(`memc/filter${query}`);
    return response.data;
  } catch (error) {
    console.error("Error while fetching single MEMC: ", error)
    throw new Error('Failed to fetch single MEMC data');
  }
});