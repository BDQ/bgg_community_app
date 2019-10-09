import { setGlobal, addReducers } from 'reactn'

import initialState from './initialState'
import { getPersisted } from './persistence'

import * as collectionReducers from './reducers/collection'
import { setCredentials, logOut } from './reducers/authorization'

// collection
addReducers(collectionReducers)
// auth
addReducers({ setCredentials, logOut })

export const setupStore = async () => {
  // now we load the data from Async store
  let persistedData = await getPersisted()

  // update global store with stuff from async and initial
  await setGlobal({
    ...initialState,
    ...persistedData
  })
}
