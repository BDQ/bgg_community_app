import { SENTRY_CONFIG } from 'react-native-dotenv'
import Sentry from 'sentry-expo'
Sentry.config(SENTRY_CONFIG).install()

import React from 'reactn'
import { View } from 'react-native'
import { createBottomTabNavigator } from 'react-navigation'
import { Font, AppLoading } from 'expo'
import FlashMessage from 'react-native-flash-message'

import { Owned, Wishlist, Scan, Profile } from './tabs'
import ProfileScreen from './screens/ProfileScreen'

import { setupStore } from './shared/store'
import { BETA_USERS } from 'react-native-dotenv'

const betaUsers = BETA_USERS.split(',')
//bootstraps ReactN global store
setupStore()

export default class App extends React.PureComponent {
  state = {
    isReady: false
  }

  _cacheResourcesAsync = async () => {
    // load fonts, so they are ready for rendering
    await Font.loadAsync({
      lato: require('./assets/Lato-Regular.ttf'),
      'lato-bold': require('./assets/Lato-Bold.ttf')
    })
  }

  _renderTabs = () => {
    const { username } = this.global.bggCredentials
    let AppNavigator

    if (betaUsers.includes(username)) {
      AppNavigator = createBottomTabNavigator({
        Owned,
        Wishlist,
        Scan,
        Profile
      })
    } else {
      AppNavigator = createBottomTabNavigator({
        Owned,
        Wishlist,
        Profile
      })
    }

    return <AppNavigator />
  }

  render() {
    const {
      loggedIn,
      bggCredentials: { username }
    } = this.global

    if (!this.state.isReady) {
      return (
        <AppLoading
          startAsync={this._cacheResourcesAsync}
          onFinish={() => this.setState({ isReady: true })}
          onError={console.warn}
        />
      )
    } else {
      if (!loggedIn) {
        return (
          <View style={{ flex: 1 }}>
            <ProfileScreen title="BGG Community App" />
            <FlashMessage position="top" />
          </View>
        )
      } else {
        return (
          <View style={{ flex: 1 }}>
            {this._renderTabs(username)}
            <FlashMessage position="top" />
          </View>
        )
      }
    }
  }
}
