import { AsyncStorage } from 'react-native'
import { logger } from '../../../shared/debug'

export const loadPersistedData = async key => {
  let persistedData
  const itemKey = `@BGGApp:${key}`

  try {
    persistedData = JSON.parse(await AsyncStorage.getItem(itemKey)) || {}
  } catch (e) {
    logger('Data in AsyncStorage at key is invalid:', itemKey)
    logger(e)
  }

  return persistedData
}
