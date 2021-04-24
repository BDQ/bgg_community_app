import React, { useGlobal, useEffect, useState, useDispatch } from 'reactn'
import PropTypes, { func } from 'prop-types'
import { View, Text, InteractionManager, Platform, FlatList, Image, TouchableOpacity } from 'react-native'
import { Button } from 'react-native-elements'
import { createStackNavigator } from '@react-navigation/stack'

import { Icon } from 'react-native-elements'

import GameScreen from '../../GameScreen'
import LogPlay from '../../Plays/Log'
import ListPlays from '../../Plays/List'
import GameSearch from '../../GameSearch'
import GameAddTo from '../../GameAddTo'

import GameList from '../../../components/GameList'

import globalStyles from '../../../shared/styles'
import { logger } from '../../../shared/debug'
import styleconstants from '../../../shared/styles/styleconstants'
import { showMessage } from 'react-native-flash-message'

const Hotness = (props) => {
    const navigation = props.navigation

    const [refreshing, setRefreshing] = useState(false)
    const [hotList, setHotlist] = useState([])

    const showFlash = (message, type = 'danger') => {
        showMessage({ message, type, icon: 'auto' })
    }

    const fetchHotList = () => {
        let hotURL = "https://api.geekdo.com/api/hotness?geeksite=boardgame&objecttype=thing&showcount=50"
        fetch(hotURL).then(hotList => {
            console.log("hot list is", hotList.status)
            if (hotList.status === 200) {
                hotList.json().then(hotListJson => {
                    console.log("hot list json", hotListJson)
                    setHotlist(hotListJson.items)
                })
            } else {
                showFlash(
                    'There was a problem with loading the hot list.'
                )
            }

        })
    }

    const getDeltaIcon = (item) => {
        if (item.delta === 0) {
            return <Icon
                containerStyle={{ margin: 10, justifyContent: 'center', alignItems: "center" }}
                name="minus"
                color={'yellow'}
                type="antdesign"
                size={20}

            />
        } else if (item.delta > 0) {
            return <Icon
                containerStyle={{ margin: 10, justifyContent: 'center', alignItems: "center" }}
                name="caretup"
                color={'lightgreen'}
                type="antdesign"
                size={20}

            />
        } else {
            return <Icon
                containerStyle={{ margin: 10, justifyContent: 'center', alignItems: "center" }}
                name="caretdown"
                color={'red'}
                type="antdesign"
                size={20}

            />
        }
    }


    useEffect(() => {
        if (hotList.length === 0) {
            fetchHotList()
        }

    })

    const HotItem = props => {
        return (
            <TouchableOpacity style={{ margin: 3, width: 150, padding: 10 }}
                onPress={() => {
                    props.navigation.navigate('GameStack', { screen: 'Game', params: { game: { "objectId": props.item.objectid, "name": props.item.name } } })
                }}
            >

                <Image
                    source={{ uri: props.item.images.mediacard.src }}
                    style={{ width: 130, height: 130, borderRadius: 5 }}
                />
                <View style={{ position: 'absolute', top: 110, left: 10 }}>
                    {getDeltaIcon(props.item)}
                </View>

                <View style={{ flexDirection: 'row', height: 30 }}>
                    <Text style={{ marginVertical: 4, fontFamily: styleconstants.primaryFontBold }}>{props.index + 1}</Text>

                    <Text style={{ marginVertical: 4, fontFamily: styleconstants.primaryFontBold }}>{" " + props.item.name}</Text>

                </View>
                <Text style={{ fontFamily: styleconstants.primaryFont }}>{props.item.description}</Text>

            </TouchableOpacity>
        )

    }




    return (
        <View style={{ backgroundColor: 'white', marginVertical: 3, padding: 15 }}>

            <Text style={{ fontFamily: styleconstants.primaryFontBold, fontSize: 20 }}>THE HOTNESS</Text>
            <Text style={{ fontFamily: styleconstants.primaryFont, fontSize: 16 }}>The top 50 trending games today.</Text>

            <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                {hotList.length > 0 ?
                    <FlatList
                        data={hotList}
                        renderItem={({ item, index }) => {
                            return <HotItem item={item} index={index} navigation={navigation} />
                        }}
                        horizontal
                    /> :
                    <View style={{ height: 250 }}>

                        <Text>Loading the hot list...</Text>
                    </View>
                }
            </View>
        </View>
    )

}



export default Hotness
