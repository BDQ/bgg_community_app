import { persistGlobal } from '../helpers/persistence'
import { fetchCollectionFromBGG } from '../../../shared/collection'

const collectionKey = 'collection'

export const fetchCollection = async state => {
  const { username } = state.bggCredentials
  const collection = await fetchCollectionFromBGG(username)

  const collectionFetchedAt = new Date().getTime()

  persistGlobal(collectionKey, { collection, collectionFetchedAt })

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

  persistGlobal(collectionKey, { collection })

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

  persistGlobal(collectionKey, { collection })

  return { collection }
}
