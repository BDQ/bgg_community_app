import { SENTRY_CONFIG } from 'react-native-dotenv'
import Sentry from 'sentry-expo'
Sentry.config(SENTRY_CONFIG).install()

import React from 'react'
import { AsyncStorage, View } from 'react-native'
import { createBottomTabNavigator } from 'react-navigation'
import { Font, AppLoading } from 'expo'
import FlashMessage from 'react-native-flash-message'

import Ionicons from 'react-native-vector-icons/Ionicons'
import OwnedScreen from './screens/OwnedScreen'
import WishlistScreen from './screens/WishlistScreen'
import PreviewScreen from './screens/PreviewScreen'
import ProfileScreen from './screens/ProfileScreen'
import VisualSearchScreen from './screens/VisualSearchScreen'

import { loadCollection } from './shared/collection'

const AppNavigator = createBottomTabNavigator({
  Owned: {
    screen: OwnedScreen,
    navigationOptions: {
      tabBarLabel: 'Owned',
      tabBarIcon: ({ tintColor, focused }) => (
        <Ionicons
          name={focused ? 'ios-albums' : 'ios-albums-outline'}
          size={26}
          style={{ color: tintColor }}
        />
      )
    }
  },
  Wishlist: {
    screen: WishlistScreen,
    navigationOptions: {
      tabBarLabel: 'Wishlist',
      tabBarIcon: ({ tintColor, focused }) => (
        <Ionicons
          name={focused ? 'ios-list-box' : 'ios-list-box-outline'}
          size={26}
          style={{ color: tintColor }}
        />
      )
    }
  },
  Scan: {
    screen: VisualSearchScreen,
    navigationOptions: {
      tabBarLabel: 'Scan',
      tabBarIcon: ({ tintColor, focused }) => (
        <Ionicons
          name={focused ? 'ios-qr-scanner' : 'ios-qr-scanner-outline'}
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
      tabBarIcon: ({ tintColor, focused }) => (
        <Ionicons
          name={focused ? 'ios-eye' : 'ios-eye-outline'}
          size={26}
          style={{ color: tintColor }}
        />
      )
    }
  },
  Profile: {
    screen: ProfileScreen,
    navigationOptions: {
      tabBarLabel: 'Account',
      tabBarIcon: ({ tintColor, focused }) => (
        <Ionicons
          name={focused ? 'ios-person' : 'ios-person-outline'}
          size={26}
          style={{ color: tintColor }}
        />
      )
    }
  }
})

export default class App extends React.Component {
  state = {
    games: [],
    isReady: false,
    updatedAt: undefined,
    bgg_credentials: {}
  }

  loadAuth = async () => {
    try {
      const value = await AsyncStorage.getItem('@BGGApp:auth')
      let auth = {}

      if (value !== null) {
        auth = JSON.parse(value)
      }

      this.setState({ bgg_credentials: auth })
    } catch (error) {
      Sentry.captureException(error)
    }
  }

  _cacheResourcesAsync = async () => {
    const persistedState = await loadCollection(this.state.updateAt)
    this.setState(persistedState)

    let promises = [
      Font.loadAsync({
        lato: require('./assets/Lato-Regular.ttf'),
        'lato-bold': require('./assets/Lato-Bold.ttf')
      }),
      this.loadAuth()
    ]

    await Promise.all(promises)
  }

  render() {
    const { games } = this.state
    const bgg_credentials = this.state.bgg_credentials
    const isLoggedIn = Object.keys(bgg_credentials).length > 0
    const loadAuth = this.loadAuth

    if (!this.state.isReady) {
      return (
        <AppLoading
          startAsync={this._cacheResourcesAsync}
          onFinish={() => this.setState({ isReady: true })}
          onError={console.warn}
        />
      )
    } else {
      if (!isLoggedIn) {
        return (
          <View style={{ flex: 1 }}>
            <ProfileScreen
              screenProps={{ bgg_credentials, loadAuth }}
              title="BGG Community App"
            />
            <FlashMessage position="top" />
          </View>
        )
      } else {
        return (
          <View style={{ flex: 1 }}>
            <AppNavigator
              screenProps={{
                games,
                bgg_credentials,
                loadAuth
              }}
            />
            <FlashMessage position="top" />
          </View>
        )
      }
    }
  }
}
