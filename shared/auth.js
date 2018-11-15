import { fetchRaw, fetchJSON } from './HTTP'

const requestHeaders = new Headers({
  Accept: 'application/json',
  'Content-Type': 'application/json;charset=UTF-8'
})

export const logIn = async (username, password) => {
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

  if (status === 200) {
    return { success: true, headers }
  } else {
    return { success: false, headers: null }
  }
}

export const getUserId = async () =>
  fetchJSON('/api/users/current', requestHeaders)
