import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { TagSelect } from 'react-native-tag-select'
import { Button } from 'react-native-elements'

import styles from '../shared/styles'
import { priorities, halls } from '../shared/data'

export default class PreviewFilters extends React.Component {
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
  render = () => {
    const { pop } = this.props.navigation
    const { filters, setFilters } = this.props.navigation.state.params

    return (
      <View style={styles.mainView}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingBottom: 8
          }}
          onPress={() => this.toggleTags('priorityTags')}
        >
          <Text style={styles.formLabel}>Priority</Text>
          <Text style={styles.toggleText}>(Toggle All)</Text>
        </TouchableOpacity>

        <TagSelect
          labelAttr="name"
          value={filters.priorities}
          ref={tag => {
            this.priorityTags = tag
          }}
          data={priorities}
          theme="info"
        />

        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingBottom: 8
          }}
          onPress={() => this.toggleTags('hallTags')}
        >
          <Text style={styles.formLabel}>Halls</Text>
          <Text style={styles.toggleText}>(Toggle All)</Text>
        </TouchableOpacity>

        <TagSelect
          labelAttr="name"
          value={filters.halls}
          ref={tag => {
            this.hallTags = tag
          }}
          data={halls}
          theme="info"
        />

        <Button
          style={{ marginTop: 30 }}
          title="Apply Filters"
          onPress={() => {
            setFilters({
              priorities: this.priorityTags.itemsSelected.map(
                priority => priority.id || priority
              ),
              halls: this.hallTags.itemsSelected.map(hall => hall.id || hall)
            })

            pop()
          }}
        />
      </View>
    )
  }
}
