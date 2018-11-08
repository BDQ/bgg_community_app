import { SENTRY_CONFIG } from 'react-native-dotenv'
import Sentry from 'sentry-expo'
Sentry.config(SENTRY_CONFIG).install()

import React from 'reactn'
import { View } from 'react-native'
import { createBottomTabNavigator } from 'react-navigation'
import { Font, AppLoading } from 'expo'
import FlashMessage from 'react-native-flash-message'

import Ionicons from 'react-native-vector-icons/Ionicons'
import OwnedScreen from './screens/OwnedScreen'
import WishlistScreen from './screens/WishlistScreen'
import PreviewScreen from './screens/PreviewScreen'
import ProfileScreen from './screens/ProfileScreen'
import VisualSearchScreen from './screens/VisualSearchScreen'

import { setupStore } from './shared/store'

//bootstraps ReactN global store
setupStore()

const AppNavigator = createBottomTabNavigator({
  Owned: {
    screen: OwnedScreen,
    navigationOptions: {
      tabBarLabel: 'Collection',
      tabBarIcon: ({ tintColor }) => (
        <Ionicons name="ios-albums" size={26} style={{ color: tintColor }} />
      )
    }
  },
  Wishlist: {
    screen: WishlistScreen,
    navigationOptions: {
      tabBarLabel: 'Wishlist',
      tabBarIcon: ({ tintColor }) => (
        <Ionicons name="ios-list-box" size={26} style={{ color: tintColor }} />
      )
    }
  },
  Scan: {
    screen: VisualSearchScreen,
    navigationOptions: {
      tabBarLabel: 'Scan',
      tabBarIcon: ({ tintColor }) => (
        <Ionicons
          name="ios-qr-scanner"
          size={26}
          style={{ color: tintColor }}
        />
      )
    }
  },
  Preview: {
    screen: PreviewScreen,
    navigationOptions: {
      tabBarLabel: 'Essen',
      tabBarIcon: ({ tintColor }) => (
        <Ionicons name="ios-eye" size={26} style={{ color: tintColor }} />
      )
    }
  },
  Profile: {
    screen: ProfileScreen,
    navigationOptions: {
      tabBarLabel: 'Account',
      tabBarIcon: ({ tintColor }) => (
        <Ionicons name="ios-person" size={26} style={{ color: tintColor }} />
      )
    }
  }
})

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

  render() {
    const { loggedIn } = this.global

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
            <AppNavigator />
            <FlashMessage position="top" />
          </View>
        )
      }
    }
  }
}
