import { SENTRY_CONFIG } from 'react-native-dotenv'
import * as Sentry from 'sentry-expo'

Sentry.init({
  dsn: SENTRY_CONFIG,
  enableInExpoDevelopment: false,
  debug: true,
})


import React, { useDispatch } from 'reactn'
import { View, AsyncStorage } from 'react-native'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { createStackNavigator } from '@react-navigation/stack'

import { PREVIEW_SHORT_NAME } from 'react-native-dotenv'

import AppLoading from 'expo-app-loading'
import * as Font from 'expo-font'
import FlashMessage from 'react-native-flash-message'

// import { Owned, Wishlist, Scan, Preview, Profile, Subscriptions } from './tabs'

import ProfileScreen from './screens/OwnProfileScreen'
import LoginScreen from './screens/LoginScreen'
import OwnedScreen from './screens/Collection/OwnedScreen'
import CollectionScreen from './screens/Collection/CollectionScreen'
import HomeScreen from './screens/Home/HomeScreen'
import MeetScreen from './screens/Meet/MeetScreen'
import MessagesScreen from './screens/Mail/MessagesScreen'
import WishlistScreen from './screens/Collection/WishlistScreen'
import PreviewScreen from './screens/PreviewScreen'
import MarketScreen from './screens/Market/MarketScreen'

import Ionicons from 'react-native-vector-icons/Ionicons'

import { setupStore } from './shared/store'
import { BETA_USERS } from 'react-native-dotenv'
import styleconstants from './shared/styles/styleconstants'
import { logIn, getUserId } from './shared/auth'
import { fetchXML } from './shared/HTTP'
import { getNumUnread } from './shared/FetchWithCookie'
import { Badge } from 'react-native-elements'
import { findCoordinates } from './shared/location'
import { fetchCollectionFromBGG } from './shared/collection'

var parseString = require('react-native-xml2js').parseString;

const betaUsers = BETA_USERS.split(',')
//bootstraps ReactN global store
setupStore()

console.disableYellowBox = true;

export default class App extends React.PureComponent {
  state = {
    isReady: false,
    userDetails: null,
    loggedIn: false
  }

  async attemptBGGLoginInBackground(username, password) {
    if (username && password) {
      try {
        const { success } = await logIn(username, password)


        if (success) {
          const { userid, firstname, lastname } = await getUserId()

          if (userid > 0) {

            const bggCredentials = {
              username,
              userid,
              firstname,
              lastname
            }

            await getNumUnread()

            this.dispatch.setCredentials(bggCredentials)
            this.setState({ loggedIn: true })
            global.username = username

            // getting user info
            const url = "https://boardgamegeek.com/xmlapi2/users?name=" + username

            const userDetails = await fetchXML(url, { method: 'GET' })
            await parseString(userDetails, function (err, result) {
              //console.log("xml parsed", result)
              if (result) {
                this.setState({ userDetails: result })
              }
            }.bind(this))
          }
        }
      } catch (error) {
        console.warn(error)
        Sentry.captureException(error)
      }
    }

  }

  _fireUp = async () => {
    // load fonts, so they are ready for rendering
    await Font.loadAsync({
      lato: require('./assets/Lato-Regular.ttf'),
      'lato-bold': require('./assets/Lato-Bold.ttf')
    })
    let valueName = await AsyncStorage.getItem('userName')
    //console.log("retrieved name value")
    //console.log(valueName)
    let valuePassword = await AsyncStorage.getItem('userPassword')
    //console.log("retrieved password value")
    //console.log(valuePassword)

    await this.attemptBGGLoginInBackground(valueName, valuePassword)

    //global.location = { "city": "Utrecht", "country": "Netherlands" }

    findCoordinates()

    /// async fetch collection
    const fetchCollection = useDispatch('fetchCollection')
    fetchCollection()



  }

  _renderTabs = () => {
    const { username } = this.global.bggCredentials
    const { loggedIn } = this.global


    // let tabsToRender = { Profile }

    // if (!loggedIn) {
    // } else {
    //   tabsToRender = { Owned, Wishlist, Preview, ...tabsToRender }

    //   if (betaUsers.includes(username)) {
    //     tabsToRender = { ...tabsToRender, Scan, Subscriptions }
    //   }
    // }
    function getTabBarVisibility(route) {
      //console.log("input route", route)
      const routeName = route.state
        ? route.state.routes[route.state.index].name
        : '';

      //console.log("route name is", routeName)

      if (routeName === 'Conversation' || routeName === 'Compose') {
        return false;
      }

      return true;
    }
    const Tab = createBottomTabNavigator()
    const Drawer = createStackNavigator()

    const mainTabNav = () => {
      return <Tab.Navigator backBehavior="none" initialRouteName="Home" >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={({ route }) => ({
            tabBarVisible: getTabBarVisibility(route),
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            )
          })}
        />

        <Tab.Screen
          name="Geekmail"
          component={MessagesScreen}

          options={({ route }) => ({
            tabBarVisible: getTabBarVisibility(route),
            tabBarLabel: 'Geekmail',
            tabBarIcon: ({ color, size }) => (
              <View>

                <Ionicons name="ios-mail-outline" size={size} color={color} />
                {global.numUnread > 0 ?
                  <Badge
                    status="error"
                    containerStyle={{ position: 'absolute', top: -4, right: -4 }}
                    value={global.numUnread}

                  />
                  : null}
              </View>
            )
          })}
        />
        <Tab.Screen
          name="Collection"
          component={CollectionScreen}
          options={{
            tabBarLabel: 'Collection',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="ios-albums" size={size} color={color} />
            )
          }}
        />
        {/*
               <Tab.Screen
          name="Share"
          component={MeetScreen}
          options={({ route }) => ({
            tabBarVisible: getTabBarVisibility(route),
            tabBarLabel: 'Share',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="share-social" size={size} color={color} />
            )
          })}
        />
          <Tab.Screen
            name="Wishlist"
            component={WishlistScreen}
            options={{
              tabBarLabel: 'Wishlist',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="ios-list-box" size={size} color={color} />
              )
            }}
          />
       
          <Tab.Screen
            name="Preview"
            component={PreviewScreen}
            options={{
              tabBarLabel: PREVIEW_SHORT_NAME,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="ios-eye" size={size} color={color} />
              )
            }}
          />
          
        <Tab.Screen
          name="Market"
          component={MarketScreen}
          options={{
            tabBarLabel: 'Market',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="basket-sharp" size={size} color={color} />
            )
          }}
        />
        */}
        <Tab.Screen
          name="ProfileStack"
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Account',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="ios-person" size={size} color={color} />
            )
          }}
        />
      </Tab.Navigator>
    }

    const mainTabWrapperStack = createStackNavigator()
    const mainTabWrapper = () => {

      return <mainTabWrapperStack.Navigator initialRouteName="mainTab" >

        <mainTabWrapperStack.Screen options={{ headerShown: false }} name="mainTab" component={mainTabNav} />

      </mainTabWrapperStack.Navigator>
    }

    return (
      <NavigationContainer>

        <Drawer.Navigator initialRouteName={this.state.userDetails ? "MainTabWrapper" : "Login"} >

          <Drawer.Screen options={{ headerShown: false }} name="Login" component={LoginScreen} />
          <Drawer.Screen options={{ headerShown: false }} name="MainTabWrapper" component={mainTabWrapper} />

        </Drawer.Navigator>
      </NavigationContainer>


    )
  }

  render() {
    if (!this.state.isReady) {
      return (
        <AppLoading
          startAsync={this._fireUp}
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
