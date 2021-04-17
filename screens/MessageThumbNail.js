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
import Ionicons from 'react-native-vector-icons/Ionicons'


const MessageThumbnail = props => {



  useEffect(() => {
  
  }, [])


  return (

    <View style = {{flexDirection:'row', padding:20, justifyContent:'space-between',marginVertical:1, backgroundColor:'white'}}>
      <View style = {{flexDirection:'row', alignItems:'center', width:"72%"}}>
        <Ionicons name="mail" size={20} color={styleconstants.bggorange} />
        <View style = {{flexDirection:'column'}}>
          <Text style = {{fontFamily:styleconstants.primaryFontBold, color:'dodgerblue',  marginLeft:10, fontSize:16}}>{props.messageObj.user}</Text>
          <Text style = {{ fontStyle:'italic', marginLeft:10, fontSize:18}}>{props.messageObj.subject}</Text>

        </View>

      </View>
      <View style = {{justifyContent:'flex-start', width:'23%'}}>
      <Text style = {{fontFamily:styleconstants.primaryFont, fontSize:12}}>{props.messageObj.date}</Text>

      </View>

    </View>

  )

}


export default MessageThumbnail
