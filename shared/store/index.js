import { setGlobal, addReducers } from 'reactn'

import initialState from './helpers/initialState'
import { getPersisted } from './helpers/persistence'

import * as collectionReducers from './reducers/collection'
import * as authReducers from './reducers/authorization'
import * as previewReducers from './reducers/preview'

// collection
addReducers(collectionReducers)
// auth
addReducers(authReducers)
// preview
addReducers(previewReducers)

export const setupStore = async () => {
  // now we load the data from Async store
  const persistedAccount = await getPersisted('account')
  const persistedCollection = await getPersisted('collection')

  // update global store with stuff from async and initial
  await setGlobal({
    ...initialState,
    ...persistedAccount,
    ...persistedCollection
  })
}
