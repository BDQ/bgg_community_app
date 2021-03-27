import React, { useGlobal, useEffect, useState, useDispatch } from 'reactn'
import PropTypes from 'prop-types'
import { View, Text, InteractionManager, useWindowDimensions } from 'react-native'
import { Button } from 'react-native-elements'
import { createStackNavigator } from '@react-navigation/stack'
import OwnedScreen from './OwnedScreen'
import WishlistScreen from './WishlistScreen'

import { Icon } from 'react-native-elements'



import globalStyles from '../shared/styles'
import { logger } from '../shared/debug'


const CollectionScreen = ({ navigation, route }) => {
    const layout = useWindowDimensions();

    let [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'first', title: 'First' },
        { key: 'second', title: 'Second' },
    ]);
    /*
    const renderScene = SceneMap({
        first: OwnedScreen,
        second: WishlistScreen,
    });
    */

    return (
        <View>

        </View>


    );

}

CollectionScreen.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
    }).isRequired,
}

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

        <Stack.Screen name="Collection" component={CollectionScreen} />

    </Stack.Navigator>
)
