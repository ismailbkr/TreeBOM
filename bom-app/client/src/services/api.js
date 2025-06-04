import axios from 'axios';

// Backend sunucumuzun adresi
const API_BASE_URL = 'http://localhost:3001/api';

// Axios instance oluştur - her istekte tekrar yazmamak için
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 saniye timeout
});

// İstek interceptor - Her API çağrısından önce çalışır
apiClient.interceptors.request.use(
    (config) => {
        console.log(`API İsteği: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('İstek hatası:', error);
        return Promise.reject(error);
    }
);

// Yanıt interceptor - Her API yanıtından sonra çalışır
apiClient.interceptors.response.use(
    (response) => {
        console.log(`API Yanıtı: ${response.status} - ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('Yanıt hatası:', error);
        return Promise.reject(error);
    }
);

// Product API fonksiyonları
export const productAPI = {
    // Tüm root ürünleri getir
    getRootProducts: async () => {
        const response = await apiClient.get('/products');
        return response.data;
    },

    // Tüm ürünleri getir
    getAllProducts: async () => {
        const response = await apiClient.get('/products/all');
        return response.data;
    },

    // Belirli bir ürünü getir
    getProduct: async (id) => {
        const response = await apiClient.get(`/products/${id}`);
        return response.data;
    },

    // Ürünün çocuklarını getir
    getProductChildren: async (id) => {
        const response = await apiClient.get(`/products/${id}/children`);
        return response.data;
    },

    // Yeni ürün oluştur
    createProduct: async (productData) => {
        const response = await apiClient.post('/products', productData);
        return response.data;
    },

    // Ürün güncelle
    updateProduct: async (id, productData) => {
        const response = await apiClient.put(`/products/${id}`, productData);
        return response.data;
    },

    // Ürün sil
    deleteProduct: async (id) => {
        const response = await apiClient.delete(`/products/${id}`);
        return response.data;
    },

    // Ürün arama
    searchProducts: async (query) => {
        const response = await apiClient.get(`/products/search?q=${encodeURIComponent(query)}`);
        return response.data;
    },

    // Ürünü başka bir parent'a taşı
    moveProduct: async (id, newParentId) => {
        const response = await apiClient.put(`/products/${id}/move`, {
            newParentId: newParentId
        });
        return response.data;
    }
};

export default apiClient; 