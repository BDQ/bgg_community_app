import React from 'react'
import {
  TouchableOpacity,
  View,
  SectionList,
  PixelRatio,
  Text,
  RefreshControl
} from 'react-native'
import { SearchBar } from 'react-native-elements'
import Ionicons from 'react-native-vector-icons/Ionicons'
import sectionListGetItemLayout from 'react-native-section-list-get-item-layout'
import ProgressBar from 'react-native-progress/Circle'

import PreviewListCompany from './PreviewListCompany'
import PreviewListGame from './PreviewListGame'

import { priorities, halls } from '../shared/data'

const defaultFilters = {
  name: '',
  priorities: [],
  halls: []
  // priorities: priorities.map(priority => priority.id),
  // halls: halls.map(hall => hall.id)
}

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

const sortByName = (a, b) => sortByAttr(a, b, 'name')
const sortByLocation = (a, b) => sortByAttr(a, b, 'location')

const sortByAttr = (a, b, attr) => {
  if (a[attr] < b[attr]) {
    return -1
  }
  if (a[attr] > b[attr]) {
    return 1
  }

  // names must be equal
  return 0
}

const buildSections = (games, companies, userSelections, filters, sortBy) => {
  if (games.length === 0 || companies.length === 0) {
    //data's not loaded yet, so render empty
    return { sections: [], gameCount: 0, missingCompanies: false }
  }

  const filteredGames = [...applyGameFilters(filters, games)]

  const gameCount = filteredGames.length
  // build array of companies, followed by their games
  let sections = companies.sort(sortByName).map(company => {
    let companyGames = []

    // some records can have not previewItems
    if (company.previewItemIds) {
      companyGames = company.previewItemIds.map(itemId => {
        const gameIndex = filteredGames.findIndex(g => g.itemId === itemId)

        if (gameIndex > -1) {
          const [game] = filteredGames.splice(gameIndex, 1)

          if (game) {
            game.userSelection = userSelections[itemId]
            game.location = company.location
          }

          return game
        }
      })
    }

    return {
      ...company,
      data: companyGames.sort(sortByName).filter(g => g)
    }
  })

  if (sortBy === 'locationPublisherGame') {
    sections = sections.sort(sortByLocation)
  }

  // if we have any games less means we're missing a company
  // and we should force a company reload (elsewhere)
  const missingCompanies = filteredGames.length > 0

  sections = sections.filter(section => section.data.length > 0)
  return { sections, gameCount, missingCompanies }
}

export default class PreviewList extends React.PureComponent {
  state = {
    filtersSet: false,
    filters: defaultFilters,
    sortBy: 'publisherGame',
    sections: [],
    missingCompanies: false
  }

  static getDerivedStateFromProps(props, state) {
    const { games, companies, userSelections } = props
    if (!games) {
      return { sections: [], gameCount: 0 }
    }

    const { sections, gameCount, missingCompanies } = buildSections(
      games,
      companies,
      userSelections,
      state.filters,
      state.sortBy
    )

    return { sections, gameCount, missingCompanies }
  }

  componentDidUpdate(_, prevState) {
    const { gameCount, missingCompanies } = this.state

    if (prevState.gameCount != gameCount) {
      this.props.navigation.setParams({ gameCount: gameCount })
    }

    if (missingCompanies && prevState.missingCompanies != missingCompanies) {
      console.log(
        `Missing ${missingCompanies} companies, forcing full load in ComponentDidUpdate`
      )
      this.props.forceCompanyFullLoad()
    }
  }

  handleFilterTextChange = str => {
    const { sortBy } = this.state
    this.setState({ filtersSet: true })
    let { filters } = this.state
    filters = { ...filters, name: str }

    this.persistFilterAndApply(filters, sortBy)
  }

  setFilters = (filterChanges, sortBy) => {
    const filters = { ...this.state.filters, ...filterChanges }
    this.persistFilterAndApply(filters, sortBy)
  }

  persistFilterAndApply = (filters, sortBy) => {
    const { games, companies, userSelections, loading } = this.props

    const { sections, gameCount, missingCompanies } = buildSections(
      games,
      companies,
      userSelections,
      filters,
      sortBy
    )

    if (missingCompanies > 0 && !loading) {
      console.log(`Missing ${missingCompanies} companies, forcing full load`)
      this.props.forceCompanyFullLoad()
    }

    this.props.navigation.setParams({ gameCount })
    this.setState({
      filtersSet: true,
      filters,
      sortBy,
      sections
    })
  }

  _renderHeader = () => {
    const { navigate } = this.props.navigation
    const { filters, sortBy } = this.state
    const { name } = filters

    return (
      <View style={{ flexDirection: 'row' }}>
        <View style={{ width: '90%' }}>
          <SearchBar
            onChangeText={this.handleFilterTextChange}
            value={name}
            onClearText={this.clearFilter}
            placeholder="Type here to filter..."
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
              navigate('Filter', {
                filters,
                sortBy,
                setFilters: this.setFilters,
                defaultFilters
              })
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
        setUserSelection={this.props.setUserSelection}
        navigation={this.props.navigation}
      />
    )
  }

  _renderEmpty = () => {
    const { filtersSet } = this.state

    if (filtersSet) {
      return (
        <React.Fragment>
          <Text>No matches found.</Text>
        </React.Fragment>
      )
    } else {
      return (
        <React.Fragment>
          <ProgressBar
            indeterminate={true}
            color="#000000"
            style={{ marginBottom: 10 }}
          />
          <Text>Loading Preview...</Text>
        </React.Fragment>
      )
    }
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
        style={{
          flex: 1
        }}
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
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
        stickySectionHeadersEnabled={false}
        getItemLayout={this.getItemLayout}
        initialNumToRender={15}
        ListEmptyComponent={() => (
          <View
            style={{
              height: 300,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {this._renderEmpty()}
          </View>
        )}
      />
    )
  }
}
