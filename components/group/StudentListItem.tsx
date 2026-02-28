import React from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'

export type Student = {
    id: string
    fullname: string
    coins: string
}

const StudentListItem = ({ id, fullname, coins, changeStudentCoins }: Student &
{
    changeStudentCoins: (id: string, coins: string) => void
}) => {
    return (
        <View style={styles.studentRow}>
            <Text style={styles.studentName} numberOfLines={1}>{fullname}</Text>
            <TextInput
                style={styles.input}
                placeholder="Кол-во"
                keyboardType="numeric"
                value={coins}
                onChangeText={(text) => changeStudentCoins(id, text)}
            />
        </View>
    )
}

export default StudentListItem

const styles = StyleSheet.create({
    studentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },

    studentName: {
        fontSize: 16,
        flex: 1,
        borderWidth: 1,
        borderColor: '#BFBFBF',
        padding: 16,
        marginRight: 6,
        borderRadius: 16,
    },
    inputContainer: {
        width: 80
    },
    input: {
        borderWidth: 1,
        borderColor: '#BFBFBF',
        borderRadius: 16,
        textAlign: 'center',
        justifyContent: 'center',
        fontSize: 16,
        padding: 16
    },
})