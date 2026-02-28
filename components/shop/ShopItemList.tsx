import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getAuthHeaders } from '@/utils/imageUtils';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

export type ShopItemListInfo = { id: string, uri: string, title: string, price: number }

const ShopItemList = ({id, uri, title, price} : ShopItemListInfo) => {

    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const router = useRouter();


    const onPress= () => {
        router.push(`/shop/${id}`);
    };

    return (
        <Pressable
         style={styles.container}
         onPress={onPress}
        >
            <Image
                style={styles.image}
                source={{
                    uri: uri,
                    headers: getAuthHeaders(),
                }}
            />
            <Text>{title}</Text>
            <Text>{price} алгокоинов</Text>
        </Pressable>
    )
}

export default ShopItemList

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 5,
        margin: 1,
        alignItems: 'center',
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 16
    }
})