import React, { useGlobal, useEffect, useState, useDispatch } from 'reactn'
import PropTypes from 'prop-types'
import { View, Text, InteractionManager, ScrollView, TouchableOpacity } from 'react-native'
import { Button } from 'react-native-elements'
import { createStackNavigator } from '@react-navigation/stack'

import { Icon } from 'react-native-elements'



import GameList from '../../components/GameList'

import globalStyles from '../../shared/styles'
import { logger } from '../../shared/debug'


const MoreScreen = (props) => {


    useEffect(() => {


    })


    return (
        <ScrollView>
            <TouchableOpacity style={{ height: 100, width: '100%', backgroundColor: 'white', margin: 3 }}
                onPress={() => {
                    props.navigation.navigate("Gamers nearby")
                }}
            >

            </TouchableOpacity>
            <TouchableOpacity style={{ height: 100, width: '100%', backgroundColor: 'white', margin: 3 }}
                onPress={() => {
                    props.navigation.navigate("Preview")
                }}
            >

            </TouchableOpacity>

        </ScrollView>
    )
}


const Stack = createStackNavigator()


export default props => {

    return (

        <Stack.Navigator >


            <Stack.Screen options={{ headerShown: false }} name="More" component={MoreScreen} />

        </Stack.Navigator>

    )
}
