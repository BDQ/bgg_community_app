import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View } from 'react-native'
import MapView, { Marker, Overlay, UrlTile, LocalTile } from 'react-native-maps'

import map from '../assets/halls/essen/h1-2.png'

export default class PreviewMap extends React.PureComponent {
  state = {
    x: 1
  }
  render() {
    // const { location } = this.props.navigation.state.params

    return (
      <View style={styles.container}>
        <MapView
          zoomControlEnabled={true}
          style={styles.map}
          initialRegion={{
            latitude: 51.427790453806146,
            latitudeDelta: 0.002539088740931561,
            longitude: 6.994015671123037,
            longitudeDelta: 0.0025975481686373314
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
          // onRegionChange={(a, b, c) => console.log(a, b, c)}
        >
          {/* <Marker
          draggable
          coordinate={{
            latitude: 51.4272,
            longitude: 6.9957
          }}
          onDragEnd={e => console.log(e.nativeEvent.coordinate)}
        /> */}
          <Overlay
            style={{ zIndex: 999 }}
            image={map}
            bounds={[[51.42869, 6.99275], [51.4267, 6.9957]]}
          />
        </MapView>
      </View>
    )
  }
}

PreviewMap.propTypes = {
  navigation: PropTypes.shape({
    state: PropTypes.shape({
      params: PropTypes.shape({
        location: PropTypes.string
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
  },
  overlay: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'rgba(255, 255, 255, 1)'
  }
})
