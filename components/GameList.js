import React from 'react'
import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import { SearchBar, Button } from 'react-native-elements'
import GameListItem from './GameListItem'

const applyFilter = (str, items) => {
  let re = new RegExp(str, 'gi')
  return items.filter(item => item.name.match(re))
}

export default class GameList extends React.PureComponent {
  state = {
    games: [],
    loading: false,
    filterString: ''
  }

  static getDerivedStateFromProps(props, state) {
    console.log(
      props.games.map(g => g.objectId) !== state.games.map(g => g.objectId),
      props.games.map(g => g.objectId),
      state.games.map(g => g.objectId)
    )

    if (props.games.map(g => g.objectId) !== state.games.map(g => g.objectId)) {
      return { games: applyFilter(state.filterString, props.games) }
    } else {
      return null
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

  filter = str => {
    this.setState({
      filterString: str,
      games: applyFilter(str, this.props.games)
    })
  }

  clearFilter = () => {
    this.setState({ items: this.props.games })
  }

  handleRefresh = async () => {
    this.setState({ loading: true })
    let games = await this.props.onRefresh()

    this.setState({ loading: false, games })
  }

  _renderHeader = () => {
    const { loading } = this.props
    return (
      <SearchBar
        onChangeText={this.filter}
        onClearText={this.clearFilter}
        placeholder="Type here to filter..."
        showLoadingIcon={loading}
      />
    )
  }

  render() {
    // console.log('GameList render', this.state.games.length)

    return (
      <FlatList
        ListHeaderComponent={this._renderHeader}
        data={this.state.games}
        keyExtractor={item => item.key || item.objectId || item.objectid}
        renderItem={this._renderItem}
        onRefresh={this.handleRefresh}
        refreshing={this.state.loading}
        getItemLayout={(data, index) => {
          const itemHeight = 100
          return {
            length: itemHeight,
            offset: itemHeight * index,
            index
          }
        }}
        initialNumToRender={15}
        removeClippedSubviews={true}
      />
    )
  }
}
