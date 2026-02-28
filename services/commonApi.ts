
import { logout, store } from '@/stores/auth/authStore';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { encode } from 'base-64';
import Config from "react-native-config";

const BASE_URL = Config.BASE_SERVER_URL || 'http://localhost:8079';

export const instance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

instance.interceptors.request.use( (config: InternalAxiosRequestConfig) => {
    
    const userCreds = store.getState().auth.creds;
    if(userCreds && userCreds.login && userCreds.password) {
        const credentials = `${userCreds.login}:${userCreds.password}`;
        const encodedCredentials = encode(credentials);
        config.headers.Authorization = `Basic ${encodedCredentials}`;
    }
    return config;
});

instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Неверные учетные данные - выходим из системы
            store.dispatch(logout());
        }
        console.log(error.request.responseURL);
        console.log(error);
        return Promise.reject(error);
    }
);

