import React from 'react'
import PropTypes from 'prop-types'

import { StyleSheet, View, Text } from 'react-native'

const propTypes = {
  amount: PropTypes.string.isRequired,
  fontSize: PropTypes.number
}

const defaultProps = {
  fontSize: 13
}

class PreviewMapMarker extends React.Component {
  render() {
    const { fontSize, amount } = this.props
    return (
      <View style={styles.container}>
        <View style={styles.bubble}>
          <Text style={[styles.amount, { fontSize }]}>{amount}</Text>
        </View>
        <View style={styles.arrowBorder} />
        <View style={styles.arrow} />
      </View>
    )
  }
}

PreviewMapMarker.propTypes = propTypes
PreviewMapMarker.defaultProps = defaultProps

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignSelf: 'flex-start'
  },
  bubble: {
    flex: 0,
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: '#FF5A5F',
    padding: 2,
    borderRadius: 3,
    borderColor: '#D23F44',
    borderWidth: 0.5
  },
  amount: {
    color: '#FFFFFF',
    fontSize: 13
  },
  arrow: {
    backgroundColor: 'transparent',
    borderWidth: 4,
    borderColor: 'transparent',
    borderTopColor: '#FF5A5F',
    alignSelf: 'center',
    marginTop: -9
  },
  arrowBorder: {
    backgroundColor: 'transparent',
    borderWidth: 4,
    borderColor: 'transparent',
    borderTopColor: '#D23F44',
    alignSelf: 'center',
    marginTop: -0.5
  }
})

export default PreviewMapMarker
