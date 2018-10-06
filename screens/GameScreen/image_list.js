import React from 'react'
import {
  StyleSheet,
  Image,
  View,
  Text,
  TouchableHighlight,
  Modal,
  SafeAreaView,
  FlatList,
  Dimensions
} from 'react-native'

import Carousel from 'react-native-snap-carousel'
import ImageProgress from 'react-native-image-progress'
import ProgressBar from 'react-native-progress/Circle'
import ImageZoom from 'react-native-image-pan-zoom'

import { fetchJSON } from '../../shared/HTTP'

export default class ImageList extends React.Component {
  state = {
    objectId: null,
    images: null,
    imageModalIndex: null
  }

  static getDerivedStateFromProps(props, state) {
    const { objectId } = props

    if (objectId && objectId !== state.objectId) {
      //clear out previous images
      return { objectId, images: null }
    }

    // Return null to indicate no change to state.
    return null
  }

  componentDidUpdate() {
    // only fetch if we don't have images
    if (this.state.objectId !== null && this.state.images === null) {
      this.getGameImages()
    }
  }

  getGameImages = async () => {
    const { objectId } = this.state
    const url = `https://api.geekdo.com/api/images?objectid=${objectId}&ajax=1&galleries%5B%5D=game&galleries%5B%5D=creative&nosession=1&objecttype=thing&showcount=17&size=crop100&sort=hot`
    const { images } = await fetchJSON(url)

    this.setState({ images })
  }

  hideImageModal() {
    this.setState({ imageModalIndex: null })
  }

  showImageModal(imageModalIndex) {
    this.setState({ imageModalIndex })
  }

  render = () => {
    if (this.state.images === null) {
      return null
    }

    const { width: viewportWidth } = Dimensions.get('window')
    const componentWidth = viewportWidth - 10

    return (
      <View>
        <FlatList
          style={{ height: 104 }}
          data={this.state.images}
          horizontal={true}
          keyExtractor={img => img.imageid}
          renderItem={({ item, index }) => {
            return (
              <TouchableHighlight
                onPress={() => {
                  this.showImageModal(index)
                }}
              >
                <Image
                  style={styles.imageListThumbnail}
                  source={{ uri: item.imageurl }}
                />
              </TouchableHighlight>
            )
          }}
        />
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.imageModalIndex !== null}
        >
          <SafeAreaView style={{ backgroundColor: '#000000' }}>
            <View style={{ margin: 10 }}>
              <TouchableHighlight
                onPress={() => {
                  this.hideImageModal()
                }}
              >
                <Text style={{ color: 'white' }}>Close</Text>
              </TouchableHighlight>
              <Carousel
                // scrollEnabled={false}
                initialNumToRender={this.state.imageModalIndex}
                maxToRenderPerBatch={1}
                firstItem={this.state.imageModalIndex}
                data={this.state.images}
                renderItem={({ item }) => {
                  return (
                    <ImageZoom
                      cropWidth={componentWidth}
                      cropHeight={Dimensions.get('window').height}
                      imageWidth={componentWidth}
                      imageHeight={Dimensions.get('window').height - 10}
                    >
                      <ImageProgress
                        source={{ uri: item.imageurl_lg }}
                        indicator={ProgressBar}
                        indicatorProps={{
                          color: '#ffffff'
                        }}
                        style={{
                          width: '100%',
                          height: '100%'
                        }}
                        imageStyle={{
                          resizeMode: Image.resizeMode.contain
                        }}
                      />
                    </ImageZoom>
                  )
                }}
                sliderWidth={viewportWidth}
                itemWidth={componentWidth}
              />
            </View>
          </SafeAreaView>
        </Modal>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  imageListThumbnail: {
    width: 100,
    height: 100,
    margin: 2,
    resizeMode: Image.resizeMode.contain
  }
})
