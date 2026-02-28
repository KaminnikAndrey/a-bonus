import { instance } from '@/services/commonApi';
import { UserDTO } from '@/services/types';

export interface Profile {
    id: string
    login: string
    fullName: string
    email: string
    birthDate: string
    algocoins: number
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
