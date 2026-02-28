import { OrderItemListType, OrderListItemDtoType } from '@/components/order/OrderListItem';
import { instance } from '@/services/commonApi';
import { OrderDTO, OrderStatus, PageOrderDTO, PresentResponse } from '@/services/types';

const mapOrderStatusToUI = (status: OrderStatus): string => {
    const statusMap: Record<OrderStatus, string> = {
        [OrderStatus.ORDERED]: 'Заказан',
        [OrderStatus.CONFIRMED]: 'Подтвержден',
        [OrderStatus.ISSUED]: 'Получен',
        [OrderStatus.CANCELLED]: 'Отменен',
    };
    return statusMap[status] || status;
};

const mapOrderDTOToOrderItem = async (order: OrderDTO, baseUrl: string): Promise<(OrderItemListType & { orderDate?: string }) | null> => {
    if (!order.present_id) {
        return null;
    }

    // Получаем информацию о подарке для получения изображения
    try {
        const presentResponse = await instance.get<PresentResponse>(`/api/presents/${order.present_id}`);
        const present = presentResponse.data;
        
        const firstPhotoId = present.photoIds && present.photoIds.length > 0 ? present.photoIds[0] : null;
        const photoUri = firstPhotoId 
            ? `${baseUrl}/api/presents/${order.present_id}/photos/${firstPhotoId}`
            : '';

        return {
            id: order.id?.toString() || '',
            title: present.name,
            price: present.priceCoins,
            image: photoUri,
            status: mapOrderStatusToUI(order.status),
            orderDate: order.date,
        };
    } catch (error) {
        // Если не удалось получить подарок, возвращаем базовую информацию
        return {
            id: order.id?.toString() || '',
            title: 'Подарок',
            price: 0,
            image: '',
            status: mapOrderStatusToUI(order.status),
            orderDate: order.date,
        };
    }
};

const groupOrdersByDate = (orders: Array<OrderItemListType & { orderDate?: string }>): OrderListItemDtoType[] => {
    const grouped: Record<string, OrderItemListType[]> = {};
    
    orders.forEach(order => {
        const orderDate = order.orderDate 
            ? new Date(order.orderDate).toLocaleDateString('ru-RU', { 
                day: 'numeric', 
                month: 'long',
                year: 'numeric'
            })
            : new Date().toLocaleDateString('ru-RU', { 
                day: 'numeric', 
                month: 'long',
                year: 'numeric'
            });
        
        if (!grouped[orderDate]) {
            grouped[orderDate] = [];
        }
        grouped[orderDate].push({
            id: order.id,
            title: order.title,
            price: order.price,
            image: order.image,
            status: order.status,
        });
    });
    
    return Object.entries(grouped).map(([date, data]) => ({
        date,
        data,
    }));
};

/**
 * Получить все заказы пользователя с пагинацией
 */
export const getAllOrdersByUser = async (
    page: number = 0,
    size: number = 5,
    sortBy: string = 'id',
    sortDir: string = 'desc'
): Promise<{ success: boolean; data: OrderListItemDtoType[]; pagination?: { hasMore: boolean; currentPage: number; totalPages: number }; error?: string }> => {
    try {
        const response = await instance.get<PageOrderDTO>('/api/orders', {
            params: { page, size, sortBy, sortDir },
        });

        const baseUrl = instance.defaults.baseURL || '';
        const orders = response.data.content || [];
        
        // Преобразуем все заказы
        const orderItemsPromises = orders.map(order => mapOrderDTOToOrderItem(order, baseUrl));
        const orderItems = (await Promise.all(orderItemsPromises)).filter(
            (item): item is OrderItemListType => item !== null
        );

        // Группируем по датам
        const groupedOrders = groupOrdersByDate(orderItems);

        return {
            success: true,
            data: groupedOrders,
            pagination: {
                hasMore: !(response.data.last ?? true),
                currentPage: response.data.number ?? 0,
                totalPages: response.data.totalPages ?? 0,
            },
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.message || 'Ошибка при получении заказов',
            data: []
        };
    }
};

/**
 * Создать заказ
 */
export const makeOrder = async (presentId: string): Promise<{ success: boolean; data?: OrderDTO; error?: string }> => {
    try {
        const response = await instance.post<OrderDTO>('/api/orders', null, {
            params: { presentId: parseInt(presentId) },
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
};

/**
 * Отменить заказ
 */
export const cancelOrder = async (id: string): Promise<{ success: boolean; data?: OrderDTO; error?: string }> => {
    try {
        const response = await instance.post<OrderDTO>(`/api/orders/${id}/cancel`);
        
        return {
            success: true,
            data: response.data,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.message || 'Ошибка при обновлении статуса заказа',
        };
    }
};