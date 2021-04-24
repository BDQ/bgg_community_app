import React from 'reactn'
import PropTypes from 'prop-types'
import { createStackNavigator } from 'react-navigation-stack'
//import ProgressBar from 'react-native-progress/Circle'
import { Icon } from 'react-native-elements'

import { View, WebView } from 'react-native'

class SubscriptionsWebScreen extends React.Component {
  state = {
    next: 0,
    uri: 'https://bgg.cc/subscriptions/next'
  }

  static navigationOptions = ({ navigation }) => ({
    title: 'Subscriptions',
    headerRight: (
      <Icon
        name="md-skip-forward"
        iconStyle={{ marginRight: 10 }}
        type="ionicon"
        onPress={navigation.getParam('next')}
      />
    )
  })

  componentDidMount() {
    this.props.navigation.setParams({
      next: this.next,
      reload: this.reload
    })
  }

  reload = () => this.browser.reload()

  next = () => this.setState({ next: this.state.next + 1 })

  renderLoadingView = () => {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >

      </View>
    )
  }

  render = () => {
    return (
      <WebView
        style={{ flex: 1 }}
        ref={tag => {
          this.browser = tag
        }}
        source={{ uri: `${this.state.uri}?fakeCount=${this.state.next}` }}
        renderLoading={this.renderLoadingView}
        startInLoadingState={true}
      />
    )
  }
}

SubscriptionsWebScreen.propTypes = {
  navigation: PropTypes.shape({
    state: PropTypes.shape({
      params: PropTypes.shape({
        reload: PropTypes.func,
        next: PropTypes.func
      })
    }),
    navigate: PropTypes.func.isRequired,
    setParams: PropTypes.func.isRequired
  }).isRequired
}

export default createStackNavigator({
  List: { screen: SubscriptionsWebScreen }
})
