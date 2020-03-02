import { SENTRY_CONFIG } from 'react-native-dotenv'
import * as Sentry from 'sentry-expo'
Sentry.init({
  dsn: SENTRY_CONFIG,
  enableInExpoDevelopment: false,
  debug: true
})

import React from 'reactn'
import { View } from 'react-native'
import { createAppContainer } from 'react-navigation'
import { createBottomTabNavigator } from 'react-navigation-tabs'
import { AppLoading } from 'expo'
import * as Font from 'expo-font'
import FlashMessage from 'react-native-flash-message'

import { Owned, Wishlist, Scan, Preview, Profile, Subscriptions } from './tabs'
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
    const { loggedIn } = this.global

    let AppNavigator

    let tabsToRender = { Profile }

    if (!loggedIn) {
    } else {
      tabsToRender = { Owned, Wishlist, Preview, ...tabsToRender }

      if (betaUsers.includes(username)) {
        tabsToRender = { ...tabsToRender, Scan, Subscriptions }
      }
    }

    AppNavigator = createBottomTabNavigator(tabsToRender)

    const App = createAppContainer(AppNavigator)

    return <App />
  }

  render() {
    if (!this.state.isReady) {
      return (
        <AppLoading
          startAsync={this._cacheResourcesAsync}
          onFinish={() => this.setState({ isReady: true })}
          onError={console.warn}
        />
      )
    } else {
      return (
        <View style={{ flex: 1 }}>
          {this._renderTabs()}
          <FlashMessage position="top" />
        </View>
      )
    }
  }
}
