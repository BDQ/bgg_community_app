import React, { Component } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { Avatar } from 'react-native-elements'
import { Font } from 'expo'

export default class GameListItem extends React.PureComponent {
  render() {
    return (
      <View style={styles.itemContainer}>
        <Avatar
          large
          source={{ uri: this.props.thumbnail }}
          activeOpacity={0.7}
        />
        <View style={styles.gameDetails}>
          <Text numberOfLines={1} style={styles.gameName}>
            {this.props.name}
          </Text>
          <Text style={{ fontFamily: 'lato-bold' }}>{this.props.subtitle}</Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  itemContainer: {
    height: 100,
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#132d3d',
    flexDirection: 'row',
    backgroundColor: '#ffffff'
  },
  gameDetails: {
    paddingLeft: 10,
    flex: 1,
    flexDirection: 'column'
  },
  gameName: {
    fontFamily: 'lato-bold',
    fontSize: 20
  },
  text: {
    color: '#132d3d'
  }
})
