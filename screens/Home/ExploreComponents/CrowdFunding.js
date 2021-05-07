import React, { useGlobal, useEffect, useState, useDispatch } from 'reactn'
import PropTypes, { func } from 'prop-types'
import { View, Text, InteractionManager, Platform, FlatList, Image, TouchableOpacity, LayoutAnimation } from 'react-native'
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

const CrowdFunding = (props) => {
    const navigation = props.navigation

    const [refreshing, setRefreshing] = useState(false)
    const [cfList, setCfList] = useState([])

    const showFlash = (message, type = 'danger') => {
        showMessage({ message, type, icon: 'auto' })
    }

    const fetchCfList = () => {
        let cfURL = "https://api.geekdo.com/api/ending_preorders"
        fetch(cfURL).then(cfList => {
            //console.log("cf is", cfList.status)
            if (cfList.status === 200) {
                cfList.json().then(cfListJson => {
                    //console.log("cf list json", cfListJson)
                    setCfList(cfListJson)
                })
            } else {
                showFlash(
                    'There was a problem with loading the crowdfunding countdown.'
                )
            }

        })
    }

    function getRemainingTime(date) {
        let d = Date.parse(date)
        let now = Date.now()
        let remaining = d - now
        let dayDiff = remaining / (1000 * 60 * 60 * 24)
        let split = date.split("T")[0].split("-")

        if (dayDiff > 1) {
            return <Text style={{ marginVertical: 4, fontFamily: styleconstants.primaryFontBold, color: 'grey' }}>{split[1] + "/" + split[2]}</Text>
        }
        else {
            return <Text style={{ marginVertical: 4, fontFamily: styleconstants.primaryFontBold, color: 'red' }}>{"In " + Math.round(remaining / (1000 * 60 * 60)).toString() + "h"}</Text>

        }

    }




    useEffect(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        if (cfList.length === 0) {
            fetchCfList()
        }

    })

    const CrowdFundingItem = props => {
        return (
            <TouchableOpacity style={{ margin: 3, width: 150, padding: 10 }}
                onPress={() => {
                    props.navigation.navigate('GameStack', { screen: 'Game', params: { game: { "objectId": props.item.item.id, "name": props.item.name } } })
                }}
            >

                <Image
                    source={{ uri: props.item.images.mediacard.src }}
                    style={{ width: 130, height: 130, borderTopLeftRadius: 5, borderTopRightRadius: 5 }}
                />
                <View style={{ width: props.item.progress >= 100 ? 130 : 1.3 * props.item.progress, height: 5, backgroundColor: '#02857a' }}></View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    {getRemainingTime(props.item.endDate)}
                    <Text style={{ marginVertical: 4, fontFamily: styleconstants.primaryFontBold, color: 'grey' }}>{" " + props.item.progress + "%"}</Text>

                </View>

                <View style={{ flexDirection: 'row' }}>

                    <Text numberOfLines={1} style={{ marginVertical: 4, fontFamily: styleconstants.primaryFontBold }}>{props.item.name}</Text>

                </View>
                <Text style={{ fontFamily: styleconstants.primaryFont }}>{props.item.description}</Text>

            </TouchableOpacity>
        )

    }




    return (
        <View style={{ backgroundColor: 'white', marginVertical: 3, padding: 15 }}>

            <Text style={{ fontFamily: styleconstants.primaryFontBold, fontSize: 20 }}>CROWDFUNDING COUNTDOWN</Text>
            <Text style={{ fontFamily: styleconstants.primaryFont, fontSize: 16 }}>Projects ending soon.</Text>

            <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                {cfList.length > 0 ?
                    <FlatList
                        data={cfList}
                        renderItem={({ item, index }) => {
                            return <CrowdFundingItem item={item} index={index} navigation={navigation} />
                        }}
                        horizontal
                    /> :
                    <View style={{ height: 250 }}>

                        <Text>Loading crowdfunding countdown...</Text>
                    </View>
                }
            </View>
        </View>
    )

}



export default CrowdFunding
