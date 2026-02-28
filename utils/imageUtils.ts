import { store } from '@/stores/auth/authStore';
import { encode } from 'base-64';

/**
 * Получить заголовки авторизации для загрузки изображений
 */
export const getAuthHeaders = (): Record<string, string> => {
    const userCreds = store.getState().auth.creds;
    if (userCreds && userCreds.login && userCreds.password) {
        const credentials = `${userCreds.login}:${userCreds.password}`;
        const encodedCredentials = encode(credentials);
        return {
            'Authorization': `Basic ${encodedCredentials}`,
        };
    }
    return {};
};

