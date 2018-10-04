import React from 'react'
import { createStackNavigator } from 'react-navigation'
import { View, Text } from 'react-native'
import { Icon } from 'react-native-elements'
import GameScreen from './GameScreen'
import GameSearch from './GameSearch'
import GameAddTo from './GameAddTo'
import GameList from './../components/GameList'
import styles from '../shared/styles'

class OwnedListScreen extends React.Component {
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

  render() {
    const { navigate } = this.props.navigation
    let { games, fetchCollection } = this.props.screenProps

    if (games.length === 0) {
      return (
        <View style={styles.emptyView}>
          <Text>You have no games in your collection.</Text>
        </View>
      )
    } else {
      games = games.filter(game => game.own)

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

const OwnedScreen = createStackNavigator({
  List: { screen: OwnedListScreen },
  Game: { screen: GameScreen },
  Search: { screen: GameSearch },
  AddTo: { screen: GameAddTo }
})

module.exports = OwnedScreen
