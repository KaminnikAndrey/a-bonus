import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  appendMockOrder,
  cancelStoredMockOrder,
  getStoredMockOrders,
} from '@/services/orders/mockOrdersStore';

describe('mockOrdersStore', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('appendMockOrder adds ORDERED row', async () => {
    const row = await appendMockOrder('present-1');
    expect(row.presentId).toBe('present-1');
    expect(row.status).toBe('ORDERED');
    expect(row.id).toMatch(/^mock-/);

    const all = await getStoredMockOrders();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe(row.id);
  });

  it('cancelStoredMockOrder sets CANCELLED', async () => {
    const row = await appendMockOrder('present-2');
    const ok = await cancelStoredMockOrder(row.id);
    expect(ok).toBe(true);

    const all = await getStoredMockOrders();
    expect(all[0].status).toBe('CANCELLED');
  });

  it('cancelStoredMockOrder returns false for unknown id', async () => {
    expect(await cancelStoredMockOrder('missing')).toBe(false);
  });
});
