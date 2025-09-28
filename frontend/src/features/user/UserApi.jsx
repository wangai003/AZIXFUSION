import { axiosi } from "../../config/axios";
import { getFirebaseIdToken } from "../../utils/getFirebaseIdToken";

export const fetchLoggedInUserById=async(id)=>{
    try {
        const res=await axiosi.get(`/users/${id}`)
        return res.data
    } catch (error) {
        throw error.response?.data || error.message || "Unknown error"
    }
}
export const updateUserById=async(update)=>{
    try {
        const res=await axiosi.patch(`/users/${update._id}`,update)
        return res.data
    } catch (error) {
        throw error.response?.data || error.message || "Unknown error"
    }
}

export const becomeSeller = async (data) => {
    try {
        const idToken = await getFirebaseIdToken();
        const res = await axiosi.post('/users/become-seller', data, {
            headers: idToken ? { Authorization: `Bearer ${idToken}` } : {}
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message || "Unknown error"
    }
};

export const fetchSellerDashboard = async () => {
    try {
        const res = await axiosi.get('/users/seller/dashboard');
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message || "Unknown error"
    }
};

export const becomeExperienceHost = async (data) => {
    try {
        const idToken = await getFirebaseIdToken();
        const res = await axiosi.post('/users/become-experience-host', data, {
            headers: idToken ? { Authorization: `Bearer ${idToken}` } : {}
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message || "Unknown error"
    }
};

export const becomeExporter = async (data) => {
    try {
        const idToken = await getFirebaseIdToken();
        const res = await axiosi.post('/users/apply-exporter', data, {
            headers: idToken ? { Authorization: `Bearer ${idToken}` } : {}
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message || "Unknown error"
    }
};