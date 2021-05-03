import React from 'react'
import PropTypes from 'prop-types'
import { FlatList, TouchableOpacity, View, Text } from 'react-native'
import { SearchBar } from 'react-native-elements'
import styleconstants from '../shared/styles/styleconstants'
import GameListItem from './GameListItem'
import GameListItemHorizontal from './GameListItemHorizontal'

import styles from '../shared/styles'

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
    if (props.games.map(g => g.objectId) !== state.games.map(g => g.objectId)) {
      return {
        games: applyFilter(state.filterString, props.games)
      }
    } else {
      return null
    }
  }

  keyExtractor = item => item.key || item.objectId

  getItemLayout = (_, index) => {
    const itemHeight = 100
    return {
      length: itemHeight,
      offset: itemHeight * index,
      index
    }
  }

  _renderItem = ({ item }) => {
    const { navigate } = this.props.navigation

    return (
      <TouchableOpacity
        onPress={() => {
          navigate('GameStack', { screen: 'Game', params: { game: item } })
        }}
      >
        <GameListItem
          name={item.name}
          thumbnail={item.thumbnail}
          subtitle={item.subtitle}
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

  goToSearch = () => this.props.navigation.navigate('GameStack', { screen: 'Search' })

  clearFilter = () => this.filter('')

  _renderEmpty = () => {
    if (this.state.filterString !== '') {
      return (
        <View style={styles.emptyView}>
          <View style={{ flexDirection: 'row' }}>
            <Text>No matches, </Text>
            <Text style={styles.link} onPress={this.clearFilter}>
              clear search
            </Text>
            <Text>.</Text>
          </View>
        </View>
      )
    } else {
      if (this.props.isSelf) {
        return (
          <View style={styles.emptyView}>
            <View style={{ flexDirection: 'row' }}>
              <Text>Your {this.props.listName} is empty, why not </Text>
              <Text style={styles.link} onPress={this.goToSearch}>
                add one
              </Text>
              <Text>?</Text>
            </View>
          </View>
        )
      } else {
        return (
          <View style={styles.emptyView}>
            <View style={{ flexDirection: 'row' }}>
              <Text>This list is empty</Text>
            </View>
          </View>
        )
      }

    }
  }

  _renderHeader = () => {
    return (
      <SearchBar
        onChangeText={this.filter}
        onClearText={this.clearFilter}
        placeholder="Type here to filter..."
        value={this.state.filterString}
        containerStyle={{ backgroundColor: styleconstants.bggpurple }}
        inputContainerStyle={{ backgroundColor: 'white' }}
      // showLoadingIcon={true}
      />
    )
  }

  render() {
    return (
      <FlatList
        ListHeaderComponent={this._renderHeader}
        ListEmptyComponent={this._renderEmpty}
        data={this.state.games}
        keyExtractor={this.keyExtractor}
        renderItem={this._renderItem}
        onRefresh={this.props.onRefresh}
        refreshing={this.props.refreshing}
        getItemLayout={this.getItemLayout}
        initialNumToRender={8}
        maxToRenderPerBatch={2}
      />
    )
  }
}

GameList.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired
  }).isRequired,
  games: PropTypes.array.isRequired,
  listName: PropTypes.string.isRequired,
  refreshing: PropTypes.bool,
  onRefresh: PropTypes.func.isRequired
}
