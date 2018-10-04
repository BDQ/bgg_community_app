import React, { Component } from 'react'
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native'
import { SearchBar, Button } from 'react-native-elements'
import GameListItem from './../components/GameListItem'
import parse from 'xml-parser'
import { fetchJSON } from '../shared/HTTP'
import { debounce } from 'throttle-debounce'

export default class GameSearch extends React.PureComponent {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Add to collection'
    }
  }

  constructor(props) {
    super(props)
    this.state = { games: [] }
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
        onChangeText={debounce(500, this.searchBGG)}
        onClearText={this.clearSearch}
        clearIcon="circle-with-cross"
        showLoadingIcon={this.state.loading}
        placeholder="Type game name to search"
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
      data={this.state.games}
      keyExtractor={item => item.objectid}
      renderItem={this._renderItem}
    />
  )

  enrich = async games => {
    let ids = games.map(g => g.objectid)
    const url = `https://www.boardgamegeek.com/xmlapi2/thing?id=${ids.join(
      ','
    )}&type=boardgame,boardgameexpansion`

    try {
      let response = await fetch(url)

      if (response.status == 200) {
        let xml = await response.text()
        let doc = parse(xml)

        let moreDataOnGames = doc.root.children.map(item => {
          let objectid = item.attributes.id
          let image = (item.children.find(e => e.name == 'image') || {}).content
          let thumbnail = (item.children.find(e => e.name == 'thumbnail') || {})
            .content
          let description = (
            item.children.find(e => e.name == 'description') || {}
          ).content

          return { objectid, image, thumbnail, description }
        })

        games = games.map(game => {
          return Object.assign(
            game,
            moreDataOnGames.find(g => g.objectid == game.objectid)
          )
        })

        this.setState({ games: games })
      }
    } catch (error) {
      console.log('ENRICH ERROR', error)
    }
  }

  searchBGG = async str => {
    if (str.length > 2) {
      this.setState({ loading: true, games: [] })

      const url = `https://bgg.cc/search/boardgame?q=${str}&showcount=20`

      let games = await fetchJSON(url)

      this.setState({ games: games.items, loading: false })
      this.enrich(games.items)
    }
  }
}
