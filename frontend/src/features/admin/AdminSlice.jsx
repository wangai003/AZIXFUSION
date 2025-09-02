import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchAllUsers, deleteUser, fetchAllProducts, deleteProduct, fetchAllServices, deleteService, fetchAllOrders, deleteOrder, fetchAllServiceRequests, deleteServiceRequest, fetchAllReviews, deleteReview } from './AdminApi';
import { axiosi } from '../../config/axios';

const initialState = {
  users: [],
  usersStatus: 'idle',
  usersError: null,
  userActionStatus: 'idle',
  userActionError: null,
  products: [],
  productsStatus: 'idle',
  productsError: null,
  productActionStatus: 'idle',
  productActionError: null,
  services: [],
  servicesStatus: 'idle',
  servicesError: null,
  serviceActionStatus: 'idle',
  serviceActionError: null,
  orders: [],
  ordersStatus: 'idle',
  ordersError: null,
  orderActionStatus: 'idle',
  orderActionError: null,
  serviceRequests: [],
  serviceRequestsStatus: 'idle',
  serviceRequestsError: null,
  serviceRequestActionStatus: 'idle',
  serviceRequestActionError: null,
  reviews: [],
  reviewsStatus: 'idle',
  reviewsError: null,
  reviewActionStatus: 'idle',
  reviewActionError: null,
};

export const fetchAllUsersAsync = createAsyncThunk('admin/fetchAllUsersAsync', async () => {
  const res = await fetchAllUsers();
  return res;
});

export const deleteUserAsync = createAsyncThunk('admin/deleteUserAsync', async (id) => {
  const res = await deleteUser(id);
  return res;
});

export const fetchAllProductsAsync = createAsyncThunk('admin/fetchAllProductsAsync', async () => {
  const res = await fetchAllProducts();
  return res;
});

export const deleteProductAsync = createAsyncThunk('admin/deleteProductAsync', async (id) => {
  const res = await deleteProduct(id);
  return res;
});

export const fetchAllServicesAsync = createAsyncThunk('admin/fetchAllServicesAsync', async () => {
  const res = await fetchAllServices();
  return res;
});

export const deleteServiceAsync = createAsyncThunk('admin/deleteServiceAsync', async (id) => {
  const res = await deleteService(id);
  return res;
});

export const fetchAllOrdersAsync = createAsyncThunk('admin/fetchAllOrdersAsync', async () => {
  const res = await fetchAllOrders();
  return res;
});

export const deleteOrderAsync = createAsyncThunk('admin/deleteOrderAsync', async (id) => {
  const res = await deleteOrder(id);
  return res;
});

export const fetchAllServiceRequestsAsync = createAsyncThunk('admin/fetchAllServiceRequestsAsync', async () => {
  const res = await fetchAllServiceRequests();
  return res;
});

export const deleteServiceRequestAsync = createAsyncThunk('admin/deleteServiceRequestAsync', async (id) => {
  const res = await deleteServiceRequest(id);
  return res;
});

export const fetchAllReviewsAsync = createAsyncThunk('admin/fetchAllReviewsAsync', async () => {
  const res = await fetchAllReviews();
  return res;
});

export const deleteReviewAsync = createAsyncThunk('admin/deleteReviewAsync', async (id) => {
  const res = await deleteReview(id);
  return res;
});

export const editUserAsync = createAsyncThunk('admin/editUserAsync', async ({ id, data }) => {
  const res = await axiosi.patch(`/users/${id}`, data);
  return res.data;
});

export const suspendUserAsync = createAsyncThunk('admin/suspendUserAsync', async (id) => {
  const res = await axiosi.patch(`/users/${id}`, { active: false });
  return res.data;
});

export const unsuspendUserAsync = createAsyncThunk('admin/unsuspendUserAsync', async (id) => {
  const res = await axiosi.patch(`/users/${id}`, { active: true });
  return res.data;
});

export const editProductAsync = createAsyncThunk('admin/editProductAsync', async ({ id, data }) => {
  const res = await axiosi.patch(`/products/${id}`, data);
  return res.data;
});

export const suspendProductAsync = createAsyncThunk('admin/suspendProductAsync', async (id) => {
  const res = await axiosi.patch(`/products/${id}`, { active: false });
  return res.data;
});

