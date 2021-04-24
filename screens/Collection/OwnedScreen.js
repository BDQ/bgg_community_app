import React, { useGlobal, useEffect, useState, useDispatch } from 'reactn'
import PropTypes from 'prop-types'
import { View, Text, InteractionManager } from 'react-native'
import { Button } from 'react-native-elements'
import { createStackNavigator } from '@react-navigation/stack'

import { Icon } from 'react-native-elements'

import GameScreen from '../GameScreen'
import LogPlay from '../Plays/Log'
import ListPlays from '../Plays/List'
import GameSearch from '../GameSearch'
import GameAddTo from '../GameAddTo'

import GameList from '../../components/GameList'

import globalStyles from '../../shared/styles'
import { logger } from '../../shared/debug'

const OwnedListScreen = (props) => {
  const navigation = props.navigation
  const route = props.route

  const [refreshing, setRefreshing] = useState(false)

  const [collectionFetchedAt, setCollectionFetchedAt] = useGlobal(
    'collectionFetchedAt'
  )
  const [loggedIn] = useGlobal('loggedIn')
  const [collection] = useGlobal('collection')

  const fetchCollection = useDispatch('fetchCollection')

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          icon={<Icon name="add-to-list" type="entypo" size={20} />}
          onPress={() => navigation.navigate('Search')}
          buttonStyle={globalStyles.headerIconButton}
        />
      ),
    })
  }, [navigation])

  useEffect(() => {
    // InteractionManager.runAfterInteractions(() => {
    // check if we need to update the users collection

    const aWeekAgo = new Date().getTime() - 1000 * 60 * 60 * 24 * 7

    if (loggedIn && collectionFetchedAt < aWeekAgo) {
      handleRefresh()
    } else {
      logger(
        'Not logged in, or collection fetched less a week ago, so skipping fetch.'
      )
    }
    // })
  })

  handleRefresh = async () => {
    setRefreshing(true)
    await fetchCollection()
    setRefreshing(false)
  }


  if (collectionFetchedAt > 0 || (props.route.params && props.route.params.gamelist)) {
    var games
    var isSelf
    if (props.route.params && props.route.params.gamelist) {
      /// if list is passed, it is a different user
      isSelf = false
      games = props.route.params.gamelist
    } else {
      games = collection.filter((game) => game.status.own === '1')
      isSelf = true
    }

    const { navigate } = props.navigation.dangerouslyGetParent().dangerouslyGetParent().dangerouslyGetParent()
    return (
      <GameList
        navigation={{ navigate }}
        listName="collection"
        games={games}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        isSelf={isSelf}
      />
    )
  } else {
    return (
      <View style={globalStyles.emptyView}>

        <Text>Loading your collection...</Text>
      </View>
    )
  }
}

OwnedListScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
}


export default OwnedListScreen
