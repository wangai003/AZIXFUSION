import { axiosi } from '../../config/axios';

export const createServiceRequest = async (data) => {
  const res = await axiosi.post('/api/service-requests', data);
  return res.data;
};

export const fetchServiceRequests = async (params) => {
  const res = await axiosi.get('/api/service-requests', { params });
  return res.data;
};

export const fetchServiceRequestById = async (id) => {
  const res = await axiosi.get(`/api/service-requests/${id}`);
  return res.data;
};

export const updateServiceRequest = async (id, data) => {
  const res = await axiosi.put(`/api/service-requests/${id}`, data);
  return res.data;
};

export const deleteServiceRequest = async (id) => {
  const res = await axiosi.delete(`/api/service-requests/${id}`);
  return res.data;
};

export const createApplication = async (id, data) => {
  const res = await axiosi.post(`/api/service-requests/${id}/apply`, data);
  return res.data;
};

export const fetchApplications = async (id) => {
  const res = await axiosi.get(`/api/service-requests/${id}/applications`);
  return res.data;
};

export const updateApplication = async (id, data) => {
  const res = await axiosi.put(`/api/service-requests/applications/${id}`, data);
  return res.data;
}; 