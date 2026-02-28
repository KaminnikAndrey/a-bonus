import { Student } from "@/components/group/StudentListItem";
import { instance } from '@/services/commonApi';
import { GroupDTO, PageGroupDto, UserDTO } from '@/services/types';

export type Group = {
    id: string
    name: string
}

const mapGroupDTOToGroup = (groupDTO: GroupDTO): Group => {
    return {
        id: groupDTO.id?.toString() || '',
        name: groupDTO.group_name,
    };
};

const mapUserDTOToStudent = (userDTO: UserDTO): Student => {
    return {
        id: userDTO.id?.toString() || '',
        fullname: userDTO.full_name || `${userDTO.last_name} ${userDTO.first_name} ${userDTO.middle_name || ''}`.trim(),
        coins: (0).toString(),
    };
};

/**
 * Получить все группы, доступные текущему пользователю
 */
export const getAllGroups = async (page: number = 0, size: number = 20): Promise<{ success: boolean; data: Group[]; pagination?: { hasMore: boolean; currentPage: number; totalPages: number }; error?: string }> => {
    try {
        const response = await instance.get<PageGroupDto>('/api/groups',  {
            params: { page, size },
        });

        const groups = response.data.content || [];

        return {
            success: true,
            data: groups.map(mapGroupDTOToGroup),
            pagination: {
                hasMore: !(response.data.last ?? true),
                currentPage: response.data.number ?? 0,
                totalPages: response.data.totalPages ?? 0,
            },
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.message || 'Ошибка при получении групп',
            data: []
        };
    }
};

/**
 * Получить всех студентов группы
 */
export const getAllStudentsByGroup = async (groupId: string): Promise<{ success: boolean; data: Student[]; error?: string }> => {
    try {
        const response = await instance.get<GroupDTO>(`/api/groups/${groupId}`);
        const students = response.data.students || [];
        return {
            success: true,
            data: students.map(mapUserDTOToStudent),
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.message || 'Ошибка при получении студентов',
            data: []
        };
    }
};


/**
 * Зачислить алгокоины студентам
 * Использует новый API для начисления коинов каждому студенту
 * Каждый студент получает количество коинов, указанное в его поле coins
 */
export const giveCoinsToStudens = async (groupId: string, studentList: Student[]): Promise<{ success: boolean; error?: string }> => {
    try {
        // Начисляем коины каждому студенту индивидуально
        const promises = studentList
            .filter(student => student.coins && parseInt(student.coins) > 0)
            .map(student => {
                const coins = parseInt(student.coins);
                return instance.put<UserDTO>(`/api/users/${student.id}/coins`, coins);
            });
        
        if (promises.length === 0) {
            return {
                success: false,
                error: 'Не указано количество коинов для начисления',
            };
        }
        
        await Promise.all(promises);
        
        return {
            success: true,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.message || 'Ошибка при начислении коинов',
        };
    }
};