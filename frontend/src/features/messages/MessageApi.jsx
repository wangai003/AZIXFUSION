import { axiosi } from '../../config/axios';

export const fetchConversations = async () => {
  // Implement conversation fetching logic (group by user/order/service)
  // Placeholder: fetch all messages and group in frontend
  const res = await axiosi.get('/api/messages');
  return res.data;
};

export const fetchMessages = async (userId, order, service) => {
  const params = {};
  if (userId) params.userId = userId;
  if (order) params.order = order;
  if (service) params.service = service;
  const res = await axiosi.get('/api/messages', { params });
  return res.data;
};

export const sendMessage = async (data) => {
  const res = await axiosi.post('/api/messages', data);
  return res.data;
}; 