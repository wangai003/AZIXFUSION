import { axiosi } from '../../config/axios';
import { getFirebaseIdToken } from '../../utils/getFirebaseIdToken';

export const fetchSellerServices = async (providerId) => {
  try {
    const idToken = await getFirebaseIdToken();
    const res = await axiosi.get(`/api/services?provider=${providerId}`, {
      headers: idToken ? { Authorization: `Bearer ${idToken}` } : {}
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching seller services:', error);
    throw error.response?.data || error.message || 'Failed to fetch services';
  }
};

export const fetchAllServices = async () => {
  try {
    const res = await axiosi.get('/api/services');
    return res.data;
  } catch (error) {
    console.error('Error fetching all services:', error);
    throw error.response?.data || error.message || 'Failed to fetch services';
  }
};

export const addService = async (data) => {
  try {
    const idToken = await getFirebaseIdToken();
    console.log('Adding service with data:', data);
    console.log('Using token:', idToken ? 'Present' : 'Missing');
    
    const res = await axiosi.post('/api/services', data, {
      headers: {
        'Content-Type': 'application/json',
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
      }
    });
    
    console.log('Service added successfully:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error adding service:', error);
    console.error('Error response:', error.response);
    throw error.response?.data || error.message || 'Failed to add service';
  }
};

export const updateService = async (id, data) => {
  try {
    const idToken = await getFirebaseIdToken();
    const res = await axiosi.put(`/api/services/${id}`, data, {
      headers: {
        'Content-Type': 'application/json',
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
      }
    });
    return res.data;
  } catch (error) {
    console.error('Error updating service:', error);
    throw error.response?.data || error.message || 'Failed to update service';
  }
};

export const deleteService = async (id) => {
  try {
    const idToken = await getFirebaseIdToken();
    const res = await axiosi.delete(`/api/services/${id}`, {
      headers: idToken ? { Authorization: `Bearer ${idToken}` } : {}
    });
    return res.data;
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error.response?.data || error.message || 'Failed to delete service';
  }
}; 