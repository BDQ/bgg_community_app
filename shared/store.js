import { setGlobal, addReducer } from 'reactn'
import { AsyncStorage } from 'react-native'
import Sentry from 'sentry-expo'

import { fetchCollection } from '../shared/collection'

export const ASYNC_KEY = '@BGGApp:v5'

const getPersisted = async () => {
  try {
    const raw = await AsyncStorage.getItem(ASYNC_KEY)

    return JSON.parse(raw) || {}
  } catch (error) {
    Sentry.captureException(error)
  }
  return {}
}
const persistGlobal = async state => {
  try {
    const raw = JSON.stringify(state)

    AsyncStorage.setItem(ASYNC_KEY, raw)
  } catch (error) {
    Sentry.captureException(error)
    return false
  }

  return true
}

export const setupStore = async () => {
  // initial state, expect nothing will come from async
  const initialState = {
    collection: [],
    collectionFetchedAt: 0,
    loggedIn: false,
    bggCredentials: {}
  }

  // now we load the data from Async store
  let persistedData = await getPersisted()
  console.log(persistedData)

  // update global store with stuff from async and initial
  setGlobal({ ...initialState, ...persistedData })

  // reducers
  addReducer('setCredentials', (state, bggCredentials) => {
    const loggedIn = Object.keys(bggCredentials).length > 0

    persistGlobal({ ...state, loggedIn, bggCredentials })

    return { loggedIn, bggCredentials }
  })

  addReducer('fetchCollection', async state => {
    const { username } = state.bggCredentials
    const collection = await fetchCollection(username)

    const collectionFetchedAt = new Date().getTime()

    persistGlobal({ ...state, collection, collectionFetchedAt })

    return { collection, collectionFetchedAt }
  })

  addReducer('logOut', () => {
    persistGlobal(initialState)
    return initialState
  })
}
