import Sentry from 'sentry-expo'
// Sentry.enableInExpoDevelopment = true;
Sentry.config(
  'https://610b42b2d6174ec78fd80f388169d5df@sentry.io/247243'
).install()

import React, { Component } from 'react'
import { AsyncStorage, View, Text, FlatList } from 'react-native'
import { createBottomTabNavigator } from 'react-navigation'
import { Font, AppLoading } from 'expo'
import FlashMessage from 'react-native-flash-message'
import parse from 'xml-parser'

import Ionicons from 'react-native-vector-icons/Ionicons'
import OwnedScreen from './screens/OwnedScreen'
import WishlistScreen from './screens/WishlistScreen'
import PreviewScreen from './screens/PreviewScreen'
import ProfileScreen from './screens/ProfileScreen'

const AppNavigator = createBottomTabNavigator({
  // Owned: {
  //   screen: OwnedScreen,
  //   navigationOptions: {
  //     tabBarLabel: 'Owned',
  //     tabBarIcon: ({ tintColor, focused }) => (
  //       <Ionicons
  //         name={focused ? 'ios-albums' : 'ios-albums-outline'}
  //         size={26}
  //         style={{ color: tintColor }}
  //       />
  //     )
  //   }
  // },
  // Wishlist: {
  //   screen: WishlistScreen,
  //   navigationOptions: {
  //     tabBarLabel: 'Wishlist',
  //     tabBarIcon: ({ tintColor, focused }) => (
  //       <Ionicons
  //         name={focused ? 'ios-list-box' : 'ios-list-box-outline'}
  //         size={26}
  //         style={{ color: tintColor }}
  //       />
  //     )
  //   }
  // },
  Preview: {
    screen: PreviewScreen,
    navigationOptions: {
      tabBarLabel: 'Essen Preview',
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

class App extends React.Component {
  state = {
    isReady: false,
    collection: [],
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
      // this.fetchCollection(auth.bgg_username)
      this.setState({ bgg_credentials: auth })
    } catch (error) {
      Sentry.captureException(error)
    }
  }

  _cacheResourcesAsync = async () => {
    await this.loadCollection()

    let promises = [
      Font.loadAsync({
        lato: require('./assets/Lato-Regular.ttf'),
        'lato-bold': require('./assets/Lato-Bold.ttf')
      }),
      this.loadAuth()
    ]

    await Promise.all(promises)
  }

  loadCollection = async () => {
    if (!this.state.updatedAt) {
      try {
        const value = await AsyncStorage.getItem('@BGGApp:collection')
        if (value !== null) {
          const { games, updatedAt } = JSON.parse(value)
          this.setState({
            collection: games,
            updatedAt
          })
        }
      } catch (error) {
        Sentry.captureException(error)
      }
    }
  }

  parseXML = async xml => new Promise(resolve => resolve(parse(xml)))

  fetchCollection = async (username, force) => {
    if (!username) {
      return false
    }

    const { updatedAt } = this.state
    console.log({ username, updatedAt })

    const aDayAgo = new Date().getTime() - 1000 * 60 * 60 * 24
    if (updatedAt > aDayAgo && !force) {
      console.log(
        'Collection fetched less than 24 hours ago, so skipping fetch.'
      )
      return false
    }

    const url = `https://www.boardgamegeek.com/xmlapi2/collection?username=${username}`

    this.setState({ loading: true })

    try {
      let response = await fetch(url)

      if (response.status == 202) {
        setTimeout(this.fetchCollection, 5000)
      } else if (response.status == 200) {
        let xml = await response.text()

        let doc = await this.parseXML(xml)

        let games = doc.root.children.map(item => {
          let objectid = item.attributes.objectid
          let name = item.children.find(e => e.name == 'name').content
          let yearpublished = (
            item.children.find(e => e.name == 'yearpublished') || {}
          ).content
          let image = (item.children.find(e => e.name == 'image') || {}).content
          let thumbnail = (item.children.find(e => e.name == 'thumbnail') || {})
            .content

          let status = item.children.find(e => e.name == 'status') || {}
          let own = status.attributes.own == '1'
          let wishlist = status.attributes.wishlist == '1'

          return {
            objectid,
            name,
            yearpublished,
            image,
            thumbnail,
            own,
            wishlist
          }
        })

        let removeDuplicates = (myArr, prop) => {
          return myArr.filter((obj, pos, arr) => {
            return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos
          })
        }

        games = removeDuplicates(games, 'objectid')

        try {
          const updatedAt = new Date().getTime()

          AsyncStorage.setItem(
            '@BGGApp:collection',
            JSON.stringify({ games, updatedAt })
          )
        } catch (error) {
          Sentry.captureException(error)
        }

        this.setState({ collection: games })
      } else {
        Sentry.captureMessage(
          'Non 200/202 Response from BGG when loading collection.',
          (extra: { url: url, stauts: response.status })
        )
      }
    } catch (error) {
      Sentry.captureException(error)
    }
  }

  render() {
    const games = this.state.collection
    const bgg_credentials = this.state.bgg_credentials
    const isLoggedIn = Object.keys(bgg_credentials).length > 0
    const loadAuth = this.loadAuth
    const fetchCollection = this.fetchCollection

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
                loadAuth,
                fetchCollection
              }}
            />
            <FlashMessage position="top" />
          </View>
        )
      }
    }
  }
}

export default App
