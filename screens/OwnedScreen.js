import React from 'reactn'
import PropTypes from 'prop-types'
import { createStackNavigator } from 'react-navigation'
import { Icon } from 'react-native-elements'
import GameScreen from './GameScreen'
import GameSearch from './GameSearch'
import GameAddTo from './GameAddTo'
import GameList from './../components/GameList'

class OwnedListScreen extends React.PureComponent {
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
    const games = this.global.collection.filter(game => game.own)

    return (
      <GameList
        navigation={{ navigate }}
        games={games}
        onRefresh={this.global.fetchCollection}
      />
    )
  }
}

OwnedListScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired
  }).isRequired
}

export default createStackNavigator({
  List: { screen: OwnedListScreen },
  Game: { screen: GameScreen },
  Search: { screen: GameSearch },
  AddTo: { screen: GameAddTo }
})
