import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { CheckBox, Button } from 'react-native-elements'
import { showMessage } from 'react-native-flash-message'
import { Dropdown } from 'react-native-material-dropdown'
import PropTypes from 'prop-types'

import { fetchJSON } from '../shared/HTTP'

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#ffffff'
  },

  headerButton: {
    backgroundColor: '#03A9F4'
  },

  gameName: {
    fontFamily: 'lato-bold',
    fontSize: 16,
    paddingLeft: 10,
    paddingTop: 10,
    paddingBottom: 5
  },

  checkboxContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 0,
    paddingLeft: 15,
    paddingBottom: 0,
    paddingTop: 0
  },

  wishlistDropDownWrapper: {
    paddingLeft: 55,
    paddingRight: 20
  }
})

export default class GameAddTo extends React.Component {
  state = {
    collectionStatus: {},
    wishlistPriority: 3
  }

  collectionStates = [
    ['Owned', 'own'],
    ['Prevously Owned', 'prevowned'],
    ['For Trade', 'fortrade'],
    ['Want to Play', 'wanttoplay'],
    ['Want to Buy', 'wanttobuy'],
    ['Pre-ordered', 'preordered'],
    ['Wishlist', 'wishlist']
  ]

  wishlistValues = [
    { label: 'Must have', value: 1 },
    { label: 'Love to have', value: 2 },
    { label: 'Like to have', value: 3 },
    { label: 'Thinking about it', value: 4 },
    { label: "Don't buy this", value: 5 }
  ]

  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Add To',
      headerRight: (
        <Button
          small
          onPress={navigation.getParam('handleSave')}
          title="Save"
          buttonStyle={styles.headerButton}
        />
      )
    }
  }

  static getDerivedStateFromProps(props, state) {
    const { collectionStatus, wishlistPriority } = props.navigation.state.params

    if (collectionStatus !== state.collectionStatus) {
      return { collectionStatus, wishlistPriority }
    }

    // Return null to indicate no change to state.
    return null
  }

  componentDidMount() {
    this.props.navigation.setParams({ handleSave: this.save })
  }

  toggle = attr => {
    let { collectionStatus } = this.state
    let currentState = collectionStatus[attr]
    collectionStatus[attr] = !currentState

    this.setState({ collectionStatus })
  }

  save = async () => {
    const { navigation } = this.props
    const { collectionId, objectId } = navigation.state.params
    const { collectionStatus, wishlistPriority } = this.state

    const body = {
      item: {
        collid: collectionId || 0,
        status: collectionStatus,
        objectid: objectId.toString(),
        objectname: this.props.navigation.state.params.name,
        objecttype: 'thing',
        acquisitiondate: null,
        invdate: null,
        wishlistpriority: wishlistPriority
      }
    }

    let response, success
    if (collectionId) {
      const url = `/api/collectionitems/${collectionId}`
      response = await fetchJSON(url, { method: 'PUT', body })

      success = response.message === 'Item updated'
    } else {
      const url = '/api/collectionitems'
      response = await fetchJSON(url, { method: 'POST', body })
      success = response.message === 'Item saved'
    }

    if (success) {
      navigation.goBack(null)
    } else {
      showMessage({
        message: "Failed to save item's collection status, please try again.",
        icon: 'auto',
        type: 'danger'
      })
    }
  }

  _renderWishlistDropdown = wishedFor => {
    const { wishlistPriority } = this.state

    return wishedFor ? (
      <View style={styles.wishlistDropDownWrapper}>
        <Dropdown
          dropdownOffset={{ top: 8, left: 0 }}
          itemCount={6}
          data={this.wishlistValues}
          value={wishlistPriority}
          onChangeText={wishlistPriority => this.setState({ wishlistPriority })}
        />
      </View>
    ) : null
  }

  render = () => {
    const { collectionStatus } = this.state

    const name = this.props.navigation.state.params.name

    let statusCheckBoxes = this.collectionStates.map((status, i) => (
      <CheckBox
        containerStyle={styles.checkboxContainer}
        title={status[0]}
        key={i}
        checked={collectionStatus[status[1]]}
        onPress={() => {
          this.toggle(status[1])
        }}
      />
    ))

    return (
      <View style={styles.main}>
        <Text style={styles.gameName}>{name}</Text>

        {statusCheckBoxes}

        {this._renderWishlistDropdown(collectionStatus.wishlist)}
      </View>
    )
  }
}

GameAddTo.propTypes = {
  name: PropTypes.string.isRequired,
  navigation: PropTypes.shape({
    state: PropTypes.shape({
      params: PropTypes.shape({
        name: PropTypes.string.isRequired,
        objectId: PropTypes.string.isRequired,
        collectionId: PropTypes.string.isRequired,
        collectionStatus: PropTypes.any.isRequired,
        wishlistPriority: PropTypes.number.isRequired
      })
    }),
    navigate: PropTypes.func.isRequired,
    setParams: PropTypes.func.isRequired
  }).isRequired
}
