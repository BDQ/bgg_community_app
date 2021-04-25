import React, { useGlobal, useEffect, useState, useDispatch } from 'reactn'
import PropTypes from 'prop-types'
import { View, Text, InteractionManager, ScrollView, TouchableOpacity, Image, Dimensions, StyleSheet } from 'react-native'
import { Button } from 'react-native-elements'
import { createStackNavigator } from '@react-navigation/stack'

import { Icon } from 'react-native-elements'


import styleconstants from '../../shared/styles/styleconstants'
import GameList from '../../components/GameList'

import globalStyles from '../../shared/styles'
import { logger } from '../../shared/debug'

const width = Dimensions.get('screen').width

const TriangleCornerBottomLeft = props => {
    return <View style={{
        width: 0,
        height: 0,
        backgroundColor: "transparent",
        borderStyle: "solid",
        borderRightWidth: 20,
        borderTopWidth: 70,
        borderRightColor: "transparent",
        borderTopColor: 'white',
    }} />;
};


const TriangleCornerTopRight = props => {
    return <View style={{
        width: 0,
        height: 0,
        backgroundColor: "transparent",
        borderStyle: "solid",
        borderLeftWidth: 20,
        borderTopWidth: 40,
        borderLeftColor: "transparent",
        borderTopColor: styleconstants.bggorange,
    }} />;
};




const MoreScreen = (props) => {

    useEffect(() => {


    })


    return (
        <ScrollView >
            <TouchableOpacity
                onPress={() => {
                    props.navigation.navigate("Gamers nearby")
                }}
            >
                <Image source={require('../../assets/gamenight.jpeg')} style={{ height: 259, width: width - 12, borderRadius: 15, margin: 6 }} />
                <View style={{
                    position: 'absolute', bottom: 6, left: 6,

                }}>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flexDirection: 'column', width: width * 0.7, backgroundColor: 'white', padding: 10 }}>
                            <Text style={{ fontFamily: styleconstants.primaryFontBold, fontSize: 20 }}>Find nearby gamers</Text>
                            <Text style={{ fontFamily: styleconstants.primaryFont, fontSize: 13 }}>Meet, share or trade with BGG users nearby.</Text>
                        </View>

                        <TriangleCornerBottomLeft />
                    </View>


                </View>

            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => {
                    props.navigation.navigate("Preview")
                }}
            >
                <Image source={require('../../assets/prev.jpg')} style={{ height: 250, width: width - 12, margin: 6, borderRadius: 15 }} />
                <View style={{
                    position: 'absolute', bottom: 6, left: 6,

                }}>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flexDirection: 'column', width: width * 0.7, backgroundColor: 'white', padding: 10 }}>
                            <Text style={{ fontFamily: styleconstants.primaryFontBold, fontSize: 20 }}>Previews</Text>
                            <Text style={{ fontFamily: styleconstants.primaryFont, fontSize: 13 }}>Find the latest board and card game releases.</Text>
                        </View>

                        <TriangleCornerBottomLeft />
                    </View>


                </View>
            </TouchableOpacity>
            <View style={{ alignItems: 'flex-end', marginTop: 30 }}>
                <View style={{ flexDirection: 'row' }}>
                    <TriangleCornerTopRight />

                    <View style={{ flexDirection: 'column', width: width * 0.7, backgroundColor: styleconstants.bggorange, padding: 10 }}>
                        <Text style={{ fontFamily: styleconstants.primaryFontBold, fontSize: 16, color: 'white' }}>More coming soon.</Text>
                    </View>

                </View>
            </View>

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
