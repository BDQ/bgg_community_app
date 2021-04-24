import React, { useGlobal, useEffect, useState, useDispatch } from 'reactn'
import PropTypes from 'prop-types'
import { View, Text, InteractionManager, useWindowDimensions } from 'react-native'
import { Button } from 'react-native-elements'
import { createStackNavigator } from '@react-navigation/stack'
import ExploreScreen from './Explore'
import WishlistScreen from '../Collection/WishlistScreen'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { Icon } from 'react-native-elements'

import GameStack from '../GameStack'

import globalStyles from '../../shared/styles'
import { logger } from '../../shared/debug'

const Tab = createMaterialTopTabNavigator();
const StackTabWrapper = createStackNavigator()
const Stack = createStackNavigator()
import styleconstants from '../../shared/styles/styleconstants'

const tabNav = props => {
    return <Tab.Navigator
        tabBarOptions={{
            indicatorStyle: {
                backgroundColor: styleconstants.bggorange, height: 3
            },
            labelStyle: { fontFamily: 'lato-bold' }

        }}>
        <Tab.Screen name="Explore" component={ExploreScreen} />
        <Tab.Screen name="More" component={WishlistScreen} />
    </Tab.Navigator>
}

const tabNavWrapped = props => {
    return <StackTabWrapper.Navigator screenOptions={{
        headerStyle: {
            backgroundColor: styleconstants.bggpurple,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'bold',
        },
        headerRight: () => (
            <Button
                icon={<Icon name="search" type="ionicons" size={20} color={'white'} />}
                onPress={() => props.navigation.navigate('GameStack', { screen: 'Search' })}
                buttonStyle={globalStyles.headerIconButton}
            />
        ),


    }}>

        <StackTabWrapper.Screen name="Home" component={tabNav} />

    </StackTabWrapper.Navigator>


}


export default props => {

    return (

        <Stack.Navigator >


            <Stack.Screen options={{ headerShown: false }} name="Home" component={tabNavWrapped} />
            <Stack.Screen options={{ headerShown: false }} name="GameStack" component={GameStack} />

        </Stack.Navigator>

    )
}
