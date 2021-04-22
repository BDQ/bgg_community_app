import React, { useGlobal, useEffect, useState, useDispatch } from 'reactn'
import PropTypes from 'prop-types'
import { View, Text, InteractionManager, ScrollView, FlatList } from 'react-native'
import { Button } from 'react-native-elements'
import { createStackNavigator } from '@react-navigation/stack'

import { Icon } from 'react-native-elements'
import styleconstants from '../shared/styles/styleconstants'
import styles from '../shared/styles'
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
import ConversationScreen from './ConversationScreen'

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
    let [country, setCountry] = useState("Germany")
    let [city, setCity] = useState("Gevelsberg")

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
        let otherWl = gamesFetched.filter((game) => game.status.wishlist === '1')

        let gl = []
        let wl = []

        for (var gameInd in gamesFiltered) {
            if (inWishlist(gamesFiltered[gameInd])) {
                wl.push(gamesFiltered[gameInd])
            } else {
                gl.push(gamesFiltered[gameInd])
            }
        }

        let userGameLists = { otherGames: gl, inUserWants: wl, othersWishlist: otherWl }
        let userComp = <UserThumbNail otherGames={userGameLists.otherGames} inUserWishlist={userGameLists.inUserWants} othersWishlist={userGameLists.othersWishlist} userName={userName} navigation={navigation} />
        let newComp = { component: userComp, inWants: userGameLists.inUserWants.length }
        setLocalUserComponents(oldList => [...oldList, newComp])


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

    async function getUserLists(userNameList) {
        setUserComponentConstructionInProgress(true)
        for (var lInd in userNameList) {
            getCollectionForUser(userNameList[lInd].name)
        }
        console.log("collection requests sent")
    }

    function processHTMLUserList(respText){
        let doc = new DomParser({locator: {},
            errorHandler: { warning: function (w) { }, 
            error: function (e) { }, 
            fatalError: function (e) { console.error(e) } }}).parseFromString(respText, 'text/html')
        let loc = doc.getElementsByClassName('username')

        console.log("found locals")

        console.log(loc.toString())

        let names = loc.toString().match(/>(.*?)</g)


        var locFinal = []

        for (var ind in names) {
            if (!(names[ind].startsWith("><") ||names[ind].startsWith(">(<")||names[ind].startsWith(">)<") )) {
                locFinal.push({ 'name': names[ind].substring(1, names[ind].length - 1), inWants: 0 })
            }
        }

        return locFinal

 
    }


    async function fetchLocalUsers() {
        setFetchingInProgress(true)
        var pageNum = 1
        var maxPageNum = 1
        while(pageNum <= maxPageNum){
            let resp = await fetchRaw('https://boardgamegeek.com/users/page/' + pageNum.toString() +'?country=' + country + '&state=&city=' + city, fetchArgs)
            resp.text().then(respText => {
                let localUsersPart = processHTMLUserList(respText)
                getUserLists(localUsersPart)
        
            })
            pageNum += 1
        }

  

    }


    useEffect(() => {
        if (!fetchingInProgress) {
            fetchLocalUsers()
        }
  
    })


    return (
        <View>
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
                    {localUserComponents.length < 1 ?
        <View style={styles.emptyView}>
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
        <Stack.Screen options={{ headerShown: false }} name="User" component={ProfileStack} />
        <Stack.Screen name="Compose" component={ConversationScreen}  options={({ route }) => ({

title: route.params.subject,
})} />

    </Stack.Navigator>


)