export const unsuspendProductAsync = createAsyncThunk('admin/unsuspendProductAsync', async (id) => {
  const res = await axiosi.patch(`/products/${id}`, { active: true });
  return res.data;
});

export const editServiceAsync = createAsyncThunk('admin/editServiceAsync', async ({ id, data }) => {
      const res = await axiosi.put(`/api/services/${id}`, data);
  return res.data;
});

export const suspendServiceAsync = createAsyncThunk('admin/suspendServiceAsync', async (id) => {
      const res = await axiosi.put(`/api/services/${id}`, { isActive: false });
  return res.data;
});

export const unsuspendServiceAsync = createAsyncThunk('admin/unsuspendServiceAsync', async (id) => {
      const res = await axiosi.put(`/api/services/${id}`, { isActive: true });
  return res.data;
});

export const editOrderAsync = createAsyncThunk('admin/editOrderAsync', async ({ id, data }) => {
  const res = await axiosi.patch(`/orders/${id}`, data);
  return res.data;
});

export const editServiceRequestAsync = createAsyncThunk('admin/editServiceRequestAsync', async ({ id, data }) => {
      const res = await axiosi.put(`/api/service-requests/${id}`, data);
  return res.data;
});

export const editReviewAsync = createAsyncThunk('admin/editReviewAsync', async ({ id, data }) => {
  const res = await axiosi.patch(`/reviews/${id}`, data);
  return res.data;
});

export const suspendReviewAsync = createAsyncThunk('admin/suspendReviewAsync', async (id) => {
  const res = await axiosi.patch(`/reviews/${id}`, { active: false });
  return res.data;
});

export const unsuspendReviewAsync = createAsyncThunk('admin/unsuspendReviewAsync', async (id) => {
  const res = await axiosi.patch(`/reviews/${id}`, { active: true });
  return res.data;
});

