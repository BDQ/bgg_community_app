import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, Text } from 'react-native'
import { Avatar } from 'react-native-elements'

export default class GameListItem extends React.PureComponent {
  render() {
    return (
      <View style={styles.itemContainer}>
        <Avatar
          size="large"
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

GameListItem.propTypes = {
  thumbnail: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired
}

const styles = StyleSheet.create({
  itemContainer: {
    height: 99,
    padding: 10,
    borderTopWidth: 2,
    borderColor: '#dde4eb',
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
