import React from 'react'
import { View, Text, ScrollView, TextInput } from 'react-native'
import { Button } from 'react-native-elements'

import styles from '../shared/styles'

export default class PreviewEdit extends React.Component {
  state = {
    text: this.props.route.params.notes.text || ''
  }

  handleSave = () => {
    const { pop } = this.props.navigation
    const {
      notes: oldNotes,
      persistUserSelection
    } = this.props.route.params

    const notes = Object.assign({}, oldNotes, { text: this.state.text })

    persistUserSelection({ notes })
    pop()
  }

  render = () => {
    const { pop } = this.props.navigation
    return (
      <ScrollView>
        <View style={styles.mainView}>
          <Text style={styles.formLabel}>Notes</Text>

          <TextInput
            style={{
              width: '100%',
              height: 120,
              borderColor: 'gray',
              borderWidth: 1,
              padding: 5
            }}
            multiline={true}
            onChangeText={text => this.setState({ text })}
            value={this.state.text}
          />

          <View style={styles.formButtons}>
            <Button
              style={{ flex: 1, marginRight: 10 }}
              backgroundColor="#03A9F4"
              title="Save"
              onPress={this.handleSave}
            />
            <Button style={{ flex: 1 }} title="Cancel" onPress={() => pop()} />
          </View>
        </View>
      </ScrollView>
    )
  }
}
