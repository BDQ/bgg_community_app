import React, { useState, useEffect, useLayoutEffect } from 'react'
import { useAsync } from 'react-async'
import { ScrollView, View, Text, TextInput } from 'react-native'
import { Button } from 'react-native-elements'
import { showMessage } from 'react-native-flash-message'
import DateTimePicker from '@react-native-community/datetimepicker'

import styles from '../../../shared/styles'
import { asyncFetch } from '../../../shared/HTTP'

import LocationPicker from './LocationPicker'
import { navigationType } from '../../../shared/propTypes'

const dateInYYYYMMDD = (date) => {
  const month = ('0' + (date.getMonth() + 1)).slice(-2),
    day = ('0' + date.getDate()).slice(-2),
    year = date.getFullYear()

  return `${year}-${month}-${day}`
}

const LogPlay = ({ navigation, route }) => {
  const {
    params: { game, play },
  } = route

  const [playDate, setDate] = useState(
    play ? new Date(play.playdate) : new Date()
  )
  const [quantity, setQty] = useState(play ? play.quantity : 1)
  const [location, setLocation] = useState(play ? play.location : '')

  useLayoutEffect(() => {
    navigation.setOptions({
      title: play ? 'Edit Play' : 'New Play',
    })
  }, [navigation, play])

  const save = async () => {
    const body = {
      quantity,
      location,
      playdate: dateInYYYYMMDD(playDate),
      date: new Date(),
      objecttype: 'thing',
      objectid: game.objectId,
      action: 'save',
      ajax: 1, // make sure we json back
    }

    // update vs new
    if (play) body.playid = play.playid

    return asyncFetch({
      path: '/geekplay.php',
      args: {
        method: 'POST',
        body,
      },
    })
  }

  const { error, run, data } = useAsync({ deferFn: save })

  useEffect(() => {
    if (data?.playid) {
      if (play) {
        navigation.navigate('ListPlays', {
          game,
          play: {
            ...play,
            location,
            quantity,
            playdate: dateInYYYYMMDD(playDate),
          },
        })
      } else {
        navigation.goBack()
        showMessage({
          message: `You've now played ${game.name} ${data.numplays} time(s).`,
          type: 'success',
          icon: 'auto',
          duration: 3000,
        })
      }
    }
  })

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <View style={styles.mainView}>
        <View
          style={{
            marginBottom: 15,
          }}
        >
          <Text style={styles.formHeader}>When did you play?</Text>
          <DateTimePicker
            value={playDate}
            mode="date"
            maximumDate={new Date()}
            onChange={(_, date) => {
              setDate(date)
            }}
          />
        </View>
        <View
          style={{
            marginBottom: 15,
          }}
        >
          <Text style={styles.formHeader}>Where did you play? [Optional]</Text>
          <LocationPicker
            currentLocation={location}
            setLocation={setLocation}
          />
        </View>
        <View
          style={{
            marginBottom: 15,
          }}
        >
          <Text style={styles.formHeader}>How many times did you play?</Text>
          <TextInput
            onChangeText={(value) => setQty(value)}
            value={quantity.toString()}
            keyboardType="numeric"
            style={{ ...styles.textInput, width: 90 }}
          />
        </View>
        <View
          style={{
            marginBottom: 15,
          }}
        >
          <Button title="Save" style={styles.formButtons} onPress={run} />

          {error && <Text>{error.message}</Text>}
        </View>
      </View>
    </ScrollView>
  )
}

LogPlay.propTypes = {
  ...navigationType,
}

export default LogPlay
