import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";

export const getMasterFile = createAsyncThunk(
  "service/getmasterfile",
  async () => {
    try {
      const response = await ApiService.get("getmasterfile");
      return response.data;
    } catch (error) {
      console.error("Error while fetching the master file: ", error);
      throw error;
    }
  }
);

export const getMasterFileLog = createAsyncThunk(
  "service/masterfilelog",
  async () => {
    try {
      const response = await ApiService.get("masterfilelog");
      return response.data;
    } catch (error) {
      console.error("Error while fetching Master file log: ", error);
      throw error;
    }
  }
);

export const validateMasterfileDeletion = createAsyncThunk(
  "service/validatemasterfiledeletion",
  async (data: { url: string; query: string }) => {
    try {
      const response = await ApiService.get(
        `validatemasterfiledeletion/${data.url}${data.query}`
      );
      return response.data;
    } catch (error) {
      console.error("Error while validating master file deletion: ", error);
      throw error;
    }
  }
);
