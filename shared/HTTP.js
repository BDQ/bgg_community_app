import Sentry from 'sentry-expo'
import { AsyncStorage } from 'react-native'

let auth = null
let bgg_user_cookie, bgg_pwd_cookie

export const fetchJSON = async (url, args = {}, headers = {}) => {
  try {
    headers = new Headers(
      Object.assign(
        {
          Accept: 'application/json',
          'Content-Type': 'application/json;charset=UTF-8'
        },
        headers
      )
    )

    const { body } = args
    body ? (args.body = JSON.stringify(body)) : null

    let response = await fetch(url, { ...args, headers })

    if (response.status == 200) {
      return response.json()
    } else {
      Sentry.captureMessage(
        'Non 200 Response from BGG when loading game stats.',
        { extra: { url: url, stauts: response.status } }
      )
    }
  } catch (error) {
    console.warn(error)
    Sentry.captureException(error)
  }
}

export const fetchJSONAsUser = async (url, args = {}) => {
  if (!auth) {
    auth = await AsyncStorage.getItem('@BGGApp:auth')
    ;({ bgg_user_cookie, bgg_pwd_cookie } = JSON.parse(auth))
  }

  return fetchJSON(url, args, {
    cookie: `${bgg_user_cookie}; ${bgg_pwd_cookie}`
  })
}
