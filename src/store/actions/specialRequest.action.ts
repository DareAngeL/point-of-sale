import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";

export const getSpecialRequest = createAsyncThunk(
  "service/specialrequest",
  async () => {
    try {
      const response = await ApiService.get("specialrequest");
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const getSpecialRequestGroup = createAsyncThunk(
  "service/specialrequestgroup",
  async () => {
    try {
      const response = await ApiService.get("specialrequestgroup");
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const getSpecialRequestDetails = createAsyncThunk(
  "specialrequest/details",
  async () => {
    try {
      const response = await ApiService.get(`specialrequest/details`);
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const getSpecialRequestByOrdercode = createAsyncThunk(
  "specialrequest/ordercode",
  async (ordercode: string) => {
    try {
      const response = await ApiService.get(
        `specialrequest/details/${ordercode}`
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);