const adminSlice = createSlice({
  name: 'adminSlice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Users
      .addCase(fetchAllUsersAsync.pending, (state) => { state.usersStatus = 'pending'; })
      .addCase(fetchAllUsersAsync.fulfilled, (state, action) => { state.usersStatus = 'fulfilled'; state.users = action.payload; })
      .addCase(fetchAllUsersAsync.rejected, (state, action) => { state.usersStatus = 'rejected'; state.usersError = action.error; })
      .addCase(deleteUserAsync.pending, (state) => { state.userActionStatus = 'pending'; })
      .addCase(deleteUserAsync.fulfilled, (state, action) => { state.userActionStatus = 'fulfilled'; state.users = state.users.filter(u => u._id !== action.meta.arg); })
      .addCase(deleteUserAsync.rejected, (state, action) => { state.userActionStatus = 'rejected'; state.userActionError = action.error; })
      .addCase(editUserAsync.pending, (state) => { state.userActionStatus = 'pending'; })
      .addCase(editUserAsync.fulfilled, (state, action) => { state.userActionStatus = 'fulfilled'; state.users = state.users.map(u => u._id === action.payload._id ? action.payload : u); })
      .addCase(editUserAsync.rejected, (state, action) => { state.userActionStatus = 'rejected'; state.userActionError = action.error; })
      .addCase(suspendUserAsync.fulfilled, (state, action) => { state.users = state.users.map(u => u._id === action.payload._id ? action.payload : u); })
      .addCase(unsuspendUserAsync.fulfilled, (state, action) => { state.users = state.users.map(u => u._id === action.payload._id ? action.payload : u); })
      
      // Products
      .addCase(fetchAllProductsAsync.pending, (state) => { state.productsStatus = 'pending'; })
      .addCase(fetchAllProductsAsync.fulfilled, (state, action) => { state.productsStatus = 'fulfilled'; state.products = action.payload; })
      .addCase(fetchAllProductsAsync.rejected, (state, action) => { state.productsStatus = 'rejected'; state.productsError = action.error; })
      .addCase(deleteProductAsync.pending, (state) => { state.productActionStatus = 'pending'; })
      .addCase(deleteProductAsync.fulfilled, (state, action) => { state.productActionStatus = 'fulfilled'; state.products = state.products.filter(p => p._id !== action.meta.arg); })
      .addCase(deleteProductAsync.rejected, (state, action) => { state.productActionStatus = 'rejected'; state.productActionError = action.error; })
      .addCase(editProductAsync.pending, (state) => { state.productActionStatus = 'pending'; })
      .addCase(editProductAsync.fulfilled, (state, action) => { state.productActionStatus = 'fulfilled'; state.products = state.products.map(p => p._id === action.payload._id ? action.payload : p); })
      .addCase(editProductAsync.rejected, (state, action) => { state.productActionStatus = 'rejected'; state.productActionError = action.error; })
      .addCase(suspendProductAsync.fulfilled, (state, action) => { state.products = state.products.map(p => p._id === action.payload._id ? action.payload : p); })
      .addCase(unsuspendProductAsync.fulfilled, (state, action) => { state.products = state.products.map(p => p._id === action.payload._id ? action.payload : p); })
      
      // Services
      .addCase(fetchAllServicesAsync.pending, (state) => { state.servicesStatus = 'pending'; })
      .addCase(fetchAllServicesAsync.fulfilled, (state, action) => { state.servicesStatus = 'fulfilled'; state.services = action.payload; })
      .addCase(fetchAllServicesAsync.rejected, (state, action) => { state.servicesStatus = 'rejected'; state.servicesError = action.error; })
      .addCase(deleteServiceAsync.pending, (state) => { state.serviceActionStatus = 'pending'; })
      .addCase(deleteServiceAsync.fulfilled, (state, action) => { state.serviceActionStatus = 'fulfilled'; state.services = state.services.filter(s => s._id !== action.meta.arg); })
      .addCase(deleteServiceAsync.rejected, (state, action) => { state.serviceActionStatus = 'rejected'; state.serviceActionError = action.error; })
      .addCase(editServiceAsync.pending, (state) => { state.serviceActionStatus = 'pending'; })
      .addCase(editServiceAsync.fulfilled, (state, action) => { state.serviceActionStatus = 'fulfilled'; state.services = state.services.map(s => s._id === action.payload._id ? action.payload : s); })
      .addCase(editServiceAsync.rejected, (state, action) => { state.serviceActionStatus = 'rejected'; state.serviceActionError = action.error; })
      .addCase(suspendServiceAsync.fulfilled, (state, action) => { state.services = state.services.map(s => s._id === action.payload._id ? action.payload : s); })
      .addCase(unsuspendServiceAsync.fulfilled, (state, action) => { state.services = state.services.map(s => s._id === action.payload._id ? action.payload : s); })
      
      // Orders
      .addCase(fetchAllOrdersAsync.pending, (state) => { state.ordersStatus = 'pending'; })
      .addCase(fetchAllOrdersAsync.fulfilled, (state, action) => { state.ordersStatus = 'fulfilled'; state.orders = action.payload; })
      .addCase(fetchAllOrdersAsync.rejected, (state, action) => { state.ordersStatus = 'rejected'; state.ordersError = action.error; })
      .addCase(deleteOrderAsync.pending, (state) => { state.orderActionStatus = 'pending'; })
      .addCase(deleteOrderAsync.fulfilled, (state, action) => { state.orderActionStatus = 'fulfilled'; state.orders = state.orders.filter(o => o._id !== action.meta.arg); })
      .addCase(deleteOrderAsync.rejected, (state, action) => { state.orderActionStatus = 'rejected'; state.orderActionError = action.error; })
      .addCase(editOrderAsync.fulfilled, (state, action) => { state.orders = state.orders.map(o => o._id === action.payload._id ? action.payload : o); })
      
      // Service Requests
      .addCase(fetchAllServiceRequestsAsync.pending, (state) => { state.serviceRequestsStatus = 'pending'; })
      .addCase(fetchAllServiceRequestsAsync.fulfilled, (state, action) => { state.serviceRequestsStatus = 'fulfilled'; state.serviceRequests = action.payload; })
      .addCase(fetchAllServiceRequestsAsync.rejected, (state, action) => { state.serviceRequestsStatus = 'rejected'; state.serviceRequestsError = action.error; })
      .addCase(deleteServiceRequestAsync.pending, (state) => { state.serviceRequestActionStatus = 'pending'; })
      .addCase(deleteServiceRequestAsync.fulfilled, (state, action) => { state.serviceRequestActionStatus = 'fulfilled'; state.serviceRequests = state.serviceRequests.filter(r => r._id !== action.meta.arg); })
      .addCase(deleteServiceRequestAsync.rejected, (state, action) => { state.serviceRequestActionStatus = 'rejected'; state.serviceRequestActionError = action.error; })
      .addCase(editServiceRequestAsync.fulfilled, (state, action) => { state.serviceRequests = state.serviceRequests.map(r => r._id === action.payload._id ? action.payload : r); })
      
      // Reviews
      .addCase(fetchAllReviewsAsync.pending, (state) => { state.reviewsStatus = 'pending'; })
      .addCase(fetchAllReviewsAsync.fulfilled, (state, action) => { state.reviewsStatus = 'fulfilled'; state.reviews = action.payload; })
      .addCase(fetchAllReviewsAsync.rejected, (state, action) => { state.reviewsStatus = 'rejected'; state.reviewsError = action.error; })
      .addCase(deleteReviewAsync.pending, (state) => { state.reviewActionStatus = 'pending'; })
      .addCase(deleteReviewAsync.fulfilled, (state, action) => { state.reviewActionStatus = 'fulfilled'; state.reviews = state.reviews.filter(r => r._id !== action.meta.arg); })
      .addCase(deleteReviewAsync.rejected, (state, action) => { state.reviewActionStatus = 'rejected'; state.reviewActionError = action.error; })
      .addCase(editReviewAsync.fulfilled, (state, action) => { state.reviews = state.reviews.map(r => r._id === action.payload._id ? action.payload : r); })
      .addCase(suspendReviewAsync.fulfilled, (state, action) => { state.reviews = state.reviews.map(r => r._id === action.payload._id ? action.payload : r); })
      .addCase(unsuspendReviewAsync.fulfilled, (state, action) => { state.reviews = state.reviews.map(r => r._id === action.payload._id ? action.payload : r); });
  }
});

