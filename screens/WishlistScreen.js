import React from 'reactn'
import PropTypes from 'prop-types'
import { View, Text } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import { Icon } from 'react-native-elements'

import GameScreen from './GameScreen'
import GameSearch from './GameSearch'
import GameAddTo from './GameAddTo'
import LogPlay from './Plays/Log'
import GameList from './../components/GameList'

import Spinner from '../components/Spinner'

class WishlistListScreen extends React.PureComponent {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'My Wishlist',
      headerRight: (
        <Icon
          name="add-to-list"
          iconStyle={{ marginRight: 10 }}
          type="entypo"
          onPress={() => navigation.navigate('Search')}
        />
      ),
    }
  }

  handleRefresh = async () => {
    this.setState({ refreshing: true })
    this.dispatch.fetchCollection()
    this.setState({ refreshing: false })
  }

  render = () => {
    if (this.global.collectionFetchedAt > 0) {
      const { navigate } = this.props.navigation
      const games = this.global.collection.filter(
        (game) => game.status.wishlist === '1'
      )

      return (
        <GameList
          navigation={{ navigate }}
          listName="wishlist"
          refreshing={false}
          games={games}
          onRefresh={this.handleRefresh}
        />
      )
    } else {
      return (
        <Spinner>
          <Text>Loading your collection...</Text>
        </Spinner>
      )
    }
  }
}

WishlistListScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
}

const Stack = createStackNavigator()

export default () => (
  <Stack.Navigator>
    <Stack.Screen name="Wishlist" component={WishlistListScreen} />
    <Stack.Screen
      name="Game"
      component={GameScreen}
      options={({ route }) => ({ title: route.params.game.name })}
    />
    <Stack.Screen name="Search" component={GameSearch} />
    <Stack.Screen name="AddTo" component={GameAddTo} />
    <Stack.Screen name="LogPlay" component={LogPlay} />
  </Stack.Navigator>
)
