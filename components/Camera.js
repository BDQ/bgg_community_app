import React from 'react'
import PropTypes from 'prop-types'
import { Text, View } from 'react-native'
import * as ImageManipulator from 'expo-image-manipulator'
import * as Permissions from 'expo-permissions'
import * as ImagePicker from 'expo-image-picker'
//import ProgressBar from 'react-native-progress/Circle'
import styles from '../shared/styles'
import { logger } from '../shared/debug'

export default class Camera extends React.Component {
  state = {
    hasCameraPermission: null
  }

  async componentDidMount() {
    const { status } = await Permissions.askAsync(
      Permissions.CAMERA,
      Permissions.CAMERA_ROLL
    )
    this.setState({ hasCameraPermission: status === 'granted' })

    const photo = await ImagePicker.launchCameraAsync({ quality: 0.1 })

    if (photo.cancelled) {
      this.props.onCancel()
    } else {
      let resize
      if (photo.height > photo.width) {
        //portrait snap
        resize = { height: 250 }
      } else {
        //landscape snap
        resize = { width: 250 }
      }
      const resized = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize }],
        {
          format: 'png',
          compress: 0,
          base64: true
        }
      )

      this.props.onScan(resized)

      logger(Object.keys(resized))
      logger(resized.width, resized.height)
      logger(resized.base64.length)
    }
  }

  render() {
    const { hasCameraPermission } = this.state
    if (hasCameraPermission === null) {
      return <View />
    } else if (hasCameraPermission === false) {
      return (
        <View style={styles.emptyView}>
          <Text style={{ textAlign: 'center' }}>
            No access to camera, check your settings to allow camera access.
          </Text>
        </View>
      )
    } else {
      return (
        <View style={styles.emptyView}>
        </View>
      )
    }
  }
}

Camera.propTypes = {
  onScan: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
}
