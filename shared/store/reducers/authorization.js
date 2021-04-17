import initialState from '../helpers/initialState'
import { persistGlobal } from '../helpers/persistence'

import { AsyncStorage } from 'react-native'

const accountKey = 'account'

export const setCredentials = (state, dispatch, bggCredentials) => {
  const loggedIn = Object.keys(bggCredentials).length > 0

  persistGlobal(accountKey, { loggedIn, bggCredentials })

  return { loggedIn, bggCredentials }
}

export const logOut = async () => {
  await AsyncStorage.clear()
  global.cookie = null
  return initialState
}
