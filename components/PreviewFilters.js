import React from 'react'
import PropTypes from 'prop-types'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { TagSelect } from 'react-native-tag-select'
import { Button } from 'react-native-elements'
import RadioForm from 'react-native-simple-radio-button'
import { Dropdown } from 'react-native-material-dropdown'

import styles from '../shared/styles'
import {
  priorities,
  halls,
  seen,
  availability,
  preorders
} from '../shared/data'

export default class PreviewFilters extends React.Component {
  state = {
    filters: this.props.navigation.state.params.filters,
    sortBy: this.props.navigation.state.params.sortBy
  }

  toggleTags = name => {
    const select = this[name]

    const value = select.props.data.reduce((ids, item) => {
      ids[item.id] = item.id
      return ids
    }, {})

    if (select.state.value.length === 0) {
      select.setState({ value })
    } else {
      select.setState({ value: [] })
    }
  }

  setFilterTextOn = filterTextOn => {
    this.setState({
      filters: {
        ...this.state.filters,
        filterTextOn
      }
    })
  }

  // static getDerivedStateFromProps(props, state) {
  //   logger(props)
  //   const { filters, sortBy } = props.navigation.state.params
  //   logger('here')
  //   if (filters !== state.filters || sortBy !== state.sortBy) {
  //     return { filters, sortBy }
  //   } else {
  //     return null
  //   }
  // }

  static navigationOptions = ({ navigation }) => {
    return {
      headerRight: (
        <Button
          onPress={navigation.state.params.applyFilters}
          title="Apply"
          buttonStyle={{
            marginRight: 10,
            backgroundColor: '#03A9F4'
          }}
        />
      )
    }
  }

  componentDidMount() {
    this.props.navigation.setParams({
      applyFilters: this.applyFilters
    })
  }

  applyFilters = () => {
    const { setFilters } = this.props.navigation.state.params
    const { pop } = this.props.navigation

    setFilters(
      {
        priorities: this.priorityTags.itemsSelected.map(
          priority => priority.id || priority
        ),
        halls: this.hallTags.itemsSelected.map(hall => hall.id || hall),
        seen: this.seenTags.itemsSelected.map(seen => seen.id || seen),
        availability: this.availabilityTags.itemsSelected.map(
          avail => avail.id || avail
        ),
        preorders: this.preorderTags.itemsSelected.map(t => t.id || t),
        filterTextOn: this.state.filters.filterTextOn
      },
      this.state.sortBy
    )

    pop()
  }

