import React from 'reactn'
import { createStackNavigator } from 'react-navigation'
import { View, Text, StyleSheet } from 'react-native'
import {
  FormLabel,
  FormInput,
  FormValidationMessage,
  Button
} from 'react-native-elements'
import { showMessage } from 'react-native-flash-message'

import { logIn, getUserId } from '../shared/auth'

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

export class ProfileEditScreen extends React.PureComponent {
  state = {
    username: '',
    password: '',
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

  showFlash = (message, type = 'danger') => {
    showMessage({ message, type, icon: 'auto' })
  }

  handleLogOut = () => {
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

  handleLogIn = () => {
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
    try {
      const { success } = await logIn(username, password)

      if (success) {
        const { userid, firstname, lastname } = await getUserId()

        this.setState({ loading: false })

        if (userid > 0) {
          this.showFlash(`Successfully signed in as ${username}.`, 'success')

          const bggCredentials = {
            username,
            userid,
            firstname,
            lastname
          }

          this.global.setCredentials(bggCredentials)
        } else {
          this.showFlash(
            'Failed to get user data while logging in, please try again.'
          )
        }
      } else {
        this.showFlash(
          'Username or password was incorrect, please try again.',
          'warning'
        )
      }
    } catch (error) {
      this.showFlash('Unexpected error logging in, please try again.')
      console.warn('LOGIN ERROR', error)
    }

    // this.setState({ loading: false })
  }

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
            id="usernameInput"
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
            id="passwordInput"
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
          onPress={this.global.loggedIn ? this.handleLogOut : this.handleLogIn}
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
