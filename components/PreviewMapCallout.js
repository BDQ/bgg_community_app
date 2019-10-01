import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, Text } from 'react-native'

// import defaultStyles from '../shared/styles'

export default class PreviewMapCallout extends React.PureComponent {
  render() {
    return (
      <View>
        <View style={styles.wrapper}>
          <Text style={styles.label}>Booth: {this.props.location}</Text>
          <Text>{this.props.company}</Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 2
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold'
  }
})

PreviewMapCallout.propTypes = {
  company: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired
}
