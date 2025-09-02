import { axiosi } from '../../config/axios';

export const fetchAllUsers = async () => {
  const res = await axiosi.get('/users');
  return res.data;
};
export const deleteUser = async (id) => {
  const res = await axiosi.delete(`/users/${id}`);
  return res.data;
};

export const fetchAllProducts = async () => {
  const res = await axiosi.get('/products');
  return res.data;
};
export const deleteProduct = async (id) => {
  const res = await axiosi.delete(`/products/${id}`);
  return res.data;
};

export const fetchAllServices = async () => {
  const res = await axiosi.get('/api/services');
  return res.data;
};
export const deleteService = async (id) => {
  const res = await axiosi.delete(`/api/services/${id}`);
  return res.data;
};

export const fetchAllOrders = async () => {
  const res = await axiosi.get('/orders');
  return res.data;
};
export const deleteOrder = async (id) => {
  const res = await axiosi.delete(`/orders/${id}`);
  return res.data;
};

export const fetchAllServiceRequests = async () => {
  const res = await axiosi.get('/api/service-requests');
  return res.data;
};
export const deleteServiceRequest = async (id) => {
  const res = await axiosi.delete(`/api/service-requests/${id}`);
  return res.data;
};

export const fetchAllReviews = async () => {
  const res = await axiosi.get('/reviews');
  return res.data;
};
export const deleteReview = async (id) => {
  const res = await axiosi.delete(`/reviews/${id}`);
  return res.data;
}; 