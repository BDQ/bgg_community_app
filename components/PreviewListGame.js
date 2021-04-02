import React, { useDispatch } from 'reactn'
import PropTypes from 'prop-types'
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native'
import { Avatar, Badge } from 'react-native-elements'
import Swipeout from 'react-native-swipeout'
import { navigationType } from '../shared/propTypes'
import { priorities } from '../shared/data'

const PreviewListGame = ({ navigation, itemId, ...props }) => {
  const userSelection = props.userSelection || {}

  let notes = { seen: false }
  if (userSelection.notes !== '') {
    try {
      notes = JSON.parse(userSelection.notes)
    } catch (e) {
      // parse failed, so user must have a string note - convert to our format
      notes = {
        text: userSelection.notes,
        seen: false,
      }
    }
  }
  const { priority } = userSelection
  const { seen } = notes

  const handleSwipeSeen = useDispatch('savePreviewSeen')
  const handleSwipePriority = useDispatch('savePreviewPriority')

  const _renderPriority = () => {
    const { name, color } = priorities.find((p) => p.id === priority) || {}

    return color ? (
      <Badge
        style={styles.minorValue}
        value={
          <Text
            style={{
              paddingHorizontal: 10,
              color: '#ffffff',
              fontSize: 9,
            }}
          >
            {name}
          </Text>
        }
        badgeStyle={{ backgroundColor: color }}
        wrapperStyle={{ flex: 1 }}
      />
    ) : null
  }

  const _renderPurchase = () => {
    const {
      game: { purchase },
    } = props

    return purchase ? (
      <Badge
        style={styles.minorValue}
        value={
          <Text
            style={{
              paddingHorizontal: 10,
              color: '#ffffff',
              fontSize: 9,
            }}
          >
            Preordered
          </Text>
        }
        badgeStyle={{ backgroundColor: 'orange' }}
        wrapperStyle={{ flex: 1 }}
      />
    ) : null
  }

  const _renderPrice = () => {
    return props.price !== 0 ? (
      <View style={styles.minor}>
        <Text style={styles.minorLabel}>MSRP</Text>
        <Text style={styles.minorValue}>
          {props.priceCurrency} {props.price}
        </Text>
      </View>
    ) : (
      <View style={styles.minor} />
    )
  }

  const _renderSwipeButton = (text) => (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          textAlign: 'center',
          color: '#ffffff',
          fontSize: 13,
        }}
      >
        {text}
      </Text>
    </View>
  )

  const _renderExpandedPreorder = (preorder, purchase) => {
    return purchase && preorder ? (
      <View>
        <Text style={styles.minorLabel}>Preorder</Text>
        <Text numberOfLines={2} style={styles.minorValue}>
          {preorder.notes}
        </Text>
      </View>
    ) : null
  }

  const _renderExpandedNotes = (notes) => {
    return notes ? (
      <View>
        <Text style={styles.minorLabel}>Notes</Text>
        <Text numberOfLines={2} style={styles.minorValue}>
          {notes}
        </Text>
      </View>
    ) : null
  }

  const _renderExpanded = () => {
    const {
      game: {
        preorder: [firstPreorder],
        purchase,
      },
    } = props

    let maxHeight = 0

    if (notes.text) maxHeight += 70
    if (purchase) maxHeight += 70

    return notes.text || purchase ? (
      <View style={{ maxHeight }}>
        {_renderExpandedPreorder(firstPreorder, purchase)}
        {_renderExpandedNotes(notes.text)}
      </View>
    ) : null
  }

  const { navigate } = navigation

  // Right swipe buttons (Priority - Must Have, Not Interested, etc)
  const swipeoutRight = priorities
    .filter((p) => ![-1, priority].includes(p.id))
    .map(({ id, color, name }) => ({
      component: _renderSwipeButton(name.replace(' ', '\n')),
      backgroundColor: color,
      onPress: () => handleSwipePriority(itemId, id),
    }))

  // Left swipe buttons (Seen, Notes)
  const swipeoutLeft = [
    {
      component: _renderSwipeButton('Edit'),
      onPress: () =>
        navigate('EditNotes', {
          itemId,
          notes: notes.text,
        }),
    },
    {
      component: _renderSwipeButton(seen ? 'Not\nSeen' : 'Seen'),
      type: 'primary',
      onPress: () => handleSwipeSeen(itemId, !seen),
    },
  ]

  return (
    <Swipeout left={swipeoutLeft} right={swipeoutRight} autoClose={true}>
      <TouchableOpacity
        onPress={() => {
          navigate('Game', { game: props.game })
        }}
      >
        <View
          style={styles.itemContainer}
          // onLayout={event => {
          //   var { x, y, width, height } = event.nativeEvent.layout
          //   logger({ x, y, width, height })
          // }}
        >
          <View style={styles.mainContainer}>
            <Avatar
              size="large"
              source={{ uri: props.thumbnail }}
              activeOpacity={0.7}
            />
            <View style={styles.gameDetails}>
              <Text numberOfLines={1} style={styles.gameName}>
                {props.name}
              </Text>
              <Text style={{ fontFamily: 'lato-bold' }}>
                {props.versionName}
              </Text>
              <View style={{ flexDirection: 'row' }}>
                <View style={styles.minor}>
                  <Text style={styles.minorLabel}>Availability</Text>
                  <Text style={styles.minorValue}>{props.status}</Text>
                </View>
                {_renderPrice()}
                <View style={[styles.minor, styles.priority]}>
                  {_renderPriority()}
                  {_renderPurchase()}
                </View>
              </View>
            </View>
          </View>
          {_renderExpanded()}
        </View>
      </TouchableOpacity>
    </Swipeout>
  )
}

PreviewListGame.propTypes = {
  ...navigationType,
  userSelection: PropTypes.shape({
    notes: PropTypes.string.isRequired,
    priority: PropTypes.number,
  }),
  thumbnail: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  versionName: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  game: PropTypes.any.isRequired,
  price: PropTypes.number,
  priceCurrency: PropTypes.string,
}

export default PreviewListGame

const styles = StyleSheet.create({
  itemContainer: {
    borderBottomWidth: 1,
    borderColor: '#dde4eb',
    backgroundColor: '#ffffff',
    padding: 10,
  },
  mainContainer: {
    height: 80,
    flexDirection: 'row',
  },
  gameDetails: {
    paddingLeft: 10,
    flex: 1,
    flexDirection: 'column',
  },
  gameName: {
    fontFamily: 'lato-bold',
    fontSize: 20,
  },
  minor: {
    flex: 1,
    flexDirection: 'column',
  },
  minorLabel: {
    marginTop: 5,
    color: '#646465',
    fontSize: 12,
  },
  minorValue: {
    fontSize: 14,
  },
  priority: {
    paddingTop: 5,
  },
})
