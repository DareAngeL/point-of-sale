import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";
import { FooterModel } from "../../models/footer";
import { HeaderfileModel } from "../../models/headerfile";

export const getHeader = createAsyncThunk(
  "service/headerfile/get",
  async () => {
    try {
      const response = await ApiService.get("headerfile");
      return response.data;
    } catch (error) {
      console.error("Error fetching header:", error);
      throw error;
    }
  }
);

export const getFooter = createAsyncThunk("service/footer/get", async () => {
  try {
    const response = await ApiService.get("footer");
    return response.data;
  } catch (error) {
    console.error("Error fetching footer:", error);
    throw error;
  }
});

export const putFooter = createAsyncThunk(
  "service/footer/put",
  async (payload: FooterModel) => {
    try {
      const response = await ApiService.put("footer", payload);
      return response.data;
    } catch (error) {
      console.error("Error updating footer:", error);
      throw error;
    }
  }
);

export const putHeader = createAsyncThunk(
  "service/header/put",
  async (payload: HeaderfileModel) => {
    try {
      const response = await ApiService.put("headerfile", payload);
      return response.data;
    } catch (error) {
      console.error("Error updating header:", error);
      throw error;
    }
  }
);

export const saveReceipt = createAsyncThunk(
  "service/receipt/save",
  async (payload: {
    trantype: string;
    date?: string;
    usePassedDate?: boolean;
    formData: FormData;
    config: { [index: string]: any };
  }) => {
    try {
      const response = await ApiService.post(
        `receiptorderfilepath/?transaction=${payload.trantype}&date=${payload.date}&usePassedDate=${payload.usePassedDate}`,
        payload.formData,
        payload.config
      );
      return response.data;
    } catch (error) {
      console.error("Error saving receipt:", error);
      throw error;
    }
  }
);
