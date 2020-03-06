import React from 'reactn'
import { Button } from 'react-native-elements'
import PropTypes from 'prop-types'
import Octicon from 'react-native-vector-icons/Octicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { fetchJSON } from '../../shared/HTTP'
import styles from './styles'

export default class AddToButton extends React.Component {
  state = {
    objectId: null,
    collectionId: null,
    collectionStatus: {},
    wishlistPriority: 3
  }

  componentDidMount = () => {
    const { game } = this.props

    this.getUserGameDetails(game.objectId)
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

    const icon = inCollection ? (
      <Octicon name="check" color="green" size={18} />
    ) : (
      <FontAwesome name="list" color="#000" size={16} />
    )

    return (
      <Button
        buttonStyle={styles.headerButton}
        titleStyle={styles.headerButtonText}
        containerStyle={styles.headerButtonContainer}
        icon={icon}
        onPress={() =>
          navigate('AddTo', {
            game,
            collectionId,
            collectionStatus,
            wishlistPriority
          })
        }
        title={inCollection ? ' In Collection' : ' Add To ...'}
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
