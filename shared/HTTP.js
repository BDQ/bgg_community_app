import Sentry from 'sentry-expo'

const baseURL = 'https://bgg.cc'

export const fetchRaw = async (path, args = {}, headers = {}) => {
  headers = new Headers(
    Object.assign(
      {
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=UTF-8'
      },
      headers
    )
  )
  const url = path.startsWith('http') ? path : `${baseURL}${path}`
  return fetch(url, { credentials: 'include', ...args, headers })
}

export const fetchJSON = async (path, args = {}, headers = {}) => {
  try {
    const { body } = args
    body ? (args.body = JSON.stringify(body)) : null

    let response = await fetchRaw(path, args, headers)

    // console.log(response)
    if (response.status == 200) {
      return response.json()
    } else {
      console.log(
        `Got status code: ${response.status} instead when fetching: ${path}`
      )
      Sentry.captureMessage('Non 200 Response for HTTP request.', {
        extra: { url: path, stauts: response.status }
      })
    }
  } catch (error) {
    console.log(`Error fetching: ${path}`)
    Sentry.captureException(error)
  }
}
