import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";
import { SystemParametersModel } from "../../models/systemparameters";

export const getSysPar = createAsyncThunk(
  "service/systemparameters/get",
  async () => {
    try {
      const response = await ApiService.get("systemparameters");
      return response.data;
    } catch (error) {
      console.error("Error fetching system parameters:", error);
      throw error;
    }
  }
);

export const putSysPar = createAsyncThunk(
  "service/systemparameters/put",
  async (data: SystemParametersModel) => {
    try {
      const response = await ApiService.put("systemparameters", data);
      return response.data;
    } catch (error) {
      console.error("Error updating system parameters:", error);
      throw error;
    }
  }
);

export const getDefaultBackupPath = createAsyncThunk(
  "service/systemparameters/defaultbackuppath",
  async () => {
    try {
      const response = await ApiService.get("systemparameters/def_backup_path");
      return response.data;
    } catch (error) {
      console.error("Error fetching default backup path:", error);
      throw error;
    }
  }
);

export const getMallhookupList = createAsyncThunk(
  "service/systemparameters/mallhookuplist",
  async () => {
    try {
      const response = await ApiService.get("systemparameters/mallhookuplist");
      return response.data;
    } catch (error) {
      console.error("Error fetching mall hookup list:", error);
      throw error;
    }
  }
);

export const getSysparOrdocnum = createAsyncThunk(
  "service/systemparameters/getOrdocnum",
  async () => {
    try {
      const response = await ApiService.get("systemparameters/getOrdocnum");
      return response.data;
    } catch (error) {
      console.error("Error fetching syspar or docnum:", error);
      throw error;
    }
  }
);

export const clearHeader = createAsyncThunk(
  "service/systemparameters/clearHeader",
  async () => {
    try {
      const response = await ApiService.put("systemparameters/clearHeader", {});
      return response.data;
    } catch (error) {
      console.error("Error clearing header:", error);
      throw error;
    }
  }
);
