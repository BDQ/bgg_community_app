import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, Text, View } from 'react-native'
import { priorities } from '../shared/data'

export default class PreviewMapCallout extends React.PureComponent {
  renderCompanies() {
    const { companies = [] } = this.props
    let lineCount = 0

    return companies.map(company => {
      console.log(company)
      const lines = (
        <React.Fragment key={company.key}>
          <Text
            style={styles.companyName}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {company.name}
          </Text>
          {this.renderGames(company.games, lineCount)}
        </React.Fragment>
      )

      lineCount += company.games.length
      return lines
    })
  }

  renderGames(games, lineCount) {
    const fallbackPriority = { priority: -1 }
    games = games.sort(
      (a, b) =>
        (b.userSelection || fallbackPriority).priority <
        (a.userSelection || fallbackPriority).priority
    )
    return games.map((game, i) => {
      lineCount++

      if (lineCount > 5 && i !== 0) return

      if (lineCount < 5) {
        const { color } = priorities.find(
          p => p.id === (game.userSelection || fallbackPriority).priority
        ) || { color: 'black' }
        return (
          <Text
            key={`line-${lineCount}`}
            style={{ color }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            - {game.name}
          </Text>
        )
      } else {
        return (
          <Text key={`line-${lineCount}`} style={{ color: '#666666' }}>
            - & {games.length - i} more
          </Text>
        )
      }
    })
  }

  render() {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.locationName}>{this.props.location}</Text>
        <View>{this.renderCompanies()}</View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 4,
    maxHeight: '50%'
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingBottom: 4,
    borderBottomColor: 'black',
    borderBottomWidth: 1
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold'
  }
})

PreviewMapCallout.propTypes = {
  companies: PropTypes.any,
  count: PropTypes.number.isRequired,
  location: PropTypes.string.isRequired
}
