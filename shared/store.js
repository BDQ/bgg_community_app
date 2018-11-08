import { setGlobal, addReducer } from 'reactn'
import { AsyncStorage } from 'react-native'
import Sentry from 'sentry-expo'

import { fetchCollection } from '../shared/collection'

export const ASYNC_KEY = '@BGGApp'
const authKey = `${ASYNC_KEY}:auth`
const collectionKey = `${ASYNC_KEY}:collection`

// loads all data from Async Storage
const fetchFromAsync = async () => {
  const items = await AsyncStorage.multiGet([authKey, collectionKey])

  let data = {}

  items.forEach(([key, value]) => {
    switch (key) {
      case authKey:
        data.bggCredentials = JSON.parse(value)
        data.loggedIn = Object.keys(data.bggCredentials).length > 0
        break
      case collectionKey:
        data = { ...data, ...JSON.parse(value) }
    }
  })

  return data
}

const persistCollection = async collection => {
  const collectionUpdatedAt = new Date().getTime()

  try {
    AsyncStorage.setItem(
      collectionKey,
      JSON.stringify({ collection, collectionUpdatedAt })
    )
  } catch (error) {
    Sentry.captureException(error)
  }

  return { collection, collectionUpdatedAt }
}

export const setupStore = async () => {
  // initial state, expect nothing will come from async
  const intialState = {
    collection: [],
    collectionUpdatedAt: 0,
    loggedIn: false,
    bggCredentials: {}
  }

  // now we load the data from Async store
  let persistedData = await fetchFromAsync()

  // update global store with stuff from async and initial
  setGlobal({ ...intialState, ...persistedData })

  // reducers
  addReducer('setCredentials', (state, bggCredentials) => {
    const loggedIn = Object.keys(bggCredentials).length > 0

    try {
      AsyncStorage.setItem(authKey, JSON.stringify(bggCredentials))
    } catch (error) {
      Sentry.captureException(error)
    }

    return { loggedIn, bggCredentials }
  })

  addReducer('fetchCollection', async state => {
    const { username } = state.bggCredentials
    const collection = await fetchCollection(username, true)

    return persistCollection(collection)
  })

  addReducer('updateCollection', (state, collection) => {
    return persistCollection(collection)
  })

  addReducer('logOut', () => {})
}
