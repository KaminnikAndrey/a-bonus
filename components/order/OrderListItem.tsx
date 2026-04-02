import { cancelOrder } from '@/services/orders/ordersApi'
import { getAuthHeaders } from '@/utils/imageUtils'
import { Image } from 'expo-image'
import React, { useState } from 'react'
import type { ImageSourcePropType } from 'react-native'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import CustomModal from '../common/CustomModal'

export type OrderItemListType = {
    id: string
    title: string,
    price: number,
    image: string,
    status: string
    /** Локальное превью (мок-заказы). */
    localImage?: ImageSourcePropType
}

export type OrderListItemDtoType = {
    date: string
    data: OrderItemListType[]
}

const OrderListItem = ({ order, onOrderCancelled }: { order: OrderItemListType, onOrderCancelled: () => void; }) => {
    const [cancelOrderConfirmVisible, setCancelOrderConfirmVisible] = useState<boolean>(false);
    const [successCancelOrderVisible, setSuccessCancelOrderVisible] = useState<boolean>(false);

    const closeOrderConfirmModal = () => {
        setCancelOrderConfirmVisible(false);
    }

    const closeSuccessCancelOrderModal = () => { 
        setSuccessCancelOrderVisible(false);
        onOrderCancelled();
    }

    const onCancelOrderConfirm = async () => {
        closeOrderConfirmModal();
        const {success} = await cancelOrder(order.id);
        if(success) {
            setSuccessCancelOrderVisible(true);
        }
    }

    const getStyleByStatus = (() => {
        switch (order.status) {
            case 'Отменен':
                return {
                    backgroundColor: '#EC13131A',
                    color: '#EC1313',
                }
            case 'Получен':
                return {
                    backgroundColor: '#29AE291A',
                    color: '#29AE29',
                }
            default:
                return {
                    backgroundColor: '#FFC62A1A',
                    color: '#FFC62A',
                }
        }
    })();

    const onCancel = () => {
        setCancelOrderConfirmVisible(true);
    }

    return (
        <View key={order.id} style={styles.container}>
            <View style={styles.orderContainer}>
                <View style={styles.header}>
                    <View style={[styles.orderStatus, getStyleByStatus]}>
                        <Text style={[styles.textInfo, { color: getStyleByStatus.color }]}>{order.status}</Text>
                    </View>
                    {(order.status == 'Заказан') &&
                        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
                            <Text style={styles.cancelButtonText}>Отменить</Text>
                        </TouchableOpacity>
                    }
                </View>
                {order.localImage != null ? (
                    <Image
                        style={styles.image}
                        source={order.localImage}
                        contentFit="cover"
                    />
                ) : (
                    <Image
                        style={styles.image}
                        source={{
                            uri: order.image,
                            headers: getAuthHeaders(),
                        }}
                        contentFit="cover"
                    />
                )}
                <View style={styles.orderTextInfo}>
                    <Text style={styles.textInfo}>{order.title}</Text>
                    <Text style={[styles.textInfo, { fontSize: 16, }]}>{order.price} алгокоинов</Text>
                </View>
            </View>

            {/* Модальное окно подтверждения отмены заказа*/}
            <CustomModal 
                visible={cancelOrderConfirmVisible}
                title={"Отменить заказ"}
                subtitle={"Заказ будет отменен, мы уведомим об этом администратора"}
                okButtonText={"Подтвердить"}
                isNeedCancelButton={true}
                cancelButtonText={"Отмена"}
                onCancel={closeOrderConfirmModal}
                onRequestClose={closeOrderConfirmModal}
                onSuccessModalClose={onCancelOrderConfirm}
            />

            {/* Модальное окно - заказ успешно отменен*/}
            <CustomModal 
                onRequestClose={closeSuccessCancelOrderModal}
                onSuccessModalClose={closeSuccessCancelOrderModal}
                visible={successCancelOrderVisible}
                title={"Заказ отменен"}
                subtitle={"Вы успешно отменили заказ"}
                okButtonText={"К заказам"}
                isNeedCancelButton={false}
            />
        </View>
    )
}

export default OrderListItem

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        marginBottom: 16,
        backgroundColor: '#FFFFFF'
    },
    orderContainer: {
        flex: 1,
        width: "100%",
        alignItems: 'center',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E6E6E6',
    },
    image: {
        width: 274,
        height: 274,
        resizeMode: 'cover',
        borderRadius: 16,
    },
    header: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        justifyContent: 'space-between',
        alignItems: "center",
        width: '100%',
    },
    orderStatus: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
    },
    orderTextInfo: {
        width: '100%',
        alignItems: "flex-start",
        padding: 16
    },
    textInfo: {
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '600'
    },
    cancelButton: {
        backgroundColor: '#F2F2F2',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center'
    },
    cancelButtonText: {
        fontSize: 12,
        textAlign: 'center',
        color: '#A0A0A0',
        fontWeight: '600'
    },
    
})