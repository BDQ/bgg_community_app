import React from 'reactn'
import {
  TouchableOpacity,
  View,
  SectionList,
  Text,
  RefreshControl,
  StyleSheet
} from 'react-native'
import { SearchBar } from 'react-native-elements'
import Ionicons from 'react-native-vector-icons/Ionicons'
import ProgressBar from 'react-native-progress/Circle'

import PreviewListCompany from './PreviewListCompany'
import PreviewListGame from './PreviewListGame'

import sharedStyles from '../shared/styles'

export default class PreviewList extends React.PureComponent {
  componentDidUpdate(prevProps) {
    const { gameCount } = this.props
    if (prevProps.gameCount != gameCount) {
      this.props.navigation.setParams({ gameCount: gameCount })
    }
  }

  handleFilterTextChange = str => this.dispatch.previewSetFilterName(str)

  _renderHeader = () => {
    const { navigate } = this.props.navigation
    const { name, filterTextOn } = this.props.filters

    return (
      <View style={{ flexDirection: 'row' }}>
        <View style={styles.searchMain}>
          <SearchBar
            onChangeText={this.handleFilterTextChange}
            value={name}
            onClearText={this.clearFilter}
            placeholder={`Filter on: ${filterTextOn}`}
            clearIcon
          />
        </View>
        <View style={styles.searchIcons}>
          <TouchableOpacity onPress={() => navigate('Filter')}>
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
        navigation={this.props.navigation}
      />
    )
  }

  _renderEmpty = () => {
    const { previewFiltersSet, firstLoad } = this.props

    if (firstLoad !== 'complete') {
      return <React.Fragment />
    } else if (previewFiltersSet) {
      return (
        <React.Fragment>
          <Text>No matches found.</Text>
        </React.Fragment>
      )
    }
  }

  _renderFirstLoadMessage = () => {
    const { firstLoad } = this.props

    if (firstLoad === 'ever') {
      return (
        <View style={{ alignItems: 'center' }}>
          <Text style={sharedStyles.formHeader}>Importing preview</Text>
          <Text>This can take a while the first time, grab a rule book!</Text>
        </View>
      )
    } else {
      return <Text style={sharedStyles.formHeader}>Updating preview...</Text>
    }
  }

  render() {
    const { loading, onRefresh, firstLoad, navigation, sections } = this.props

    if (firstLoad === 'complete') {
      return (
        <React.Fragment>
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
                  games={section.games}
                  navigation={navigation}
                />
              )
            }}
            sections={sections}
            keyExtractor={item => item.key || item.objectId}
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
        </React.Fragment>
      )
    } else {
      return (
        <View style={sharedStyles.emptyView}>
          <ProgressBar
            indeterminate={true}
            color="#000000"
            style={{ marginBottom: 10 }}
          />
          {this._renderFirstLoadMessage()}
        </View>
      )
    }
  }
}

const styles = StyleSheet.create({
  searchMain: {
    width: '92%'
  },
  searchIcons: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '8%',
    backgroundColor: '#393e42',
    borderBottomColor: 'black',
    borderBottomWidth: 1
  }
})