// Selectors
export const selectAdminUsers = (state) => state.AdminSlice.users;
export const selectAdminUsersStatus = (state) => state.AdminSlice.usersStatus;
export const selectAdminUsersError = (state) => state.AdminSlice.usersError;
export const selectAdminUserActionStatus = (state) => state.AdminSlice.userActionStatus;
export const selectAdminUserActionError = (state) => state.AdminSlice.userActionError;

export const selectAdminProducts = (state) => state.AdminSlice.products;
export const selectAdminProductsStatus = (state) => state.AdminSlice.productsStatus;
export const selectAdminProductsError = (state) => state.AdminSlice.productsError;
export const selectAdminProductActionStatus = (state) => state.AdminSlice.productActionStatus;
export const selectAdminProductActionError = (state) => state.AdminSlice.productActionError;

export const selectAdminServices = (state) => state.AdminSlice.services;
export const selectAdminServicesStatus = (state) => state.AdminSlice.servicesStatus;
export const selectAdminServicesError = (state) => state.AdminSlice.servicesError;
export const selectAdminServiceActionStatus = (state) => state.AdminSlice.serviceActionStatus;
export const selectAdminServiceActionError = (state) => state.AdminSlice.serviceActionError;

export const selectAdminOrders = (state) => state.AdminSlice.orders;
export const selectAdminOrdersStatus = (state) => state.AdminSlice.ordersStatus;
export const selectAdminOrdersError = (state) => state.AdminSlice.ordersError;
export const selectAdminOrderActionStatus = (state) => state.AdminSlice.orderActionStatus;
export const selectAdminOrderActionError = (state) => state.AdminSlice.orderActionError;

export const selectAdminServiceRequests = (state) => state.AdminSlice.serviceRequests;
export const selectAdminServiceRequestsStatus = (state) => state.AdminSlice.serviceRequestsStatus;
export const selectAdminServiceRequestsError = (state) => state.AdminSlice.serviceRequestsError;
export const selectAdminServiceRequestActionStatus = (state) => state.AdminSlice.serviceRequestActionStatus;
export const selectAdminServiceRequestActionError = (state) => state.AdminSlice.serviceRequestActionError;

export const selectAdminReviews = (state) => state.AdminSlice.reviews;
export const selectAdminReviewsStatus = (state) => state.AdminSlice.reviewsStatus;
export const selectAdminReviewsError = (state) => state.AdminSlice.reviewsError;
export const selectAdminReviewActionStatus = (state) => state.AdminSlice.reviewActionStatus;
export const selectAdminReviewActionError = (state) => state.AdminSlice.reviewActionError;

export default adminSlice.reducer; 