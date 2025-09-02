import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createServiceRequest, fetchServiceRequests, fetchServiceRequestById, updateServiceRequest, deleteServiceRequest, createApplication, fetchApplications, updateApplication } from './ServiceRequestApi';

const initialState = {
  requests: [],
  requestsStatus: 'idle',
  requestsError: null,
  requestActionStatus: 'idle',
  requestActionError: null,
  applications: [],
  applicationsStatus: 'idle',
  applicationsError: null,
  applicationActionStatus: 'idle',
  applicationActionError: null,
};

export const createServiceRequestAsync = createAsyncThunk('serviceRequests/createServiceRequestAsync', async (data) => {
  return await createServiceRequest(data);
});
export const fetchServiceRequestsAsync = createAsyncThunk('serviceRequests/fetchServiceRequestsAsync', async (params) => {
  return await fetchServiceRequests(params);
});
export const fetchServiceRequestByIdAsync = createAsyncThunk('serviceRequests/fetchServiceRequestByIdAsync', async (id) => {
  return await fetchServiceRequestById(id);
});
export const updateServiceRequestAsync = createAsyncThunk('serviceRequests/updateServiceRequestAsync', async ({ id, data }) => {
  return await updateServiceRequest(id, data);
});
export const deleteServiceRequestAsync = createAsyncThunk('serviceRequests/deleteServiceRequestAsync', async (id) => {
  return await deleteServiceRequest(id);
});
export const createApplicationAsync = createAsyncThunk('serviceRequests/createApplicationAsync', async ({ id, data }) => {
  return await createApplication(id, data);
});
export const fetchApplicationsAsync = createAsyncThunk('serviceRequests/fetchApplicationsAsync', async (id) => {
  return await fetchApplications(id);
});
export const updateApplicationAsync = createAsyncThunk('serviceRequests/updateApplicationAsync', async ({ id, data }) => {
  return await updateApplication(id, data);
});

const serviceRequestSlice = createSlice({
  name: 'ServiceRequestSlice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServiceRequestsAsync.pending, (state) => {
        state.requestsStatus = 'pending';
      })
      .addCase(fetchServiceRequestsAsync.fulfilled, (state, action) => {
        state.requestsStatus = 'fulfilled';
        state.requests = action.payload;
      })
      .addCase(fetchServiceRequestsAsync.rejected, (state, action) => {
        state.requestsStatus = 'rejected';
        state.requestsError = action.error;
      })
      .addCase(createServiceRequestAsync.pending, (state) => {
        state.requestActionStatus = 'pending';
      })
      .addCase(createServiceRequestAsync.fulfilled, (state, action) => {
        state.requestActionStatus = 'fulfilled';
        state.requests.push(action.payload);
      })
      .addCase(createServiceRequestAsync.rejected, (state, action) => {
        state.requestActionStatus = 'rejected';
        state.requestActionError = action.error;
      })
      .addCase(updateServiceRequestAsync.pending, (state) => {
        state.requestActionStatus = 'pending';
      })
      .addCase(updateServiceRequestAsync.fulfilled, (state, action) => {
        state.requestActionStatus = 'fulfilled';
        const idx = state.requests.findIndex(r => r._id === action.payload._id);
        if (idx !== -1) state.requests[idx] = action.payload;
      })
      .addCase(updateServiceRequestAsync.rejected, (state, action) => {
        state.requestActionStatus = 'rejected';
        state.requestActionError = action.error;
      })
      .addCase(deleteServiceRequestAsync.pending, (state) => {
        state.requestActionStatus = 'pending';
      })
      .addCase(deleteServiceRequestAsync.fulfilled, (state, action) => {
        state.requestActionStatus = 'fulfilled';
        state.requests = state.requests.filter(r => r._id !== action.meta.arg);
      })
      .addCase(deleteServiceRequestAsync.rejected, (state, action) => {
        state.requestActionStatus = 'rejected';
        state.requestActionError = action.error;
      })
      .addCase(fetchApplicationsAsync.pending, (state) => {
        state.applicationsStatus = 'pending';
      })
      .addCase(fetchApplicationsAsync.fulfilled, (state, action) => {
        state.applicationsStatus = 'fulfilled';
        state.applications = action.payload;
      })
      .addCase(fetchApplicationsAsync.rejected, (state, action) => {
        state.applicationsStatus = 'rejected';
        state.applicationsError = action.error;
      })
      .addCase(createApplicationAsync.pending, (state) => {
        state.applicationActionStatus = 'pending';
      })
      .addCase(createApplicationAsync.fulfilled, (state, action) => {
        state.applicationActionStatus = 'fulfilled';
        state.applications.push(action.payload);
      })
      .addCase(createApplicationAsync.rejected, (state, action) => {
        state.applicationActionStatus = 'rejected';
        state.applicationActionError = action.error;
      })
      .addCase(updateApplicationAsync.pending, (state) => {
        state.applicationActionStatus = 'pending';
      })
      .addCase(updateApplicationAsync.fulfilled, (state, action) => {
        state.applicationActionStatus = 'fulfilled';
        const idx = state.applications.findIndex(a => a._id === action.payload._id);
        if (idx !== -1) state.applications[idx] = action.payload;
      })
      .addCase(updateApplicationAsync.rejected, (state, action) => {
        state.applicationActionStatus = 'rejected';
        state.applicationActionError = action.error;
      });
  },
});

export const selectServiceRequests = (state) => state.ServiceRequestSlice.requests;
export const selectServiceRequestsStatus = (state) => state.ServiceRequestSlice.requestsStatus;
export const selectServiceRequestsError = (state) => state.ServiceRequestSlice.requestsError;
export const selectServiceRequestActionStatus = (state) => state.ServiceRequestSlice.requestActionStatus;
export const selectServiceRequestActionError = (state) => state.ServiceRequestSlice.requestActionError;
export const selectApplications = (state) => state.ServiceRequestSlice.applications;
export const selectApplicationsStatus = (state) => state.ServiceRequestSlice.applicationsStatus;
export const selectApplicationsError = (state) => state.ServiceRequestSlice.applicationsError;
export const selectApplicationActionStatus = (state) => state.ServiceRequestSlice.applicationActionStatus;
export const selectApplicationActionError = (state) => state.ServiceRequestSlice.applicationActionError;

export default serviceRequestSlice.reducer; 