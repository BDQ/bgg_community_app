import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, Text } from 'react-native'
import { priorities } from '../shared/data'
// import defaultStyles from '../shared/styles'

export default class PreviewMapCallout extends React.PureComponent {
  renderGames() {
    let { games } = this.props

    const fallbackPriority = { priority: -1 }
    games = games.sort(
      (a, b) =>
        (b.userSelection || fallbackPriority).priority <
        (a.userSelection || fallbackPriority).priority
    )

    return games.map(game => {
      const { color } = priorities.find(
        p => p.id === (game.userSelection || fallbackPriority).priority
      )

      return (
        <Text
          style={{ color }}
          numberOfLines={1}
          ellipsizeMode="tail"
          key={game.objectId}
        >
          - {game.name}
        </Text>
      )
    })
  }

  render() {
    return (
      <View>
        <View style={styles.wrapper}>
          <Text style={styles.label}>{this.props.company}</Text>

          <View>{this.renderGames()}</View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 4
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold'
  }
})

PreviewMapCallout.propTypes = {
  company: PropTypes.string.isRequired,
  games: PropTypes.any,
  location: PropTypes.string.isRequired
}
