import React from 'reactn'
import PropTypes from 'prop-types'
import { createStackNavigator } from 'react-navigation'
import { Icon } from 'react-native-elements'

import GameScreen from './GameScreen'
import GameSearch from './GameSearch'
import GameAddTo from './GameAddTo'
import GameList from './../components/GameList'

class OwnedListScreen extends React.PureComponent {
  state = {
    refreshing: false
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

  componentDidMount = async () => {
    // check if we need to update the users collection
    const { collectionFetchedAt, loggedIn } = this.global

    const aWeekAgo = new Date().getTime() - 1000 * 60 * 60 * 24 * 7
    if (loggedIn && collectionFetchedAt < aWeekAgo) {
      this.handleRefresh()
    } else {
      console.log(
        'Not logged in, or collection fetched less a week ago, so skipping fetch.'
      )
    }
  }

  handleRefresh = async () => {
    this.setState({ refreshing: true })
    this.global.fetchCollection()
    this.setState({ refreshing: false })
  }

  render() {
    const { navigate } = this.props.navigation
    const games = this.global.collection.filter(game => game.status.own === '1')

    return (
      <GameList
        navigation={{ navigate }}
        games={games}
        refreshing={this.state.refreshing}
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
