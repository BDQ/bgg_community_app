import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View } from 'react-native'
import MapView, { Marker, Callout, UrlTile } from 'react-native-maps'

import { points } from '../assets/halls/essen/points'
import PreviewMapCallout from './PreviewMapCallout'
import PreviewMapMarker from './PreviewMapMarker'

export default class PreviewMap extends React.PureComponent {
  state = {
    coordinate: this.findLocation()
  }

  findLocation() {
    let { location } = this.props.navigation.state.params
    location = location.replace(/[^a-zA-Z0-9]/, '')
    if (points.hasOwnProperty(location)) {
      return points[location]
    }
  }

  renderMarker() {
    const { location, company, games } = this.props.navigation.state.params
    const { coordinate } = this.state

    if (coordinate) {
      return (
        <Marker
          draggable
          coordinate={coordinate}
          onDragEnd={e => console.log(e.nativeEvent.coordinate)}
        >
          <PreviewMapMarker amount={`${location} (${games.length})`} />
          <Callout style={{ width: 130 }}>
            <PreviewMapCallout
              location={location}
              company={company}
              games={games}
            />
          </Callout>
        </Marker>
      )
    }
  }

  render() {
    const {
      coordinate = {
        latitude: 51.427790453806146,
        longitude: 6.994015671123037
      }
    } = this.state

    return (
      <View style={styles.container}>
        <MapView
          // provider="google"
          style={styles.map}
          showsPointsOfInterest={false}
          showsUserLocation={true}
          // cacheEnabled={true}
          region={{
            ...coordinate,

            latitudeDelta: 0.0015,

            longitudeDelta: 0.0015
          }}
          // camera={{
          //   center: {
          //     latitude: 51.42779045380615,
          //     longitude: 6.994015671123038
          //   },
          //   pitch: 0,
          //   heading: -6,
          //   altitude: 500,
          //   zoom: 16
          // }}
          // minZoomLevel={16}
          maxZoomLevel={18}
        >
          <UrlTile
            urlTemplate={
              'http://bggca.s3-website-us-east-1.amazonaws.com/essen/{z}/{x}/{y}.png'
            }
            minimumZ={16}
            maximumZ={20}
            zIndex={-1}
            shouldReplaceMapContent={true}
          />
          {this.renderMarker()}
        </MapView>
      </View>
    )
  }
}

PreviewMap.propTypes = {
  navigation: PropTypes.shape({
    state: PropTypes.shape({
      params: PropTypes.shape({
        location: PropTypes.string,
        company: PropTypes.string.isRequired,
        games: PropTypes.any
      })
    })
  }).isRequired
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'
  },
  map: {
    ...StyleSheet.absoluteFillObject
  }
})
