import { axiosi } from "../../config/axios";

export const addProduct=async(data)=>{
    try {
        const res=await axiosi.post('/products',data)
        return res.data
    } catch (error) {
        throw error.response?.data || error.message || "Unknown error";
    }
}
export const fetchProducts=async(filters)=>{

    let queryString=''

    console.log('🔍 ProductApi - fetchProducts called with filters:', filters);

    if(filters.brand){
        queryString+=`brand=${filters.brand.join(',')}&`
    }
    if(filters.category){
        queryString+=`category=${filters.category.join(',')}&`
    }
    if(filters.subcategory){
        queryString+=`subcategory=${filters.subcategory.join(',')}&`
    }
    if(filters.element){
        queryString+=`element=${filters.element.join(',')}&`
    }

    if(filters.pagination){
        queryString+=`page=${filters.pagination.page}&limit=${filters.pagination.limit}&`
    }

    if(filters.sort){
        queryString+=`sort=${JSON.stringify(filters.sort)}&`
    }

    if(filters.user){
        queryString+=`user=${filters.user}&`
    }

    // FIXED: Add the missing isGoodsSellerProduct filter
    if(filters.isGoodsSellerProduct !== undefined){
        queryString+=`isGoodsSellerProduct=${filters.isGoodsSellerProduct}&`
    }

    // Add other filters that might be needed
    if(filters.searchQuery){
        queryString+=`search=${filters.searchQuery}&`
    }

    // Add country filter
    if(filters.country){
        queryString+=`country=${filters.country}&`
    }

    // Add timestamp to bypass caching
    queryString+=`_t=${Date.now()}&`

    console.log('🔍 ProductApi - Final query string:', queryString);
    console.log('🔍 ProductApi - Full URL will be:', `/products?${queryString}`);
    
    try {
        const res=await axiosi.get(`/products?${queryString}`)
        console.log('🔍 ProductApi - Full response:', res.data);
        
        // Handle the correct API response structure
        if (res.data && res.data.success) {
            const products = res.data.data || [];
            const pagination = res.data.pagination || {};
            
            console.log('🔍 ProductApi - Products count:', products.length);
            console.log('🔍 ProductApi - Pagination:', pagination);
            
            return {
                data: products,
                totalResults: pagination.totalResults || products.length
            };
        } else {
            console.log('🔍 ProductApi - Response not successful or missing data');
            return {
                data: [],
                totalResults: 0
            };
        }
    } catch (error) {
        console.error('❌ ProductApi - Error:', error);
        // Return empty data structure on error to prevent crashes
        return {
            data: [],
            totalResults: 0
        };
    }
}
export const fetchProductById=async(id)=>{
    try {
        const res=await axiosi.get(`/products/${id}`)
        console.log('🔍 ProductApi - fetchProductById response:', res.data);
        
        // Handle the correct API response structure
        if (res.data && res.data.success) {
            const product = res.data.data;
            console.log('🔍 ProductApi - fetchProductById product:', product);
            return product;
        } else {
            console.log('🔍 ProductApi - fetchProductById response not successful');
            throw new Error(res.data?.message || 'Product not found');
        }
    } catch (error) {
        console.error('❌ ProductApi - fetchProductById error:', error);
        throw error.response?.data || error.message || "Unknown error";
    }
}
export const updateProductById=async(update)=>{
    try {
        const res=await axiosi.patch(`/products/${update._id}`,update)
        return res.data
    } catch (error) {
        throw error.response?.data || error.message || "Unknown error";
    }
}
export const undeleteProductById=async(id)=>{
    try {
        const res=await axiosi.patch(`/products/undelete/${id}`)
        return res.data
    } catch (error) {
        throw error.response?.data || error.message || "Unknown error";
    }
}
export const deleteProductById=async(id)=>{
    try {
        const res=await axiosi.delete(`/products/${id}`)
        return res.data
    } catch (error) {
        throw error.response?.data || error.message || "Unknown error";
    }
}

export const fetchSellerProducts = async (sellerId) => {
  try {
    const res = await axiosi.get(`/products?seller=${sellerId}`);
    console.log('🔍 ProductApi - fetchSellerProducts response:', res.data);
    
    // Handle the correct API response structure
    if (res.data && res.data.success) {
      const products = res.data.data || [];
      console.log('🔍 ProductApi - fetchSellerProducts products count:', products.length);
      return products; // Return just the products array for seller products
    } else {
      console.log('🔍 ProductApi - fetchSellerProducts response not successful');
      return [];
    }
  } catch (error) {
    console.error('❌ ProductApi - fetchSellerProducts error:', error);
    return [];
  }
};

export const updateProduct = async (id, data) => {
  const res = await axiosi.put(`/products/${id}`, data);
  return res.data;
};

export const deleteProduct = async (id) => {
  const res = await axiosi.delete(`/products/${id}`);
  return res.data;
};

// Fetch featured products with highest ratings
export const fetchFeaturedProducts = async (limit = 8, filters = {}) => {
  try {
    let queryString = `limit=${limit}`;

    // Add country filter if provided
    if (filters.country) {
      queryString += `&country=${filters.country}`;
    }

    const res = await axiosi.get(`/products/featured?${queryString}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return { success: false, data: [] };
  }
};
