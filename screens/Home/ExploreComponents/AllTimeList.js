import React, { useGlobal, useEffect, useState, useDispatch } from 'reactn'
import PropTypes, { func } from 'prop-types'
import { View, Text, InteractionManager, Platform, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native'
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
import { getRatingColor } from '../../../shared/collection'
import { Dropdown } from 'react-native-material-dropdown-v2'

const Hexagon = props => {
    return (
        <View style={stylesHex.hexagon}>
            <View style={[stylesHex.hexagonInner, { backgroundColor: props.color, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: 'white', fontFamily: styleconstants.primaryFontBold }}>{Math.round(props.rating * 10) / 10}</Text>
            </View>
            <View style={[stylesHex.hexagonBefore, { borderBottomColor: props.color }]} />
            <View style={[stylesHex.hexagonAfter, { borderTopColor: props.color }]} />
        </View>
    );
}
const stylesHex = StyleSheet.create({
    hexagon: {
        width: 40,
        height: 22
    },
    hexagonInner: {
        width: 40,
        height: 22,
    },
    hexagonAfter: {
        position: 'absolute',
        bottom: -10,
        left: 0,
        width: 0,
        height: 0,
        borderStyle: 'solid',
        borderLeftWidth: 20,
        borderLeftColor: 'transparent',
        borderRightWidth: 20,
        borderRightColor: 'transparent',
        borderTopWidth: 10,
    },
    hexagonBefore: {
        position: 'absolute',
        top: -10,
        left: 0,
        width: 0,
        height: 0,
        borderStyle: 'solid',
        borderLeftWidth: 20,
        borderLeftColor: 'transparent',
        borderRightWidth: 20,
        borderRightColor: 'transparent',
        borderBottomWidth: 10,

    }
});


const AllTimeList = (props) => {
    const navigation = props.navigation

    const [refreshing, setRefreshing] = useState(false)
    const [allTimeList, setallTimeList] = useState([])
    let [title, setTitle] = useState("Loading list")
    let [subTitle, setSubTitle] = useState("...")
    let [subcats, setSubcats] = useState([])
    let [selectedCat, setSelectedCat] = useState(null)

    const showFlash = (message, type = 'danger') => {
        showMessage({ message, type, icon: 'auto' })
    }



    const fetchallTimeIDs = () => {
        fetch("https://api.geekdo.com/api/subdomains?domain=boardgame").then(ids => {
            ids.json().then(idJson => {
                console.log("all time id-s", idJson)
                let cats = []
                for (var i in idJson) {
                    cats.push(idJson[i])
                    cats[i].label = cats[i].name
                    cats[i].value = cats[i].id

                }
                setSubcats(cats)
                var randInd = Math.floor(Math.random() * (cats.length))

                setSelectedCat(cats[randInd].name)
                fetchallTimeList(cats[randInd].id)
            })

        })
    }
    const fetchallTimeList = (listid) => {
        let allTimeURL = "https://api.geekdo.com/api/subdomaingamelists/" + listid
        fetch(allTimeURL).then(allTimeList => {
            console.log("all time list is", allTimeList.status)
            if (allTimeList.status === 200) {
                allTimeList.json().then(allTimeListJson => {
                    console.log("allTime list json", allTimeListJson)
                    setallTimeList(allTimeListJson.games)
                    setTitle(allTimeListJson.title)
                    setSubTitle(allTimeListJson.description)
                })
            } else {
                showFlash(
                    'There was a problem with loading the allTime list.'
                )
            }

        })



    }

    useEffect(() => {
        if (!selectedCat) {
            fetchallTimeIDs()
        }

    })

    const AllTimeItem = props => {
        return (
            <TouchableOpacity style={{ margin: 3, width: 150, padding: 10 }}
                onPress={() => {
                    props.navigation.navigate('GameStack', { screen: 'Game', params: { game: { "objectId": props.item.item.id, "name": props.item.item.name } } })
                }}
            >

                <Image
                    source={{ uri: props.item.image["src@2x"] }}
                    style={{ width: 130, height: 130, borderRadius: 5 }}
                />
                <View style={{ position: 'absolute', top: 100, left: 12 }}>
                    <Hexagon color={getRatingColor(props.item.rating)} rating={props.item.rating} />

                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ marginVertical: 4, fontFamily: styleconstants.primaryFontBold, color: 'grey' }}>{props.item.item.descriptors[0] ? props.item.item.descriptors[0].displayValue : "--"}</Text>
                    <Text style={{ marginVertical: 4, fontFamily: styleconstants.primaryFontBold, color: 'grey' }}>{props.item.item.descriptors[1] ? props.item.item.descriptors[1].displayValue : "--"}</Text>

                </View>

                <View style={{ flexDirection: 'row' }}>

                    <Text numberOfLines={1} style={{ marginVertical: 4, fontFamily: styleconstants.primaryFontBold }}>{props.item.item.name}</Text>

                </View>
                <Text style={{ fontFamily: styleconstants.primaryFont }}>{props.item.description}</Text>

            </TouchableOpacity>
        )

    }




    return (
        <View style={{ backgroundColor: 'white', marginVertical: 3, padding: 15 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontFamily: styleconstants.primaryFontBold, fontSize: 20 }}>{"Best games of all time in: "}</Text>

                <Dropdown
                    dropdownOffset={{
                        top: 0,
                        left: 0
                    }}
                    itemCount={subcats.length}
                    containerStyle={{ width: 150, margin: 0, height: 30, color: 'red' }}
                    inputContainerStyle={{ borderBottomWidth: 2, borderBottomColor: styleconstants.bggorange }}
                    style={{ margin: 0, height: 30 }}
                    data={subcats}
                    value={selectedCat} //use local state if set, otherwise global
                    onChangeText={(f, ind) => {
                        setSelectedCat(f)
                        fetchallTimeList(subcats[ind].id)
                    }}
                    overlayStyle={{ fontFamily: styleconstants.primaryFont, }}
                />
            </View>
            <Text style={{ fontFamily: styleconstants.primaryFont, fontSize: 16 }}>{subTitle}</Text>

            <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                {allTimeList.length > 0 ?
                    <FlatList
                        data={allTimeList}
                        renderItem={({ item, index }) => {
                            return <AllTimeItem item={item} index={index} navigation={navigation} />
                        }}
                        horizontal
                    /> :
                    <Text>Loading top games in categroy ...</Text>
                }
            </View>
        </View>
    )

}



export default AllTimeList
