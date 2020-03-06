import React, { useState, Text } from 'react-native'
import { Button } from 'react-native-elements'

const GamePlay = () => {
  const [count, setCount] = useState(0)

  return (
    <ScrollView>
      <View style={styles.itemContainer}>
        <Text>You clicked {count} times</Text>
        <Button onClick={() => setCount(count + 1)}>Click me</Button>
      </View>
    </ScrollView>
  )
}
