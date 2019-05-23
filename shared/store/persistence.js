import { AsyncStorage } from 'react-native'
import Sentry from 'sentry-expo'

// increment the vX when we need to blow up the old key
// todo: figure out a nice way to kill the old key.
export const ASYNC_KEY = '@BGGApp:v6'

export const getPersisted = async () => {
  try {
    const raw = await AsyncStorage.getItem(ASYNC_KEY)

    return JSON.parse(raw) || {}
  } catch (error) {
    Sentry.captureException(error)
  }
  return {}
}

export const persistGlobal = async state => {
  try {
    const raw = JSON.stringify(state)

    AsyncStorage.setItem(ASYNC_KEY, raw)
  } catch (error) {
    Sentry.captureException(error)
    return false
  }

  return true
}
