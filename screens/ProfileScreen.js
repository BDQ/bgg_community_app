import React from 'react'
import { createStackNavigator } from 'react-navigation'
import { View, Text, StyleSheet, AsyncStorage } from 'react-native'
import {
  FormLabel,
  FormInput,
  FormValidationMessage,
  Button
} from 'react-native-elements'
import { showMessage } from 'react-native-flash-message'

import { fetchRaw, fetchJSON } from '../shared/HTTP'

const styles = StyleSheet.create({
  text: {
    paddingHorizontal: 20,
    paddingVertical: 10
  },

  bottomText: {
    padding: 20
  }
})

class FieldValidation extends React.PureComponent {
  constructor(props) {
    super(props)
  }

  render = () => {
    if (this.props.message) {
      return <FormValidationMessage>{this.props.message}</FormValidationMessage>
    } else {
      return null
    }
  }
}

class ProfileEditScreen extends React.PureComponent {
  static navigationOptions = () => {
    return {
      title: 'BGG Account'
    }
  }

  constructor(props) {
    super(props)
    const isLoggedIn = Object.keys(props.screenProps.bgg_credentials).length > 0

    this.state = {
      username: props.screenProps.bgg_credentials.bgg_username,
      username_error: '',
      password: '',
      password_error: '',
      loading: false,
      message: null,
      isLoggedIn: isLoggedIn
    }
  }

  usernameChange = username => {
    this.setState({ username: username })
  }

  passwordChange = password => {
    this.setState({ password: password })
  }

  logOut = () => {
    this.setState({
      usernameError: '',
      password: '',
      passwordError: '',
      loading: false,
      isLoggedIn: false,
      message: null
    })

    // todo enumerate our keys and use multiRemove instead - clear is bad - I know - priorities...
    AsyncStorage.clear()

    //tells top level App we've logged in
    this.props.screenProps.loadAuth()
  }

  logIn = () => {
    let valid = true

    if (this.state.username == '') {
      valid = false
      this.setState({ usernameError: 'Username is required' })
    }

    if (this.state.password == '') {
      valid = false
      this.setState({ passwordError: 'Password is required' })
    }

    if (valid) {
      this.setState({ loading: true })
      this.attemptBGGLogin(this.state.username, this.state.password)
    }
  }

  attemptBGGLogin = async (bggUsername, bggPassword) => {
    const loadAuth = this.props.screenProps.loadAuth

    const headers = new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json;charset=UTF-8'
    })

    const init = {
      method: 'POST',
      body: JSON.stringify({
        credentials: { username: bggUsername, password: bggPassword }
      }),
      credentials: 'include',
      headers
    }

    try {
      // can't fetchJSON here as we want the full http response
      // so we can inspect the cookies... like a monster ;)
      let response = await fetchRaw('/login/api/v1', init)

      this.setState({ loading: false })

      if (response.status == 200) {
        // const {message} = await response.json()
        // const cookie = response.headers.get('set-cookie')

        // manually build the cookie here, as the .setItem below is async
        const { userid, firstname, lastname } = await this.getUserId()

        if (userid > 0) {
          showMessage({
            message: `Successfully signed in as ${bggUsername}.`,
            icon: 'auto',
            type: 'success'
          })

          this.setState({
            isLoggedIn: true
          })

          AsyncStorage.setItem(
            '@BGGApp:auth',
            JSON.stringify({
              bggUsername,
              userid,
              firstname,
              lastname
            })
          )

          //tells top level App we've logged in
          loadAuth()
        } else {
          showMessage({
            message:
              'Failed to get user data while logging in, please try again.',
            icon: 'auto',
            type: 'danger'
          })
        }
      } else if (response.status == 401) {
        showMessage({
          message: 'Username or password was incorrect, please try again.',
          icon: 'auto',
          type: 'warning'
        })
      } else {
        showMessage({
          message: 'Unexpected http status while logging in, please try again.',
          icon: 'auto',
          type: 'danger'
        })
        console.warn(response)
      }
    } catch (error) {
      showMessage({
        message: 'Unexpected error logging in, please try again.',
        icon: 'auto',
        type: 'danger'
      })
      console.warn('LOGIN ERROR', error)
    }
  }

  getUserId = async headers => await fetchJSON('/api/users/current', headers)

  renderMessage = () => {
    let msg = 'Configure your BoardGameGeek account to get started.'
    if (this.state.message !== null) {
      msg = this.state.message
    }

    return <Text style={styles.text}>{msg}</Text>
  }

  render = () => {
    return (
      <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
        {this.renderMessage()}

        <FormLabel>BGG Username</FormLabel>
        <FormInput
          focus={true}
          autoCapitalize={'none'}
          autoCorrect={false}
          spellCheck={false}
          onChangeText={this.usernameChange}
          value={this.state.username}
        />
        <FieldValidation message={this.state.usernameError} />

        <FormLabel>BGG Password</FormLabel>
        <FormInput
          onChangeText={this.passwordChange}
          secureTextEntry={true}
          value={this.state.password}
        />
        <FieldValidation message={this.state.passwordError} />

        <Text style={styles.bottomText} />
        <Button
          raised
          backgroundColor="#03A9F4"
          onPress={this.state.isLoggedIn ? this.logOut : this.logIn}
          loading={this.state.loading}
          title={this.state.isLoggedIn ? 'Log Out' : 'Log In'}
        />
      </View>
    )
  }
}

export default (ProfileScreen = createStackNavigator({
  Edit: { screen: ProfileEditScreen }
}))
