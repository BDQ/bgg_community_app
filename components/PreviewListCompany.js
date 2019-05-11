import React, { Component } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { Avatar } from 'react-native-elements'
import { Font } from 'expo'

export default class PreviewListCompany extends React.PureComponent {
  _renderLocation = () => {
    const { location } = this.props

    if (location) {
      return <Text style={styles.location}>Location: {location}</Text>
    }
  }
  render() {
    return (
      <View style={styles.itemContainer}>
        <Avatar
          medium
          source={{ uri: this.props.thumbnail }}
          activeOpacity={0.7}
        />
        <View style={styles.companyDetails}>
          <Text numberOfLines={1} style={styles.companyName}>
            {this.props.name}
          </Text>
          {this._renderLocation()}
        </View>
      </View>
    )
  }
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
