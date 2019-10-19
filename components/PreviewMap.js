import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View } from 'react-native'
import MapView, { Marker, Callout, UrlTile } from 'react-native-maps'

import { points } from '../shared/points'
import PreviewMapCallout from './PreviewMapCallout'
import PreviewMapMarker from './PreviewMapMarker'

export default class PreviewMap extends React.PureComponent {
  state = {
    clickCoord: undefined
  }

  findLocation(locationParsed) {
    if (points.hasOwnProperty(locationParsed)) {
      return points[locationParsed]
    }
  }

  renderSingleMarker(company) {
    const { locationParsed, name, games } = company
    const coordinate = this.findLocation(locationParsed)

    if (coordinate) {
      return (
        <Marker
          key={`${company.name}-${locationParsed}-${Math.random()}`}
          coordinate={coordinate}
        >
          <PreviewMapMarker amount={`${locationParsed} (${games.length})`} />
          <Callout style={{ width: 130 }}>
            <PreviewMapCallout
              location={locationParsed}
              name={name}
              games={games}
            />
          </Callout>
        </Marker>
      )
    }
  }

  renderMarkers() {
    const { companies } = this.props.navigation.state.params

    return companies.map(company => this.renderSingleMarker(company))
  }

  render() {
    const staringCoordinate = {
      latitude: 51.427790453806146,
      longitude: 6.994015671123037
    }

    let { clickCoord = staringCoordinate } = this.state

    return (
      <View style={styles.container}>
        <MapView
          // provider="google"
          style={styles.map}
          showsPointsOfInterest={false}
          showsUserLocation={true}
          // cacheEnabled={true}
          region={{
            ...clickCoord,
            latitudeDelta: 0.0005,
            longitudeDelta: 0.0005
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
          maxZoomLevel={22}
          onPress={evt => {
            console.log(evt.nativeEvent)
            this.setState({ clickCoord: evt.nativeEvent.coordinate })
            console.log('--------------------------')
          }}
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
          <Marker
            draggable
            coordinate={clickCoord}
            onDragEnd={e => console.log(e.nativeEvent.coordinate)}
          >
            <PreviewMapMarker amount="x" />
          </Marker>
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
