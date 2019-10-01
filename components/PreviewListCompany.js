import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, Text } from 'react-native'
// import { logger } from '../shared/debug'
import { Avatar, Icon } from 'react-native-elements'

export default class PreviewListCompany extends React.PureComponent {
  _renderMapButton = () => {
    const { location } = this.props
    const { navigate } = this.props.navigation

    if (location) {
      return (
        <Icon
          name="map"
          iconStyle={{ marginRight: 10, marginTop: 10 }}
          type="entypo"
          onPress={() =>
            navigate('Map', { location, company: this.props.name })
          }
        />
      )
    }
  }
  _renderLocation = () => {
    const { location } = this.props

    if (location) {
      return <Text style={styles.location}>Location: {location}</Text>
    }
  }

  render() {
    return (
      <View
        style={styles.itemContainer}
        // onLayout={event => {
        //   var { x, y, width, height } = event.nativeEvent.layout
        //   logger({ x, y, width, height })
        // }}
      >
        <Avatar
          size="medium"
          source={{ uri: this.props.thumbnail }}
          activeOpacity={0.7}
        />
        <View style={styles.companyDetails}>
          <Text numberOfLines={1} style={styles.companyName}>
            {this.props.name}
          </Text>
          {this._renderLocation()}
        </View>
        {this._renderMapButton()}
      </View>
    )
  }
}

PreviewListCompany.propTypes = {
  thumbnail: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired
  }).isRequired
}

const styles = StyleSheet.create({
  itemContainer: {
    height: 58,
    padding: 3,
    paddingLeft: 10,
    borderBottomWidth: 2,
    borderColor: '#e8ad4b',
    flexDirection: 'row',
    backgroundColor: '#f3f3f4'
  },
  companyDetails: {
    paddingLeft: 10,
    flex: 1,
    flexDirection: 'column'
  },
  companyName: {
    fontFamily: 'lato-bold',
    fontSize: 20,
    color: '#292e62'
  },
  location: {
    fontFamily: 'lato-bold',
    color: '#161616'
  },
  text: {
    color: '#132d3d'
  }
})
