import React, { useState, useDispatch } from 'reactn'
import { View, Text, ScrollView, TextInput } from 'react-native'
import { Button } from 'react-native-elements'
import { navigationType } from '../shared/propTypes'
import styles from '../shared/styles'

const PreviewEdit = ({ navigation, route }) => {
  const [notes, setNotes] = useState(route.params?.notes || '')

  const { pop } = navigation

  const saveNotes = useDispatch('savePreviewNotes')

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
            padding: 5,
          }}
          multiline={true}
          onChangeText={(text) => setNotes(text)}
          value={notes}
        />

        <View style={styles.formButtons}>
          <Button
            style={{ flex: 1, marginRight: 10 }}
            backgroundColor="#03A9F4"
            title="Save"
            onPress={() => {
              saveNotes(route.params.itemId, notes)
              pop()
            }}
          />
          <Button style={{ flex: 1 }} title="Cancel" onPress={() => pop()} />
        </View>
      </View>
    </ScrollView>
  )
}

PreviewEdit.propTypes = {
  ...navigationType,
}

export default PreviewEdit
