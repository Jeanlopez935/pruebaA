import axios from 'axios';

const client = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the auth token
client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('ueagru_token');
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default client;
