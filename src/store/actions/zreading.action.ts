import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";

export const generateZReading = createAsyncThunk(
  "service/zread",
  async (query: string) => {
    try {
      const result = await ApiService.get(`xzreading/generate${query}`);
      return result.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const generateGrandtotal = createAsyncThunk(
  "service/grandtotal",
  async (data: { query: string; data: any }) => {
    try {
      const result = await ApiService.post(
        `posfile/zreading${data.query}`,
        data.data
      );
      return result.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const getOpenTransactions = createAsyncThunk(
  "service/openTransactions",
  async () => {
    try {
      const result = await ApiService.get("transaction/prevActive");
      return result.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const autoTransfer = createAsyncThunk(
  "service/autoTransfer",
  async () => {
    try {
      const result = await ApiService.get("eodautotransfer");
      return result.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const generateRobinsonMallFile = createAsyncThunk(
  "service/robinson",
  async (data: any) => {
    try {
      const result = await ApiService.post(`mallhookup/robinson`, data);
      return { data: result.data, status: result.status };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const generateStaLuciaMallFile = createAsyncThunk(
  "service/stalucia",
  async (data: any) => {
    try {
      const result = await ApiService.post(`mallhookup/stalucia`, data);
      return { data: result.data, status: result.status };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const generateMegaworldMallFile = createAsyncThunk(
  "service/megaworld",
  async (data: any) => {
    try {
      const result = await ApiService.post(`mallhookup/megaworld`, data);
      return { data: result.data, status: result.status };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);
