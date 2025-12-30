import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true // Para enviar cookies de sesión
});

export default api;
