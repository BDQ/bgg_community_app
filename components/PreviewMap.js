import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, PermissionsAndroid } from 'react-native'
import MapView, { Marker, Callout, UrlTile } from 'react-native-maps'

import { points } from '../shared/points'
import PreviewMapCallout from './PreviewMapCallout'
import PreviewMapMarker from './PreviewMapMarker'

const averageGeolocation = coords => {
  if (coords.length === 1) {
    return coords[0]
  }

  let x = 0.0
  let y = 0.0
  let z = 0.0

  for (let coord of coords) {
    let latitude = (coord.latitude * Math.PI) / 180
    let longitude = (coord.longitude * Math.PI) / 180

    x += Math.cos(latitude) * Math.cos(longitude)
    y += Math.cos(latitude) * Math.sin(longitude)
    z += Math.sin(latitude)
  }

  let total = coords.length

  x = x / total
  y = y / total
  z = z / total

  let centralLongitude = Math.atan2(y, x)
  let centralSquareRoot = Math.sqrt(x * x + y * y)
  let centralLatitude = Math.atan2(z, centralSquareRoot)

  return {
    latitude: (centralLatitude * 180) / Math.PI,
    longitude: (centralLongitude * 180) / Math.PI
  }
}

export default class PreviewMap extends React.PureComponent {
  state = {
    startingCoordinate: {
      latitude: 51.427790453806146,
      longitude: 6.994015671123037
    },
    locations: undefined,
    locationCounts: {},
    locationCoords: {}
  }

  static getDerivedStateFromProps(props, state) {
    if (!state.locations) {
      const { companies } = props.route.params

      const locations = {}
      const locationCounts = {}
      const locationCoords = {}

      companies.forEach(company => {
        const { locationParsed } = company
        if (!locationParsed) return

        // setup empties
        if (locations[locationParsed] === undefined) {
          // empty  company arry
          locations[locationParsed] = []

          // get all the lat/longs as just two numbers so we can easily
          // calculate the middle of them for the starting point
          const locationCoord = PreviewMap.findCoordinates(locationParsed)
          if (locationCoord) locationCoords[locationParsed] = locationCoord

          // starting count of items at a location
          locationCounts[locationParsed] = 0
        }

        locationCounts[locationParsed] += company.games.length

        locations[locationParsed].push(company)
      })

      // get default /fallback starting coord from state
      let { startingCoordinate } = state

      // only set starting Coord if we have locations to average out
      if (Object.values(locationCoords).length > 0) {
        startingCoordinate = averageGeolocation(Object.values(locationCoords))
      }

      return {
        locations,
        locationCounts,
        locationCoords,
        startingCoordinate
      }
    } else {
      return null
    }
  }

  static findCoordinates(locationParsed) {
    if (points.hasOwnProperty(locationParsed)) {
      return points[locationParsed]
    }
  }

  renderSingleMarker(location, companies) {
    const coordinate = this.state.locationCoords[location]

    if (coordinate) {
      const count = this.state.locationCounts[location]
      return (
        <Marker key={location} coordinate={coordinate}>
          <PreviewMapMarker amount={`${location} (${count})`} />
          <Callout style={{ width: 130 }}>
            <PreviewMapCallout
              location={location}
              count={count}
              companies={companies}
            />
          </Callout>
        </Marker>
      )
    }
  }

  renderMarkers() {
    const { locations } = this.state

    return Object.keys(locations).map(location => {
      return this.renderSingleMarker(location, locations[location])
    })
  }

  render() {
    const { startingCoordinate } = this.state

    return (
      <View style={styles.container}>
        <MapView
          // provider="google"
          style={styles.map}
          showsPointsOfInterest={false}
          showsUserLocation={true}
          showsMyLocationButton={true}
          // cacheEnabled={true}
          region={{
            ...startingCoordinate,
            latitudeDelta: 0.001,
            longitudeDelta: 0.001
          }}
          // minZoomLevel={16}
          maxZoomLevel={20}
        // click on map to dump location
        // onPress={evt => {
        //   console.log(evt.nativeEvent)
        //   this.setState({ startingCoordinate: evt.nativeEvent.coordinate })
        // }}
        >
          <UrlTile
            urlTemplate={
              'http://bggca.s3-website-us-east-1.amazonaws.com/essen19/{z}/{x}/{y}.png'
            }
            minimumZ={15}
            maximumZ={22}
            zIndex={-1}
            shouldReplaceMapContent={true}
          />
          {/* <Marker
            draggable
            coordinate={startingCoordinate}
            onDragEnd={e => console.log(e.nativeEvent.coordinate)}
          >
            <PreviewMapMarker amount="x" />
          </Marker> */}
          {this.renderMarkers()}
        </MapView>
      </View>
    )
  }
}

PreviewMap.propTypes = {
  navigation: PropTypes.shape({
    state: PropTypes.shape({
      params: PropTypes.shape({
        companies: PropTypes.arrayOf(
          PropTypes.shape({
            name: PropTypes.string.isRequired,
            locationParsed: PropTypes.string,
            games: PropTypes.array.isRequired
          })
        )
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
