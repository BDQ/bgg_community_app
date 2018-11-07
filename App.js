import { SENTRY_CONFIG } from 'react-native-dotenv'
import Sentry from 'sentry-expo'
Sentry.config(SENTRY_CONFIG).install()

import React, { setGlobal, addReducer } from 'reactn'
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

import { loadCollection, fetchCollection } from './shared/collection'

// initial state
setGlobal({
  collection: [],
  loggedIn: false,
  bggCredentials: {}
})

// reducers
addReducer('setBggCredentials', (state, bggCredentials) => {
  const loggedIn = Object.keys(bggCredentials).length > 0

  return { loggedIn, bggCredentials }
})

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
    isReady: false,
    updatedAt: undefined
  }

  loadAuth = async () => {
    try {
      const value = await AsyncStorage.getItem('@BGGApp:auth')
      let auth = {}

      if (value !== null) {
        auth = JSON.parse(value)
      }
      this.global.setBggCredentials(auth)
    } catch (error) {
      Sentry.captureException(error)
    }
  }

  _cacheResourcesAsync = async () => {
    const persistedState = await loadCollection(this.state.updateAt)
    // console.log(Object.keys(persistedState))

    if (persistedState) {
      this.setState(persistedState)
    }

    let promises = [
      Font.loadAsync({
        lato: require('./assets/Lato-Regular.ttf'),
        'lato-bold': require('./assets/Lato-Bold.ttf')
      }),
      this.loadAuth()
    ]

    await Promise.all(promises)

    const collection = await fetchCollection(
      this.global.bggCredentials.username
    )

    this.setGlobal({ collection })
    // this.setState({ games })
  }

  render() {
    const { bggCredentials } = this.global
    const isLoggedIn = Object.keys(bggCredentials).length > 0

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
