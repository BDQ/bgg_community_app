import { setGlobal, addReducer } from 'reactn'

import initialState from './initialState'
import { getPersisted } from './persistence'

import {
  fetchCollection,
  addOrUpdateGameInCollection,
  removeGameFromCollection
} from './reducers/collection'
import { setCredentials, logOut } from './reducers/authorization'

addReducer('fetchCollection', fetchCollection)
addReducer('addOrUpdateGameInCollection', addOrUpdateGameInCollection)
addReducer('removeGameFromCollection', removeGameFromCollection)
addReducer('setCredentials', setCredentials)
addReducer('logOut', logOut)

export const setupStore = async () => {
  // now we load the data from Async store
  let persistedData = await getPersisted()

  // update global store with stuff from async and initial
  await setGlobal({
    ...initialState,
    ...persistedData
  })
}
