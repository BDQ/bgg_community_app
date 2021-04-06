import React, { useState, useEffect, useGlobal } from 'reactn'
import Sentry from 'sentry-expo'
import { View, Text, StyleSheet, Linking, ScrollView, Image } from 'react-native'
import { Input, Button } from 'react-native-elements'
import { showMessage } from 'react-native-flash-message'
import SafeAreaView from 'react-native-safe-area-view'
import { createStackNavigator } from '@react-navigation/stack'
import { logIn, getUserId } from '../shared/auth'
import CollectionScreen from './CollectionScreen'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SearchBar, Icon } from 'react-native-elements'
import styleconstants from '../shared/styles/styleconstants'
import styles from '../shared/styles'
import { getDispatch } from 'reactn'
import ProfileCard from './ProfileCard'

import { fetchXML } from '../shared/HTTP'
var parseString = require('react-native-xml2js').parseString;


const customStyles = StyleSheet.create({
  text: {
    paddingHorizontal: 20,
    paddingVertical: 10
  },

  stateText: {
    paddingVertical: 20
  },

  bottomText: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 20
  },

  buttonContainer: {
    paddingVertical: 30
  },

  button: {
    alignSelf: 'center',
    width: '100%'
  },

  strong: {
    fontWeight: 'bold'
  }
})

const ProfileScreen = props => {

  let [loading, setLoading] = useState(false)

  /// if there are no params, we are logging in, so we use the global username
  let userName = props.route.params ? props.route.params.userName : global.username

  console.log("props", props)
  console.log(props.route.params)

  const handleLogOut = () => {


    //tells global store we've logged in
    props.navigation.navigate("Login")
    getDispatch().logOut()
  }



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView>
        <View style={[styles.mainView, { marginTop: 30 }]}>

          <ProfileCard userName={userName} />



          <View style={customStyles.buttonContainer}>
            <Button
              id="submitButton"
              backgroundColor="#03A9F4"
              style={customStyles.button}
              onPress={
                handleLogOut
              }
              loading={loading}
              title={'Sign Out'}
            />

          </View>
          <View >
            <Text style={{ color: 'black' }}>
              This app is an <Text style={customStyles.strong}>unofficial</Text>{' '}
              {' '}
              community initiative to build a sharing mobile application
              for the amazing BoardGameGeek.com site.
            </Text>
            <Text></Text>
            <Text style={{ color: 'black' }}>
              Geekdo, BoardGameGeek, the Geekdo logo, and the BoardGameGeek
              logo are trademarks of BoardGameGeek, LLC.
              </Text>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  )

}
const Stack = createStackNavigator()


export default () => (
  <Stack.Navigator screenOptions={{
    headerStyle: {
      backgroundColor: '#403c64',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  }}>
    <Stack.Screen name="Profile" component={ProfileScreen} />
  </Stack.Navigator>
)
