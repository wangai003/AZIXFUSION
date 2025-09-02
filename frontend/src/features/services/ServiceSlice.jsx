import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchSellerServices, fetchAllServices, addService, updateService, deleteService } from './ServiceApi';

const initialState = {
  sellerServices: [],
  sellerServicesStatus: 'idle',
  sellerServicesError: null,
  serviceActionStatus: 'idle',
  serviceActionError: null,
  allServices: [],
  allServicesStatus: 'idle',
  allServicesError: null,
};

export const fetchSellerServicesAsync = createAsyncThunk('services/fetchSellerServicesAsync', async (providerId) => {
  return await fetchSellerServices(providerId);
});

export const fetchAllServicesAsync = createAsyncThunk('services/fetchAllServicesAsync', async () => {
  return await fetchAllServices();
});

export const addServiceAsync = createAsyncThunk('services/addServiceAsync', async (data) => {
  return await addService(data);
});

export const updateServiceAsync = createAsyncThunk('services/updateServiceAsync', async ({ id, data }) => {
  return await updateService(id, data);
});

export const deleteServiceAsync = createAsyncThunk('services/deleteServiceAsync', async (id) => {
  return await deleteService(id);
});

const serviceSlice = createSlice({
  name: 'ServiceSlice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSellerServicesAsync.pending, (state) => {
        state.sellerServicesStatus = 'pending';
      })
      .addCase(fetchSellerServicesAsync.fulfilled, (state, action) => {
        state.sellerServicesStatus = 'fulfilled';
        state.sellerServices = action.payload;
      })
      .addCase(fetchSellerServicesAsync.rejected, (state, action) => {
        state.sellerServicesStatus = 'rejected';
        state.sellerServicesError = action.error;
      })
      .addCase(fetchAllServicesAsync.pending, (state) => {
        state.allServicesStatus = 'pending';
      })
      .addCase(fetchAllServicesAsync.fulfilled, (state, action) => {
        state.allServicesStatus = 'fulfilled';
        state.allServices = action.payload;
      })
      .addCase(fetchAllServicesAsync.rejected, (state, action) => {
        state.allServicesStatus = 'rejected';
        state.allServicesError = action.error;
      })
      .addCase(addServiceAsync.pending, (state) => {
        state.serviceActionStatus = 'pending';
      })
      .addCase(addServiceAsync.fulfilled, (state, action) => {
        state.serviceActionStatus = 'fulfilled';
        state.sellerServices.push(action.payload);
      })
      .addCase(addServiceAsync.rejected, (state, action) => {
        state.serviceActionStatus = 'rejected';
        state.serviceActionError = action.error;
      })
      .addCase(updateServiceAsync.pending, (state) => {
        state.serviceActionStatus = 'pending';
      })
      .addCase(updateServiceAsync.fulfilled, (state, action) => {
        state.serviceActionStatus = 'fulfilled';
        const idx = state.sellerServices.findIndex(s => s._id === action.payload._id);
        if (idx !== -1) state.sellerServices[idx] = action.payload;
      })
      .addCase(updateServiceAsync.rejected, (state, action) => {
        state.serviceActionStatus = 'rejected';
        state.serviceActionError = action.error;
      })
      .addCase(deleteServiceAsync.pending, (state) => {
        state.serviceActionStatus = 'pending';
      })
      .addCase(deleteServiceAsync.fulfilled, (state, action) => {
        state.serviceActionStatus = 'fulfilled';
        state.sellerServices = state.sellerServices.filter(s => s._id !== action.meta.arg);
      })
      .addCase(deleteServiceAsync.rejected, (state, action) => {
        state.serviceActionStatus = 'rejected';
        state.serviceActionError = action.error;
      });
  },
});

export const selectSellerServices = (state) => state.ServiceSlice.sellerServices;
export const selectSellerServicesStatus = (state) => state.ServiceSlice.sellerServicesStatus;
export const selectSellerServicesError = (state) => state.ServiceSlice.sellerServicesError;
export const selectServiceActionStatus = (state) => state.ServiceSlice.serviceActionStatus;
export const selectServiceActionError = (state) => state.ServiceSlice.serviceActionError;
export const selectAllServices = (state) => state.ServiceSlice.allServices;
export const selectAllServicesStatus = (state) => state.ServiceSlice.allServicesStatus;
export const selectAllServicesError = (state) => state.ServiceSlice.allServicesError;

export default serviceSlice.reducer; 