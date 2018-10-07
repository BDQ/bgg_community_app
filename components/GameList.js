import React from 'react'
import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import { SearchBar, Button } from 'react-native-elements'
import GameListItem from './GameListItem'

const applyFilter = (str, items) => {
  let re = new RegExp(str, 'gi')
  let x = items.filter(item => item.name.match(re))

  console.log(x.length)
  return x
}

export default class GameList extends React.PureComponent {
  state = {
    games: [],
    filterString: ''
  }

  constructor(props) {
    super(props)
    this.state = { games: props.games }
  }

  // static getDerivedStateFromProps(props, state) {
  //   return { items: applyFilter(state.filterString, props.items) }
  // }

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
    const { loading, fetchCollection } = this.props

    return (
      <FlatList
        ListHeaderComponent={this._renderHeader}
        data={this.state.games}
        keyExtractor={item => item.key || item.objectid}
        renderItem={this._renderItem}
        onRefresh={() => fetchCollection('briandquinn', true)}
        refreshing={false}
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
