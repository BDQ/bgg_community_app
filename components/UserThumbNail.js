import React, { useState, useDispatch } from 'react'
import PropTypes from 'prop-types'
import { FlatList, TouchableOpacity, View, Text, ScrollView } from 'react-native'
import { SearchBar } from 'react-native-elements'
import styleconstants from '../shared/styles/styleconstants'
import GameListItemHorizontal from './GameListItemHorizontal'

import styles from '../shared/styles'
import { useSafeArea } from 'react-native-safe-area-view'
import { fetchCollectionFromBGG } from '../shared/collection'

import { BarIndicator } from 'react-native-indicators';

export default UserThumbNail = props => {

    async function getCollection() {
        gamesFetched = await fetchCollectionFromBGG(props.userName)
        gamesFiltered = gamesFetched.filter((game) => game.status.own === '1')
        setGames(gamesFiltered)
        setGamesFetched(true)
    }

    keyExtractor = item => item.key || item.objectId
    let [games, setGames] = useState([])
    let [gamesFetched, setGamesFetched] = useState(false)

    if (!gamesFetched && games.length === 0) {
        getCollection()
    }

    getItemLayout = (_, index) => {
        const itemHeight = 100
        return {
            length: itemHeight,
            offset: itemHeight * index,
            index
        }
    }

    _renderItem = ({ item }) => {

        return (
            <TouchableOpacity
                onPress={() => {
                    props.navigation.navigate('GameStack', { screen: 'Game', params: { game: item } })
                }}
            >
                <GameListItemHorizontal
                    name={item.name}
                    thumbnail={item.thumbnail}
                    subtitle={item.subtitle}
                />
            </TouchableOpacity>
        )
    }

    if (gamesFetched && games.length === 0) {
        return (null)
    } else {
        return (
            <View style={{ padding: 10, height: 130, backgroundColor: 'white', borderRadius: 15, shadowOpacity: 0.2, margin: 10 }}>
                <View style={{ marginBottom: 5 }}>
                    <Text style={{ fontFamily: styleconstants.primaryFont }}>{props.userName + " owns 5 of your wants."}</Text>

                </View>
                {gamesFetched ?
                    <ScrollView horizontal>
                        <FlatList
                            data={games}
                            keyExtractor={keyExtractor}
                            renderItem={_renderItem}
                            getItemLayout={getItemLayout}
                            horizontal
                        />
                    </ScrollView>

                    :
                    <BarIndicator color={styleconstants.bggorange} count={5} size={20} />
                }
            </View>

        )
    }



}

UserThumbNail.propTypes = {

    userName: PropTypes.string.isRequired,
}
