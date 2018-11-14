import React from 'reactn'
import waitUntil from 'async-wait-until'
import { ProfileEditScreen } from '../ProfileScreen'
import * as flash from 'react-native-flash-message'
import { setupStore } from '../../shared/store'

import { TEST_BGG_PWD, TEST_BGG_USR } from 'react-native-dotenv'
import { shallow } from 'enzyme'

jest.mock('../../shared/auth')

describe('ProfileEditScreen', () => {
  beforeEach(setupStore)

  it('logs in successfully with credentials are valid', async () => {
    const wrap = shallow(<ProfileEditScreen />)
    const flashMock = jest.spyOn(wrap.instance(), 'showFlash')

    wrap.find('FormInput#usernameInput').simulate('changeText', TEST_BGG_USR)
    wrap.find('FormInput#passwordInput').simulate('changeText', TEST_BGG_PWD)

    await wrap.find('Button').simulate('press')
    await waitUntil(() => wrap.state('loading') === false)

    const { bggCredentials } = wrap.instance().global
    expect(bggCredentials.username).toEqual(TEST_BGG_USR)
    expect(bggCredentials.userid).toEqual(1979)
    expect(flashMock).toBeCalledWith(
      `Successfully signed in as ${TEST_BGG_USR}.`,
      'success'
    )
  })

  it('displays error messge when login fails', async () => {
    const wrap = shallow(<ProfileEditScreen />)
    const flashMock = jest.spyOn(wrap.instance(), 'showFlash')

    wrap.find('FormInput#usernameInput').simulate('changeText', 'someBadUser')
    wrap.find('FormInput#passwordInput').simulate('changeText', 'password')

    await wrap.find('Button').simulate('press')
    await waitUntil(() => wrap.state('loading') === false)

    expect(flashMock).toBeCalledWith(
      'Username or password was incorrect, please try again.',
      'warning'
    )
  })
})
