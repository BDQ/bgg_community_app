import React from 'react'
import { createStackNavigator } from 'react-navigation'
import { View, Text } from 'react-native'
import GameScreen from './GameScreen'
import GameSearch from './GameSearch'
import GameAddTo from './GameAddTo'
import GameList from './../components/GameList'
import styles from '../shared/styles'

class WishlistListScreen extends React.Component {
  static navigationOptions = {
    title: 'Wishlist'
  }

  render = () => {
    const { navigate } = this.props.navigation
    let { games, fetchCollection } = this.props.screenProps

    if (games.length == 0) {
      return (
        <View style={styles.emptyView}>
          <Text>You have no games on your wishlist.</Text>
        </View>
      )
    } else {
      games = games.filter(game => game.wishlist)

      return (
        <GameList
          navigation={{ navigate }}
          games={games}
          fetchCollection={fetchCollection}
        />
      )
    }
  }
}

const WishlistScreen = createStackNavigator({
  List: { screen: WishlistListScreen },
  Game: { screen: GameScreen },
  Search: { screen: GameSearch },
  AddTo: { screen: GameAddTo }
})

module.exports = WishlistScreen
