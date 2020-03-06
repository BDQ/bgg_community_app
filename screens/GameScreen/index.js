import React from 'react'
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  InteractionManager
} from 'react-native'
import { Icon, Button } from 'react-native-elements'
import HTMLView from 'react-native-htmlview'
import ImageProgress from 'react-native-image-progress'
import ProgressBar from 'react-native-progress/Circle'

import ImageList from './ImageList'
import AddToButton from './AddToButton'
import LogPlayButton from './LogPlayButton'
import { fetchJSON } from '../../shared/HTTP'

export default class GameScreen extends React.Component {
  state = {
    game: {},
    details: null,
    stats: { item: { rankinfo: [] } },
    imageModalIndex: null
  }

  static navigationOptions = ({ navigation }) => ({
    title: navigation.state.params.game.name
  })

  static getDerivedStateFromProps(props, state) {
    const { game } = props.navigation.state.params

    if (game && game !== state.game) {
      return { game }
    }

    // Return null to indicate no change to state.
    return null
  }

  componentDidMount() {
    const { game, details } = this.state
    const objectId = game.objectId

    if (details === null) {
      InteractionManager.runAfterInteractions(async () => {
        this.getGameStats(objectId)
        this.getGameDetails(objectId)
      })
    }
  }

  getGameDetails = async objectId => {
    const url = `https://api.geekdo.com/api/geekitems?objectid=${objectId}&showcount=10&nosession=1&ajax=1&objecttype=thing`
    const { item: details } = await fetchJSON(url)

    this.setState({ details })
  }

  getGameStats = async objectId => {
    const url = `https://api.geekdo.com/api/dynamicinfo?objectid=${objectId}&showcount=10&nosession=1&ajax=1&objecttype=thing`
    const stats = await fetchJSON(url)
    this.setState({ stats })
  }

  _renderHeaderRank = () => {
    let {
      stats: {
        item: { rankinfo: rankInfo }
      }
    } = this.state

    if (rankInfo && rankInfo.length > 0) {
      return (
        <View style={styles.headerRatings}>
          <Icon
            name="crown"
            type="foundation"
            color="#e66c06"
            size={20}
            containerStyle={{
              marginRight: 4,
              height: 20
            }}
          />
          <Text
            style={[
              styles.headerRatingsText,
              {
                fontFamily: 'lato-bold'
              }
            ]}
          >
            RANK:{' '}
          </Text>
          {rankInfo.map((rank, i) => (
            <Text
              key={i}
              style={[
                styles.headerRatingsText,
                {
                  fontFamily: 'lato',
                  paddingRight: 8
                }
              ]}
            >
              {rank.veryshortprettyname.toUpperCase().trim()}:{' '}
              {rank.rank.toUpperCase()}
            </Text>
          ))}
        </View>
      )
    } else {
      return (
        <View style={styles.headerRatings}>
          <Text>Loading</Text>
        </View>
      )
    }
  }

  _renderHeaderName = () => {
    const {
      game,
      details,
      stats: {
        item: { stats: stats = { average: '0' } }
      }
    } = this.state

    let ratingBGColor, ratingText

    if (!stats.average || stats.average === '0') {
      ratingBGColor = '#999999'
      ratingText = '--'
    } else {
      ratingBGColor = '#5369a2'
      ratingText = this._trimTo(stats.average, 1)
    }

    return (
      <View style={{ flexDirection: 'row' }}>
        <View style={[styles.headerIcon, { backgroundColor: ratingBGColor }]}>
          <Text
            style={{ color: '#ffffff', fontSize: 24, fontFamily: 'lato-bold' }}
          >
            {ratingText}
          </Text>
        </View>

        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
          <Text
            id="headerText"
            style={{
              width: '100%',
              fontSize: 18,
              fontFamily: 'lato-bold',
              color: '#ffffff'
            }}
          >
            {game.name}
            {details ? (
              <Text style={{ color: '#dee0e2' }}>
                {' '}
                ({details.yearpublished})
              </Text>
            ) : null}
          </Text>
          <Text
            style={{
              width: '100%',
              fontSize: 14,
              paddingTop: 2,
              fontFamily: 'lato',
              color: '#ffffff'
            }}
          >
            {stats.usersrated} Ratings & {stats.numcomments} Comments
          </Text>
        </View>
      </View>
    )
  }

  _trimTo = (decimal, places) => (Math.round(decimal * 10) / 10).toFixed(places)

  _playerCounts = (cnts = {}) => {
    if (cnts.min !== undefined) {
      cnts = [cnts.min, cnts.max]
    }

    if (cnts[0] == cnts[1]) {
      return cnts[0]
    } else {
      return `${cnts[0]}-${cnts[1]}`
    }
  }

