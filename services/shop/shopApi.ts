import { ShopItemListInfo } from "@/components/shop/ShopItemList";
import { appendMockOrder } from '@/services/orders/mockOrdersStore';
import { instance } from '@/services/commonApi';
import { PagePresentDTO, PresentResponse } from '@/services/types';
import { store } from '@/stores/auth/authStore';
import type { ImageSourcePropType } from 'react-native';

export type ShopItemInfo = {
    title: string
    price: number
    stock: number
    images: string[]
    /** Публичные URL, без Basic Auth (мок-картинки). */
    imagesWithoutAuth?: boolean
    /** Локальные картинки (мок), без запросов по сети. */
    localImages?: ImageSourcePropType[]
}

/** Демо-витрина без бэкенда (логин mock-student), совпадает с макетом «Магазин подарков» в Figma. */
function isDevMockShopStudent(): boolean {
    if (!__DEV__) return false;
    const login = store.getState()?.auth?.creds?.login?.trim().toLowerCase() ?? '';
    return login === 'mock-student';
}

/** Локальные файлы: assets/images/shop/ */
const MOCK_SHOP_IMAGE_BY_ID: Record<string, ImageSourcePropType> = {
    '1': require('@/assets/images/shop/shop-pen-university.png'),
    '2': require('@/assets/images/shop/shop-hoodie-university.png'),
    '3': require('@/assets/images/shop/shop-tshirt-university.png'),
    '4': require('@/assets/images/shop/shop-pen-company-2.png'),
    '5': require('@/assets/images/shop/shop-notebook-university.png'),
    '6': require('@/assets/images/shop/shop-pen-company.png'),
};

const DEV_MOCK_SHOP_LIST: ShopItemListInfo[] = [
    {
        id: '1',
        localImage: MOCK_SHOP_IMAGE_BY_ID['1'],
        title: 'Ручка с логотипом вуза',
        price: 25,
    },
    {
        id: '2',
        localImage: MOCK_SHOP_IMAGE_BY_ID['2'],
        title: 'Худи с логотипом вуза',
        price: 100,
    },
    {
        id: '3',
        localImage: MOCK_SHOP_IMAGE_BY_ID['3'],
        title: 'Футболка с логотипом вуза - длинный загол...',
        price: 75,
    },
    {
        id: '4',
        localImage: MOCK_SHOP_IMAGE_BY_ID['4'],
        title: 'Блокнот с логотипом вуза',
        price: 20,
    },
    {
        id: '5',
        localImage: MOCK_SHOP_IMAGE_BY_ID['5'],
        title: 'Ручка с логотипом компании',
        price: 25,
    },
    {
        id: '6',
        localImage: MOCK_SHOP_IMAGE_BY_ID['6'],
        title: 'Ручка с логотипом компании',
        price: 25,
    },
];

export const getMockShopItemById = (id: string): ShopItemInfo | null => {
    const row = DEV_MOCK_SHOP_LIST.find((item) => item.id === id);
    if (!row) return null;
    const asset = MOCK_SHOP_IMAGE_BY_ID[id];
    return {
        title: row.title,
        price: row.price,
        stock: 10,
        images: [],
        localImages: asset ? [asset] : [],
    };
};

const mapPresentToShopItemList = (present: PresentResponse, baseUrl: string): ShopItemListInfo => {
    const firstPhotoId = present.photoIds && present.photoIds.length > 0 ? present.photoIds[0] : null;
    const photoUri = firstPhotoId
        ? `${baseUrl}/api/presents/${present.id}/photos/${firstPhotoId}`
        : '';
    return {
        id: present.id.toString(),
        uri: photoUri || undefined,
        title: present.name,
        price: present.priceCoins,
    };
};

const mapPresentToShopItem = async (present: PresentResponse, baseUrl: string): Promise<ShopItemInfo> => {
    // Получаем все фотографии
    const imageUris = present.photoIds.map(photoId => 
        `${baseUrl}/api/presents/${present.id}/photos/${photoId}`
    );

    
    return {
        title: present.name,
        price: present.priceCoins,
        stock: present.stock,
        images: imageUris,
    };
};


export const getAllShopItems = async (page: number = 0, size: number = 20): Promise<{ success: boolean; data: ShopItemListInfo[]; pagination?: { hasMore: boolean; currentPage: number; totalPages: number }; error?: string }> => {
    if (isDevMockShopStudent()) {
        return {
            success: true,
            data: page === 0 ? DEV_MOCK_SHOP_LIST : [],
            pagination: {
                hasMore: false,
                currentPage: 0,
                totalPages: 1,
            },
        };
    }
    try {
        const response = await instance.get<PagePresentDTO>('/api/presents', {
            params: { page, size },
        });

        const baseUrl = instance.defaults.baseURL || '';
        const presents = response.data.content || [];
        return {
            success: true,
            data: presents.map(present => mapPresentToShopItemList(present, baseUrl)),
            pagination: {
                hasMore: !(response.data.last ?? true),
                currentPage: response.data.number ?? 0,
                totalPages: response.data.totalPages ?? 0,
            },
        };
    } catch (error: any) {
        return {
            success: false,
            data: [],
            error: error.response?.data?.message || 'Ошибка при получении подарков',
        };
    }
};

/**
 * Получить подарок по ID
 */
export const getShopItem = async (id: string): Promise<{ success: boolean; data?: ShopItemInfo; error?: string }> => {
    if (isDevMockShopStudent()) {
        const mock = getMockShopItemById(id);
        if (mock) {
            return { success: true, data: mock };
        }
        return { success: false, error: 'Подарок не найден' };
    }
    try {
        const response = await instance.get<PresentResponse>(`/api/presents/${id}`);
        const baseUrl = instance.defaults.baseURL || '';
        const shopItem = await mapPresentToShopItem(response.data, baseUrl);
        
        return {
            success: true,
            data: shopItem,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.message || 'Ошибка при получении подарка',
        };
    }
};

/**
 * Заказать подарок
 * Использует новый API для создания заказа
 */
export const orderShopItem = async (id: string): Promise<{ success: boolean; data?: any; error?: string }> => {
    if (isDevMockShopStudent() && getMockShopItemById(id)) {
        try {
            await appendMockOrder(id);
        } catch {
            return { success: false, error: 'Не удалось сохранить заказ' };
        }
        return { success: true, data: { mock: true } };
    }
    try {
        const response = await instance.post('/api/orders', null, {
            params: { presentId: parseInt(id) },
        });
        return {
            success: true,
            data: response.data,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.message || 'Ошибка при создании заказа',
        };
    }
}