import Sentry from 'sentry-expo'
import React from 'react'
import { StyleSheet, Image, View, Text, ScrollView } from 'react-native'
import { Icon, Button } from 'react-native-elements'
import HTMLView from 'react-native-htmlview'

import ImageList from './image_list'
import { fetchJSON } from '../../shared/HTTP'

export default class GameScreen extends React.Component {
  state = {
    game: {},

    stats: { item: { rankinfo: [] } },
    imageModalIndex: null
  }

  static navigationOptions = ({ navigation }) => ({
    title: navigation.state.params.game.name
  })

  static getDerivedStateFromProps(props, state) {
    const game = props.navigation.state.params.game

    if (game && game !== state.game) {
      return { game }
    }

    // Return null to indicate no change to state.
    return null
  }

  componentDidMount() {
    const { game } = this.state

    if (game !== {}) {
      this.getGameStats(game.objectid)
      this.getGameDetails(game.objectid)
    }
  }

  getGameDetails = async objectid => {
    const url = `https://api.geekdo.com/api/geekitems?objectid=${objectid}&showcount=10&nosession=1&ajax=1&objecttype=thing`
    const game = await fetchJSON(url)
    this.setState({ game })
  }

  getGameStats = async objectid => {
    const url = `https://api.geekdo.com/api/dynamicinfo?objectid=${objectid}&showcount=10&nosession=1&ajax=1&objecttype=thing`
    const stats = await fetchJSON(url)
    this.setState({ stats })
  }

  _renderHeaderRank = () => {
    let {
      stats: {
        item: { rankinfo: rankInfo }
      }
    } = this.state

    if (rankInfo.length > 0) {
      return (
        <View style={styles.headerRatings}>
          <Icon name="crown" type="foundation" color="#e66c06" size={20} />
          <View style={{ paddingTop: 3, paddingLeft: 6, flexDirection: 'row' }}>
            <Text style={{ color: '#ffffff', fontFamily: 'lato-bold' }}>
              RANK:{' '}
            </Text>
            {rankInfo.map((rank, i) => (
              <Text
                key={i}
                style={{
                  color: '#ffffff',
                  fontFamily: 'lato',
                  paddingRight: 8
                }}
              >
                {rank.veryshortprettyname.toUpperCase().trim()}:{' '}
                {rank.rank.toUpperCase()}
              </Text>
            ))}
          </View>
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

  _renderHeaderName = params => {
    const {
      game: { item: game = {} }
    } = this.state || {}
    const {
      stats: {
        item: { stats: stats = {} }
      }
    } = this.state

    return (
      <View style={{ flexDirection: 'row' }}>
        <View style={styles.headerIcon}>
          <Text
            style={{ color: '#ffffff', fontSize: 24, fontFamily: 'lato-bold' }}
          >
            {this._trimTo(stats.average, 1)}
          </Text>
        </View>

        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
          <Text
            style={{
              width: '100%',
              fontSize: 18,
              fontFamily: 'lato-bold',
              color: '#ffffff'
            }}
          >
            {params.game.name}

            <Text style={{ color: '#dee0e2' }}> ({game.yearpublished})</Text>
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

  _renderGameStats = game => {
    const {
      stats: {
        item: { polls: polls }
      }
    } = this.state

    if (polls !== undefined && game !== undefined) {
      return (
        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
          <View style={[styles.statsBox, styles.statsBoxRight]}>
            <Text style={styles.statsTitle}>
              {game.minplayers}-{game.maxplayers} Players
            </Text>
            <Text style={styles.statsText}>
              Community: {this._playerCounts(polls.userplayers.recommended[0])}{' '}
              -- Best: {this._playerCounts(polls.userplayers.best[0])}
            </Text>
          </View>
          <View style={styles.statsBox}>
            <Text style={styles.statsTitle}>
              {this._playerCounts([game.minplaytime, game.maxplaytime])} Min
            </Text>
            <Text style={styles.statsText}>Playing Time</Text>
          </View>
          <View
            style={[styles.statsBox, styles.statsBoxRight, styles.statsBoxTop]}
          >
            <Text style={styles.statsTitle}>Age: {game.minage}+</Text>
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

  _renderCredits = game => {
    if (game !== undefined) {
      return (
        <View>
          {this._renderCreditLine('Alternative Names', game.alternatenames, 1)}
          {this._renderCreditLine('Designer', game.links.boardgamedesigner, 2)}
          {this._renderCreditLine('Artist', game.links.boardgameartist, 2)}
          {this._renderCreditLine(
            'Publisher',
            game.links.boardgamepublisher,
            2
          )}
        </View>
      )
    }
  }

  _renderDescription = game => {
    if (game !== undefined) {
      const description = game.description.replace(/\n/g, '')
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

  render = () => {
    const { navigate } = this.props.navigation
    const { params } = this.props.navigation.state
    const { game: { item: game } = {} } = this.state
    const images = game ? game.images : {}

    return (
      <ScrollView>
        <View style={styles.itemContainer}>
          <View style={styles.gameHeader}>
            <Image
              source={{ uri: images.previewthumb }}
              style={styles.headerImage}
            />
          </View>
          {this._renderHeaderRank()}
          <View style={{ padding: 10, backgroundColor: '#000000' }}>
            {this._renderHeaderName(params)}
          </View>
          <View style={{ padding: 10, backgroundColor: '#E7ECF1' }}>
            {this._renderGameStats(game)}
            {this._renderCredits(game)}
            <Button
              backgroundColor="#03A9F4"
              onPress={() => navigate('AddTo', { game })}
              title="Add To ..."
            />
          </View>
          <View style={{ padding: 10, backgroundColor: '#ffffff' }}>
            <ImageList objectId={game ? game.objectid : null} />
            {this._renderDescription(game)}
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
    height: 30,
    paddingHorizontal: 10,
    flexDirection: 'row'
  },
  headerImage: {
    width: '90%',
    height: '95%',
    resizeMode: Image.resizeMode.contain
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: '#5369a2',
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
