import React from 'react'
import { TouchableOpacity, View, SectionList, PixelRatio } from 'react-native'
import { SearchBar } from 'react-native-elements'
import Ionicons from 'react-native-vector-icons/Ionicons'
import sectionListGetItemLayout from 'react-native-section-list-get-item-layout'

import PreviewListCompany from './PreviewListCompany'
import PreviewListGame from './PreviewListGame'

import { priorities, halls } from '../shared/data'

const applyFilter = (filters, items) => {
  let filteredItems = items

  // name
  if (filters.name !== '') {
    let nameRE = new RegExp(filters.name, 'gi')
    filteredItems = filteredItems.filter(item => item.name.match(nameRE))
  }

  // priorities
  if (
    filters.priorities.length > 0 &&
    filters.priorities.length < priorities.length
  ) {
    filteredItems = filteredItems.filter(item => {
      // zero === unprioritized
      const { priority } = item.userSelection || { priority: -1 }
      return filters.priorities.includes(priority)
    })
  }

  // halls
  if (filters.halls.length > 0 && filters.halls.length < halls.length) {
    let locationRE = new RegExp(`^[${filters.halls.join('')}]-.*`, 'gi')
    filteredItems = filteredItems.filter(
      item => item.location && item.location.match(locationRE)
    )
  }

  return filteredItems
}

const sortByName = (a, b) => {
  if (a.name < b.name) {
    return -1
  }
  if (a.name > b.name) {
    return 1
  }

  // names must be equal
  return 0
}

export default class PreviewList extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      filters: {
        name: '',
        priorities: priorities.map(priority => priority.id),
        halls: halls.map(hall => hall.id)
      },
      games: props.games,
      companies: props.companies.sort(sortByName)
    }
  }

  static getDerivedStateFromProps(props, state) {
    return {
      games: applyFilter(state.filters, props.games),
      companies: props.companies.sort(sortByName)
    }
  }

  filter = str => {
    let { filters } = this.state
    filters = { ...filters, name: str }

    this.setState({
      filters,
      games: applyFilter(filters, this.props.games)
    })
  }

  clearFilter = () => {
    this.setState({ games: applyFilter(this.state.filters, this.props.games) })
  }

  setFilters = filterChanges => {
    const filters = { ...this.state.filters, ...filterChanges }

    const games = applyFilter(filters, this.props.games)
    this.setState({ filters, games })

    this.props.navigation.setParams({ gameCount: games.length })
  }

  _renderHeader = () => {
    const { navigate } = this.props.navigation
    const { filters } = this.state
    const { name } = filters

    return (
      <View style={{ flexDirection: 'row' }}>
        <View style={{ width: '90%' }}>
          <SearchBar
            onChangeText={this.filter}
            value={name}
            onClearText={this.clearFilter}
            placeholder="Type here to filter..."
          />
        </View>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            width: '10%',
            backgroundColor: '#393e42'
          }}
        >
          <TouchableOpacity
            style={{ backgroundColor: '#393e42' }}
            onPress={() =>
              navigate('Filter', { filters, setFilters: this.setFilters })
            }
          >
            <Ionicons
              name="ios-funnel"
              size={26}
              style={{ color: '#ffffff' }}
            />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  _renderItem = ({ item }) => {
    return (
      <PreviewListGame
        {...item}
        game={item}
        navigation={this.props.navigation}
      />
    )
  }

  getItemLayout = sectionListGetItemLayout({
    // The height of the row with rowData at the given sectionIndex and rowIndex
    // args can include: (sectionIndex, rowIndex, rowData)
    getItemHeight: rowData => (rowData.objecttype === 'thing' ? 100 : 55),

    // These three properties are optional
    getSeparatorHeight: () => 1 / PixelRatio.get(), // The height of your separators
    getSectionHeaderHeight: () => 56, // The height of your section headers
    getSectionFooterHeight: () => 0 // The height of your section footers
  })

  render() {
    const { loading, userSelections, onRefresh } = this.props
    const { companies, games } = this.state

    // build array of companies, followed by their games
    let sections = companies.sort(sortByName).map(company => {
      const companyGames = company.previewItemIds.map(itemId => {
        let game = games.find(g => g.itemId === itemId)

        if (game) {
          game.userSelection = userSelections[itemId]
          game.location = company.location
        }

        return game
      })
      return {
        ...company,
        data: companyGames.sort(sortByName).filter(g => g)
      }
    })

    sections = sections.filter(section => section.data.length > 0)

    return (
      <SectionList
        ListHeaderComponent={this._renderHeader}
        renderSectionHeader={({ section }) => {
          return (
            <PreviewListCompany
              name={section.name}
              thumbnail={section.thumbnail}
              location={section.location}
            />
          )
        }}
        sections={sections}
        keyExtractor={item => item.key || item.objectid}
        renderItem={this._renderItem}
        onRefresh={onRefresh}
        refreshing={loading}
        stickySectionHeadersEnabled={false}
        getItemLayout={this.getItemLayout}
        initialNumToRender={15}
      />
    )
  }
}
