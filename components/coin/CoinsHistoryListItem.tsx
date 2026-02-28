import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export type CoinsHistoryListItemDto = {
    fullname: string,
    coins: number
  }
  

const CoinsHistoryListItem = ({fullname, coins}: CoinsHistoryListItemDto) => {
  return (
    <View style={styles.container}>
      <Text>{fullname}</Text>
      <Text>{coins}</Text>
    </View>
  )
}

export default CoinsHistoryListItem

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderRadius: 16,
        backgroundColor: "#F2F2F2",
        padding: 16,
        marginVertical: 4
    },
    text: {
        color: "#404040",
        fontSize: 14
    }
})