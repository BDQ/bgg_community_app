import { setGlobal, addReducer } from 'reactn'

import initialState from './initialState'
import { getPersisted } from './persistence'

import {
  fetchCollection,
  addOrUpdateGameInCollection,
  removeGameFromCollection
} from './reducers/collection'
import { setCredentials, logOut } from './reducers/authorization'

const reducers = [
  fetchCollection,
  addOrUpdateGameInCollection,
  removeGameFromCollection,
  setCredentials,
  logOut
]

let reducersLoaded = false

export const setupStore = async () => {
  // now we load the data from Async store
  let persistedData = await getPersisted()

  // update global store with stuff from async and initial
  await setGlobal({
    ...initialState,
    ...persistedData
  })

  // wire up all the imported reducers
  if (!reducersLoaded) {
    reducers.forEach(func => {
      addReducer(func.name, func)
    })

    reducersLoaded = true
  }
}
