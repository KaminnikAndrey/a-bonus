import { CoinsHistoryListItemDto } from '@/components/coin/CoinsHistoryListItem';
import { instance } from '@/services/commonApi';
import { EnrollmentHistoryDTO, PageEnrollmentHistoryDTO } from '@/services/types';

export type CoinsHistoryData = {
    date: string
    data: CoinsHistoryListItemDto[]
}

const mapEnrollmentHistoryToListItem = (history: EnrollmentHistoryDTO): CoinsHistoryListItemDto => {
    return {
        fullname: history.student_name,
        coins: history.enrolled_coins,
    };
};

const groupHistoryByDate = (history: EnrollmentHistoryDTO[]): CoinsHistoryData[] => {
    const grouped: Record<string, CoinsHistoryListItemDto[]> = {};
    
    history.forEach(item => {
        const date = new Date(item.date).toLocaleDateString('ru-RU', { 
            day: 'numeric', 
            month: 'long',
            year: 'numeric'
        });
        if (!grouped[date]) {
            grouped[date] = [];
        }
        grouped[date].push(mapEnrollmentHistoryToListItem(item));
    });
    
    return Object.entries(grouped).map(([date, data]) => ({
        date,
        data,
    }));
};

/**
 * Получить всю историю начисления коинов преподавателем с пагинацией
 */
export const getAllCoinsHistory = async (page: number = 0, size: number = 20): Promise<{ success: boolean; data: CoinsHistoryData[]; pagination?: { hasMore: boolean; currentPage: number; totalPages: number }; error?: string }> => {
    try {
        const response = await instance.get<PageEnrollmentHistoryDTO>('/api/users/allCoinsHistory', {
            params: { page, size },
        });


        const history = response.data.content || [];
        return {
            success: true,
            data: groupHistoryByDate(history),
            pagination: {
                hasMore: !(response.data.last ?? true),
                currentPage: response.data.number ?? 0,
                totalPages: response.data.totalPages ?? 0,
            },
        };
    } catch (error: any) {
        try {
            const response = await instance.get<EnrollmentHistoryDTO[]>('/api/users/allCoinsHistory');
            return {
                success: true,
                data: groupHistoryByDate(response.data),
            };
        } catch (fallbackError: any) {
            return {
                success: false,
                error: fallbackError.response?.data?.message || error.response?.data?.message || 'Ошибка при получении истории начисления коинов',
                data: []
            };
        }
    }
};

