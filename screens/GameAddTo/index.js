import React, { useDispatch } from 'reactn'
import { View, Text } from 'react-native'
import { CheckBox, Button } from 'react-native-elements'
import { showMessage } from 'react-native-flash-message'
import { Picker } from '@react-native-community/picker'
import PropTypes from 'prop-types'

import { fetchJSON } from '../../shared/HTTP'
import { navigationType, routeType } from '../../shared/propTypes.js'
import globalStyles from '../../shared/styles'
import styles from './styles'

const GameAddTo = ({ navigation, route }) => {
  const [collectionStatus, setCollectionStatus] = React.useState(
    route.params.collectionStatus
  )
  const [wishlistPriority, setWishlistPriority] = React.useState(
    route.params.wishlistPriority
  )

  const addOrUpdateGameInCollection = useDispatch('addOrUpdateGameInCollection')
  const removeGameFromCollection = useDispatch('removeGameFromCollection')

  const save = async () => {
    const { game, collectionId } = route.params

    const body = {
      item: {
        collid: collectionId || 0,
        status: collectionStatus,
        objectid: game.objectId.toString(),
        objectname: game.name,
        objecttype: 'thing',
        acquisitiondate: null,
        invdate: null,
        wishlistpriority: wishlistPriority,
      },
    }

    let response, success
    if (collectionId) {
      const url = `/api/collectionitems/${collectionId}`
      response = await fetchJSON(url, { method: 'PUT', body })

      success = response.message === 'Item updated'
    } else {
      const url = '/api/collectionitems'
      response = await fetchJSON(url, { method: 'POST', body })
      success = response.message === 'Item saved'
    }

    if (success) {
      //update global / store
      if (Object.values(collectionStatus).some((state) => state)) {
        game.status = {}

        Object.keys(collectionStatus).map((key) => {
          game.status[key] = collectionStatus[key] ? '1' : '0'
        })

        addOrUpdateGameInCollection(game)
      } else {
        removeGameFromCollection(game)
      }

      navigation.goBack(null)
    } else {
      showMessage({
        message: "Failed to save item's collection status, please try again.",
        icon: 'auto',
        type: 'danger',
      })
    }
  }

  const headerRight = () => (
    <Button
      small
      onPress={save}
      title="Save"
      buttonStyle={globalStyles.headerButton}
    />
  )
  React.useLayoutEffect(() => {
    navigation.setOptions({ headerRight })
  }, [navigation, save])

  const collectionStates = [
    ['Owned', 'own'],
    ['Prevously Owned', 'prevowned'],
    ['For Trade', 'fortrade'],
    ['Want to Play', 'wanttoplay'],
    ['Want to Buy', 'wanttobuy'],
    ['Pre-ordered', 'preordered'],
    ['Wishlist', 'wishlist'],
  ]

  const wishlistValues = [
    { label: 'Must have', value: 1 },
    { label: 'Love to have', value: 2 },
    { label: 'Like to have', value: 3 },
    { label: 'Thinking about it', value: 4 },
    { label: "Don't buy this", value: 5 },
  ]

  const toggle = (attr) => {
    let currentState = collectionStatus[attr]
    setCollectionStatus({ ...collectionStatus, [attr]: !currentState })
  }

  const _renderWishlistDropdown = (wishedFor) => {
    return wishedFor ? (
      <View style={styles.wishlistDropDownWrapper}>
        <Picker
          selectedValue={wishlistPriority}
          onValueChange={setWishlistPriority}
        >
          {wishlistValues.map(({ label, value }) => {
            return <Picker.Item key={value} label={label} value={value} />
          })}
        </Picker>
      </View>
    ) : null
  }

  const { name } = route.params.game

  let statusCheckBoxes = collectionStates.map((status, i) => (
    <CheckBox
      containerStyle={styles.checkboxContainer}
      title={status[0]}
      key={i}
      checked={collectionStatus[status[1]]}
      onPress={() => {
        toggle(status[1])
      }}
    />
  ))

  return (
    <View style={styles.main}>
      <Text style={styles.gameName}>{name}</Text>

      {statusCheckBoxes}

      {_renderWishlistDropdown(collectionStatus.wishlist)}
    </View>
  )
}

GameAddTo.propTypes = {
  ...navigationType,
  ...routeType({
    game: PropTypes.object.isRequired,
    collectionId: PropTypes.string,
    collectionStatus: PropTypes.any,
    wishlistPriority: PropTypes.number,
  }),
}

export default GameAddTo
