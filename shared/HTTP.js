// import { SENTRY_CONFIG } from 'react-native-dotenv'
// import * as Sentry from 'sentry-expo'
// Sentry.init({
//   dsn: SENTRY_CONFIG,
//   enableInExpoDevelopment: false,
//   debug: true
// })

import { getDispatch } from 'reactn'
import { showMessage } from 'react-native-flash-message'

import { logger } from './debug'

const baseURL = 'https://bgg.cc'

export const fetchRaw = async (path, args = {}, headers = {}) => {
  headers = new Headers(
    Object.assign(
      {
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=UTF-8',
      },
      headers
    )
  )
  const url = path.startsWith('http') ? path : `${baseURL}${path}`
  return fetch(url, { credentials: 'include', ...args, headers })
}

export const asyncFetch = async ({ path, args = {}, headers = {} }) =>
  fetchJSON(path, args, headers)

export const fetchJSON = async (path, args = {}, headers = {}) => {
  try {
    const { body } = args
    body ? (args.body = JSON.stringify(body)) : null

    let response = await fetchRaw(path, args, headers)

    if (response.status == 200) {
      return response.json()
    } else if (response.status == 403) {
      getDispatch().logOut()
      showMessage({
        message: 'Your session has expired, please log in again to continue.',
        type: 'danger',
        icon: 'auto',
        duration: 3000,
      })
    } else {
      logger(
        `Got status code: ${response.status} instead when fetching: ${path}`
      )
      Sentry.captureMessage('Non 200 Response for HTTP request.', {
        extra: { url: path, stauts: response.status },
      })
    }
  } catch (error) {
    console.error(`Error fetching: ${path}`)
    console.error(error)
    // Sentry.captureException(error)
  }
}
