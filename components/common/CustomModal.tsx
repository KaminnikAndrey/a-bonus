import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { GestureResponderEvent, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const CustomModal = ({
    onRequestClose,
    onSuccessModalClose, 
    visible, title,
    subtitle,
    okButtonText,
    isNeedCancelButton,
    cancelButtonText,
    onCancel
} : {
    onRequestClose: (event: GestureResponderEvent) => void
    onSuccessModalClose: (event: GestureResponderEvent) => void
    visible: boolean
    title: string
    subtitle: string
    okButtonText: string
    isNeedCancelButton?: boolean | undefined
    cancelButtonText?: string | undefined
    onCancel?: ((event: GestureResponderEvent) => void) | undefined
}) => {

    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    return (
        <Modal
            animationType='fade'
            transparent={true}
            visible={visible}
            onRequestClose={onRequestClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: '#fff' }]}>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>
                        {title}
                    </Text>
                    <Text style={[styles.modalSubtitle, { color: colors.text }]}>
                        {subtitle}
                    </Text>

                    <View style={styles.modalButtons}>
                        {isNeedCancelButton && <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={onCancel}
                        >
                            <Text style={styles.cancelButtonText}>{cancelButtonText}</Text>
                        </TouchableOpacity>}
                        <TouchableOpacity
                            style={[styles.modalButton, styles.singleButton, { backgroundColor: colors.tint }]}
                            onPress={onSuccessModalClose}
                        >
                            <Text style={styles.confirmButtonText}>{okButtonText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export default CustomModal

const styles = StyleSheet.create({
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
})