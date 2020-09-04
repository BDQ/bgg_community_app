import React, { useState } from 'reactn'
import PropTypes from 'prop-types'
import { StyleSheet, TouchableHighlight, FlatList, Image } from 'react-native'

import ImageView from 'react-native-image-viewing'

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
      <ImageView
        images={images.map((img) => ({ uri: img.url }))}
        imageIndex={imageModalIndex}
        visible={imageModalIndex !== null}
        onRequestClose={hideImageModal}
      />
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
