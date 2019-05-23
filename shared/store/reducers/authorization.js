import { persistGlobal } from '../persistence'
import initialState from '../initialState'

export const setCredentials = (state, bggCredentials) => {
  const loggedIn = Object.keys(bggCredentials).length > 0

  persistGlobal({ ...state, loggedIn, bggCredentials })

  return { loggedIn, bggCredentials }
}

export const logOut = () => {
  persistGlobal(initialState)
  return initialState
}
