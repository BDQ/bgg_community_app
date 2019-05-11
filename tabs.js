import React from 'reactn'

import Ionicons from 'react-native-vector-icons/Ionicons'
import OwnedScreen from './screens/OwnedScreen'
import WishlistScreen from './screens/WishlistScreen'
import PreviewScreen from './screens/PreviewScreen'
import ProfileScreen from './screens/ProfileScreen'
import VisualSearchScreen from './screens/VisualSearchScreen'
import SubscriptionsWebScreen from './screens/SubcriptionsScreen/Web'

export const Owned = {
  screen: OwnedScreen,
  navigationOptions: {
    tabBarLabel: 'Collection',
    tabBarIcon: ({ tintColor }) => (
      <Ionicons name="ios-albums" size={26} style={{ color: tintColor }} />
    )
  }
}

export const Wishlist = {
  screen: WishlistScreen,
  navigationOptions: {
    tabBarLabel: 'Wishlist',
    tabBarIcon: ({ tintColor }) => (
      <Ionicons name="ios-list-box" size={26} style={{ color: tintColor }} />
    )
  }
}

export const Scan = {
  screen: VisualSearchScreen,
  navigationOptions: {
    tabBarLabel: 'Scan',
    tabBarIcon: ({ tintColor }) => (
      <Ionicons name="ios-qr-scanner" size={26} style={{ color: tintColor }} />
    )
  }
}

export const Preview = {
  screen: PreviewScreen,
  navigationOptions: {
    tabBarLabel: 'Origins 2019',
    tabBarIcon: ({ tintColor }) => (
      <Ionicons name="ios-eye" size={26} style={{ color: tintColor }} />
    )
  }
}

export const Profile = {
  screen: ProfileScreen,
  navigationOptions: {
    tabBarLabel: 'Account',
    tabBarIcon: ({ tintColor }) => (
      <Ionicons name="ios-person" size={26} style={{ color: tintColor }} />
    )
  }
}

export const Subscriptions = {
  screen: SubscriptionsWebScreen,
  navigationOptions: {
    tabBarLabel: 'Subs',
    tabBarIcon: ({ tintColor }) => (
      <Ionicons name="ios-microphone" size={26} style={{ color: tintColor }} />
    )
  }
}
