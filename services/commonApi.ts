import { logout } from '@/stores/auth/authStore';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { encode } from 'base-64';
import Config from "react-native-config";

// Создаем переменную для store
let store: any = null;

// Функция для установки store извне
export const setStore = (storeInstance: any) => {
    store = storeInstance;
    console.log('Store установлен в API');
};

// Временно убираем динамический импорт, чтобы не мешал
// import('@/stores/auth/authStore').then((authStore) => {
//     store = authStore.store;
// }).catch(err => {
//     console.log('Store not yet initialized, will be set via setStore()');
// });

const BASE_URL = 'http://localhost:8080';

export const instance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // Добавляем подробное логирование
    console.log('Interceptor request: store =', store ? 'есть' : 'нет');

    if (!store) {
        console.log('Store не инициализирован, пропускаем авторизацию');
        return config;
    }

    try {
        const state = store.getState();
        console.log('State получен:', state ? 'да' : 'нет');

        const userCreds = state?.auth?.creds;
        console.log('userCreds:', userCreds);

        if (userCreds?.login && userCreds?.password) {
            const credentials = `${userCreds.login}:${userCreds.password}`;
            const encodedCredentials = encode(credentials);
            config.headers.Authorization = `Basic ${encodedCredentials}`;
            console.log('Добавлен Authorization header');
        }
    } catch (error) {
        console.log('Ошибка доступа к store:', error);
    }

    return config;
});

instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401 && store) {
            try {
                store.dispatch(logout());
                console.log('Dispatch logout выполнен');
            } catch (e) {
                console.log('Ошибка dispatch logout:', e);
            }
        }
        console.log('API Error:', error.request?.responseURL || error.message);
        return Promise.reject(error);
    }
);