import React from 'reactn'
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
  state = {
    username: '',
    username_error: '',
    password: '',
    password_error: '',
    loading: false,
    message: null
  }

  static navigationOptions = () => {
    return {
      title: 'BGG Account'
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

    //tells global store we've logged in
    this.global.logOut()
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

  attemptBGGLogin = async (username, password) => {
    // const { loadAuth } = this.props.screenProps

    const headers = new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json;charset=UTF-8'
    })

    const init = {
      method: 'POST',
      body: JSON.stringify({
        credentials: { username, password }
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
            message: `Successfully signed in as ${username}.`,
            icon: 'auto',
            type: 'success'
          })

          const bggCredentials = {
            username,
            userid,
            firstname,
            lastname
          }

          AsyncStorage.setItem('@BGGApp:auth', JSON.stringify(bggCredentials))

          this.global.setCredentials(bggCredentials)
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

  _renderMessage = () => {
    let msg = 'Configure your BoardGameGeek account to get started.'
    if (this.state.message !== null) {
      msg = this.state.message
    }

    return <Text style={styles.text}>{msg}</Text>
  }

  _renderLoggedOut = () => {
    if (!this.global.loggedIn) {
      return (
        <React.Fragment>
          {this._renderMessage()}

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
        </React.Fragment>
      )
    } else {
      return <Text style={styles.bottomText}>You are logged in!</Text>
    }
  }

  render = () => {
    return (
      <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
        {this._renderLoggedOut()}
        <Button
          raised
          backgroundColor="#03A9F4"
          onPress={this.global.loggedIn ? this.logOut : this.logIn}
          loading={this.state.loading}
          title={this.global.loggedIn ? 'Log Out' : 'Log In'}
        />
      </View>
    )
  }
}

export default createStackNavigator({
  Edit: { screen: ProfileEditScreen }
})
