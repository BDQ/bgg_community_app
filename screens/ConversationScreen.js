import React, { useState, useEffect, useGlobal } from 'reactn'

import SafeAreaView from 'react-native-safe-area-view'
import { createStackNavigator } from '@react-navigation/stack'
import { useFocusEffect } from '@react-navigation/native';
import { getNumUnread } from '../shared/FetchWithCookie'

import { fetchRaw } from '../shared/HTTP'
import { View, Text, ScrollView, FlatList, TouchableOpacity, Dimensions, TextInput, KeyboardAvoidingView , Keyboard} from 'react-native';
import styles from '../shared/styles'
import { func } from 'prop-types';
import MessageThumbNail from './MessageThumbNail'
import { manipulateAsync } from 'expo-image-manipulator';
import { Icon } from 'react-native-elements'
import { BarIndicator } from 'react-native-indicators';
import { showMessage } from 'react-native-flash-message'

import HTML from "react-native-render-html";
import styleconstants from '../shared/styles/styleconstants';


const showFlash = (message, type = 'danger') => {
  showMessage({ message, type, icon: 'auto' })
}

const ConversationScreen = props => {

  let [loading, setLoading] = useState(true)
  let [sending, setSending] = useState(false)

  let [messages, setMessages] = useState(null)
  let [messageToSend, setMessageToSend] = useState('');

  const { height } = Dimensions.get("window")
  const numLines = Math.floor((height / 4) / 22)      /// 22 is the height of the main font
  const maxTextInputHeight = 22 * numLines
  const extraTextInputHeight = Platform.OS === 'ios' ? 10 : 2
  let [textInputHeight, setHeight] = useState(34 + extraTextInputHeight)


  function getPastMessagesString(){
    var s = ""
    for(var mInd in messages){
      s += "[q=\"" + messages[mInd].sender + "\"]" + messages[mInd].message
    }
    s += "[/q][/q]"
    return encodeURIComponent(s)
  }

  async function sendMessage(){
    Keyboard.dismiss()
    setSending(true)


    var myHeaders = new Headers();
    myHeaders.append("authority", "boardgamegeek.com");
    myHeaders.append("sec-ch-ua", "\"Google Chrome\";v=\"89\", \"Chromium\";v=\"89\", \";Not A Brand\";v=\"99\"");
    myHeaders.append("accept", "text/javascript, text/html, application/xml, text/xml, */*");
    myHeaders.append("x-requested-with", "XMLHttpRequest");
    myHeaders.append("sec-ch-ua-mobile", "?0");
    myHeaders.append("user-agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36");
    myHeaders.append("content-type", "application/x-www-form-urlencoded; charset=UTF-8");
    myHeaders.append("origin", "https://boardgamegeek.com");
    myHeaders.append("sec-fetch-site", "same-origin");
    myHeaders.append("sec-fetch-mode", "cors");
    myHeaders.append("sec-fetch-dest", "empty");
    myHeaders.append("referer", "https://boardgamegeek.com/geekmail");
    myHeaders.append("accept-language", "en-US,en;q=0.9");
    myHeaders.append("cookie", global.cookie);

    var raw = "action=save&messageid=&touser=" + encodeURIComponent(props.route.params.user) + "&subject="+encodeURIComponent(props.route.params.subject)+"&savecopy=1&geek_link_select_1=&sizesel=10&body="+encodeURIComponent(messageToSend) + getPastMessagesString()+"&B1=Send&folder=inbox&label=&ajax=1&searchid=0&pageID=1";
    
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
      credentials: 'omit'
    };
    
    fetch("https://boardgamegeek.com/geekmail_controller.php", requestOptions)
      .then(response => {
        console.log("resp status", response.status)
        if(response.status === 200){
          response.text()
          .then(rt => {
            console.log("resp text", rt)
            setSending(false)
            showFlash(`Your message was sent successfully`, 'success')
            getNumUnread()
      
            props.navigation.navigate("GeekMail", {"refetch":true})
          })
          .catch(error => console.log('error', error));

        }else{
          showFlash(`An error has occured`, 'error')

        }
        
    })

  }


  async function getMessages(){
    console.log("global cookie", global.cookie)
    console.log("message id", props.route.params.messageid)
  
  
    // can't fetchJSON here as we want the full http response
    // so we can inspect the cookies... like a monster ;)
  
    const requestHeaders = {
      Accept: '*/*',
      cookie: global.cookie

    }
   let resp = await fetchRaw("https://boardgamegeek.com/geekmail_controller.php?action=getmessage&ajax=1&folder=inbox&messageid=" + props.route.params.messageid, 
   {
    method: 'GET',
    credentials: 'omit',
  }, requestHeaders)

    ///also refresh number of unread
    getNumUnread()
    
    console.log("resp messages", resp.status, resp.statusText)
    resp.text().then(rText => {



      console.log("resp text", rText)
      let regexMsgs = rText.match(/>(.*?)</g)
      console.log("enclosed", regexMsgs)

      let msgList = []
      let sender  = ""
      let msg = ""
      let messagesBlockStarted = false
      let messagesBlockEnded = false
      let nextIsFirstSender = false
      let subjectFound = false
      let firstMsgCountdown = 2

      for(var ind in regexMsgs){
        if((!regexMsgs[ind].startsWith(">\\") && regexMsgs[ind] != "><" && !regexMsgs[ind].startsWith("> \\") &&  !regexMsgs[ind].startsWith(">)")||regexMsgs[ind].endsWith("Subject: <"))){

          if(!messagesBlockStarted){
            //// getting the first message is different from getting the rest
            if(regexMsgs[ind].startsWith(">(")){
              nextIsFirstSender = true
            }
            else if(nextIsFirstSender){
              sender = regexMsgs[ind].substring(1, regexMsgs[ind].length - 1)
              nextIsFirstSender = false

            }

            if(regexMsgs[ind].endsWith("Subject: <")){
              subjectFound = true
            }
            else if(subjectFound){
              if(firstMsgCountdown === 0){
                msg = regexMsgs[ind].substring(1, regexMsgs[ind].length - 1)
                messagesBlockStarted = true
                msgList.push({"sender":sender, "message":msg})
                msg = ""
                sender = ""
              }else{
                firstMsgCountdown -=1
              }
   

            }

          }
          
          if(messagesBlockStarted && !messagesBlockEnded){
    
            if(regexMsgs[ind].startsWith(">Collapse")){
              messagesBlockEnded = true
            }
            else if(regexMsgs[ind].endsWith("wrote:<")){
              msgList.push({"sender":sender, "message":msg})
              sender = regexMsgs[ind].substring(1, regexMsgs[ind].length - 8)
              msg = ""
  
            }else{
              msg += regexMsgs[ind].substring(1, regexMsgs[ind].length - 1) + "\n"
            }
        
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

 
<View style={{ flexDirection: 'row',  justifyContent: 'space-between', width:'100%', maxHeight: maxTextInputHeight + 15, alignItems:'flex-end'}}>

<View style={{ paddingHorizontal: 10, backgroundColor: 'white', borderRadius: 15, marginVertical: 8, height: textInputHeight + 10, maxHeight: maxTextInputHeight, width:'85%', marginHorizontal:6 ,justifyContent:'center', paddingBottom:5}}>
<TextInput
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
    {sending?
    <View style = {{marginBottom:0, marginRight:5}}>
      <BarIndicator size={16} color={styleconstants.bggorange} count={5}  />
      </View>
      :                              
      
      <Icon
      name='paper-plane'
      type='font-awesome'
      color={styleconstants.bggorange}
      size={16}
      style={{ textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}
      onPress = {() => {sendMessage()}}
      reverse
      />
    }

    </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  )

}


export default ConversationScreen