import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllOrdersByUser } from '@/services/orders/ordersApi';
import { appendMockOrder } from '@/services/orders/mockOrdersStore';
import { getAllShopItems, getShopItem } from '@/services/shop/shopApi';
import { createTestStore, seedMockStudent } from '@/__tests__/helpers/testStore';
import { login, store } from '@/stores/auth/authStore';

function syncStore(testStore: ReturnType<typeof createTestStore>) {
  const state = testStore.getState();
  store.dispatch(login({ user: state.auth.user!, creds: state.auth.creds! }));
}

describe('shop & orders read (mock-student)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    const ts = createTestStore();
    seedMockStudent(ts);
    syncStore(ts);
  });

  it('getAllShopItems returns demo catalog', async () => {
    const result = await getAllShopItems();
    expect(result.success).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0].title).toBeTruthy();
  });

  it('getShopItem by id', async () => {
    const result = await getShopItem('1');
    expect(result.success).toBe(true);
    expect(result.data?.title).toContain('Ручка');
  });

  it('getAllOrdersByUser lists stored mock orders', async () => {
    await appendMockOrder('1');
    const result = await getAllOrdersByUser();
    expect(result.success).toBe(true);
    const total = result.data.reduce((n, g) => n + g.data.length, 0);
    expect(total).toBe(1);
    expect(result.data[0].data[0].status).toBe('Заказан');
  });
});
