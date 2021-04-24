import React from 'reactn'
import PropTypes from 'prop-types'
import { View, Text } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import { Icon } from 'react-native-elements'

import GameScreen from '../GameScreen'
import GameSearch from '../GameSearch'
import GameAddTo from '../GameAddTo'
import LogPlay from '../Plays/Log'
import GameList from '../../components/GameList'

import styles from '../../shared/styles'

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
      )
    }
  }

  handleRefresh = async () => {
    this.setState({ refreshing: true })
    this.dispatch.fetchCollection()
    this.setState({ refreshing: false })
  }

  render = () => {
    if (this.global.collectionFetchedAt > 0 || (this.props.route.params && this.props.route.params.gamelist)) {
      var games
      var isSelf
      if (this.props.route.params && this.props.route.params.gamelist) {
        /// if list is passed, it is a different user
        isSelf = false
        games = this.props.route.params.gamelist
      } else {
        games = this.global.collection.filter(
          game => (game.status.wishlist === '1' || game.status.wishlist === '1' || game.status.wishlist === '1')
        )
        isSelf = true
      }

      const { navigate } = this.props.navigation.dangerouslyGetParent().dangerouslyGetParent().dangerouslyGetParent()

      return (
        <GameList
          navigation={{ navigate }}
          listName="wishlist"
          refreshing={false}
          games={games}
          onRefresh={this.handleRefresh}
          isSelf={isSelf}
        />
      )
    } else {
      return (
        <View style={styles.emptyView}>

          <Text>Loading your collection...</Text>
        </View>
      )
    }
  }
}

WishlistListScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired
  }).isRequired
}


export default WishlistListScreen