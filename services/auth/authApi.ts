import { UserDTO, UserRole } from '@/services/types';
import axios from 'axios';

// Жестко задаем URL
const BASE_URL = 'http://localhost:8080';

const authInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

/** Только в dev-сборке: войти без бэкенда (см. подсказку на экране входа). */
function tryDevMockLogin(
    loginValue: string,
    password: string
): { success: boolean; data?: { user: UserDTO }; error?: string } | null {
    if (!__DEV__) return null;
    const norm = loginValue.trim().toLowerCase();
    if (!password.trim()) return null;

    if (norm === 'mock-student') {
        return {
            success: true,
            data: {
                user: {
                    id: 1,
                    login: 'mock-student',
                    role: UserRole.STUDENT,
                    first_name: 'Демо',
                    last_name: 'Студент',
                    email: 'student@mock.local',
                },
            },
        };
    }
    if (norm === 'mock-teacher') {
        return {
            success: true,
            data: {
                user: {
                    id: 2,
                    login: 'mock-teacher',
                    role: UserRole.TEACHER,
                    first_name: 'Демо',
                    last_name: 'Преподаватель',
                    email: 'teacher@mock.local',
                },
            },
        };
    }
    return null;
}

export const login = async (
    loginValue: string,
    password: string
): Promise<{ success: boolean; data?: { user: UserDTO }; error?: string }> => {
    const mock = tryDevMockLogin(loginValue, password);
    if (mock) {
        console.log('🔵 Auth: dev mock login', loginValue.trim().toLowerCase());
        return mock;
    }

    try {
        console.log('🔵 Auth API:', loginValue);

        const credentials = `${loginValue}:${password}`;
        const encodedCredentials = btoa(credentials);

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
        console.log('🔴 Auth API error:', error.message);
        return {
            success: false,
            error: 'Неверный логин или пароль',
        };
    }
};