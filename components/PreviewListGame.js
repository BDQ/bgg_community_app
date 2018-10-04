import React from 'react'
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native'
import { Avatar, Badge } from 'react-native-elements'
import Swipeout from 'react-native-swipeout'

import { priorities } from '../shared/data'
import { fetchJSONAsUser } from '../shared/HTTP'

export default class PreviewListGame extends React.PureComponent {
  state = {
    priority: (this.props.userSelection || {}).priority
  }

  _renderPriority = () => {
    const { priority } = this.state

    const { name, color } = priorities.find(p => p.id === priority) || {}

    return color ? (
      <Badge
        value={name}
        textStyle={{ color: '#ffffff', fontSize: 10 }}
        containerStyle={{ backgroundColor: color }}
      />
    ) : null
  }

  _renderPrice = () => {
    return this.props.price !== 0 ? (
      <View style={styles.minor}>
        <Text style={styles.minorLabel}>MSRP</Text>
        <Text style={styles.minorValue}>
          {this.props.priceCurrency} {this.props.price}
        </Text>
      </View>
    ) : (
      <View style={styles.minor} />
    )
  }

  handleSwipePriority = async priority => {
    const url = 'https://bgg.cc/api/geekpreviewitems/userinfo'
    const { itemId } = this.props

    this.setState({ priority })

    const body = {
      data: {
        priority,
        itemid: itemId
      }
    }
    console.log(body)
    let x = await fetchJSONAsUser(url, { method: 'POST', body })
    console.log(x)
  }

  render() {
    const { navigate } = this.props.navigation
    const { priority } = this.state

    var swipeoutBtns = priorities
      .filter(p => ![-1, priority].includes(p.id))
      .map(({ id, color, name }) => ({
        text: name,
        backgroundColor: color,
        onPress: () => this.handleSwipePriority(id)
      }))

    return (
      <Swipeout right={swipeoutBtns} autoClose={true}>
        <TouchableOpacity
          onPress={() => {
            navigate('Game', { game: this.props.game })
          }}
        >
          <View
            style={styles.itemContainer}
            // onLayout={event => {
            //   var { x, y, width, height } = event.nativeEvent.layout
            //   console.log({ x, y, width, height})
            // }}
          >
            <Avatar
              large
              source={{ uri: this.props.thumbnail }}
              activeOpacity={0.7}
            />
            <View style={styles.gameDetails}>
              <Text numberOfLines={1} style={styles.gameName}>
                {this.props.name}
              </Text>
              <Text style={{ fontFamily: 'lato-bold' }}>
                {this.props.versionName}
              </Text>
              <View style={{ flexDirection: 'row' }}>
                <View style={styles.minor}>
                  <Text style={styles.minorLabel}>Availability</Text>
                  <Text style={styles.minorValue}>{this.props.status}</Text>
                </View>
                {this._renderPrice()}
                <View style={[styles.minor, styles.priority]}>
                  <Text style={styles.minorValue}>
                    {this._renderPriority()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeout>
    )
  }
}

const styles = StyleSheet.create({
  itemContainer: {
    height: 100,
    padding: 10,
    borderBottomWidth: 1,
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
  minor: {
    flex: 1,
    flexDirection: 'column'
  },
  minorLabel: {
    marginTop: 5,
    color: '#646465',
    fontSize: 12
  },
  minorValue: {
    fontSize: 14
  },
  priority: {
    paddingTop: 5
  }
})
