import React, { useState, useDispatch } from 'react'
import PropTypes from 'prop-types'
import { FlatList, TouchableOpacity, View, Text, ScrollView } from 'react-native'
import styleconstants from '../shared/styles/styleconstants'
import GameListItemHorizontal from './GameListItemHorizontal'
import { SearchBar, Icon } from 'react-native-elements'

import styles from '../shared/styles'
import { useSafeArea } from 'react-native-safe-area-view'


export default UserThumbNail = props => {
    let games = props.otherGames
    let inUserWishlist = props.inUserWishlist
    let othersWishlist = props.othersWishlist

    keyExtractor = item => item.key || item.objectId

    getItemLayout = (_, index) => {
        const itemHeight = 100
        return {
            length: itemHeight,
            offset: itemHeight * index,
            index
        }
    }


    const renderItemWithIcon = (item, icon) => {

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
                <View style={{ position: 'absolute', right: -1, top: -5 }}>
                    {icon}

                </View>
            </TouchableOpacity>

        )
    }


    _renderItem = ({ item }) => {
        return renderItemWithIcon(item, null)
    }

    _renderTarget = ({ item }) => {

        const icon = <Icon
            name="bookmark"
            color={styleconstants.bggorange}
            type="font-awesome"
            size={28}

        />
        return renderItemWithIcon(item, icon)
    }

    if (games.length === 0 && inUserWishlist.length === 0) {
        return (null)
    } else {
        return (
            <TouchableOpacity style={{ padding: 10, height: 130, backgroundColor: 'white', margin: 1 }}
                onPress={() => {
                    props.navigation.navigate('User', { screen: 'Profile', params: { userName: props.userName, lists: { inUserWishlist: inUserWishlist, otherGames: games, othersWishlist: othersWishlist } } })
                }}

            >
                {inUserWishlist.length > 0 ?
                    <View style={{ marginBottom: 5, height: 30, flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontFamily: styleconstants.primaryFontBold }}>{props.userName + " owns " + inUserWishlist.length.toString() + " of your wants."}</Text>
                        <Text style={{ color: 'dodgerblue', textDecorationLine: 'underline' }}>{"See all games (" + (games.length + inUserWishlist.length).toString() + ") >"}</Text>

                    </View>
                    : <View style={{ marginBottom: 5, height: 30, flexDirection: 'row', justifyContent: 'space-between' }}>

                        <Text style={{ fontFamily: styleconstants.primaryFontBold }}>{props.userName}</Text>
                        <Text style={{ color: 'dodgerblue', textDecorationLine: 'underline' }}>{"See all games (" + (games.length + inUserWishlist.length).toString() + ") >"}</Text>

                    </View>
                }
                <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                    {inUserWishlist.length > 0 ?


                        <FlatList
                            data={inUserWishlist}
                            keyExtractor={keyExtractor}
                            renderItem={_renderTarget}
                            getItemLayout={getItemLayout}
                            horizontal
                        />
                        :
                        <FlatList
                            data={games.slice(0, 10)}
                            keyExtractor={keyExtractor}
                            renderItem={_renderItem}
                            getItemLayout={getItemLayout}
                            horizontal
                        />
                    }



                </View>



            </TouchableOpacity>

        )
    }



}
