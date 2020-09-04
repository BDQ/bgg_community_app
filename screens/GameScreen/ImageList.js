import React, { useState } from 'reactn'
import PropTypes from 'prop-types'
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  Modal,
  FlatList,
  Image,
  SafeAreaView,
} from 'react-native'

import ImageViewer from 'react-native-image-zoom-viewer'

const ImageList = ({ images }) => {
  const [imageModalIndex, setImageModalIndex] = useState(null)

  if (images === null) return null

  const hideImageModal = () => setImageModalIndex(null)

  return (
    <React.Fragment>
      <FlatList
        style={{ height: 104, backgroundColor: '#ffffff' }}
        data={images}
        horizontal={true}
        keyExtractor={(img) => img.id}
        renderItem={({ item, index }) => {
          return (
            <TouchableHighlight
              onPress={() => {
                setImageModalIndex(index)
              }}
            >
              <Image
                source={{ uri: item.url }}
                style={styles.imageListThumbnail}
              />
            </TouchableHighlight>
          )
        }}
      />
      <Modal
        animationType="slide"
        transparent={false}
        visible={imageModalIndex !== null}
        onRequestClose={hideImageModal}
      >
        <ImageViewer
          renderImage={({ source, style }) => {
            return (
              <Image source={source} style={{ flex: 1 }} imageStyle={style} />
            )
          }}
          renderHeader={() => (
            <SafeAreaView>
              <TouchableHighlight onPress={hideImageModal}>
                <Text style={{ padding: 10, color: 'white' }}>Close</Text>
              </TouchableHighlight>
            </SafeAreaView>
          )}
          imageUrls={images}
          onCancel={hideImageModal}
          index={imageModalIndex}
          enableSwipeDown={true}
        />
      </Modal>
    </React.Fragment>
  )
}

const styles = StyleSheet.create({
  imageListThumbnail: {
    resizeMode: 'cover',
    width: 100,
    height: 100,
    margin: 2,
  },
})

ImageList.propTypes = {
  images: PropTypes.any,
}
export default ImageList
