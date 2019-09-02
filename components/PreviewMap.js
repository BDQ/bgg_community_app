import React from 'react'
import PropTypes from 'prop-types'
import { Animated, StyleSheet } from 'react-native'
import {
  PanGestureHandler,
  PinchGestureHandler,
  State
} from 'react-native-gesture-handler'
import { Icon } from 'react-native-elements'

// import styles from '../shared/styles'
import Svg, { Circle, Image } from 'react-native-svg'
const MIN_SCALE = 0.2
const MAX_SCALE = 1.6

export class PinchableBox extends React.Component {
  panRef = React.createRef()
  pinchRef = React.createRef()
  constructor(props) {
    super(props)

    /* Pinching */
    this._baseScale = new Animated.Value(1)
    this._pinchScale = new Animated.Value(1)
    this._scale = Animated.multiply(
      this._baseScale,
      this._pinchScale
    ).interpolate({
      inputRange: [MIN_SCALE, MAX_SCALE],
      outputRange: [MIN_SCALE, MAX_SCALE],
      extrapolate: 'clamp'
    })

    this._lastScale = 1
    this._onPinchGestureEvent = Animated.event(
      [
        {
          nativeEvent: {
            scale: this._pinchScale
          }
        }
      ],
      { useNativeDriver: false }
    )

    /* Pan */
    this._translateX = new Animated.Value(0)
    this._translateY = new Animated.Value(0)
    this._lastOffset = { x: 0, y: 0 }
    this._onPanGestureEvent = Animated.event(
      [
        {
          nativeEvent: {
            translationX: this._translateX,
            translationY: this._translateY
          }
        }
      ],
      { useNativeDriver: true }
    )
  }

  _onPinchHandlerStateChange = event => {
    console.log('pinch event')
    console.log({
      scale: this._scale,
      lastScale: this._lastScale,
      translateX: this._translateX,
      translateY: this._translateY
    })
    if (event.nativeEvent.oldState === State.ACTIVE) {
      this._lastScale *= event.nativeEvent.scale

      if (this._lastScale < MIN_SCALE) this._lastScale = MIN_SCALE
      if (this._lastScale > MAX_SCALE) this._lastScale = MAX_SCALE

      this._baseScale.setValue(this._lastScale)
      this._pinchScale.setValue(1)
    }
  }

  _onPanGestureStateChange = event => {
    console.log('pan event')
    console.log({
      scale: this._scale,
      translateX: this._translateX,
      translateY: this._translateY
    })
    if (event.nativeEvent.oldState === State.ACTIVE) {
      this._lastOffset.x += event.nativeEvent.translationX
      this._lastOffset.y += event.nativeEvent.translationY
      this._translateX.setOffset(this._lastOffset.x)
      this._translateX.setValue(0)
      this._translateY.setOffset(this._lastOffset.y)
      this._translateY.setValue(0)
    }
  }

  render() {
    return (
      <PinchGestureHandler
        ref={this.pinchRef}
        simultaneousHandlers={this.rotationRef}
        onGestureEvent={this._onPinchGestureEvent}
        onHandlerStateChange={this._onPinchHandlerStateChange}
      >
        <Animated.View style={styles.container}>
          <PanGestureHandler
            ref={this.panRef}
            onGestureEvent={this._onPanGestureEvent}
            onHandlerStateChange={this._onPanGestureStateChange}
            // minDist={10}
            maxPointers={1}
            avgTouches
          >
            <Animated.View style={styles.container} collapsable={false}>
              <Animated.View
                style={{
                  position: 'absolute',

                  zIndex: 9,
                  transform: [
                    { scale: this._scale },
                    {
                      translateX: Animated.add(this._translateX, 123)
                    },
                    {
                      translateY: Animated.add(this._translateY, 123)
                    }
                  ]
                }}
              >
                <Svg width="3754" height="3992" viewBox="0 0 100 100">
                  <Image
                    width="100%"
                    height="100%"
                    href={require('../assets/halls/essen/h1&2.jpeg')}
                  />
                  <Circle
                    cx="10"
                    cy="10"
                    r="5"
                    stroke="blue"
                    strokeWidth="2.5"
                    fill="green"
                  />
                </Svg>
              </Animated.View>
              {/* <Animated.Image
                style={[
                  styles.pinchableImage,
                  {
                    transform: [
                      { perspective: 200 },
                      { scale: this._scale },
                      { translateX: this._translateX },
                      { translateY: this._translateY }
                    ]
                  }
                ]}
                source={require('../assets/halls/essen/h1&2.jpeg')}
              /> */}
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </PinchGestureHandler>
    )
  }
}

export default class PreviewMap extends React.PureComponent {
  render() {
    // const { location } = this.props.navigation.state.params

    return <PinchableBox />
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    overflow: 'hidden',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  pinchableImage: {
    // ...StyleSheet.absoluteFillObject,
    // flex: 1
  },
  wrapper: {
    flex: 1
  }
})
