import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getAuthHeaders } from '@/utils/imageUtils';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import type { ImageSourcePropType } from 'react-native';
import { Pressable, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

export type ShopItemListInfo = {
    id: string;
    /** Удалённое фото (API). */
    uri?: string;
    /** Локальный ассет (мок), например require('@/assets/...'). */
    localImage?: ImageSourcePropType;
    title: string;
    price: number;
    /** Демо: иконка корзины как в макете Figma (нижний ряд карточек). */
    showCartButton?: boolean;
    /** Публичные URL картинок без Basic Auth. */
    omitAuthHeaders?: boolean;
};

const H_PADDING = 18;
const COLUMN_GAP = 16;

const ShopItemList = ({ id, uri, localImage, title, price, showCartButton, omitAuthHeaders }: ShopItemListInfo) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const router = useRouter();
    const { width: screenW } = useWindowDimensions();
    const cardWidth = Math.floor((screenW - H_PADDING * 2 - COLUMN_GAP) / 2);

    const onPress = () => {
        router.push(`/shop/${id}`);
    };

    const remoteUri = uri?.trim();
    const imageSource =
        omitAuthHeaders || !remoteUri
            ? { uri: remoteUri ?? '' }
            : { uri: remoteUri, headers: getAuthHeaders() };

    const showRemote = Boolean(remoteUri);
    const showLocal = localImage != null;

    return (
        <Pressable
            style={[styles.outer, { width: cardWidth }]}
            onPress={onPress}
        >
            <View
                style={[
                    styles.card,
                    showCartButton ? styles.cardTall : null,
                ]}
            >
                <View style={styles.imageWrap}>
                    {showLocal ? (
                        <Image
                            style={styles.image}
                            source={localImage}
                            contentFit="cover"
                        />
                    ) : showRemote ? (
                        <Image
                            style={styles.image}
                            source={imageSource}
                            contentFit="cover"
                        />
                    ) : (
                        <View style={[styles.image, styles.imagePlaceholder, { borderColor: colors.border }]} />
                    )}
                </View>
                <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
                    {title}
                </Text>
                <Text style={[styles.price, { color: colors.text }]}>
                    {price} алгокоинов
                </Text>
                {showCartButton ? (
                    <TouchableOpacity
                        style={styles.bagFab}
                        onPress={onPress}
                        activeOpacity={0.85}
                        hitSlop={12}
                    >
                        <Ionicons name="bag-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                ) : null}
            </View>
        </Pressable>
    );
};

export default ShopItemList;

export { COLUMN_GAP, H_PADDING };

const styles = StyleSheet.create({
    outer: {
        marginBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        minHeight: 206,
        paddingTop: 17,
        paddingBottom: 14,
        paddingHorizontal: 8,
        alignItems: 'center',
        shadowColor: '#1B1956',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 4,
    },
    cardTall: {
        minHeight: 228,
        paddingBottom: 20,
    },
    imageWrap: {
        marginBottom: 10,
    },
    image: {
        width: 96,
        height: 96,
        borderRadius: 16,
    },
    imagePlaceholder: {
        borderWidth: 1,
        backgroundColor: '#f3f3f5',
    },
    title: {
        fontSize: 12,
        lineHeight: 18,
        textAlign: 'center',
        letterSpacing: 0.3,
        minHeight: 36,
    },
    price: {
        marginTop: 2,
        fontSize: 14,
        lineHeight: 21,
        fontWeight: '500',
        textAlign: 'center',
        letterSpacing: 0.3,
    },
    bagFab: {
        position: 'absolute',
        bottom: 10,
        alignSelf: 'center',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
});