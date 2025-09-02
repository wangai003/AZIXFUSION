import {axiosi} from '../../config/axios'


export const createOrder=async(order)=>{
    try {
        // Handle payment based on payment mode
        if (order.paymentMode === 'Mpesa') {
            const mpesaRes = await axiosi.post('/payments/mpesa/stkpush', {
                amount: order.total,
                orderData: order
            });
            return mpesaRes.data;
        } else if (order.paymentMode === 'Crypto') {
            const cryptoRes = await axiosi.post('/payments/crypto', {
                amount: order.total,
                network: order.network,
                walletAddress: order.walletAddress,
                orderData: order
            });
            return cryptoRes.data;
        } else {
            // For other payment methods (COD, etc.)
            const res = await axiosi.post("/orders", order);
            return res.data;
        }
    } catch (error) {
        throw error.response?.data || error.message || "Unknown error";
    }
}

export const getOrderByUserId=async(id)=>{
    try {
        const res=await axiosi.get(`/orders/user/${id}`)
        return res.data
    } catch (error) {
        throw error.response?.data || error.message || "Unknown error";
    }
}

export const getAllOrders=async()=>{
    try {
        const res=await axiosi.get(`/orders`)
        return res.data
    } catch (error) {
        throw error.response?.data || error.message || "Unknown error";
    }
}

export const updateOrderById=async(update)=>{
    try {
        const res=await axiosi.patch(`/orders/${update._id}`,update)
        return res.data
    } catch (error) {
        throw error.response?.data || error.message || "Unknown error";
    }
}

export const fetchSellerOrders = async (sellerId) => {
  const res = await axiosi.get(`/orders?seller=${sellerId}`);
  return res.data;
};

export const updateOrderStatus = async (id, data) => {
  const res = await axiosi.put(`/orders/${id}`, data);
  return res.data;
};

export const fetchBuyerOrders = async (buyerId) => {
  const res = await axiosi.get(`/orders?buyer=${buyerId}`);
  return res.data;
};