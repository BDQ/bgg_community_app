import React, { useEffect, useState, useGlobal, useDispatch } from 'reactn'
import PropTypes from 'prop-types'
import { Text } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import { Icon } from 'react-native-elements'

import GameScreen from './GameScreen'
import GameSearch from './GameSearch'
import GameAddTo from './GameAddTo'
import LogPlay from './Plays/Log'
import GameList from './../components/GameList'

import Spinner from '../components/Spinner'
import { logger } from '../shared/debug'

const WishlistListScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false)

  const [collectionFetchedAt] = useGlobal('collectionFetchedAt')
  const [loggedIn] = useGlobal('loggedIn')
  const [collection] = useGlobal('collection')

  const fetchCollection = useDispatch('fetchCollection')

  const headerRight = () => (
    <Icon
      name="add-to-list"
      iconStyle={{ marginRight: 10 }}
      type="entypo"
      onPress={() => navigation.navigate('Search')}
    />
  )

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight,
    })
  }, [navigation])

  useEffect(() => {
    const aWeekAgo = new Date().getTime() - 1000 * 60 * 60 * 24 * 7

    if (loggedIn && collectionFetchedAt < aWeekAgo) {
      handleRefresh()
    } else {
      logger(
        'Not logged in, or collection fetched less a week ago, so skipping fetch.'
      )
    }
  })

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchCollection()
    setRefreshing(false)
  }
  if (collectionFetchedAt > 0) {
    const { navigate } = navigation
    const games = collection.filter((game) => game.status.wishlist === '1')

    return (
      <GameList
        navigation={{ navigate }}
        listName="wishlist"
        games={games}
        refreshing={refreshing}
        onRefresh={handleRefresh}
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
