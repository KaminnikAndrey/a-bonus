import AsyncStorage from '@react-native-async-storage/async-storage';
import { cancelOrder } from '@/services/orders/ordersApi';
import { orderShopItem } from '@/services/shop/shopApi';
import { getStoredMockOrders } from '@/services/orders/mockOrdersStore';
import { createTestStore, seedMockStudent } from '@/__tests__/helpers/testStore';
import { login, store } from '@/stores/auth/authStore';

function syncGlobalStore(testStore: ReturnType<typeof createTestStore>) {
  const state = testStore.getState();
  store.dispatch(
    login({
      user: state.auth.user!,
      creds: state.auth.creds!,
    })
  );
}

describe('shop order + cancel (mock student)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    const testStore = createTestStore();
    seedMockStudent(testStore);
    syncGlobalStore(testStore);
  });

  it('orderShopItem создаёт заказ в хранилище', async () => {
    const result = await orderShopItem('1');
    expect(result.success).toBe(true);

    const orders = await getStoredMockOrders();
    expect(orders.length).toBe(1);
    expect(orders[0].presentId).toBe('1');
    expect(orders[0].status).toBe('ORDERED');
  });

  it('cancelOrder отменяет mock-заказ', async () => {
    const created = await orderShopItem('2');
    expect(created.success).toBe(true);

    const orders = await getStoredMockOrders();
    const cancel = await cancelOrder(orders[0].id);
    expect(cancel.success).toBe(true);

    const after = await getStoredMockOrders();
    expect(after[0].status).toBe('CANCELLED');
  });

  it('cancelOrder unknown mock id fails', async () => {
    const cancel = await cancelOrder('mock-not-exists');
    expect(cancel.success).toBe(false);
  });
});
