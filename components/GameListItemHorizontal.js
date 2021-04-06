import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, Text } from 'react-native'
import { Avatar } from 'react-native-elements'

export default class GameListItem extends React.PureComponent {
  render() {
    return (
      <View>
        <Avatar
          size="large"
          source={{ uri: this.props.thumbnail }}
          activeOpacity={0.7}
        />
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
    justifyContent: 'center',
    alignItems: 'center',
    height: 99,
    width: 99,
    padding: 8,
    borderTopWidth: 2,
    borderColor: '#dde4eb',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    shadowRadius: 0.5,
    shadowOpacity: 0.2,
    margin: 2
  },
  gameDetails: {
    paddingLeft: 10,
    flex: 1,
    flexDirection: 'column'
  },
  gameName: {
    fontFamily: 'lato-bold',
    fontSize: 12
  },
  text: {
    color: '#132d3d'
  }
})
