import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../../services";
import { ThemeModel } from "../../../models/theme";

export const getTheme = createAsyncThunk("theme/get", async () => {
  try {
    const response = await ApiService.get("theme");
    return response.data; 
  } catch (err) {
    console.error(err);
    return null;
  }
});

export const putTheme = createAsyncThunk("theme/put", async (theme: ThemeModel) => {
  try {
    const response = await ApiService.put("theme", theme);
    return response.data;
  } catch (err) {
    console.error(err);
    return null;
  }
});