import React, { useGlobal, useEffect, useState, useDispatch } from 'reactn'
import PropTypes from 'prop-types'
import { View, Text, InteractionManager } from 'react-native'
import { Button } from 'react-native-elements'
import { createStackNavigator } from '@react-navigation/stack'

import { Icon } from 'react-native-elements'
import ProgressBar from 'react-native-progress/Circle'

import GameScreen from './GameScreen'
import LogPlay from './Plays/Log'
import ListPlays from './Plays/List'
import GameSearch from './GameSearch'
import GameAddTo from './GameAddTo'

import GameList from './../components/GameList'

import globalStyles from '../shared/styles'
import { logger } from '../shared/debug'



const Stack = createStackNavigator()



export default () => (

    <Stack.Navigator
        screenOptions={{
            headerStyle: {
                backgroundColor: '#403c64',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
        }}>

        <Stack.Screen
            name="Game"
            component={GameScreen}
            options={({ route }) => ({ title: route.params.game.name })}
        />
        <Stack.Screen name="Search" component={GameSearch} />
        <Stack.Screen name="AddTo" component={GameAddTo} />
        <Stack.Screen name="LogPlay" component={LogPlay} />
        <Stack.Screen name="ListPlays" component={ListPlays} />
    </Stack.Navigator>
)
