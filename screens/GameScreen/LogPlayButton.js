import React, { useState } from 'react'
import { View, Text } from 'react-native'
import { Button } from 'react-native-elements'
import styles from './styles'

const LogPlayButton = ({ navigation: { navigate }, game }) => (
  <View>
    <Button
      buttonStyle={styles.headerButton}
      titleStyle={styles.headerButtonText}
      containerStyle={styles.headerButtonContainer}
      title="Log Play"
      onPress={() =>
        navigate('LogPlay', {
          game
        })
      }
    />
  </View>
)

// LogPlayButton.navigationOptions = () => {
//   ;(title: 'Home')
// }

export default LogPlayButton
