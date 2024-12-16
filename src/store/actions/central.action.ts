import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";
import { toast } from "react-toastify";

export const getCentralBranches = createAsyncThunk(
  "central/getCentralBranches",
  async (
    payload: {
      url: string;
      opts: { [index: string]: any };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await ApiService.customEndpointPost(
        payload.url,
        {},
        payload.opts
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getCentralTenant = createAsyncThunk(
  "central/getCentralTenant",
  async (
    payload: {
      url: string;
      opts: { [index: string]: any };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await ApiService.customEndpointPost(
        payload.url,
        {},
        payload.opts
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getCentralMasterfileLogs = createAsyncThunk(
  "central/getCentralMasterfileLogs",
  async (
    payload: {
      url: string;
      opts: { [index: string]: any };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await ApiService.customEndpointPost(
        payload.url,
        {},
        payload.opts
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getPOSMasterfilelog = createAsyncThunk(
  "central/getPOSMasterfilelog",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiService.get("masterfilelog");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const saveBranches = createAsyncThunk(
  "central/saveBranches",
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await ApiService.put("branchfile", payload);
      console.log("Response on saving the branch", response);
      return response.data;
    } catch (error: any) {
      toast.error("Something went wrong when saving branches.", {
        hideProgressBar: true,
        position: "top-center",
        autoClose: 2000,
      });
      return rejectWithValue(error.response.data);
    }
  }
);

export const getCentralServerDir = createAsyncThunk(
  "central/getCentralServerDir",
  async (
    payload: {
      url: string;
      opts: { [index: string]: any };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await ApiService.customEndpointPost(
        payload.url,
        {},
        payload.opts
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getCentralConnection = createAsyncThunk(
  "central/getCentralConnection",
  async (
    payload: {
      url: string;
      opts: { [index: string]: any };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await ApiService.customEndpointPost(
        payload.url,
        {},
        payload.opts
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);
