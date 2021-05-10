import React, { useGlobal, useEffect, useState, useDispatch, useRef } from 'reactn'
import PropTypes from 'prop-types'
import { View, Text, InteractionManager, ScrollView, FlatList, LayoutAnimation, Keyboard } from 'react-native'
import { Button } from 'react-native-elements'
import { createStackNavigator } from '@react-navigation/stack'
import SafeAreaView from 'react-native-safe-area-view'
import * as Sentry from 'sentry-expo'

import { Icon } from 'react-native-elements'
import styleconstants from '../../shared/styles/styleconstants'
import styles from '../../shared/styles'
import { SearchBar } from 'react-native-elements'
var DomParser = require('react-native-html-parser').DOMParser
import { fetchCollectionFromBGG } from '../../shared/collection'
import { BarIndicator } from 'react-native-indicators';
import { RateLimit } from "async-sema";
import { useFocusEffect } from '@react-navigation/native';


import GameScreen from '../GameScreen'
import LogPlay from '../Plays/Log'
import ListPlays from '../Plays/List'
import GameSearch from '../GameSearch'
import GameAddTo from '../GameAddTo'

import UserThumbNail from '../../components/UserThumbNail'
import GameStack from '../GameStack'
import ProfileStack from './OtherProfileScreen'
import ConversationScreen from '../Mail/ConversationScreen'

import globalStyles from '../../shared/styles'
import { logger } from '../../shared/debug'
import { fetchRaw } from '../../shared/HTTP'
import { TouchableOpacity } from 'react-native-gesture-handler'

const COMPONENTS_PER_PAGE = 8
let NUM_PARALLEL_FETCHES = 10


const requestHeaders = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=UTF-8'
})
const fetchArgs = {
    method: 'GET',
    credentials: 'include',
    requestHeaders
}
let orderedFetchedUsers = []

let usersPageIndex = 1
let fetchingOnGoing = false

const limit = RateLimit(NUM_PARALLEL_FETCHES);
let limitBackground = RateLimit(1)
let usersFetchFinishedCount = 0

let nonEmptyUsersCount = 0
let pageNumToRender = 0
let maxPageNumToRender = 1

let usersToFetchCount = 0
let filterStringSync = ""
let citySync = ""
let countrySync = ""

let controller = new AbortController();
let initialFetchStarted = false


