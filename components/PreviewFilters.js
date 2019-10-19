import React from 'reactn'
import PropTypes from 'prop-types'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { TagSelect } from 'react-native-tag-select'
import { Button } from 'react-native-elements'
import { Dropdown } from 'react-native-material-dropdown'

import styles from '../shared/styles'
import {
  priorities,
  halls,
  seen,
  availability,
  preorders
} from '../shared/data'

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
const filterTextOnOptions = [
  { label: 'Game Name', value: 'game' },
  {
    label: 'Publisher Name',
    value: 'publisher'
  },
  { label: 'Notes', value: 'note' }
]

export default class PreviewFilters extends React.Component {
  toggleTags = name => {
    const select = this[name]

    const value = select.props.data.reduce((ids, item) => {
      ids[item.id] = item.id
      return ids
    }, {})

    if (
      Object.values(select.state.value).length === Object.values(value).length
    ) {
      select.setState({ value: {} })
    } else {
      select.setState({ value })
    }
  }

  static navigationOptions = ({ navigation }) => {
    if (navigation.state.params)
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
    const { pop } = this.props.navigation

    const filterValues = {
      priorities: this.priorityTags.itemsSelected.map(
        priority => priority.id || priority
      ),
      halls: this.hallTags.itemsSelected.map(hall => hall.id || hall),
      seen: this.seenTags.itemsSelected.map(seen => seen.id || seen),
      availability: this.availabilityTags.itemsSelected.map(
        avail => avail.id || avail
      ),
      preorders: this.preorderTags.itemsSelected.map(t => t.id || t),
      filterTextOn: this.filterTextOnRef.value(),
      sortBy: this.sortByRef.value()
    }

    // update main filters
    this.dispatch.previewFiltersSet(filterValues)

    pop()
  }

  reset = () => {
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
    this.preorderTags.setState({
      value: []
    })

    this.filterTextOnRef.setState({ value: filterTextOnOptions[0].value })
    this.sortByRef.setState({ value: sortingOptions[0].value })
  }

  render = () => {
    const { previewFilters: filters } = this.global

    return (
      <ScrollView>
        <View style={styles.mainView}>
          <Text style={styles.formHeader}>Sorting</Text>
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
              itemCount={sortingOptions.length}
              ref={ref => {
                this.sortByRef = ref
              }}
              data={sortingOptions}
              value={filters.sortBy || ''} //use local state if set, otherwise global
              onChangeText={sortBy => this.setState({ sortBy })}
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
                itemCount={filterTextOnOptions.length}
                ref={ref => {
                  this.filterTextOnRef = ref
                }}
                data={filterTextOnOptions}
                value={filters.filterTextOn || ''} //use local state if set, otherwise global
                onChangeText={filterTextOn => this.setState({ filterTextOn })}
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
              <Button style={{ flex: 1 }} title="Reset" onPress={this.reset} />
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
    navigate: PropTypes.func.isRequired
  }).isRequired
}
