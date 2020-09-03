import React from 'react'
import { View } from 'react-native'
import { AnimatedCircularProgress } from 'react-native-circular-progress'

import globalStyles from '../shared/styles'

const Spinner = ({ children }) => {
  return (
    <View style={globalStyles.emptyView}>
      <AnimatedCircularProgress
        size={60}
        width={2}
        duration={5000}
        fill={100}
        tintColor="#3d5875"
        backgroundColor="#ccc"
        style={{ marginBottom: 10 }}
      />
      {children}
    </View>
  )
}

export default Spinner
