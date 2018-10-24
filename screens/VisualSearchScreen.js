import React from 'react'
import { createStackNavigator } from 'react-navigation'
import { View, Text, Image } from 'react-native'
import ProgressBar from 'react-native-progress/Circle'
import { Button } from 'react-native-elements'
import { showMessage } from 'react-native-flash-message'

import { CLARIFAI_API_KEY } from 'react-native-dotenv'
import Camera from '../components/Camera'

import GameScreen from './GameScreen'
import GameAddTo from './GameAddTo'

import { fetchJSON } from '../shared/HTTP'
import GameListScreen from './GameListScreen'

class VisualSearchScreen extends React.Component {
  state = {
    showCamera: true,
    photo: null,
    searchComplete: false
  }

  // uncomment this, and set photo: true to state
  // componentDidMount = () => {
  //   // const base64 = '' //grab contents of base64cover.txt
  //   // this.handleScan({ base64 })
  // }

  handleCancel = () => {
    this.setState({ showCamera: false })
  }

  handleSnap = async photo => {
    this.setState({ photo, showCamera: false, searchComplete: false })

    const body = {
      query: {
        ands: [
          {
            output: {
              input: {
                data: {
                  image: {
                    base64: photo.base64
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
        Authorization: `Key ${CLARIFAI_API_KEY}`
      }
    )

    if (result) {
      const games = result.hits.map(result => {
        const { metadata } = result.input.data
        const { score } = result

        return {
          key: metadata.id,
          objectId: metadata.id,
          name: metadata.name,
          thumbnail: metadata.thumbnail,
          yearpublished: score,
          searchScore: score
        }
      })

      await this.setState({ searchComplete: true })

      // navigate to the results list
      this.props.navigation.push('List', { games })

      if (games.length > 2) {
        // if the top game has a good score, and is at least 1 full point above the next game
        // we just jump directly to that game, as opposed to showing the list
        const game = games[0]
        if (
          game.searchScore > 0.69 ||
          (game.searchScore > 0.6 &&
            games[1].searchScore < game.searchScore - 1)
        ) {
          this.props.navigation.push('Game', { game: games[0] })
        }
      }
    } else {
      showMessage({
        message:
          'Something went wrong with the image search, please try again.',
        icon: 'auto',
        type: 'danger',
        duration: 3500
      })
      this.setState({ searchComplete: true })
    }
  }

  snapAgain = () => {
    this.setState({ showCamera: true })
  }

  _renderStatus = () => {
    const { searchComplete } = this.state

    if (searchComplete) {
      return null
    } else {
      return (
        <React.Fragment>
          <ProgressBar indeterminate={true} color="#000000" style={{}} />
          <Text style={{ marginTop: 15, marginBottom: 10 }}>
            Searching the shelves...
          </Text>
        </React.Fragment>
      )
    }
  }

  render = () => {
    if (this.state.showCamera) {
      return <Camera onScan={this.handleSnap} onCancel={this.handleCancel} />
    } else {
      const uri = `data:image/png;base64,${this.state.photo.base64}`

      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            paddingTop: 20
          }}
        >
          {this._renderStatus()}
          <Image
            style={{
              width: '90%',
              height: 300,
              marginBottom: 10,
              resizeMode: Image.resizeMode.contain
            }}
            source={{ uri }}
          />

          <Button
            raised
            icon={{ name: 'camera' }}
            title="Take Another"
            onPress={this.snapAgain}
          />
        </View>
      )
    }
  }
}

export default createStackNavigator({
  Scan: { screen: VisualSearchScreen, headerBackTitle: 'Back' },
  List: { screen: GameListScreen },
  Game: { screen: GameScreen },
  AddTo: { screen: GameAddTo }
})
