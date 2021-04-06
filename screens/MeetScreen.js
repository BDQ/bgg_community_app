import React, { useGlobal, useEffect, useState, useDispatch } from 'reactn'
import PropTypes from 'prop-types'
import { View, Text, InteractionManager, ScrollView, FlatList } from 'react-native'
import { Button } from 'react-native-elements'
import { createStackNavigator } from '@react-navigation/stack'

import { Icon } from 'react-native-elements'
import styleconstants from '../shared/styles/styleconstants'
import { SearchBar } from 'react-native-elements'
var DomParser = require('react-native-html-parser').DOMParser
import { fetchCollectionFromBGG } from '../shared/collection'
import { BarIndicator } from 'react-native-indicators';


import GameScreen from './GameScreen'
import LogPlay from './Plays/Log'
import ListPlays from './Plays/List'
import GameSearch from './GameSearch'
import GameAddTo from './GameAddTo'

import UserThumbNail from './../components/UserThumbNail'
import GameStack from './GameStack'
import ProfileStack from './OtherProfileScreen'

import globalStyles from '../shared/styles'
import { logger } from '../shared/debug'
import { fetchRaw } from '../shared/HTTP'

const requestHeaders = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=UTF-8'
})
const fetchArgs = {
    method: 'GET',
    credentials: 'include',
    requestHeaders
}

const MeetScreen = ({ navigation, route }) => {
    let [country, setCountry] = useState("Netherlands")
    let [city, setCity] = useState("Utrecht")

    let [locals, setLocals] = useState([])
    let [localUserComponents, setLocalUserComponents] = useState([])
    let [fetchingInProgress, setFetchingInProgress] = useState(false)
    let [userComponentConstructionInProgress, setUserComponentConstructionInProgress] = useState(false)

    const [collection] = useGlobal('collection')
    const wishlist = collection.filter(
        game => game.status.wishlist === '1'
    )

    function inWishlist(item) {
        for (var wishItem in wishlist) {
            if (item.name === wishlist[wishItem].name) {
                return true
            }
        }
        return false
    }

    async function getCollectionForUser(userName) {
        console.log("Fetching for ", userName)
        var gamesFetched = await fetchCollectionFromBGG(userName)
        var gamesFiltered = gamesFetched.filter((game) => game.status.own === '1')

        let gl = []
        let wl = []

        for (var gameInd in gamesFiltered) {
            if (inWishlist(gamesFiltered[gameInd])) {
                wl.push(gamesFiltered[gameInd])
            } else {
                gl.push(gamesFiltered[gameInd])
            }
        }

        return { otherGames: gl, inUserWants: wl }
    }

    function compare(a, b) {
        if (a.inWants < b.inWants) {
            return 1;
        }
        if (a.inWants > b.inWants) {
            return -1;
        }
        return 0;
    }

    const _sortArray = () => {
        var sorted = localUserComponents.sort(compare)
        return sorted
    }

    async function getUserLists() {
        setUserComponentConstructionInProgress(true)
        for (var lInd in locals) {
            let userGameLists = await getCollectionForUser(locals[lInd].name)
            let userComp = <UserThumbNail otherGames={userGameLists.otherGames} inUserWishlist={userGameLists.inUserWants} userName={locals[lInd].name} navigation={navigation} />
            console.log("current list", localUserComponents.length)
            let newComp = { component: userComp, inWants: userGameLists.inUserWants.length }


            setLocalUserComponents(oldList => [...oldList, newComp])

        }
    }


    async function fetchLocalUsers() {
        setFetchingInProgress(true)
        let resp = await fetchRaw('https://boardgamegeek.com/users?country=' + country + '&state=&city=' + city, fetchArgs)
        resp.text().then(respText => {
            let doc = new DomParser().parseFromString(respText, 'text/html')
            let loc = doc.getElementsByClassName('username')

            console.log("found locals")

            console.log(loc.toString())

            loc = loc.toString()
            loc = loc.replaceAll("<div class=\"username\">(<a href=\"/user/", "")
            loc = loc.replaceAll("\">", " ")
            loc = loc.replaceAll("</a>)</div>", " ")

            loc = loc.split(" ")
            var locFinal = []

            for (var ind in loc) {
                if (ind % 2) {
                    locFinal.push({ 'name': loc[ind], inWants: 0 })
                }
            }

            setLocals(locFinal)
            setFetchingInProgress(false)

        })

    }


    useEffect(() => {
        if (locals.length === 0 && !fetchingInProgress) {
            fetchLocalUsers()
        }
        if (locals.length > 0 && !userComponentConstructionInProgress) {
            getUserLists()
        }

    })


    return (
        <View>
            <ScrollView>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <SearchBar
                        onChangeText={(t) => { setCountry(t) }}
                        onClearText={(t) => { setCountry("") }}
                        placeholder="Country..."
                        value={country}
                        containerStyle={{ width: '40%', backgroundColor: styleconstants.bggpurple }}
                        inputContainerStyle={{ backgroundColor: 'white' }}
                    // showLoadingIcon={true}
                    />
                    <SearchBar
                        onChangeText={(t) => { setCity(t) }}
                        onClearText={(t) => { setCity("") }}
                        placeholder="City..."
                        value={city}
                        containerStyle={{ width: '40%', backgroundColor: styleconstants.bggpurple }}
                        inputContainerStyle={{ backgroundColor: 'white' }}


                    // showLoadingIcon={true}
                    />
                    <View style={{ backgroundColor: styleconstants.bggorange, width: "20%", justifyContent: 'center', alignItems: 'center' }}>
                        {fetchingInProgress || userComponentConstructionInProgress ?
                            <BarIndicator size={15} color={"white"} count={5} />
                            :
                            <Text>Search</Text>
                        }
                    </View>
                </View>
                <View>
                    {fetchingInProgress ?
                        <View>
                            <Text>Loading users nearby ...</Text>

                        </View> :
                        <View>

                            <FlatList
                                data={_sortArray()}
                                renderItem={({ item }) => {
                                    return item.component
                                }}
                            />

                        </View>
                    }
                </View>
            </ScrollView>
        </View>
    )

}

const Stack = createStackNavigator()


export default () => (


    <Stack.Navigator screenOptions={{
        headerStyle: {
            backgroundColor: styleconstants.bggpurple, shadowColor: styleconstants.bggpurple
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'bold',
        },

    }}>


        <Stack.Screen options={{ headerShown: true }} name="BGG users nearby" component={MeetScreen} />
        <Stack.Screen options={{ headerShown: false }} name="GameStack" component={GameStack} />
        <Stack.Screen options={{ headerShown: false }} name="ProfileStack" component={ProfileStack} />

    </Stack.Navigator>


)

