import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";

export const getMenus = createAsyncThunk("service/menus/get", async () => {
  try {
    const response = await ApiService.get("menus");
    return response.data;
  } catch (error) {
    console.error("Error while fetching menu: ", error);
    throw new Error("Failed to fetch menus: " + error);
  }
});

export const getMenusMasterfile = createAsyncThunk(
  "service/menusMasterfile/get",
  async () => {
    try {
      const response = await ApiService.get("menus/masterfile");
      return response.data;
    } catch (error) {
      console.error("Error while fetching master file menu: ", error);
      throw new Error("Failed to fetch menus masterfile: " + error);
    }
  }
);
