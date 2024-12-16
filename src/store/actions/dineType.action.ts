import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";

export const getDineType = createAsyncThunk("service/dineType", async () => {
  try {
    const response = await ApiService.get("dinetype/all");
    return response.data;
  } catch (e) {
    console.error(
      "There's an error while fetching the dine type, please check the network: ",
      e
    );
    throw e;
  }
});

export const getDineTypeByPosType = createAsyncThunk(
  "ordering/getDineType",
  async (postypcde: string, { rejectWithValue }) => {
    try {
      const response = await ApiService.get(`/dinetype/${postypcde}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);
