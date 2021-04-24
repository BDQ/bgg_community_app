import React, { useEffect, useState } from 'react'
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  InteractionManager,
} from 'react-native'
import { Icon, Button } from 'react-native-elements'
import HTMLView from 'react-native-htmlview'
import ImageProgress from 'react-native-image-progress'
//import ProgressBar from 'react-native-progress/Circle'

import ImageList from './ImageList'
import AddToButton from './AddToButton'
import LogPlayButton from './LogPlayButton'
import { fetchJSON } from '../../shared/HTTP'
import { getRatingColor } from '../../shared/collection'

import styles from './styles'

const GameScreen = ({ navigation, route }) => {
  const { game } = route.params

  console.log("gamescreen params", route.params)

  const [details, setDetails] = useState(null)
  const [itemStats, setItemStates] = useState({ item: { rankinfo: [] } })

  // export default class GameScreen extends React.Component {
  // state = {
  //   game: {},
  //   details: null,
  //   stats: { item: { rankinfo: [] } },
  //   imageModalIndex: null
  // }

  // static navigationOptions = ({ route }) => ({
  //   title: route.params.game.name
  // })

  useEffect(() => {
    const objectId = game.objectId
    if (details === null) {
      getGameStats(objectId)
      getGameDetails(objectId)

    }
  }, [game])

  getGameDetails = async (objectId) => {
    console.log("fetching game", objectId)
    const url = `https://api.geekdo.com/api/geekitems?objectid=${objectId}&showcount=10&nosession=1&ajax=1&objecttype=thing`
    const { item } = await fetchJSON(url)
    console.log("fetched game")

    setDetails(item)
  }

  getGameStats = async (objectId) => {
    const url = `https://api.geekdo.com/api/dynamicinfo?objectid=${objectId}&showcount=10&nosession=1&ajax=1&objecttype=thing`
    const newItemStats = await fetchJSON(url)

    setItemStates(newItemStats)
  }

  _renderHeaderRank = () => {
    let {
      item: { rankinfo: rankInfo },
    } = itemStats

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
              height: 20,
            }}
          />
          <Text
            style={[
              styles.headerRatingsText,
              {
                fontFamily: 'lato-bold',
              },
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
                  paddingRight: 8,
                },
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
      item: { stats: stats = { average: '0' } },
    } = itemStats

    let ratingBGColor, ratingText

    if (!stats.average || stats.average === '0') {
      ratingBGColor = '#999999'
      ratingText = '--'
    } else {
      ratingBGColor = getRatingColor(stats.average)
      ratingText = _trimTo(stats.average, 1)
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
              color: '#ffffff',
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
              color: '#ffffff',
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

  _renderGameStats = (details) => {
    const {
      item: { polls: polls },
    } = itemStats

    if (polls !== undefined && details !== null) {
      return (
        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
          <View style={[styles.statsBox, styles.statsBoxRight]}>
            <Text style={styles.statsTitle}>
              {details.minplayers}-{details.maxplayers} Players
            </Text>
            <Text style={styles.statsText}>
              Community: {_playerCounts(polls.userplayers.recommended[0])} --
              Best: {_playerCounts(polls.userplayers.best[0])}
            </Text>
          </View>
          <View style={styles.statsBox}>
            <Text style={styles.statsTitle}>
              {_playerCounts([details.minplaytime, details.maxplaytime])} Min
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
              Weigth: {_trimTo(polls.boardgameweight.averageweight, 2)} / 5
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
              {to_show.map((item) => item.name).join(', ')}
              {list.length > show ? ` + ${list.length - show} more` : ''}
            </Text>
          </View>
        </View>
      )
    }
  }

  _renderCredits = (details) => {
    if (details !== null) {
      return (
        <View>
          {_renderCreditLine('Alternative Names', details.alternatenames, 1)}
          {_renderCreditLine('Designer', details.links.boardgamedesigner, 2)}
          {_renderCreditLine('Artist', details.links.boardgameartist, 2)}
          {_renderCreditLine('Publisher', details.links.boardgamepublisher, 2)}
        </View>
      )
    }
  }

  _renderDescription = (details) => {
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

  _renderMainImage = (images) => {
    if (images.previewthumb) {
      return (
        <ImageProgress
          source={{ uri: images.previewthumb }}
          indicatorProps={{
            color: '#ffffff',
          }}
          resizeMode="contain"
          style={styles.headerImage}
        />
      )
    } else {
      return (
        <View style={styles.emptyView}>


          <Text style={{ marginTop: 10, color: 'white' }}>Loading...</Text>
        </View>
      )
    }
  }

  const images = details ? details.images : {}

  return (
    <ScrollView>
      <View style={styles.itemContainer}>
        <View style={styles.gameHeader}>{_renderMainImage(images)}</View>
        {_renderHeaderRank()}
        <View style={{ padding: 10, backgroundColor: '#000000' }}>
          {_renderHeaderName(route.params)}
        </View>
        <View style={{ padding: 10, backgroundColor: '#E7ECF1' }}>
          {_renderGameStats(details)}
          {_renderCredits(details)}
        </View>
        <View style={styles.headerBottonRow}>
          <AddToButton navigation={navigation} game={game} />
          <LogPlayButton navigation={navigation} game={game} />
        </View>
        <View style={{ padding: 10, backgroundColor: '#ffffff' }}>
          <ImageList objectId={game ? game.objectId : null} />
          {_renderDescription(details)}
        </View>
      </View>
    </ScrollView>
  )
}

export default GameScreen

const htmlStyles = StyleSheet.create({
  p: {
    marginTop: 0,
    marginBottom: 8,
    paddingTop: 0,
    paddingBottom: 0,
  },
})
