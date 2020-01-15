import { AsyncStorage } from 'react-native'
import Sentry from 'sentry-expo'
import { logger } from '../../debug'

// increment the vX when we need to blow up the old key
// log out kills old keys
export const ASYNC_KEY = '@BGGApp:v12'

export const getPersisted = async path => {
  try {
    logger(`Loading: ${ASYNC_KEY}:${path}`)
    const raw = await AsyncStorage.getItem(`${ASYNC_KEY}:${path}`)

    return JSON.parse(raw) || {}
  } catch (error) {
    Sentry.captureException(error)
  }
  return {}
}

export const persistGlobal = async (path, state) => {
  try {
    logger(`Persisting: ${ASYNC_KEY}:${path}`, Object.keys(state))
    const raw = JSON.stringify(state)

    AsyncStorage.setItem(`${ASYNC_KEY}:${path}`, raw)
  } catch (error) {
    Sentry.captureException(error)
    return false
  }

  return true
}
