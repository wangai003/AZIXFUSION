import {axiosi} from '../../config/axios'

export const createReview=async(review)=>{
    try {
        const res=await axiosi.post('/reviews',review)
        return res.data
    } catch (error) {
        throw error.response?.data || error.message || "Unknown error";
    }
}
export const fetchReviewsByProductId=async(id)=>{
    try {
        const res=await axiosi.get(`/reviews/product/${id}`)
        return res.data
    } catch (error) {
        throw error.response?.data || error.message || "Unknown error";
    }
}

export const updateReviewById=async(update)=>{
    try {
        const res=await axiosi.patch(`/reviews/${update._id}`,update)
        return res.data
    } catch (error) {
        throw error.response?.data || error.message || "Unknown error";
    }
}
export const deleteReviewById=async(id)=>{
    try {
        const res=await axiosi.delete(`/reviews/${id}`)
        return res.data
    } catch (error) {
        throw error.response?.data || error.message || "Unknown error";
    }
}

export const fetchProductReviews = async (productId) => {
  const res = await axiosi.get(`/reviews/product/${productId}`);
  return res.data;
};

export const fetchServiceReviews = async (serviceId) => {
  const res = await axiosi.get(`/reviews/service/${serviceId}`);
  return res.data;
};

export const fetchUserReviews = async (userId) => {
  const res = await axiosi.get(`/reviews/user/${userId}`);
  return res.data;
};