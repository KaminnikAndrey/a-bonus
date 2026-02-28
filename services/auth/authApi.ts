import { UserDTO } from '@/services/types';
import axios from 'axios';
import { encode } from 'base-64';
import Config from "react-native-config";

// Базовый URL API (можно переопределить через переменную окружения)
const BASE_URL = Config.BASE_SERVER_URL || 'http://localhost:8079';

// Создаем отдельный instance для авторизации без токена
const authInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Функция авторизации с использованием Basic Authorization
 */
export const login = async (
    loginValue: string, 
    password: string
): Promise<{ success: boolean; data?: { user: UserDTO }; error?: string }> => {
    try {
        // Создаем Basic Authorization заголовок
        const credentials = `${loginValue}:${password}`;
        const encodedCredentials = encode(credentials);
        
        // Выполняем запрос с Basic Authorization
        const response = await authInstance.get<UserDTO>('/api/users/me', {
            headers: {
                'Authorization': `Basic ${encodedCredentials}`,
            },
        });

        return {
            success: true,
            data: {
                user: response.data,
            },
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.message || 'Неверный логин или пароль',
        };
    }
};

