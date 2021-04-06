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
                <View style={{ position: 'absolute', right: -10, top: -10 }}>
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
            name="heart"
            color={styleconstants.bggorange}
            type="feather"
            size={12}
            reverse
        />
        return renderItemWithIcon(item, icon)
    }

    if (games.length === 0 && inUserWishlist.length === 0) {
        return (null)
    } else {
        return (
            <TouchableOpacity style={{ padding: 10, height: 130, backgroundColor: 'white', margin: 1 }}
                onPress={() => {
                    props.navigation.navigate('ProfileStack', { screen: 'Profile', params: { userName: props.userName } })
                }}

            >
                {inUserWishlist.length > 0 ?
                    <View style={{ marginBottom: 5 }}>
                        <Text style={{ fontFamily: styleconstants.primaryFontBold }}>{props.userName + " owns " + inUserWishlist.length.toString() + " of your wants."}</Text>

                    </View>
                    : <View style={{ marginBottom: 5 }}>
                        <Text style={{ fontFamily: styleconstants.primaryFontBold }}>{props.userName}</Text>

                    </View>
                }
                <ScrollView horizontal>
                    <View style={{ alignItems: 'center', flexDirection: 'row' }}>


                        <FlatList
                            data={inUserWishlist}
                            keyExtractor={keyExtractor}
                            renderItem={_renderTarget}
                            getItemLayout={getItemLayout}
                            horizontal
                        />

                        {inUserWishlist.length > 0 ?
                            <Icon
                                containerStyle={{ margin: 10, justifyContent: 'center', alignItems: "center" }}
                                name="more-horizontal"
                                color={'black'}
                                type="feather"
                                size={20}

                            />
                            : null}



                        <FlatList
                            data={games}
                            keyExtractor={keyExtractor}
                            renderItem={_renderItem}
                            getItemLayout={getItemLayout}
                            horizontal
                        />
                    </View>

                </ScrollView>


            </TouchableOpacity>

        )
    }



}