const MeetScreen = ({ navigation, route }) => {

    const scrollRef = useRef();

    let ongoingFetches = 0

    let [country, setCountry] = useState("")
    let [city, setCity] = useState("")



    let [localUserComponents, setLocalUserComponents] = useState([])
    let [userComponentConstructionInProgress, setUserComponentConstructionInProgress] = useState(false)
    let [searchOpen, setSearchOpen] = useState(false)
    let [filterString, setFilterstring] = useState("")
    let [startSearchButtonVisible, setStartSearchButtonVisible] = useState(false)

    const [collection] = useGlobal('collection')
    const wishlist = collection.filter(
        game => game.status.wishlist === '1'
    )


    const scrollUp = () => {
        scrollRef.current?.scrollTo({
            y: 0,
            animated: true,
        });
    }


    function inWishlist(item) {
        for (var wishItem in wishlist) {
            if (item.objectId === wishlist[wishItem].objectId) {
                return true
            }
        }
        return false
    }


    async function getCollectionForUser(userName) {

        if (userName !== global.username) {
            console.log(usersFetchFinishedCount, ", Fetching for ", userName)

            var gamesFetched = await fetchCollectionFromBGG(userName)
            console.log("fetched", userName)

            var gamesFiltered = gamesFetched.filter((game) => game.status.own === '1')
            if ((gamesFiltered.length > 0)) {
                nonEmptyUsersCount += 1
                maxPageNumToRender = Math.ceil(nonEmptyUsersCount / COMPONENTS_PER_PAGE)
                console.log("max page : ", maxPageNumToRender)

                let otherWl = gamesFetched.filter((game) => game.status.wishlist === '1')

                let gl = []
                let wl = []

                let offerList = []


                //// checking which games I'm looking for
                for (var gameInd in gamesFiltered) {
                    if (inWishlist(gamesFiltered[gameInd])) {
                        wl.push(gamesFiltered[gameInd])
                    } else {
                        gl.push(gamesFiltered[gameInd])
                    }
                }



                let userObj = { otherGames: gl, inUserWants: wl, offerList: offerList, othersWishlist: otherWl, userName: userName, inWants: wl.length }
                //let userComp = <UserThumbNail otherGames={userGameLists.otherGames} inUserWishlist={userGameLists.inUserWants} othersWishlist={userGameLists.othersWishlist} userName={userName} navigation={navigation} />
                //let newComp = { component: userComp, inWants: userGameLists.inUserWants.length }
                let insertInd = 0
                while (insertInd < orderedFetchedUsers.length && orderedFetchedUsers[insertInd].inWants > userObj.inWants) {
                    insertInd += 1
                }
                orderedFetchedUsers.splice(insertInd, 0, userObj)

            }
        }



        usersFetchFinishedCount += 1




    }



    async function getUserLists(userNameList, inputCity, inputCountry) {
        console.log('user list', userNameList)
        for (var lInd in userNameList) {
            /// check if we are still looking for the same city
            if (fetchingOnGoing && inputCity === citySync && inputCountry === countrySync) {

                await limit()
                /// also check after waiting for the limit
                if (fetchingOnGoing && inputCity === citySync && inputCountry === countrySync) {
                    getCollectionForUser(userNameList[lInd])

                }
            }

        }
    }

    function processHTMLUserList(respText) {
        let doc = new DomParser({
            locator: {},
            errorHandler: {
                warning: function (w) { },
                error: function (e) { },
                fatalError: function (e) { console.error(e) }
            }
        }).parseFromString(respText, 'text/html')
        let loc = doc.getElementsByClassName('username')


        let names = loc.toString().match(/>(.*?)</g)


        var locFinal = []

        try {
            for (var ind in names) {
                if (!(names[ind].startsWith("><") || names[ind].startsWith(">(<") || names[ind].startsWith(">)<"))) {
                    locFinal.push(names[ind].substring(1, names[ind].length - 1))
                }
            }
        } catch (error) {
            Sentry.captureException(error)
            return []
        }



        return locFinal


    }

    function rerenderUserListPeriodically() {
        if (filterStringSync == "") {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setLocalUserComponents(getComponentsForPage(pageNumToRender))
        }

        setTimeout(() => {

            if (usersFetchFinishedCount > 0 && usersFetchFinishedCount >= usersToFetchCount) {
                if (filterStringSync == "") {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setLocalUserComponents(getComponentsForPage(pageNumToRender))
                }
                setUserComponentConstructionInProgress(false)
                console.log("stopping rerender")

            } else {
                rerenderUserListPeriodically()
            }
        }, 5000)
    }


    async function fetchLocalUsers(country, city) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setUserComponentConstructionInProgress(true)
        rerenderUserListPeriodically()


        let usersFetchedNumber = 1
        while (usersFetchedNumber > 0) {
            if (fetchingOnGoing) {
                let path = 'https://boardgamegeek.com/users/page/' + usersPageIndex.toString() + '?country=' + country + '&state=&city=' + city
                let resp = await fetchRaw(path, fetchArgs)

                if (resp.status === 200) {
                    resp.text().then(respText => {
                        if (fetchingOnGoing) {
                            let localUsersPart = processHTMLUserList(respText)
                            usersFetchedNumber = localUsersPart.length
                            usersToFetchCount += usersFetchedNumber
                            getUserLists(localUsersPart, city, country)
                        }


                    })
                    console.log(usersPageIndex)
                    usersPageIndex += 1
                } else {
                    Sentry.captureMessage('Non 200 Response for HTTP request.', {
                        extra: { url: path, stauts: resp.status }
                    })
                }


            } else {
                break
            }

        }
        console.log("last user fetch sent, page num: ", usersPageIndex)

    }

    function proceedFetchingLocalUsers() {
        if (global.location) {
            setCity(global.location.city)
            citySync = global.location.city
            countrySync = global.location.country
            setCountry(global.location.country)
            //setCity("Utrecht")
            //setCountry("Netherlands")
            fetchLocalUsers(global.location.country, global.location.city)
            //fetchLocalUsers("Germany", "Gevelsberg")

        } else {
            console.log("still waiting for location")
            setTimeout(() => {
                proceedFetchingLocalUsers()
            }, 1000)
        }

    }

    useFocusEffect(
        React.useCallback(() => {
            navigation.setOptions({
                headerRight: () => (
                    <Button
                        icon={<Icon name="search" type="ionicons" size={20} color={'white'} />}
                        onPress={() => {
                            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                            setSearchOpen(!searchOpen)
                        }}
                        buttonStyle={globalStyles.headerIconButton}
                    />
                ),
            })
            if (!initialFetchStarted && filterStringSync === "") {
                fetchingOnGoing = true
                initialFetchStarted = true
                proceedFetchingLocalUsers()
            } else {
                pageNumToRender = 0
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setLocalUserComponents(getComponentsForPage(pageNumToRender))
            }
            setCity(citySync)
            setCountry(countrySync)

        }, [])
    );





    const stopFetch = () => {
        //controller.abort()
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setUserComponentConstructionInProgress(false)
        setLocalUserComponents([])
        orderedFetchedUsers = []
        fetchingOnGoing = false
        usersPageIndex = 1
        usersToFetchCount = 0
        usersFetchFinishedCount = 0
        nonEmptyUsersCount = 0
        pageNumToRender = 0
        maxPageNumToRender = 1
    }

    const startFetch = () => {
        fetchingOnGoing = true

        fetchLocalUsers(countrySync, citySync)
    }

    const getComponentsForPage = (p) => {
        console.log("ordered list", orderedFetchedUsers.length)
        var arr = orderedFetchedUsers.slice(p * COMPONENTS_PER_PAGE, (p + 1) * COMPONENTS_PER_PAGE)
        return [...new Set(arr)];
    }

    function checkUserForFilter(user) {
        for (var wlInd in user.inUserWants) {
            if (user.inUserWants[wlInd].name.toLowerCase().includes(filterStringSync)) {
                return true
            }


        }
        for (var gInd in user.otherGames) {

            if (user.otherGames[gInd].name.toLowerCase().includes(filterStringSync)) {
                return true
            }

        }
        return false

    }

    function filterUsersForGame() {
        if (filterString !== "") {
            let filteredUsers = []

            for (var userInd in orderedFetchedUsers) {
                if (checkUserForFilter(orderedFetchedUsers[userInd])) {
                    filteredUsers.push(orderedFetchedUsers[userInd])
                }


            }


            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setLocalUserComponents(filteredUsers)
        } else {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setLocalUserComponents(getComponentsForPage(pageNumToRender))
        }

    }


    return (
        <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <SearchBar
                    onChangeText={(t) => { setCountry(t); countrySync = t }}
                    onClearText={(t) => { setCountry(""); countrySync = "" }}
                    placeholder="Country..."
                    value={countrySync}
                    containerStyle={{ width: userComponentConstructionInProgress ? "35%" : "40%", backgroundColor: styleconstants.bggpurple }}
                    inputContainerStyle={{ backgroundColor: 'white' }}
                // showLoadingIcon={true}
                />
                <SearchBar
                    onChangeText={(t) => { setCity(t); citySync = t }}
                    onClearText={(t) => { setCity(""); citySync = "" }}
                    placeholder="City..."
                    value={citySync}
                    containerStyle={{ width: userComponentConstructionInProgress ? "35%" : "40%", backgroundColor: styleconstants.bggpurple }}
                    inputContainerStyle={{ backgroundColor: 'white' }}


                // showLoadingIcon={true}
                />
                <View style={{ backgroundColor: styleconstants.bggorange, width: userComponentConstructionInProgress ? "30%" : "20%", justifyContent: 'center', alignItems: 'center' }}>
                    {userComponentConstructionInProgress ?
                        <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'flex-start' }}
                            onPress={stopFetch}
                        >
                            <View style={{ marginRight: 25 }} >
                                <BarIndicator size={15} color={"white"} count={5} />

                            </View>
                            <Icon
                                name="stop"
                                color='white'
                                type="font-awesome"
                                size={16}
                            />
                        </TouchableOpacity>
                        :
                        <View>
                            {global.location ?
                                <TouchableOpacity style={{ backgroundColor: styleconstants.bggorange }}
                                    onPress={() => {
                                        stopFetch()
                                        startFetch()
                                        Keyboard.dismiss()
                                    }}
                                >
                                    <Icon
                                        name="caretright"
                                        color='white'
                                        type="antdesign"
                                        containerStyle={{ margin: 4 }}
                                        size={16}
                                    />
                                </TouchableOpacity>
                                :
                                <View style={{ flexDirection: 'row' }}>
                                    <BarIndicator size={15} color={"white"} count={5} />

                                </View>

                            }
                        </View>
                    }
                </View>
            </View>
            <View>
                {searchOpen ?
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <SearchBar
                            onChangeText={(t) => {
                                setFilterstring(t)
                                filterStringSync = t.toLowerCase()
                                if (t !== "") {
                                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                    setStartSearchButtonVisible(true)
                                } else {
                                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                    setStartSearchButtonVisible(false)
                                    setLocalUserComponents(getComponentsForPage(pageNumToRender))
                                }
                            }}
                            onClearText={(t) => {
                                setFilterstring("")
                                filterStringSync = t.toLowerCase()
                                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                setStartSearchButtonVisible(false)
                                setLocalUserComponents(getComponentsForPage(pageNumToRender))
                            }}
                            placeholder="Search games..."
                            value={filterString}
                            containerStyle={{ width: startSearchButtonVisible ? '80%' : '100%', backgroundColor: styleconstants.bggpurple }}
                            inputContainerStyle={{ backgroundColor: 'white' }}
                        // showLoadingIcon={true}
                        />
                        {startSearchButtonVisible ?
                            <View style={{ backgroundColor: styleconstants.bggorange, width: "20%", justifyContent: 'center', alignItems: 'center' }}>

                                <View>

                                    <TouchableOpacity style={{ backgroundColor: styleconstants.bggorange }}
                                        onPress={() => {
                                            filterUsersForGame()
                                            Keyboard.dismiss()
                                        }}
                                    >
                                        <Icon
                                            name="caretright"
                                            color='white'
                                            type="antdesign"
                                            containerStyle={{ margin: 4 }}
                                            size={16}
                                        />
                                    </TouchableOpacity>

                                </View>

                            </View>
                            : null}
                    </View>
                    : null}
            </View>
            <View>
                {global.location ?
                    <View>
                        {localUserComponents.length < 1 ?
                            <View style={styles.emptyView}>

                            </View> :
                            <SafeAreaView>
                                <ScrollView automaticallyAdjustContentInsets={true} ref={scrollRef}>
                                    <FlatList
                                        data={localUserComponents}
                                        renderItem={({ item }) => {
                                            return <UserThumbNail otherGames={item.otherGames} inUserWishlist={item.inUserWants} offerList={item.offerList} othersWishlist={item.othersWishlist} userName={item.userName} navigation={navigation} />
                                        }}
                                    />
                                    <View>
                                        {filterStringSync === "" ?

                                            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-evenly', marginTop: 20, alignItems: 'center' }}>

                                                <Icon
                                                    name="caretleft"
                                                    color={pageNumToRender > 0 ? styleconstants.bggorange : 'lightgrey'}
                                                    type="antdesign"
                                                    containerStyle={{ margin: 4 }}
                                                    size={20}
                                                    onPress={() => {
                                                        if (pageNumToRender > 0) {
                                                            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                                            setLocalUserComponents(getComponentsForPage(pageNumToRender - 1))
                                                            pageNumToRender -= 1
                                                            scrollUp()
                                                        }

                                                    }}
                                                />

                                                <Text>{(pageNumToRender + 1).toString() + "/" + maxPageNumToRender}</Text>

                                                <Icon
                                                    name="caretright"
                                                    color={pageNumToRender < (maxPageNumToRender - 1) ? styleconstants.bggorange : 'lightgrey'}
                                                    type="antdesign"
                                                    containerStyle={{ margin: 4 }}
                                                    size={20}
                                                    onPress={() => {
                                                        if (pageNumToRender < (maxPageNumToRender - 1)) {
                                                            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                                            setLocalUserComponents(getComponentsForPage(pageNumToRender + 1))
                                                            pageNumToRender += 1
                                                            scrollUp()
                                                        }

                                                    }}

                                                />

                                            </View>

                                            : null}

                                    </View>
                                    <View style={{ height: 200 }}></View>

                                </ScrollView>


                            </SafeAreaView>
                        }
                    </View>
                    :
                    <View style={{ height: 600, justifyContent: 'center', alignItems: 'center' }}>
                        <Text>Detecting your location...</Text>

                    </View>}
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

    </Stack.Navigator>

)

