import { persistGlobal } from '../persistence'

export const fetchCollection = async state => {
  const { username } = state.bggCredentials
  const collection = await fetchCollection(username)

  const collectionFetchedAt = new Date().getTime()

  persistGlobal({ ...state, collection, collectionFetchedAt })

  return { collection, collectionFetchedAt }
}

export const addOrUpdateGameInCollection = async (state, game) => {
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

export const removeGameFromCollection = async (state, game) => {
  const { collection } = state
  let idx = collection.findIndex(
    collectionGame =>
      collectionGame.objectId.toString() === game.objectId.toString()
  )

  if (idx > -1) {
    // already exists
    collection.splice(idx, 1)
  }

  return { collection }
}
