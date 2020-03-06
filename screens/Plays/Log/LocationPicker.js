import React, { useState } from 'react'
import { useAsync } from 'react-async'

import SearchableDropdown from 'react-native-searchable-dropdown'

import styles from '../../../shared/styles'
import { asyncFetch } from '../../../shared/HTTP'

export default ({ setLocation }) => {
  const { data, error, loading } = useAsync(asyncFetch, {
    path: '/geekplay.php?action=locations&ajax=1'
  })

  const [selected, setSelected] = useState()

  const locations = data
    ? data.locations.map((loc, i) => ({
        id: 1,
        name: loc.location
      }))
    : []

  const selectedItems = selected ? [selected] : []

  return (
    <SearchableDropdown
      selectedItems={selectedItems}
      onItemSelect={item => {
        setSelected(item) // local state
        setLocation(item.name) // tell parent component
      }}
      itemStyle={{
        padding: 10,
        marginTop: 2,
        backgroundColor: '#ddd',
        borderColor: '#bbb',
        borderWidth: 1,
        borderRadius: 1
      }}
      // itemTextStyle={{ color: '#222' }}
      itemsContainerStyle={{ maxHeight: 140 }}
      items={loading ? [] : locations}
      textInputProps={{
        placeholder: '',
        style: {
          ...styles.textInput
        },
        onTextChange: text => setLocation(text)
      }}
      listProps={{
        nestedScrollEnabled: true
      }}
    />
  )
}
