import React, { useGlobal, useEffect, useState, useDispatch } from 'reactn'
import PropTypes from 'prop-types'
import { View, Text, InteractionManager, ScrollView, FlatList } from 'react-native'
import { Button } from 'react-native-elements'
import { createStackNavigator } from '@react-navigation/stack'

import { Icon } from 'react-native-elements'
import ProgressBar from 'react-native-progress/Circle'
import styleconstants from '../shared/styles/styleconstants'
import { SearchBar } from 'react-native-elements'
var DomParser = require('react-native-html-parser').DOMParser

import GameScreen from './GameScreen'
import LogPlay from './Plays/Log'
import ListPlays from './Plays/List'
import GameSearch from './GameSearch'
import GameAddTo from './GameAddTo'

import UserThumbNail from './../components/UserThumbNail'
import GameStack from './GameStack'

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
    let [country, setCountry] = useState("")
    let [city, setCity] = useState("")

    let [locals, setLocals] = useState([])
    let [fetchingInProgress, setFetchingInProgress] = useState(false)
    const [collection] = useGlobal('collection')



    async function fetchLocalUsers() {
        setFetchingInProgress(true)
        let resp = await fetchRaw('https://boardgamegeek.com/users?country=Netherlands&state=&city=utrecht', fetchArgs)
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
                    locFinal.push({ 'name': loc[ind] })
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
                        containerStyle={{ width: '50%', backgroundColor: styleconstants.bggpurple }}
                        inputContainerStyle={{ backgroundColor: 'white' }}
                    // showLoadingIcon={true}
                    />
                    <SearchBar
                        onChangeText={(t) => { setCity(t) }}
                        onClearText={(t) => { setCity("") }}
                        placeholder="City..."
                        value={city}
                        containerStyle={{ width: '50%', backgroundColor: styleconstants.bggpurple }}
                        inputContainerStyle={{ backgroundColor: 'white' }}


                    // showLoadingIcon={true}
                    />
                </View>
                <View>
                    {fetchingInProgress ?
                        <View>
                            <Text>Loading users nearby ...</Text>

                        </View> :
                        <View>

                            <FlatList
                                data={locals}
                                renderItem={({ item }) => {
                                    return <UserThumbNail
                                        userName={item.name}
                                        navigation={navigation}
                                    />
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

    </Stack.Navigator>


)

