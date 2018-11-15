import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

// import 'react-native-mock-render/mock'

import 'isomorphic-fetch'

Enzyme.configure({ adapter: new Adapter() })

// react doesn't like some of the props that are set on native components (that eventually are set on DOM nodes, so suppress those warnings
const suppressedErrors = /(React does not recognize the.*prop on a DOM element|Use PascalCase for React components|Unknown event handler property|is using uppercase HTML|Received `true` for a non-boolean attribute `accessible`|The tag.*is unrecognized in this browser)/
// eslint-disable-next-line no-console
const realConsoleError = console.error
// eslint-disable-next-line no-console
console.error = message => {
  if (message.match(suppressedErrors)) {
    return
  }
  realConsoleError(message)
}
