import React, { useGlobal, useEffect, useState, useDispatch, useRef } from 'reactn'
import PropTypes from 'prop-types'
import { View, Text, InteractionManager, ScrollView, FlatList, LayoutAnimation } from 'react-native'
import { Button } from 'react-native-elements'
import { createStackNavigator } from '@react-navigation/stack'
import SafeAreaView from 'react-native-safe-area-view'

import { Icon } from 'react-native-elements'
import styleconstants from '../../shared/styles/styleconstants'
import styles from '../../shared/styles'
import { SearchBar } from 'react-native-elements'
var DomParser = require('react-native-html-parser').DOMParser
import { fetchCollectionFromBGG } from '../../shared/collection'
import { BarIndicator } from 'react-native-indicators';
import { RateLimit } from "async-sema";


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
const NUM_PARALLEL_FETCHES = 10

const requestHeaders = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=UTF-8'
})
const fetchArgs = {
    method: 'GET',
    credentials: 'include',
    requestHeaders
}
let constructedUserComponents = []
let usersToFetch = null
let usersFetched = 0

const limit = RateLimit(5);
let usersFetchFinishedCount = 0
let usersToFetchCount = 0




const MeetScreen = ({ navigation, route }) => {

    const scrollRef = useRef();

    let ongoingFetches = 0

    let [country, setCountry] = useState("")
    let [city, setCity] = useState("")

    let maxPageNumToRender = 10


    let [localUserComponents, setLocalUserComponents] = useState([])
    let [initialFetchStarted, setInitialFetchStarted] = useState(false)
    let [userComponentConstructionInProgress, setUserComponentConstructionInProgress] = useState(false)
    let [pageNumToRender, setPageNumToRender] = useState(0)

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
            console.log("item check", wishlist[wishItem])
            if (item.objectId === wishlist[wishItem].objectId) {
                return true
            }
        }
        return false
    }

    async function getCollectionForUser(userName) {
        console.log("Fetching for ", userName)
        var gamesFetched = await fetchCollectionFromBGG(userName)
        usersFetchFinishedCount += 1
        var gamesFiltered = gamesFetched.filter((game) => game.status.own === '1')
        if ((gamesFiltered.length > 0)) {
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
            let insertInd = 0
            while (insertInd < constructedUserComponents.length && constructedUserComponents[insertInd].inWants > newComp.inWants) {
                insertInd += 1
            }
            constructedUserComponents.splice(insertInd, 0, newComp)

        }



    }



    async function getUserLists(userNameList) {
        for (var lInd in userNameList) {
            await limit()
            getCollectionForUser(userNameList[lInd].name)
        }
        console.log("collection requests sent")
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

        console.log("found locals")

        console.log(loc.toString())

        let names = loc.toString().match(/>(.*?)</g)


        var locFinal = []

        try {
            for (var ind in names) {
                if (!(names[ind].startsWith("><") || names[ind].startsWith(">(<") || names[ind].startsWith(">)<"))) {
                    locFinal.push({ 'name': names[ind].substring(1, names[ind].length - 1), inWants: 0 })
                }
            }
        } catch (error) {
            return []
        }



        return locFinal


    }

    function rerenderUserListPeriodically() {
        setTimeout(() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setLocalUserComponents(getComponentsForPage(pageNumToRender))
            if (usersFetchFinishedCount > 0 && usersFetchFinishedCount >= usersToFetchCount) {
                setUserComponentConstructionInProgress(false)
            } else {
                rerenderUserListPeriodically()
            }
        }, 5000)
    }


    async function fetchLocalUsers(country, city) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setUserComponentConstructionInProgress(true)
        rerenderUserListPeriodically()

        var pageNum = 1
        let usersFetchedNumber = 1
        while (usersFetchedNumber > 0) {
            let resp = await fetchRaw('https://boardgamegeek.com/users/page/' + pageNum.toString() + '?country=' + country + '&state=&city=' + city, fetchArgs)
            resp.text().then(respText => {
                let localUsersPart = processHTMLUserList(respText)
                usersFetchedNumber = localUsersPart.length
                usersToFetchCount += usersFetchedNumber
                getUserLists(localUsersPart)

            })
            pageNum += 1
        }
        console.log("last user fetch sent, page num: ", pageNum)



    }

    function startFetchingLocalUsers() {
        if (global.location) {
            setCity(global.location.city)
            setCountry(global.location.country)
            //setCity("Utrecht")
            //setCountry("Netherlands")
            fetchLocalUsers(global.location.country, global.location.city)
            //fetchLocalUsers("Netherlands", "Utrecht")

        } else {
            console.log("still waiting for location")
            setTimeout(() => {
                startFetchingLocalUsers()
            }, 1000)
        }

    }


    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (!initialFetchStarted) {
                setInitialFetchStarted(true)
                startFetchingLocalUsers()
            }
        });



    })

    const stopFetch = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setUserComponentConstructionInProgress(false)
        setLocalUserComponents([])
        constructedUserComponents = []
    }

    const getComponentsForPage = (p) => {
        return constructedUserComponents.slice(p * COMPONENTS_PER_PAGE, (p + 1) * COMPONENTS_PER_PAGE)
    }



    return (
        <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <SearchBar
                    onChangeText={(t) => { setCountry(t) }}
                    onClearText={(t) => { setCountry("") }}
                    placeholder="Country..."
                    value={country}
                    containerStyle={{ width: userComponentConstructionInProgress ? "35%" : "40%", backgroundColor: styleconstants.bggpurple }}
                    inputContainerStyle={{ backgroundColor: 'white' }}
                // showLoadingIcon={true}
                />
                <SearchBar
                    onChangeText={(t) => { setCity(t) }}
                    onClearText={(t) => { setCity("") }}
                    placeholder="City..."
                    value={city}
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
                                    onPress={() => { fetchLocalUsers(country, city) }}
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
                {global.location ?
                    <View>
                        {localUserComponents.length < 1 ?
                            <View style={styles.emptyView}>
                                <Text>Loading users nearby ...</Text>

                            </View> :
                            <SafeAreaView>
                                <ScrollView automaticallyAdjustContentInsets={true} ref={scrollRef}>
                                    <FlatList
                                        data={localUserComponents}
                                        renderItem={({ item }) => {
                                            return item.component
                                        }}
                                    />
                                    <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-evenly', marginTop: 20 }}>

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
                                                    setPageNumToRender(pageNumToRender - 1)
                                                    scrollUp()
                                                }

                                            }}
                                        />

                                        <Icon
                                            name="caretright"
                                            color={pageNumToRender < maxPageNumToRender ? styleconstants.bggorange : 'lightgrey'}
                                            type="antdesign"
                                            containerStyle={{ margin: 4 }}
                                            size={20}
                                            onPress={() => {
                                                if (pageNumToRender < maxPageNumToRender) {
                                                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                                    setLocalUserComponents(getComponentsForPage(pageNumToRender + 1))
                                                    setPageNumToRender(pageNumToRender + 1)
                                                    scrollUp()
                                                }

                                            }}

                                        />

                                    </View>
                                    <View style={{ height: 100 }}></View>
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

