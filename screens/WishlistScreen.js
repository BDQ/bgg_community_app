import React from 'reactn'
import PropTypes from 'prop-types'
import { createStackNavigator } from 'react-navigation'

import GameScreen from './GameScreen'
import GameSearch from './GameSearch'
import GameAddTo from './GameAddTo'
import GameList from './../components/GameList'

class WishlistListScreen extends React.PureComponent {
  static navigationOptions = {
    title: 'Wishlist'
  }

  render = () => {
    const { navigate } = this.props.navigation
    const games = this.global.collection.filter(game => game.wishlist)

    return (
      <GameList
        navigation={{ navigate }}
        games={games}
        onRefresh={this.global.fetchCollection}
      />
    )
  }
}

WishlistListScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired
  }).isRequired
}

export default createStackNavigator({
  List: { screen: WishlistListScreen },
  Game: { screen: GameScreen },
  Search: { screen: GameSearch },
  AddTo: { screen: GameAddTo }
})
