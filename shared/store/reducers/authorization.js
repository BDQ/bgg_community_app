import initialState from '../initialState'
import { persistGlobal } from '../persistence'

import { AsyncStorage } from 'react-native'

export const setCredentials = (state, dispatch, bggCredentials) => {
  const loggedIn = Object.keys(bggCredentials).length > 0

  persistGlobal({ ...state, loggedIn, bggCredentials })

  return { loggedIn, bggCredentials }
}

export const logOut = async () => {
  await AsyncStorage.clear()
  persistGlobal(initialState)
  return initialState
}
