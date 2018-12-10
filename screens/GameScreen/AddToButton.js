import React from 'reactn'
import { Button } from 'react-native-elements'
import PropTypes from 'prop-types'

import { fetchJSON } from '../../shared/HTTP'

export default class AddToButton extends React.Component {
  state = {
    objectId: null,
    collectionId: null,
    collectionStatus: {},
    wishlistPriority: 3
  }

  componentDidMount = () => {
    const { game } = this.props

    this.getUserGameDetails(game.objectId || game.objectid)
  }

  getUserGameDetails = async objectId => {
    const { userid } = this.global.bggCredentials

    const url = `/api/collections?objectid=${objectId}&objecttype=thing&userid=${userid}`
    const { items } = await fetchJSON(url)

    let collid = null,
      status = null,
      wishlistpriority

    if (items.length > 0) {
      ;[{ collid, status, wishlistpriority }] = items
    }

    // fallback
    status = status ? status : {}

    this.setState({
      collectionId: collid,
      collectionStatus: status,
      wishlistPriority: wishlistpriority,
      objectId
    })
  }

  render = () => {
    const {
      game,
      navigation: { navigate }
    } = this.props

    const { collectionId, collectionStatus, wishlistPriority } = this.state

    const inCollection = Object.keys(collectionStatus).length > 0

    const icon = inCollection
      ? {
          name: 'check',
          type: 'Octicons',
          color: 'green',
          size: 18
        }
      : {
          name: 'list',
          type: 'FontAwesome',
          color: '#ffffff',
          size: 18
        }

    return (
      <Button
        backgroundColor={inCollection ? '#ffffff' : '#03A9F4'}
        color={inCollection ? '#000000' : '#ffffff'}
        textStyle={{
          fontFamily: 'lato-bold',
          fontSize: 14
        }}
        leftIcon={icon}
        containerViewStyle={{
          marginVertical: 5
        }}
        onPress={() =>
          navigate('AddTo', {
            game,
            collectionId,
            collectionStatus,
            wishlistPriority
          })
        }
        title={inCollection ? 'In Collection' : 'Add To ...'}
      />
    )
  }
}

AddToButton.propTypes = {
  game: PropTypes.object.isRequired,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired
  }).isRequired
}
