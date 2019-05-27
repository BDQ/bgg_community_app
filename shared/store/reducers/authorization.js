import initialState from '../initialState'
import { persistGlobal } from '../persistence'

export const setCredentials = (state, dispatch, bggCredentials) => {
  const loggedIn = Object.keys(bggCredentials).length > 0

  persistGlobal({ ...state, loggedIn, bggCredentials })

  return { loggedIn, bggCredentials }
}

export const logOut = () => {
  persistGlobal(initialState)
  return initialState
}
