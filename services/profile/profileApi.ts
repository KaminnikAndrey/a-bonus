import { instance } from '@/services/commonApi';
import { UserDTO } from '@/services/types';
import { store } from '@/stores/auth/authStore';

export interface Profile {
    id: string
    login: string
    fullName: string
    email: string
    birthDate: string
    algocoins: number
    /** Накопленный опыт (ранги). Пока только демо / будущее поле API. */
    experiencePoints?: number
}

/** Профиль без запроса к API при демо-входе (см. authApi tryDevMockLogin). */
function getDevMockProfile(): Profile | null {
    if (!__DEV__) return null;
    const login = store.getState()?.auth?.creds?.login?.trim().toLowerCase() ?? '';
    if (login === 'mock-student') {
        return {
            id: '1',
            login: 'mock-student',
            fullName: 'Демо Студент Патронович',
            email: 'student@mock.local',
            birthDate: '15.03.2005',
            algocoins: 1250,
            experiencePoints: 450,
        };
    }
    if (login === 'mock-teacher') {
        return {
            id: '2',
            login: 'mock-teacher',
            fullName: 'Демо Преподаватель Иванович',
            email: 'teacher@mock.local',
            birthDate: '22.07.1988',
            algocoins: 0,
        };
    }
    return null;
}

const mapUserDTOToProfile = (userDTO: UserDTO): Profile => {
    return {
        id: userDTO.id?.toString() || '',
        login: userDTO.login,
        fullName: userDTO.full_name || `${userDTO.last_name} ${userDTO.first_name} ${userDTO.middle_name || ''}`.trim(),
        email: userDTO.email,
        birthDate: userDTO.date_of_birth || '',
        algocoins: userDTO.coins || 0,
    };
};

/**
 * Получить информацию о текущем пользователе
 */
export const getProfileInfo = async (userId?: string): Promise<{ success: boolean; data?: Profile; error?: string }> => {
    const mock = getDevMockProfile();
    if (mock) {
        return { success: true, data: mock };
    }
    try {
        const response = await instance.get<UserDTO>('/api/users/me');
        return {
            success: true,
            data: mapUserDTOToProfile(response.data),
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.message || 'Ошибка при получении профиля',
        };
    }
};

/**
 * Получить баланс алгокоинов текущего пользователя
 */
export const getAlgocoins = async (userId?: string): Promise<{ success: boolean; data?: number; error?: string }> => {
    const mock = getDevMockProfile();
    if (mock) {
        return { success: true, data: mock.algocoins };
    }
    try {
        const response = await instance.get<UserDTO>('/api/users/me');
        return {
            success: true,
            data: response.data.coins || 0,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.message || 'Ошибка при получении баланса',
        };
    }
};
