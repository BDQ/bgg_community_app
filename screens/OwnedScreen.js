import React from 'react'
import { createStackNavigator } from 'react-navigation'
import { Icon } from 'react-native-elements'
import GameScreen from './GameScreen'
import GameSearch from './GameSearch'
import GameAddTo from './GameAddTo'
import GameList from './../components/GameList'

import { fetchCollection } from '../shared/collection'

class OwnedListScreen extends React.Component {
  state = {
    games: []
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Owned',
      headerRight: (
        <Icon
          name="add-to-list"
          iconStyle={{ marginRight: 10 }}
          type="entypo"
          onPress={() => navigation.navigate('Search')}
        />
      )
    }
  }

  handleRefresh = async () => fetchCollection('briandquinn', true)

  render() {
    const { navigate } = this.props.navigation
    let { games } = this.state
    games = games.filter(game => game.own)

    return (
      <GameList
        navigation={{ navigate }}
        games={games}
        onRefresh={this.handleRefresh}
      />
    )
  }
}

const OwnedScreen = createStackNavigator({
  List: { screen: OwnedListScreen },
  Game: { screen: GameScreen },
  Search: { screen: GameSearch },
  AddTo: { screen: GameAddTo }
})

module.exports = OwnedScreen
