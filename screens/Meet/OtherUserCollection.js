import React, { useGlobal, useEffect, useState, useDispatch } from 'reactn'
import PropTypes from 'prop-types'
import { View, Text, InteractionManager, useWindowDimensions } from 'react-native'
import { Button } from 'react-native-elements'
import { createStackNavigator } from '@react-navigation/stack'
import OwnedScreen from '../Collection/OwnedScreen'
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
            labelStyle: { fontFamily: styleconstants.primaryFontBold, fontSize: 12 }

        }}>
        <Tab.Screen name="In my wishlist" component={WishlistScreen} initialParams={{ gamelist: props.route.params.lists.inUserWishlist }} />
        <Tab.Screen name="Owned" component={OwnedScreen} initialParams={{ gamelist: props.route.params.lists.otherGames }} />
        <Tab.Screen name="Wishlist" component={WishlistScreen} initialParams={{ gamelist: props.route.params.lists.othersWishlist }} />

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
                icon={<Icon name="add-to-list" type="entypo" size={20} color={'white'} />}
                onPress={() => props.navigation.navigate('GameStack', { screen: 'Search' })}
                buttonStyle={globalStyles.headerIconButton}
            />
        ),


    }}>

        <StackTabWrapper.Screen options={{ headerShown: false }} name="Collection" component={tabNav} initialParams={props.route.params} />

    </StackTabWrapper.Navigator>


}


export default props => {

    return (

        <Stack.Navigator >


            <Stack.Screen options={{ headerShown: false }} name="Collection" component={tabNavWrapped} initialParams={{ lists: props.lists }} />
            <Stack.Screen options={{ headerShown: false }} name="GameStack" component={GameStack} />

        </Stack.Navigator>

    )
}
