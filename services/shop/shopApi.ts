import { ShopItemListInfo } from "@/components/shop/ShopItemList";
import { instance } from '@/services/commonApi';
import { PagePresentDTO, PresentResponse } from '@/services/types';

export type ShopItemInfo = {
    title: string
    price: number
    stock: number
    images: string[]
}

const mapPresentToShopItemList = (present: PresentResponse, baseUrl: string): ShopItemListInfo => {
    const firstPhotoId = present.photoIds && present.photoIds.length > 0 ? present.photoIds[0] : null;
    const photoUri = firstPhotoId
        ? `${baseUrl}/api/presents/${present.id}/photos/${firstPhotoId}`
        : '';
    return {
        id: present.id.toString(),
        uri: photoUri,
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