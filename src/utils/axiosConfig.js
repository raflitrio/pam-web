import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const API_BASE_URL2 = process.env.REACT_APP_API_URL2;
export const userApiClient = axios.create({
    baseURL: API_BASE_URL2,
    withCredentials: true,
});

export let currentCsrfToken = null;

// Fungsi untuk mengambil CSRF token dari backend
export const fetchCsrfToken = async () => {
    try {
        const { data } = await apiClient.get('/csrf-token');
        return data.csrfToken;
    } catch (error) {
        return null;
    }
};

// Fungsi untuk refresh CSRF token
const refreshCSRFToken = async () => {
    try {
        const response = await apiClient.get('/csrf-token');
        const csrfToken = response.data.csrfToken;
        currentCsrfToken = csrfToken;
        apiClient.defaults.headers.common['X-CSRF-Token'] = csrfToken;
        userApiClient.defaults.headers.common['X-CSRF-Token'] = csrfToken;
        return csrfToken;
    } catch (error) {
        return null;
    }
};

// Fungsi untuk inisialisasi CSRF token saat aplikasi dimuat
export const initializeCsrfToken = async () => {
    try {
        const response = await apiClient.get('/csrf-token');
        const csrfToken = response.data.csrfToken;
        currentCsrfToken = csrfToken;
        apiClient.defaults.headers.common['X-CSRF-Token'] = csrfToken;
        userApiClient.defaults.headers.common['X-CSRF-Token'] = csrfToken;
        return csrfToken;
    } catch (error) {
        return null;
    }
};

// Interceptor untuk request Axios
apiClient.interceptors.request.use(
    async (config) => {
         if (currentCsrfToken && !config.headers['X-CSRF-Token'] && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method.toUpperCase())) {
            config.headers['X-CSRF-Token'] = currentCsrfToken;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor untuk response Axios (menangani kasus token CSRF tidak valid dari server)
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 403 && error.response?.data?.message?.includes('CSRF')) {
            try {
                const newToken = await refreshCSRFToken();
                if (newToken) {
                    error.config.headers['X-CSRF-Token'] = newToken;
                    return apiClient.request(error.config);
                }
            } catch (refreshError) {
                // Token refresh failed
            }
        }
        return Promise.reject(error);
    }
);

userApiClient.interceptors.request.use(
    async (config) => {
         if (currentCsrfToken && !config.headers['X-CSRF-Token'] && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method.toUpperCase())) {
            config.headers['X-CSRF-Token'] = currentCsrfToken;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

userApiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 403 && error.response?.data?.message?.includes('CSRF')) {
            try {
                const newToken = await refreshCSRFToken();
                if (newToken) {
                    error.config.headers['X-CSRF-Token'] = newToken;
                    return userApiClient.request(error.config);
                }
            } catch (refreshError) {
                // Token refresh failed
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;