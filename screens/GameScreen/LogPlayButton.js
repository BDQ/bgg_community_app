import React, { useEffect, useState } from 'react'
import { View, Text } from 'react-native'
import { Button, ButtonGroup } from 'react-native-elements'
import styles from './styles'
import { fetchJSON } from '../../shared/HTTP'

const LogPlayButton = ({ navigation: { navigate }, game }) => {
  const [playCount, setPlayCount] = useState(0)
  fetchPlayCount = async () => {
    const path = `/geekplay.php?action=getuserplaycount&ajax=1&objectid=${game.objectId}&objecttype=thing`

    const { count } = await fetchJSON(path)
    setPlayCount(count)
  }

  useEffect(() => {
    fetchPlayCount()
  }, [game.objectId])

  const buttons = []

  const logPlayButtonStyle =
    playCount === 0
      ? {}
      : {
          width: 80,
          marginRight: 0,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        }

  buttons.push(
    <Button
      key="logButton"
      buttonStyle={styles.headerButton}
      titleStyle={styles.headerButtonText}
      containerStyle={{
        ...styles.headerButtonContainer,
        ...logPlayButtonStyle,
      }}
      title="Log Play"
      onPress={() =>
        navigate('LogPlay', {
          game,
        })
      }
    />
  )

  if (playCount > 0) {
    buttons.push(
      <Button
        key="playsButton"
        buttonStyle={styles.headerButton}
        titleStyle={styles.headerButtonText}
        containerStyle={{
          ...styles.headerButtonContainer,
          width: 40,
          borderLeftColor: 'black',
          borderLeftWidth: 1,
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
        }}
        title={playCount > 999 ? '1k+' : playCount.toString()}
        onPress={() =>
          navigate('ListPlays', {
            game,
          })
        }
      />
    )
  }

  return <View style={styles.headerButtonGroup}>{buttons}</View>
}

export default LogPlayButton
