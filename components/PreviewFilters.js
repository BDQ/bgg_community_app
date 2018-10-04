import React from 'react'
import { View, Text, Picker } from 'react-native'
import { TagSelect } from 'react-native-tag-select'
import { FormLabel, FormInput, Button } from 'react-native-elements'

import styles from '../shared/styles'
import { priorities, halls } from '../shared/data'

export default class PreviewFilters extends React.Component {
  render = () => {
    const { pop } = this.props.navigation
    const { filters, setFilters } = this.props.navigation.state.params

    return (
      <View style={styles.mainView}>
        <Text style={styles.formLabel}>Priority</Text>
        <TagSelect
          labelAttr="name"
          value={filters.priorities}
          ref={tag => {
            this.priorityTags = tag
          }}
          data={priorities}
          theme="info"
        />

        <Text style={styles.formLabel}>Halls</Text>
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
