export const { logIn } = require.requireActual('../auth')

export const extractCredentials = responseHeaders => {
  let cookie = responseHeaders.headers.get('set-cookie')

  if (cookie !== null) {
    let userCookie = cookie.match(/(bggusername=[^;]*)/gm)[0]
    let pwdCookie = cookie.match(/(bggpassword=[^;]*)/gm)[0]

    return `${userCookie}; ${pwdCookie}`
  }
}

export const getUserId = async () => ({
  userid: 1979,
  firstname: 'Fake',
  lastname: 'User'
})
