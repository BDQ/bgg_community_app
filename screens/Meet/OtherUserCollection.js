import React, { useGlobal, useEffect, useState, useDispatch } from 'reactn'
import PropTypes from 'prop-types'
import { View, Text, InteractionManager, useWindowDimensions, ScrollView } from 'react-native'
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
const OwnedTab = createMaterialTopTabNavigator();
const WishlistTab = createMaterialTopTabNavigator();

const StackTabWrapper = createStackNavigator()
const Stack = createStackNavigator()
import styleconstants from '../../shared/styles/styleconstants'

const OwnedTabNav = props => {
    return <OwnedTab.Navigator
        tabBarOptions={{
            indicatorStyle: {
                backgroundColor: styleconstants.bggorange, height: 3
            },
            labelStyle: { fontFamily: styleconstants.primaryFontBold, fontSize: 12 }

        }}>

        <OwnedTab.Screen name={`In my wishlist (${props.route.params.lists.inUserWishlist.length})`} component={WishlistScreen} initialParams={{ gamelist: props.route.params.lists.inUserWishlist }} />
        <OwnedTab.Screen name={`Other games (${props.route.params.lists.otherGames.length})`} component={OwnedScreen} initialParams={{ gamelist: props.route.params.lists.otherGames }} />

    </OwnedTab.Navigator>
}

const WishlistTabNav = props => {
    const [collection] = useGlobal('collection')


    function iCanOffer(item) {
        for (var ownInd in owned) {
            if (item.objectId === owned[ownInd].objectId) {
                return true
            }
        }
        return false
    }
    const owned = collection.filter(
        game => game.status.own === '1'
    )

    const offerList = props.route.params.lists.othersWishlist.filter(
        game => iCanOffer(game)
    )

    const restList = props.route.params.lists.othersWishlist.filter(
        game => !iCanOffer(game)
    )

    return <WishlistTab.Navigator
        tabBarOptions={{
            indicatorStyle: {
                backgroundColor: styleconstants.bggorange, height: 3
            },
            labelStyle: { fontFamily: styleconstants.primaryFontBold, fontSize: 12 }

        }}>

        <WishlistTab.Screen name={`I can offer (${offerList.length})`} component={OwnedScreen} initialParams={{
            gamelist: offerList
        }} />
        <WishlistTab.Screen name={`Other games (${restList.length})`} component={WishlistScreen} initialParams={{
            gamelist: restList
        }} />

    </WishlistTab.Navigator>
}

const tabNav = props => {
    return <Tab.Navigator
        tabBarOptions={{
            indicatorStyle: {
                backgroundColor: styleconstants.bggpurple, height: 3
            },
            labelStyle: { fontFamily: styleconstants.primaryFontBold, fontSize: 12 }

        }}>
        <Tab.Screen name="Owned" component={OwnedTabNav} initialParams={props.route.params} />
        <Tab.Screen name="Wishlist" component={WishlistTabNav} initialParams={props.route.params} />

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
