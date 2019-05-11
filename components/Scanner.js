import React from 'react'
import { Text, View, TouchableOpacity } from 'react-native'
import { Camera, Permissions, ImageManipulator } from 'expo'

export default class Scanner extends React.Component {
  state = {
    hasCameraPermission: null,
    type: Camera.Constants.Type.back
  }

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA)
    this.setState({ hasCameraPermission: status === 'granted' })
  }

  snap = async () => {
    console.log('taking snap')
    if (this.camera) {
      console.log('have camera')
      let photo = await this.camera.takePictureAsync({
        quality: 0.1
      })
      console.log(photo)

      let resize
      if (photo.height > photo.width) {
        //portrait snap
        resize = { height: 200 }
      } else {
        //landscape snap
        resize = { width: 200 }
      }

      const resized = await ImageManipulator.manipulate(
        photo.uri,
        [{ resize }],
        {
          format: 'png',
          compress: 0,
          base64: true
        }
      )

      this.props.onScan(resized)

      console.log(Object.keys(resized))
      console.log(resized.width, resized.height)
      console.log(resized.base64.length)
    }
  }

  render() {
    const { hasCameraPermission } = this.state
    if (hasCameraPermission === null) {
      return <View />
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>
    } else {
      return (
        <View style={{ flex: 1, padding: 10 }}>
          <Camera
            ref={ref => {
              this.camera = ref
            }}
            style={{ flex: 1 }}
            type={this.state.type}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'row'
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 0.1,
                  alignSelf: 'flex-end',
                  alignItems: 'center'
                }}
                onPress={this.snap}
              >
                <Text
                  style={{ fontSize: 18, marginBottom: 10, color: 'white' }}
                >
                  Snap
                </Text>
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      )
    }
  }
}
