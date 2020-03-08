import React from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  InteractionManager
} from 'react-native'
import { SearchBar } from 'react-native-elements'
import PropTypes from 'prop-types'
import { debounce } from 'throttle-debounce'
const XMLParser = require('react-xml-parser')

import { fetchJSON } from '../shared/HTTP'
import { getElementValue } from '../shared/xml.js'
import GameListItem from './../components/GameListItem'

export default class GameSearch extends React.PureComponent {
  state = { games: [], searchFor: '' }
  static navigationOptions = () => {
    return {
      title: 'Add to collection'
    }
  }

  _renderItem = ({ item }) => {
    const { navigate } = this.props.navigation

    return (
      <TouchableOpacity
        onPress={() => {
          navigate('Game', { game: item })
        }}
      >
        <GameListItem
          name={item.name}
          thumbnail={item.thumbnail}
          subtitle={`Year: ${item.yearpublished}`}
        />
      </TouchableOpacity>
    )
  }

  clearSearch = () => {
    this.setState({ games: [] })
  }

  _renderHeader = () => {
    return (
      <SearchBar
        autoFocus={true}
        onChangeText={this.handlerSearch}
        onClearText={this.clearSearch}
        showLoadingIcon={this.state.loading}
        placeholder="Type game name to search"
        value={this.state.searchFor}
      />
    )
  }

  _renderFooter = () => {
    let message
    if (this.state.loading) {
      message = 'Searching BGG...'
    } else {
      if (this.state.games.length == 0) {
        message = 'No results'
      }
    }

    return (
      <View
        style={{
          paddingVertical: 20,
          borderTopWidth: 1,
          alignItems: 'center',
          borderColor: '#CED0CE'
        }}
      >
        <Text>{message}</Text>
      </View>
    )
  }

  render = () => (
    <FlatList
      ListHeaderComponent={this._renderHeader}
      ListFooterComponent={this._renderFooter}
      extraData={this.state}
      data={this.state.games}
      keyExtractor={item => item.objectId}
      renderItem={this._renderItem}
    />
  )

  enrich = async games => {
    let ids = games.map(g => g.objectId)
    const url = `https://www.boardgamegeek.com/xmlapi2/thing?id=${ids.join(
      ','
    )}&type=boardgame,boardgameexpansion`

    try {
      let response = await fetch(url)

      if (response.status == 200) {
        const xml = await response.text()
        const doc = new XMLParser().parseFromString(xml)

        let moreDataOnGames = doc.children.map(item => {
          let objectId = item.attributes.id
          let image = getElementValue(item, 'image')

          let thumbnail = getElementValue(item, 'thumbnail')
          let description = getElementValue(item, 'description')

          return { objectId, image, thumbnail, description }
        })

        games = games.map(game => {
          return Object.assign(
            game,
            moreDataOnGames.find(g => g.objectId == game.objectId)
          )
        })

        this.setState({ games: games })
      }
    } catch (error) {
      console.log('ENRICH ERROR', error)
    }
  }

  handlerSearch = str => {
    this.setState({ searchFor: str })
    debounce(500, this.searchBGG(str))
  }

  searchBGG = async searchFor => {
    if (searchFor.length > 2) {
      this.setState({ loading: true, games: [] })

      InteractionManager.runAfterInteractions(async () => {
        const url = `https://bgg.cc/search/boardgame?q=${searchFor}&showcount=20`

        const response = await fetchJSON(url)

        const games = response.items.map(game => ({
          objectId: game.objectid,
          name: game.name,
          yearpublished: game.yearpublished
        }))

        this.setState({ games, loading: false })
        this.enrich(games)
      })
    }
  }
}

GameSearch.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired
  }).isRequired
}
