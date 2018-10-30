import React from 'react'
import { createStackNavigator } from 'react-navigation'
import GameScreen from './GameScreen'
import GameSearch from './GameSearch'
import GameAddTo from './GameAddTo'
import GameList from './../components/GameList'
import { fetchCollection } from '../shared/collection'

class WishlistListScreen extends React.Component {
  state = {
    games: []
  }
  static navigationOptions = {
    title: 'Wishlist'
  }

  static getDerivedStateFromProps(props, state) {
    const { games } = props.screenProps
    const allIds = items => items.map(item => item.objectId)

    if (allIds(games) === allIds(state.games)) {
      return null
    } else {
      return { games: games.filter(game => game.wishlist) }
    }
  }

  handleRefresh = async () => {
    let games = await fetchCollection('briandquinn', true)

    this.setState({ games: games.filter(game => game.wishlist) })
  }

  render = () => {
    const { navigate } = this.props.navigation
    let { games } = this.state

    return (
      <GameList
        navigation={{ navigate }}
        games={games}
        onRefresh={this.handleRefresh}
      />
    )
  }
}

const WishlistScreen = createStackNavigator({
  List: { screen: WishlistListScreen },
  Game: { screen: GameScreen },
  Search: { screen: GameSearch },
  AddTo: { screen: GameAddTo }
})

module.exports = WishlistScreen
