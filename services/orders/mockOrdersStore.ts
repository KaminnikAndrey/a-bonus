import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@a-bonus-mock-orders';

export type StoredMockOrder = {
    id: string;
    presentId: string;
    createdAt: string;
    status: 'ORDERED' | 'CANCELLED';
};

async function readAll(): Promise<StoredMockOrder[]> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw) as StoredMockOrder[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

async function writeAll(orders: StoredMockOrder[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

/** Добавить заказ демо-студента (без бэкенда). */
export async function appendMockOrder(presentId: string): Promise<StoredMockOrder> {
    const orders = await readAll();
    const row: StoredMockOrder = {
        id: `mock-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        presentId,
        createdAt: new Date().toISOString(),
        status: 'ORDERED',
    };
    orders.unshift(row);
    await writeAll(orders);
    return row;
}

export async function getStoredMockOrders(): Promise<StoredMockOrder[]> {
    return readAll();
}

export async function cancelStoredMockOrder(id: string): Promise<boolean> {
    const orders = await readAll();
    const idx = orders.findIndex((o) => o.id === id);
    if (idx === -1) return false;
    orders[idx] = { ...orders[idx], status: 'CANCELLED' };
    await writeAll(orders);
    return true;
}
