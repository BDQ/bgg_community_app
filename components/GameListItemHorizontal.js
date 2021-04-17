import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, Text, Image } from 'react-native'
import { Avatar } from 'react-native-elements'

export default class GameListItem extends React.PureComponent {
  render() {
    return (
      <View style={styles.itemContainer}>
        <Image
          source={{ uri: this.props.thumbnail }}
          style={{ width: 100, height: 80, borderRadius: 5 }}
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
    height: 80,
    width: 105,
    flexDirection: 'column',
    backgroundColor: '#ffffff',

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
