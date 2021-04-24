import { fetchRaw, fetchJSON } from './HTTP'

const requestHeaders = new Headers({
  Accept: 'application/json',
  'Content-Type': 'application/json;charset=UTF-8'
})

export const logIn = async (username, password) => {
  console.log("logging in with username", username)
  const init = {
    method: 'POST',
    body: JSON.stringify({
      credentials: { username, password }
    }),
    credentials: 'include',
    requestHeaders
  }

  // can't fetchJSON here as we want the full http response
  // so we can inspect the cookies... like a monster ;)
  const { status, headers } = await fetchRaw('/login/api/v1', init)

  console.log("login headers", headers)

  /// getting cookie
  global.cookie = null

  let cookieOriginal = headers.get("set-cookie")
  let cookie = cookieOriginal.split(" ")
  console.log("cookie ", cookie)
  let cookieFinal = ""
  for (var cookieParamInd in cookie) {
    if (cookie[cookieParamInd].startsWith("bggusername") || cookie[cookieParamInd].startsWith("bggpassword") || cookie[cookieParamInd].startsWith("SessionID")) {
      cookieFinal += cookie[cookieParamInd] + " "
    }
  }
  console.log("final cookie", cookieFinal)
  global.cookie = cookieFinal
  //////


  if (status === 200 || status === 202) {
    return { success: true, headers }
  } else {
    return { success: false, headers: null }
  }
}

export const getUserId = async () =>
  fetchJSON('/api/users/current', requestHeaders)
