import { persistGlobal } from '../persistence'

import { fetchCollectionFromBGG } from '../../../shared/collection'

export const fetchCollection = async state => {
  const { username } = state.bggCredentials
  const collection = await fetchCollectionFromBGG(username)

  const collectionFetchedAt = new Date().getTime()

  persistGlobal({ ...state, collection, collectionFetchedAt })

  return { collection, collectionFetchedAt }
}

export const addOrUpdateGameInCollection = async (state, _, game) => {
  const { collection } = state

  let idx = collection.findIndex(
    collectionGame =>
      collectionGame.objectId.toString() === game.objectId.toString()
  )

  if (idx > -1) {
    // already exists
    collection[idx] = game
  } else {
    // new game to collection
    collection.push(game)
  }

  persistGlobal({ ...state, collection })

  return { collection }
}

export const removeGameFromCollection = async (state, _, game) => {
  const { collection } = state
  let idx = collection.findIndex(
    collectionGame =>
      collectionGame.objectId.toString() === game.objectId.toString()
  )

  if (idx > -1) {
    // exists
    collection.splice(idx, 1)
  }

  return { collection }
}
