import React from 'reactn'
import {
  View,
  SectionList,
  Text,
  RefreshControl,
  StyleSheet
} from 'react-native'
import { SearchBar, Icon } from 'react-native-elements'
import ProgressBar from 'react-native-progress/Circle'

import PreviewListCompany from './PreviewListCompany'
import PreviewListGame from './PreviewListGame'

import sharedStyles from '../shared/styles'

import { PREVIEW_MAP } from 'react-native-dotenv'

export default class PreviewList extends React.PureComponent {
  componentDidUpdate(prevProps) {
    const { gameCount } = this.props
    if (prevProps.gameCount != gameCount) {
      this.props.navigation.setParams({ gameCount: gameCount })
    }
  }

  handleFilterTextChange = str => this.dispatch.previewFiltersSet({ name: str })

  _renderHeader = () => {
    const { navigate } = this.props.navigation
    const { sections } = this.props
    const { name, filterTextOn } = this.props.filters
    const mapDisabled = sections.length > 200

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
        {this._renderSearchIcons()}
      </View>
    )
  }

  _renderSearchIcons = () => {
    const { navigate } = this.props.navigation
    if (PREVIEW_MAP === 'yes') {
      return (
        <View style={styles.searchIcons}>
          <Icon
            name="ios-funnel"
            color="#ffffff"
            iconStyle={styles.icon}
            containerStyle={styles.icon}
            type="ionicon"
            size={24}
            onPress={() => navigate('Filter')}
          />
          <Icon
            name="map"
            iconStyle={styles.icon}
            type="entypo"
            color={mapDisabled ? '#333333' : '#ffffff'}
            size={24}
            disabledStyle={styles.icon}
            containerStyle={[{ marginLeft: 12 }, styles.icon]}
            disabled={mapDisabled}
            onPress={() => navigate('Map', { companies: sections })}
          />
        </View>
      )
    } else {
      return (
        <View style={styles.searchIcons}>
          <Icon
            name="ios-funnel"
            color="#ffffff"
            iconStyle={styles.icon}
            containerStyle={styles.icon}
            type="ionicon"
            size={24}
            onPress={() => navigate('Filter')}
          />
        </View>
      )
    }
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
                  publisherId={section.publisherId}
                  thumbnail={section.thumbnail}
                  location={section.location}
                  locationParsed={section.locationParsed}
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
    width: PREVIEW_MAP === 'yes' ? '83%' : '92%'
  },
  searchIcons: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: PREVIEW_MAP === 'yes' ? '17%' : '8%',
    backgroundColor: '#393e42',
    flex: 1,
    flexDirection: 'row',
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    paddingTop: 17
  },
  icon: {
    backgroundColor: '#393e42'
  }
})
