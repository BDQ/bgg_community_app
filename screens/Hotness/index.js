import React, { useGlobal, useEffect, useState, useDispatch } from 'reactn'
import PropTypes from 'prop-types'
import { View, Text } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

import GameScreen from '../GameScreen'
import LogPlay from '../Plays/Log'
import ListPlays from '../Plays/List'
import GameList from '../../components/GameList'
import GameAddTo from '../GameAddTo'
import Spinner from '../../components/Spinner'

import globalStyles from '../../shared/styles'

const HotnessScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false)

  const [fetchedAt, setFetchedAt] = useGlobal('hotnessFetchedAt')
  const [hotness] = useGlobal('hotness')

  const fetchHotness = useDispatch('fetchHotness')

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchHotness()
    setFetchedAt(new Date().getTime())
    setRefreshing(false)
  }

  const renderGameItemDetails = (game) => {
    const renderDelta = (delta) => {
      const style = { alignSelf: 'flex-end' }
      if (delta === 0) {
        return <FontAwesome style={style} name="minus" color="#999" size={16} />
      } else if (delta < 0) {
        return (
          <FontAwesome
            style={style}
            name="caret-down"
            color="#c21721"
            size={24}
          />
        )
      } else {
        return (
          <FontAwesome
            style={style}
            name="caret-up"
            color="#1b7144"
            size={24}
          />
        )
      }
    }

    const renderRank = (rank) => {
      return rank ? <Text>Rank: {game.rank}</Text> : null
    }

    return (
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <View>
          <Text>{game.yearPublished}</Text>
          {renderRank(game.rank)}
        </View>
        <View style={{ flexGrow: 1 }}>{renderDelta(game.delta)}</View>
      </View>
    )
  }

  const renderEmptyView = () => {
    return (
      <View style={globalStyles.emptyView}>
        <Text>Whoops, didn't except this to be empty...</Text>
      </View>
    )
  }

  useEffect(() => {
    const aDayAgo = new Date().getTime() - 1000 * 60 * 60 * 24

    if (fetchedAt < aDayAgo) handleRefresh()
  })

  if (fetchedAt > 0) {
    const { navigate } = navigation

    return (
      <GameList
        navigation={{ navigate }}
        listName="hotness"
        games={hotness}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        renderGameListItemDetails={renderGameItemDetails}
        renderEmptyView={renderEmptyView}
      />
    )
  } else {
    return (
      <Spinner>
        <Text>Loading the Hotness...</Text>
      </Spinner>
    )
  }
}

HotnessScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
}

const Stack = createStackNavigator()

const HotnessStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Hotness" component={HotnessScreen} />
    <Stack.Screen
      name="Game"
      component={GameScreen}
      options={({ route }) => ({ title: route.params.game.name })}
    />
    <Stack.Screen name="AddTo" component={GameAddTo} />
    <Stack.Screen name="LogPlay" component={LogPlay} />
    <Stack.Screen name="ListPlays" component={ListPlays} />
  </Stack.Navigator>
)

HotnessStack.propTypes = {
  navigation: PropTypes.shape({
    setParams: PropTypes.func.isRequired,
    navigate: PropTypes.func.isRequired,
  }).isRequired,
}

export default HotnessStack
