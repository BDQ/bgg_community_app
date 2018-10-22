import React from 'react'
import { createStackNavigator } from 'react-navigation'
import { View, Text, Image } from 'react-native'
import Camera from '../components/Camera'

import GameScreen from './GameScreen'
import GameAddTo from './GameAddTo'
import ImagePicker from 'expo'

import { fetchJSON } from '../shared/HTTP'
import GameListScreen from './GameListScreen'
import styles from '../shared/styles'

class VisualSearchScreen extends React.Component {
  handleScan = async photo => {
    const { navigate } = this.props.navigation
    navigate('Processing', { photo })
  }

  render = () => {
    return <Camera onScan={this.handleScan} />
  }
}

class SnapProcessingScreen extends React.Component {
  state = {
    photo: {}
  }

  static getDerivedStateFromProps(props, state) {
    const { photo } = props.navigation.state.params

    if (photo && photo !== state.photo) {
      return { photo }
    }

    // Return null to indicate no change to state.
    return null
  }

  async componentDidMount() {
    const body = {
      query: {
        ands: [
          {
            output: {
              input: {
                data: {
                  image: {
                    base64: this.state.photo.base64
                  }
                }
              }
            }
          }
        ]
      }
    }

    const result = await fetchJSON(
      'https://api.clarifai.com/v2/searches',
      {
        method: 'POST',
        body
      },
      {
        Authorization: 'Key 2e66614a535d4e27aabd35862f23c6ed'
      }
    )
    // console.log(result)

    const games = result.hits.map(result => {
      const { metadata } = result.input.data
      const { score } = result

      return {
        key: metadata.id,
        objectId: metadata.id,
        name: metadata.name,
        thumbnail: metadata.thumbnail,
        yearpublished: score
      }
    })

    console.log(games)
    const { navigate } = this.props.navigation
    navigate('List', { games })
  }

  render = () => {
    const uri = `data:image/png;base64,${this.state.photo.base64}`

    return (
      <View style={styles.mainView}>
        <Text>Processing Image...</Text>
        <Image style={{ width: 66, height: 58 }} source={{ uri }} />
      </View>
    )
  }
}

export default createStackNavigator({
  Scan: { screen: VisualSearchScreen, headerBackTitle: 'Back' },
  Processing: { screen: SnapProcessingScreen },
  List: { screen: GameListScreen },
  Game: { screen: GameScreen },
  AddTo: { screen: GameAddTo }
})
