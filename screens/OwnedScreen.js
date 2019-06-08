import React from 'reactn'
import PropTypes from 'prop-types'
import { View, Text } from 'react-native'
import { createStackNavigator } from 'react-navigation'
import { Icon } from 'react-native-elements'
import ProgressBar from 'react-native-progress/Circle'

import GameScreen from './GameScreen'
import GameSearch from './GameSearch'
import GameAddTo from './GameAddTo'
import GameList from './../components/GameList'

import styles from '../shared/styles'

class OwnedListScreen extends React.PureComponent {
  state = {
    collectionFetched: false,
    refreshing: false
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title: 'My Collection',
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
    this.dispatch.fetchCollection()
    this.setState({ refreshing: false })
  }

  render() {
    if (this.global.collectionFetchedAt > 0) {
      const { navigate } = this.props.navigation
      const games = this.global.collection.filter(
        game => game.status.own === '1'
      )

      return (
        <GameList
          navigation={{ navigate }}
          games={games}
          refreshing={this.state.refreshing}
          onRefresh={this.handleRefresh}
        />
      )
    } else {
      return (
        <View style={styles.emptyView}>
          <ProgressBar
            indeterminate={true}
            color="#000000"
            style={{ marginBottom: 10 }}
          />
          <Text>Loading your collection...</Text>
        </View>
      )
    }
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
