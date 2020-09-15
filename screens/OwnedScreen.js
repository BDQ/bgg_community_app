import React, { useGlobal, useEffect, useState, useDispatch } from 'reactn'
import PropTypes from 'prop-types'
import { Text } from 'react-native'
import { Button } from 'react-native-elements'
import { createStackNavigator } from '@react-navigation/stack'
import { Icon } from 'react-native-elements'

import GameScreen from './GameScreen'
import LogPlay from './Plays/Log'
import ListPlays from './Plays/List'
import GameSearch from './GameSearch'
import GameAddTo from './GameAddTo'

import GameList from './../components/GameList'

import globalStyles from '../shared/styles'
import { logger } from '../shared/debug'
import Spinner from '../components/Spinner'

const OwnedListScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false)

  const [collectionFetchedAt] = useGlobal('collectionFetchedAt')
  const [loggedIn] = useGlobal('loggedIn')
  const [collection] = useGlobal('collection')

  const fetchCollection = useDispatch('fetchCollection')

  const headerRight = () => (
    <Button
      icon={<Icon name="add-to-list" type="entypo" size={20} />}
      onPress={() => navigation.navigate('Search')}
      buttonStyle={globalStyles.headerIconButton}
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
    const games = collection.filter((game) => game.status.own === '1')

    return (
      <GameList
        navigation={{ navigate }}
        listName="collection"
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

OwnedListScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
}

const Stack = createStackNavigator()

export default () => (
  <Stack.Navigator>
    <Stack.Screen name="Collection" component={OwnedListScreen} />
    <Stack.Screen
      name="Game"
      component={GameScreen}
      options={({ route }) => ({ title: route.params.game.name })}
    />
    <Stack.Screen name="Search" component={GameSearch} />
    <Stack.Screen name="AddTo" component={GameAddTo} />
    <Stack.Screen name="LogPlay" component={LogPlay} />
    <Stack.Screen name="ListPlays" component={ListPlays} />
  </Stack.Navigator>
)
