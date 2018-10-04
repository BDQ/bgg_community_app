import React from 'react'
import { TouchableOpacity, View, SectionList, PixelRatio } from 'react-native'
import { SearchBar } from 'react-native-elements'
import Ionicons from 'react-native-vector-icons/Ionicons'
import sectionListGetItemLayout from 'react-native-section-list-get-item-layout'

import PreviewListCompany from './PreviewListCompany'
import PreviewListGame from './PreviewListGame'

import { priorities, halls } from '../shared/data'

const applyGameFilters = (filters, items) => {
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

const buildSections = (games, companies, userSelections, filters) => {
  games = applyGameFilters(filters, games)

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

  return { sections, gameCount: games.length }
}

export default class PreviewList extends React.PureComponent {
  state = {
    filtering: false,
    filters: {
      name: '',
      priorities: priorities.map(priority => priority.id),
      halls: halls.map(hall => hall.id)
    },
    sections: []
  }

  static getDerivedStateFromProps(props, state) {
    const { games, companies, userSelections } = props
    if (!games) {
      return { sections: [] }
    }

    const { sections } = buildSections(
      games,
      companies,
      userSelections,
      state.filters
    )
    return { sections }
  }

  handleFilterTextChange = str => {
    this.setState({ filtering: true })
    let { filters } = this.state
    filters = { ...filters, name: str }

    this.persistFilterAndApply(filters)
  }

  setFilters = filterChanges => {
    const filters = { ...this.state.filters, ...filterChanges }
    this.persistFilterAndApply(filters)
  }

  persistFilterAndApply = filters => {
    const { games, companies, userSelections } = this.props
    const { sections, gameCount } = buildSections(
      games,
      companies,
      userSelections,
      filters
    )

    this.props.navigation.setParams({ gameCount })
    this.setState({
      filtering: false,
      filters,
      sections
    })
  }

  _renderHeader = () => {
    const { navigate } = this.props.navigation
    const { filters, filtering } = this.state
    const { name } = filters

    return (
      <View style={{ flexDirection: 'row' }}>
        <View style={{ width: '90%' }}>
          <SearchBar
            onChangeText={this.handleFilterTextChange}
            value={name}
            onClearText={this.clearFilter}
            placeholder="Type here to filter..."
            showLoadingIcon={filtering}
            clearIcon
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
    const { loading, onRefresh } = this.props
    const { sections } = this.state

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