  render = () => {
    const { filters, sortBy } = this.state
    const { filterTextOn } = filters
    const { defaultFilters } = this.props.navigation.state.params

    const sortingOptions = [
      {
        label: 'Publisher, Game',
        value: 'publisherGame'
      },
      {
        label: 'Location, Publisher, Game',
        value: 'locationPublisherGame'
      }
    ]

    const sortIndex = sortingOptions.findIndex(
      sortOpt => sortOpt.value === sortBy
    )

    const filterTextOnOptions = [
      { label: 'Game Name', value: 'game' },
      {
        label: 'Publisher Name',
        value: 'publisher'
      },
      { label: 'Notes', value: 'note' }
    ]

    return (
      <ScrollView>
        <View style={styles.mainView}>
          <Text style={styles.formHeader}>Sorting</Text>
          <View style={{ padding: 5 }}>
            <RadioForm
              radio_props={sortingOptions}
              initial={sortIndex}
              onPress={value => this.setState({ sortBy: value })}
            />
          </View>
          <Text style={styles.formHeader}>Filters</Text>
          <View style={{ padding: 5 }}>
            <Text style={styles.formLabel}>Text Filter on:</Text>
            <View
              style={{
                marginLeft: 5,
                marginBottom: 15
              }}
            >
              <Dropdown
                dropdownOffset={{
                  top: 8,
                  left: 0
                }}
                itemCount={3}
                data={filterTextOnOptions}
                value={filterTextOn}
                onChangeText={this.setFilterTextOn}
              />
            </View>

            <TouchableOpacity
              style={styles.formLabelRow}
              onPress={() => this.toggleTags('priorityTags')}
            >
              <Text style={styles.formLabel}>Priority</Text>
              <Text style={styles.toggleText}>(Toggle All)</Text>
            </TouchableOpacity>

            <View
              style={{
                marginLeft: 5,
                marginBottom: 15
              }}
            >
              <TagSelect
                labelAttr="name"
                value={filters.priorities}
                ref={tag => {
                  this.priorityTags = tag
                }}
                data={priorities}
                theme="info"
              />
            </View>

            <View style={{ display: 'block' }}>
              <TouchableOpacity
                style={styles.formLabelRow}
                onPress={() => this.toggleTags('hallTags')}
              >
                <Text style={styles.formLabel}>Halls</Text>
                <Text style={styles.toggleText}>(Toggle All)</Text>
              </TouchableOpacity>

              <View
                style={{
                  marginLeft: 5,
                  marginBottom: 15
                }}
              >
                <TagSelect
                  labelAttr="name"
                  value={filters.halls}
                  ref={tag => {
                    this.hallTags = tag
                  }}
                  data={halls}
                  theme="info"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.formLabelRow}
              onPress={() => this.toggleTags('seenTags')}
            >
              <Text style={styles.formLabel}>Viewed</Text>
              <Text style={styles.toggleText}>(Toggle All)</Text>
            </TouchableOpacity>

            <View
              style={{
                marginLeft: 5,
                marginBottom: 15
              }}
            >
              <TagSelect
                labelAttr="name"
                value={filters.seen}
                ref={tag => {
                  this.seenTags = tag
                }}
                data={seen}
                theme="info"
              />
            </View>

            <TouchableOpacity
              style={styles.formLabelRow}
              onPress={() => this.toggleTags('availabilityTags')}
            >
              <Text style={styles.formLabel}>Availability</Text>
              <Text style={styles.toggleText}>(Toggle All)</Text>
            </TouchableOpacity>

            <View style={{ marginLeft: 5 }}>
              <TagSelect
                labelAttr="name"
                value={filters.availability}
                ref={tag => {
                  this.availabilityTags = tag
                }}
                data={availability}
                theme="info"
              />
            </View>

            <TouchableOpacity
              style={styles.formLabelRow}
              onPress={() => this.toggleTags('preorderTags')}
            >
              <Text style={styles.formLabel}>Preordered</Text>
            </TouchableOpacity>

            <View style={{ marginLeft: 5 }}>
              <TagSelect
                labelAttr="name"
                value={filters.preorders}
                ref={tag => {
                  this.preorderTags = tag
                }}
                data={preorders}
                theme="info"
              />
            </View>

            <View style={styles.formButtons}>
              <Button
                style={{ flex: 1 }}
                backgroundColor="#03A9F4"
                title="Apply Filters"
                onPress={this.applyFilters}
                containerStyle={{
                  marginHorizontal: 10
                }}
              />
              <Button
                style={{ flex: 1 }}
                title="Reset"
                onPress={() => {
                  this.setState({
                    filters: defaultFilters
                  })

                  this.priorityTags.setState({
                    value: []
                  })
                  this.hallTags.setState({
                    value: []
                  })
                  this.seenTags.setState({
                    value: []
                  })
                  this.availabilityTags.setState({
                    value: []
                  })
                }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    )
  }
}

PreviewFilters.propTypes = {
  navigation: PropTypes.shape({
    pop: PropTypes.func.isRequired,
    setParams: PropTypes.func.isRequired,
    navigate: PropTypes.func.isRequired,
    state: PropTypes.shape({
      params: PropTypes.shape({
        filters: PropTypes.object.isRequired,
        sortBy: PropTypes.string.isRequired,
        setFilters: PropTypes.func.isRequired,
        defaultFilters: PropTypes.object.isRequired
      })
    }).isRequired
  }).isRequired
}