  _renderGameStats = details => {
    const {
      stats: {
        item: { polls: polls }
      }
    } = this.state

    if (polls !== undefined && details !== null) {
      return (
        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
          <View style={[styles.statsBox, styles.statsBoxRight]}>
            <Text style={styles.statsTitle}>
              {details.minplayers}-{details.maxplayers} Players
            </Text>
            <Text style={styles.statsText}>
              Community: {this._playerCounts(polls.userplayers.recommended[0])}{' '}
              -- Best: {this._playerCounts(polls.userplayers.best[0])}
            </Text>
          </View>
          <View style={styles.statsBox}>
            <Text style={styles.statsTitle}>
              {this._playerCounts([details.minplaytime, details.maxplaytime])}{' '}
              Min
            </Text>
            <Text style={styles.statsText}>Playing Time</Text>
          </View>
          <View
            style={[styles.statsBox, styles.statsBoxRight, styles.statsBoxTop]}
          >
            <Text style={styles.statsTitle}>Age: {details.minage}+</Text>
            <Text style={styles.statsText}>Community: {polls.playerage}</Text>
          </View>
          <View style={[styles.statsBox, styles.statsBoxTop]}>
            <Text style={styles.statsTitle}>
              Weigth: {this._trimTo(polls.boardgameweight.averageweight, 2)} / 5
            </Text>
            <Text style={styles.statsText}>Complexity Rating</Text>
          </View>
        </View>
      )
    }
  }

  _renderCreditLine = (name, list, show) => {
    if (list.length > 0) {
      let to_show = list.slice(0, show)
      return (
        <View style={{ paddingBottom: 4 }}>
          <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
            <Text style={styles.creditText}>
              <Text style={styles.creditTitle}>{name}: </Text>
              {to_show.map(item => item.name).join(', ')}
              {list.length > show ? ` + ${list.length - show} more` : ''}
            </Text>
          </View>
        </View>
      )
    }
  }

  _renderCredits = details => {
    if (details !== null) {
      return (
        <View>
          {this._renderCreditLine(
            'Alternative Names',
            details.alternatenames,
            1
          )}
          {this._renderCreditLine(
            'Designer',
            details.links.boardgamedesigner,
            2
          )}
          {this._renderCreditLine('Artist', details.links.boardgameartist, 2)}
          {this._renderCreditLine(
            'Publisher',
            details.links.boardgamepublisher,
            2
          )}
        </View>
      )
    }
  }

  _renderDescription = details => {
    if (details !== null) {
      const description = details.description.replace(/\n/g, '')
      return (
        <View>
          <View style={styles.descriptionHeader}>
            <Text style={styles.descriptionHeaderText}>Description</Text>
          </View>
          <HTMLView
            style={{ width: '100%' }}
            stylesheet={htmlStyles}
            paragraphBreak={null}
            addLineBreaks={false}
            value={description}
          />
        </View>
      )
    }
  }

  _renderMainImage = images => {
    if (images.previewthumb) {
      return (
        <ImageProgress
          source={{ uri: images.previewthumb }}
          indicator={ProgressBar}
          indicatorProps={{
            color: '#ffffff'
          }}
          resizeMode="contain"
          style={styles.headerImage}
        />
      )
    } else {
      return (
        <View style={styles.emptyView}>
          <ProgressBar
            indeterminate={true}
            color="#ffffff"
            style={{ margin: 12 }}
          />

          <Text style={{ marginTop: 10, color: 'white' }}>Loading...</Text>
        </View>
      )
    }
  }

  render = () => {
    const { navigation } = this.props
    const { params } = navigation.state

    const { game, details } = this.state
    const images = details ? details.images : {}

    return (
      <ScrollView>
        <View style={styles.itemContainer}>
          <View style={styles.gameHeader}>{this._renderMainImage(images)}</View>
          {this._renderHeaderRank()}
          <View style={{ padding: 10, backgroundColor: '#000000' }}>
            {this._renderHeaderName(params)}
          </View>
          <View style={{ padding: 10, backgroundColor: '#E7ECF1' }}>
            {this._renderGameStats(details)}
            {this._renderCredits(details)}
          </View>
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#E7ECF1',
              paddingBottom: 8,
              paddingLeft: 8,
              paddingRight: 8,
              justifyContent: 'center'
            }}
          >
            <AddToButton navigation={navigation} game={game} />
            <LogPlayButton navigation={navigation} game={game} />
          </View>
          <View style={{ padding: 10, backgroundColor: '#ffffff' }}>
            <ImageList objectId={game ? game.objectId : null} />
            {this._renderDescription(details)}
          </View>
        </View>
      </ScrollView>
    )
  }
}
const htmlStyles = StyleSheet.create({
  p: {
    marginTop: 0,
    marginBottom: 8,
    paddingTop: 0,
    paddingBottom: 0
  }
})

const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  gameHeader: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    height: 300
  },
  headerRatings: {
    backgroundColor: '#000000',
    paddingHorizontal: 10,
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  headerRatingsText: {
    paddingTop: 2,
    color: '#ffffff',
    height: 20
  },
  headerImage: {
    width: '90%',
    height: '92%'
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  statsBoxRight: {
    borderRightWidth: 1
  },
  statsBoxTop: {
    borderTopWidth: 1
  },
  statsBox: {
    borderColor: '#BEBFC0',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 12,
    width: '50%',
    height: 65
  },
  statsTitle: {
    fontFamily: 'lato-bold',
    color: '#282D5C',
    width: '100%',
    textAlign: 'center',
    fontSize: 16
  },
  statsText: {
    fontFamily: 'lato',
    color: '#004FAE',
    width: '100%',
    textAlign: 'center',
    fontSize: 12
  },
  creditText: {
    fontFamily: 'lato'
  },
  creditTitle: {
    fontFamily: 'lato-bold'
  },
  descriptionHeader: {
    borderBottomColor: '#292e62',
    borderBottomWidth: 1,
    marginBottom: 10
  },
  descriptionHeaderText: {
    fontFamily: 'lato-bold',
    fontSize: 18,
    color: '#292e62',
    marginBottom: 10
  }
})
