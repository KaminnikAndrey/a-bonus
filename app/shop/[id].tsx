import CustomModal from '@/components/common/CustomModal';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getAlgocoins } from '@/services/profile/profileApi';
import { getShopItem, orderShopItem } from "@/services/shop/shopApi";
import { userSelector } from '@/stores/auth/authStore';
import { getAuthHeaders } from '@/utils/imageUtils';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

const { width: screenWidth } = Dimensions.get('window');

type ShopItemInfo = {
  title: string
  price: number
  stock: number
  images: string[]
}


export default function ShopItemScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const user = useSelector(userSelector);
  const [shopItem, setShopItem] = useState<ShopItemInfo | null>(null);
  const [algocoins, setAlgocoins] = useState(0);

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [insufficientModalVisible, setInsufficientModalVisible] = useState(false);
  const [successModalVisible, setSucessModalVisible] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchShopItem = async () => {
      setIsLoading(true);
      const { success: isAlgoCoinsSuccessFetch, data: coins } = await getAlgocoins();
      if (isAlgoCoinsSuccessFetch && coins !== undefined) {
        setAlgocoins(coins);
      }
      const { success, data } = await getShopItem(id as string);
      console.log(data)
      if (success && data) {
        setShopItem(data);
      }
      setIsLoading(false);
    }
    fetchShopItem();
  }, []);

  const onBack = () => {
    router.back();
  } 

  const onOrder = () => {
    if (algocoins && shopItem?.price && algocoins >= shopItem?.price) {
      setConfirmModalVisible(true);
    } else {
      setInsufficientModalVisible(true);
    }
  };

  const onConfirmOrder = async () => {
    setConfirmModalVisible(false);
    const { success } = await orderShopItem(id as string);
    if (success) {
      setSucessModalVisible(true);
    }
  };

  const onCancelOrder = () => {
    setConfirmModalVisible(false);
  };

  const closeInsufficientModal = () => {
    setInsufficientModalVisible(false);
  };

  const closeSucessModal = () => {
    setSucessModalVisible(false);
  }

  const onSuccessModalClose = () => {
    closeSucessModal();
    router.push("/(tabs)/orders")
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Подробнее о подарке</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {isLoading ? <ActivityIndicator color={"#6766AA"} size={'large'} /> :
          <>
            {/* Горизонтальный скролл изображений */}
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.imageScrollView}
            >
              {shopItem?.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ 
                    uri: image,
                    headers: getAuthHeaders(),
                  }}
                  style={styles.productImage}
                  contentFit="cover"
                />
              ))}
            </ScrollView>
            {/* Информация о товаре */}
            <View style={styles.productInfo}>
              <Text style={[styles.productTitle, { color: colors.text }]}>
                {shopItem?.title}
              </Text>

              <View style={styles.priceContainer}>
                <Text style={[styles.price, { color: colors.text }]}>
                  {shopItem?.price} алгокоинов
                </Text>
              </View>

              <Text style={[styles.stock, { color: colors.tint }]}>
                В наличии: {shopItem?.stock} штук
              </Text>

              <TouchableOpacity
                style={[
                  styles.orderButton,
                  { backgroundColor: shopItem?.stock && shopItem?.stock > 0 ? colors.tint : '#ccc' }
                ]}
                onPress={onOrder}
                disabled={shopItem?.stock === 0}
              >
                <Text style={styles.orderButtonText}>
                  {shopItem?.stock && shopItem?.stock > 0 ? 'Заказать' : 'Нет в наличии'}
                </Text>
              </TouchableOpacity>
            </View></>

        }
      </ScrollView>

      {/* Модальное окно подтверждения заказа */}
      <CustomModal
        visible={confirmModalVisible}
        title={" Подтвердить заказ"}
        subtitle={`С вашего баланса спишется ${shopItem?.price} алгокоинов`}
        okButtonText={"Подтвердить"}
        isNeedCancelButton={true}
        cancelButtonText={"Отмена"}
        onCancel={onCancelOrder}
        onRequestClose={onCancelOrder}
        onSuccessModalClose={onConfirmOrder}
      />

      {/* Модальное окно недостатка средств */}
      <CustomModal
        visible={insufficientModalVisible}
        title={"Недостаточно алокомнов"}
        subtitle={`На вашем балансе недостаточно алгокоинов для покупки`}
        okButtonText={"Ок"}
        isNeedCancelButton={false}
        onRequestClose={closeInsufficientModal}
        onSuccessModalClose={closeInsufficientModal}
      />

      {/* Модальное окно успешной покупки */}
      <CustomModal
        visible={successModalVisible}
        title={"Успешно"}
        subtitle={`Вы успешно сделали заказ`}
        okButtonText={"К заказам"}
        isNeedCancelButton={false}
        onRequestClose={closeSucessModal}
        onSuccessModalClose={onSuccessModalClose}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  placeholder: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  imageScrollView: {
    height: screenWidth,
  },
  productImage: {
    width: screenWidth,
    height: screenWidth,
  },
  productInfo: {
    padding: 16,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  priceContainer: {
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
  },
  stock: {
    fontSize: 16,
    marginBottom: 24,
  },
  sizeSection: {
    marginBottom: 24,
  },
  sizeTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sizeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  sizeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
  },
  sizeButtonSelected: {
    borderColor: 'transparent',
  },
  sizeButtonText: {
    fontSize: 16,
    color: '#333',
  },
  sizeButtonTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  insufficientWarning: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  insufficientText: {
    color: '#d32f2f',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  orderButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  orderButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  // Стили для модальных окон
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  singleButton: {
    flex: 1,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});