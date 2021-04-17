import React, { useState, useEffect, useGlobal } from 'reactn'

import SafeAreaView from 'react-native-safe-area-view'
import { createStackNavigator } from '@react-navigation/stack'
import { useFocusEffect } from '@react-navigation/native';

import { fetchRaw } from '../shared/HTTP'
import { View, Text, ScrollView, FlatList, TouchableOpacity, Dimensions, TextInput, KeyboardAvoidingView } from 'react-native';
import styles from '../shared/styles'
import { func } from 'prop-types';
import MessageThumbNail from './MessageThumbNail'
import { manipulateAsync } from 'expo-image-manipulator';
import { Icon } from 'react-native-elements'

import HTML from "react-native-render-html";
import styleconstants from '../shared/styles/styleconstants';

const ConversationScreen = props => {

  let [loading, setLoading] = useState(true)
  let [messages, setMessages] = useState(null)
  let [messageToSend, setMessageToSend] = useState('');

  const { height } = Dimensions.get("window")
  const numLines = Math.floor((height / 4) / 22)      /// 22 is the height of the main font
  const maxTextInputHeight = 22 * numLines
  const extraTextInputHeight = Platform.OS === 'ios' ? 10 : 2
  let [textInputHeight, setHeight] = useState(34 + extraTextInputHeight)


  async function getMessages(){
    console.log("global cookie", global.cookie)
    console.log("message id", props.route.params.messageid)
  
  
    // can't fetchJSON here as we want the full http response
    // so we can inspect the cookies... like a monster ;)
  
    const requestHeaders = {
      Accept: '*/*',
      Cookie: "bggusername=BalintHompot; bggpassword=v2s49n9d6uvqyu5410vqyrsflkw7m10axx; bggusername=BalintHompot; bggpassword=yfgysc3v29qbbz10pqcenv3prm8qrgovg; SessionID=d81c9ff2789975350e11a072689b0c640b2d0b56u2573199; "
    }
   let resp = await fetchRaw("https://boardgamegeek.com/geekmail_controller.php?action=getmessage&ajax=1&folder=inbox&messageid=" + props.route.params.messageid, 
   {
    method: 'GET',
    credentials: 'include',
  }, requestHeaders)
    console.log("resp messages", resp.status, resp.statusText)
    resp.text().then(rText => {



      console.log("resp text", rText)
      let regexMsgs = rText.match(/>(.*?)</g)
      console.log("enclosed", regexMsgs)

      let msgList = []
      let sender  = ""
      let msg = ""

      for(var ind in regexMsgs){
        if(!regexMsgs[ind].startsWith(">\\") && regexMsgs[ind] != "><" ){

          if(regexMsgs[ind].startsWith(">Collapse")){
            
          }

          if(regexMsgs[ind].endsWith("wrote:<")){
            msgList.push({"sender":sender, "message":msg})
            sender = regexMsgs[ind].substring(1, regexMsgs[ind].length - 8)
            msg = ""

          }else{
            msg += regexMsgs[ind].substring(1, regexMsgs[ind].length - 1) + "\n"
          }


        }
      }
      msgList.push({"sender":sender, "message":msg})





      setMessages(msgList)
      setLoading(false)

  
    })
  }

  useFocusEffect(
    React.useCallback(() => {
      if(!messages){
        console.log("fetching messages")
        getMessages()
      }
   
 
    }, [])
  );


  const htmlContent = `
  <h1>This HTML snippet is now rendered with native components !</h1>
  <h2>Enjoy a webview-free and blazing fast application</h2>
  <img src="https://i.imgur.com/dHLmxfO.jpg?2" />
  <em style="textAlign: center;">Look at how happy this native cat is</em>
`;


  return (
    <SafeAreaView style={{ flex: 1}}>
        <KeyboardAvoidingView style={{ height: '100%', flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : null} keyboardVerticalOffset={Platform.OS === 'ios' ? height * 0.1 : 0}>
      {loading? 
       <View style={styles.emptyView}>
       <Text>Loading conversation...</Text>

        </View>
        :
              <FlatList
          data={messages}
          renderItem={({ item }) => {

            let isSelf =  global.username.normalize() ===  item.sender.normalize()
      
          return (
            <View style = {{width:'100%', alignItems: isSelf ? 'flex-end':'flex-start'}}>
              <View style = {{width:300, margin:10, alignItems: isSelf ? 'flex-end':'flex-start'}}>
              <Text style = {{fontStyle:"italic", marginHorizontal:20}}>{item.sender}</Text>
              <View style = {{backgroundColor: isSelf ? 'white' : styleconstants.bggpurple, borderRadius:20, padding:16, paddingBottom:0}}>
              <Text style = {{fontFamily:styleconstants.primaryFont, color:isSelf ? 'black':'white'}}>{item.message}</Text>

              </View>

            </View>
            </View>
      
          )
          
        }}
        inverted
      />
}

 
<View style={{ flexDirection: 'row', height: textInputHeight + 15, justifyContent: 'space-between', width:'100%', maxHeight: maxTextInputHeight + 15, alignItems:'flex-end'}}>

<View style={{ paddingHorizontal: 10, backgroundColor: 'white', borderRadius: 15, marginVertical: Platform.OS === 'ios' ? 8 : 4, height: textInputHeight, maxHeight: maxTextInputHeight, width:'85%', marginHorizontal:6 }}>
<TextInput
    style={{height : textInputHeight}}
    onChangeText={Msg => setMessageToSend(Msg)}
    placeholder="Write a message"
    placeholderTextColor={'lightgrey'}
    autoCapitalize="sentences"
    returnKeyType="next"
    multiline={true}
    maxHeight={maxTextInputHeight}
    value={messageToSend}
    returnKeyType='default'
    textAlignVertical='center'
    onContentSizeChange={e => {
        console.log('content size change, height:', e.nativeEvent.contentSize.height);
        setHeight(e.nativeEvent.contentSize.height + extraTextInputHeight)
    }}


    />
    </View>
      
      <Icon
      name='paper-plane'
      type='font-awesome'
      color={styleconstants.bggorange}
      size={16}
      style={{ textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}
      reverse
      />

    </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  )

}


export default ConversationScreen