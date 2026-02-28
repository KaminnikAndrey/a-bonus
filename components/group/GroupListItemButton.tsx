import React from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'

export type Group = {
    id: string
    name: string
}

const GroupListItemButton = ({ id, name, isSelected, setSelectedGroupId }: Group & {
    isSelected: boolean
    setSelectedGroupId: (id: string) => void
}) => {
    return (
        <Pressable style={[styles.container, isSelected ? { backgroundColor: '#6766AA', borderWidth: 0 } : {}]}
            onPress={() => setSelectedGroupId(id)}
        >
            <Text style={[styles.text, isSelected ? { color: '#FFFFFF' } : {}]}>{name}</Text>
        </Pressable>
    )
}

export default GroupListItemButton

const styles = StyleSheet.create({
    container: {
        padding: 8,
        margin: 4,
        borderColor: "#A0A0A0",
        borderWidth: 1,
        borderRadius: 100,
        paddingHorizontal: 16,
        maxHeight: 40,
        minHeight: 40,
        justifyContent: 'center'
    },
    text: {
        fontSize: 14,
        fontWeight: 500,
        color: "#A0A0A0"
    }
})