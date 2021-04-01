import { SENTRY_CONFIG } from 'react-native-dotenv'
import * as Sentry from 'sentry-expo'
Sentry.init({
  dsn: SENTRY_CONFIG,
  enableInExpoDevelopment: false,
  enableNative: false,
  debug: true,
})

import React from 'reactn'
import { View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { PREVIEW_SHORT_NAME, BETA_USERS } from 'react-native-dotenv'
const betaUsers = BETA_USERS.split(',')

import AppLoading from 'expo-app-loading'
import * as Font from 'expo-font'
import FlashMessage from 'react-native-flash-message'

import ProfileScreen from './screens/ProfileScreen'
import OwnedScreen from './screens/OwnedScreen'
import WishlistScreen from './screens/WishlistScreen'
import PreviewScreen from './screens/PreviewScreen'
import HotnessScreen from './screens/Hotness'

import Ionicons from 'react-native-vector-icons/Ionicons'

import { setupStore } from './shared/store'

//bootstraps ReactN global store
setupStore()

export default class App extends React.PureComponent {
  state = {
    isReady: false,
  }

  _cacheResourcesAsync = async () => {
    // load fonts, so they are ready for rendering
    await Font.loadAsync({
      lato: require('./assets/Lato-Regular.ttf'),
      'lato-bold': require('./assets/Lato-Bold.ttf'),
    })
  }

  _renderTabs = () => {
    const { loggedIn } = this.global

    const Tab = createBottomTabNavigator()

    if (!loggedIn)
      return (
        <NavigationContainer>
          <ProfileScreen />
        </NavigationContainer>
      )

    return (
      <NavigationContainer>
        <Tab.Navigator backBehavior="none">
          <Tab.Screen
            name="Hotness"
            component={HotnessScreen}
            options={{
              tabBarLabel: 'Hotness',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="ios-flame" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Owned"
            component={OwnedScreen}
            options={{
              tabBarLabel: 'Collection',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="ios-albums" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Wishlist"
            component={WishlistScreen}
            options={{
              tabBarLabel: 'Wishlist',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="ios-list" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Preview"
            component={PreviewScreen}
            options={{
              tabBarLabel: PREVIEW_SHORT_NAME.toString(),
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="ios-eye" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              tabBarLabel: 'Account',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="ios-person" size={size} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    )
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
        <SafeAreaProvider>
          <View style={{ flex: 1 }}>
            {this._renderTabs()}
            <FlashMessage position="top" />
          </View>
        </SafeAreaProvider>
      )
    }
  }
}
