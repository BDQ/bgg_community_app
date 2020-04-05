import React, { useState, useEffect, useLayoutEffect } from 'react'
import { useAsync } from 'react-async'
import { ScrollView, View, Text, TextInput } from 'react-native'
import { Button } from 'react-native-elements'
import { showMessage } from 'react-native-flash-message'
// import { Appearance } from 'react-native-appearance'
import DatePicker from 'react-native-datepicker'

import styles from '../../../shared/styles'
import { asyncFetch } from '../../../shared/HTTP'

import LocationPicker from './LocationPicker'

// const colorScheme = Appearance.getColorScheme()

const nowInYYYYMMDD = () => {
  const now = new Date(),
    month = '' + (now.getMonth() + 1),
    day = '' + now.getDate(),
    year = now.getFullYear()

  return `${year}-${month}-${day}`
}

export default ({ navigation, route }) => {
  const {
    params: { game, play },
  } = route

  const [playDate, setDate] = useState(play ? play.playdate : nowInYYYYMMDD())
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
      playdate: playDate,
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

  const { isPending, error, run, data } = useAsync({ deferFn: save })

  useEffect(() => {
    if (data?.playid) {
      if (play) {
        navigation.navigate('ListPlays', {
          game,
          play: { ...play, location, quantity, playdate: playDate },
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
          <DatePicker
            date={playDate}
            mode="date"
            confirmBtnText="Confirm"
            cancelBtnText="Cancel"
            showIcon={false}
            onDateChange={(date) => setDate(date)}
            customStyles={{
              // datePicker: {
              //   backgroundColor: colorScheme === 'dark' ? '#222' : 'white',
              //   colorScheme: colorScheme === 'dark' ? 'white' : '#222',
              // },
              // datePickerCon: {
              //   backgroundColor: colorScheme === 'dark' ? '#333' : 'white',
              // },
              dateInput: {
                ...styles.textInput,
                flex: 1,
                justifyContent: 'center',
              },
            }}
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
          <Button title="Save" style={styles.formButtons} onPress={run} />

          {error && <Text>{error.message}</Text>}
        </View>
      </View>
    </ScrollView>
  )
}
