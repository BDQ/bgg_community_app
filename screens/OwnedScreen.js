import React from 'reactn'
import PropTypes from 'prop-types'
import { createStackNavigator } from 'react-navigation'
import { Icon } from 'react-native-elements'
import GameScreen from './GameScreen'
import GameSearch from './GameSearch'
import GameAddTo from './GameAddTo'
import GameList from './../components/GameList'

import { fetchCollection } from '../shared/collection'

class OwnedListScreen extends React.PureComponent {
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

  componentDidMount = () => {
    const { collection } = this.global
    const allIds = items => items.map(item => item.objectId)

    if (allIds(collection) !== allIds(this.state.games)) {
      this.filterAndPersistCollection(collection)
    }
  }

  filterAndPersistCollection = collection =>
    this.setState({ games: collection.filter(game => game.own) })

  handleRefresh = async () => {
    const { username } = this.global.bggCredentials
    const collection = await fetchCollection(username, true)

    this.filterAndPersistCollection(collection)
  }

  render() {
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
