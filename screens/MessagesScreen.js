import React, { useState, useEffect, useGlobal } from 'reactn'

import SafeAreaView from 'react-native-safe-area-view'
import { createStackNavigator } from '@react-navigation/stack'
import { useFocusEffect } from '@react-navigation/native';

import { fetchRaw } from '../shared/HTTP'
import { View, Text, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import styles from '../shared/styles'
import { func } from 'prop-types';
import MessageThumbNail from './MessageThumbNail'
import ConversationScreen from './ConversationScreen'
import { manipulateAsync } from 'expo-image-manipulator';



const MessagesScreen = props => {

  let [loading, setLoading] = useState(true)
  let [messages, setMessages] = useState("")


  async function getMessages(){
    console.log("global cookie", global.cookie)
  
  
    // can't fetchJSON here as we want the full http response
    // so we can inspect the cookies... like a monster ;)
  
    const requestHeaders = {
      Accept: '*/*',
      Cookie: "bggusername=BalintHompot; bggpassword=v2s49n9d6uvqyu5410vqyrsflkw7m10axx; bggusername=BalintHompot; bggpassword=yfgysc3v29qbbz10pqcenv3prm8qrgovg; SessionID=d81c9ff2789975350e11a072689b0c640b2d0b56u2573199; "
    }
   let resp = await fetchRaw("https://boardgamegeek.com/geekmail_controller.php?action=viewfolder&ajax=1&folder=inbox", 
   {
    method: 'GET',
    credentials: 'include',
  }, requestHeaders)
    console.log("resp messages", resp.status, resp.statusText)
    resp.text().then(rText => {



      console.log("resp text", rText)

      let mainTable = rText.match(/mychecks(.*)</g)[0]
      let msgIDs = rText.match(/GetMessage(.*?)return/g)

      
      let regexMsgs = mainTable.match(/>(.*?)</g)
      let msgs = []
      let counter = 0
      let msgCounter = 0
      let subject = ""
      let user = ""
      let date = ""
      let dateStr = ""

      for(var ind in regexMsgs){
        if(!regexMsgs[ind].startsWith(">\\")){
          if(counter == 6){
            msgs.push({"user":user, "subject":subject, "date":date,"id" : msgIDs[msgCounter].substring(12, msgIDs[msgCounter].length-10)})
            counter = 0
            msgCounter += 1
          }else{
            if(counter == 1){
              user = regexMsgs[ind].substring(1, regexMsgs[ind].length-1)
            }else if(counter == 3){
              subject = regexMsgs[ind].substring(1, regexMsgs[ind].length-1)
            }else if(counter == 5){
              dateStr = regexMsgs[ind].substring(1, regexMsgs[ind].length-1)
              date = dateStr.replace(/&nbsp/g, "")
            }
            counter += 1
          }
        }
      }

      setMessages(msgs)
      setLoading(false)

  
    })
  }

  useFocusEffect(
    React.useCallback(() => {
   
      console.log("fetching messages")
      getMessages()
    }, [])
  );




  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      
      {loading? 
       <View style={styles.emptyView}>
       <Text>Loading your messages...</Text>

        </View>
      :<ScrollView style = {{backgroundColor:'gainsboro'}}>
      <FlatList
        data={messages}
        renderItem={({ item }) => {
      
          return (
            <TouchableOpacity
              onPress={() => {
                props.navigation.navigate("Conversation", {messageid:item.id, subject : item.subject})
              }}
            >
              <MessageThumbNail
                messageObj = {item}
              />
            </TouchableOpacity>
          )
        }}

      />
        </ScrollView>
        
        }
 
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
    <Stack.Screen name="GeekMail" component={MessagesScreen} />
    <Stack.Screen name="Conversation" component={ConversationScreen}  options={({ route }) => ({

      title: route.params.subject,

      })} />

  </Stack.Navigator>
)
