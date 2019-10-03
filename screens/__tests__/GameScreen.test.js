import React from 'reactn'

import { shallow } from 'enzyme'
import waitUntil from 'async-wait-until'

import GameScreen from '../GameScreen'

it('renders without crashing', async () => {
  const wrap = shallow(
    <GameScreen
      navigation={{
        navigate: () => {},
        state: {
          params: { game: { name: 'Heroes of Terrinoth', objectId: '254591' } }
        }
      }}
    />
  )

  await waitUntil(() => wrap.state('details') !== null)

  // console.log(wrap.debug())
  wrap.update()

  expect(
    wrap
      .find('#headerText')
      .render()
      .text()
  ).toEqual('Heroes of Terrinoth (2018)')
})
