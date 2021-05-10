import React, { useGlobal, useEffect, useState, useDispatch, useRef } from 'reactn'
import PropTypes from 'prop-types'
import { View, Text, InteractionManager, ScrollView, FlatList, LayoutAnimation, Keyboard } from 'react-native'
import { Button } from 'react-native-elements'
import { createStackNavigator } from '@react-navigation/stack'
import SafeAreaView from 'react-native-safe-area-view'
import * as Sentry from 'sentry-expo'

import styleconstants from '../../shared/styles/styleconstants'


import { Dropdown } from 'react-native-material-dropdown-v2'

const conditions = [
    {
        label: 'Condition: any',
        value: 'any'
    },
    {
        label: 'Condition: new',
        value: 'new'
    },
    {
        label: 'Condition: like new',
        value: 'like new'
    },
    {
        label: 'Condition: good',
        value: 'good'
    },
    {
        label: 'Condition: acceptable',
        value: 'acceptable'
    },


]

const currencies = [
    {
        label: 'Currency: Any',
        value: 'Any'
    },
    {
        label: 'Currency: U.S. Dollars',
        value: 'U.S. Dollars'
    },
    {
        label: 'Currency: Euros',
        value: 'Euros'
    },
    {
        label: 'Currency: British Pounds Sterling',
        value: 'British Pounds Sterling'
    },
    {
        label: 'Currency: Canadian Dollars',
        value: 'Canadian Dollars'
    },
    {
        label: 'Currency: Australian Dollars',
        value: 'Australian Dollars'
    },

]




const MarketScreen = ({ navigation, route }) => {

    let [condition, setCondition] = useState("any")
    let [currency, setCurrency] = useState("Any")



    return (
        <SafeAreaView>
            <Dropdown
                dropdownOffset={{
                    top: 0,
                    left: 0
                }}
                itemCount={conditions.length}
                containerStyle={{ width: '50%', margin: 0, height: 30 }}
                style={{ margin: 0, height: 30 }}
                data={conditions}
                value={condition} //use local state if set, otherwise global
                onChangeText={f => {
                    setCondition(f)
                }}
            />
            <Dropdown
                dropdownOffset={{
                    top: 0,
                    left: 0
                }}
                itemCount={currencies.length}
                containerStyle={{ width: '50%', margin: 0, height: 30 }}
                style={{ margin: 0, height: 30 }}
                data={currencies}
                value={currency} //use local state if set, otherwise global
                onChangeText={f => {
                    setCurrency(f)
                }}
            />
        </SafeAreaView>
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


        <Stack.Screen options={{ headerShown: true }} name="Geek Market" component={MarketScreen} />


    </Stack.Navigator>

)

