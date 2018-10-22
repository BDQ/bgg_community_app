import React, { Component } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { Avatar } from 'react-native-elements'
import { Font } from 'expo'

export default class PreviewListCompany extends React.PureComponent {
  _renderLocation = () => {
    const { location } = this.props

    if (location) {
      return (
        <Text style={styles.location}>Location: {location}</Text>
      )
    }
  }
  render() {
    return (
      <View style={styles.itemContainer}>
        <Avatar
          medium
          rounded
          source={{ uri: this.props.thumbnail }}
          activeOpacity={0.7}
        />
        <View style={styles.gameDetails}>
          <Text numberOfLines={1} style={styles.gameName}>
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
    height: 56,
    padding: 2,
    paddingLeft:10,
    borderBottomWidth: 1,
    borderColor: '#132d3d',
    flexDirection: 'row',
    backgroundColor: '#292e62'
  },
  gameDetails: {
    paddingLeft: 10,
    flex: 1,
    flexDirection: 'column',
  },
  gameName: {
    fontFamily: 'lato-bold',
    fontSize: 20,
    color: '#ffffff'
  },
  location: {
    fontFamily: 'lato-bold',
    color: '#eeeeee'
  },
  text: {
    color: '#132d3d'
  }
})
