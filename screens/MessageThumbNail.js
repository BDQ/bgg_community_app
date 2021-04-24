import React, { useState, useEffect, useGlobal } from 'reactn'
import { View, Text, StyleSheet, Linking, ScrollView, Image } from 'react-native'

import styleconstants from '../shared/styles/styleconstants'
import styles from '../shared/styles'
import Ionicons from 'react-native-vector-icons/Ionicons'


const MessageThumbnail = props => {



  useEffect(() => {

  }, [])


  return (

    <View style={{ flexDirection: 'row', padding: 20, justifyContent: 'space-between', marginVertical: 1, backgroundColor: 'white' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', width: "72%" }}>
        <Ionicons name={props.messageObj.read ? "mail-open-outline" : "mail"} size={20} color={styleconstants.bggorange} />
        <View style={{ flexDirection: 'column' }}>
          <Text style={{ fontFamily: styleconstants.primaryFontBold, color: 'dodgerblue', marginLeft: 10, fontSize: 16 }}>{props.messageObj.user}</Text>
          <Text style={props.messageObj.read ? { fontStyle: 'italic', marginLeft: 10, fontSize: 18 } : { marginLeft: 10, fontSize: 18, fontWeight: '600' }}>{props.messageObj.subject}</Text>

        </View>

      </View>
      <View style={{ justifyContent: 'flex-start', width: '23%' }}>
        <Text style={{ fontFamily: styleconstants.primaryFont, fontSize: 12 }}>{props.messageObj.date}</Text>

      </View>

    </View>

  )

}


export default MessageThumbnail
