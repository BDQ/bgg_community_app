import React, { useState, useEffect, useLayoutEffect } from 'react'
import {
  ScrollView,
  Button,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { Icon } from 'react-native-elements'

import styles from '../../../shared/styles'
import { asyncFetch } from '../../../shared/HTTP'

renderItem = (item, game, navigate) => {
  const locationTextStyle = {
    ...playStyles.cellText,
  }

  if (item.location === '') locationTextStyle.color = '#999999'

  return (
    <TouchableOpacity
      onPress={() => {
        navigate('LogPlay', {
          game,
          play: item,
        })
      }}
    >
      <View style={styles.listItem}>
        <View style={playStyles.row}>
          <View style={playStyles.countCell}>
            <Icon name="activity" color="black" type="feather" size={24} />
            <Text style={playStyles.cellText}>{item.quantity}</Text>
          </View>

          <View style={playStyles.dateCell}>
            <Icon name="calendar" color="black" type="feather" size={24} />
            <Text style={playStyles.cellText}>{item.playdate}</Text>
          </View>

          <View style={playStyles.locationCell}>
            <Icon name="map-pin" color="black" type="feather" size={24} />
            <Text style={locationTextStyle}>
              {item.location || 'No location set'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

renderFooter = (count, total, page, setPage) => {
  if (count >= total) return null

  return (
    <View style={playStyles.loadMoreRow}>
      <Button onPress={() => setPage((page += 1))} title="Load More" />
    </View>
  )
}

export default ({ navigation, route }) => {
  const {
    params: { game, play },
  } = route

  const { navigate } = navigation

  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [plays, setPlays] = useState([])

  useEffect(() => {
    const fetchPlays = async () => {
      const result = await asyncFetch({
        path: `/geekplay.php?pageID=${page}&objectid=${game.objectId}&action=getplays&ajax=1&currentUser=true&objecttype=thing&showcount=10`,
      })

      setCount(result.eventcount)
      setPlays([...plays, ...result.plays])
    }
    fetchPlays()
  }, [page])

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Log Plays',
    })
  }, [navigation])

  // take updated play and replace old value
  if (play) {
    const idx = plays.findIndex((p) => p.playid === play.playid)
    if (idx >= 0) plays[idx] = play
  }

  return (
    <FlatList
      data={plays}
      renderItem={({ item }) => renderItem(item, game, navigate)}
      keyExtractor={(play) => play.playid}
      ListFooterComponent={() =>
        renderFooter(plays.length, count, page, setPage)
      }
    />
  )
}

const playStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  countCell: {
    flexDirection: 'row',
    width: '15%',
  },
  dateCell: {
    flexDirection: 'row',
    width: '35%',
  },
  locationCell: {
    flexDirection: 'row',
    width: '50%',
  },
  cellText: {
    marginTop: 5,
    marginLeft: 5,
  },
  loadMoreRow: {
    ...styles.listItem,
    alignItems: 'center',
  },
})
