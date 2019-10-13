import React from 'reactn'
import PropTypes from 'prop-types'
import { createStackNavigator } from 'react-navigation-stack'
import { InteractionManager } from 'react-native'

import GameScreen from '../GameScreen'
import GameAddTo from '../GameAddTo'
import PreviewFilters from '../../components/PreviewFilters'
import PreviewList from '../../components/PreviewList'
import PreviewEdit from '../../components/PreviewEdit'
import PreviewMap from '../../components/PreviewMap'

import { buildSections } from './sections'

import { PREVIEW_FULL_NAME } from 'react-native-dotenv'

class PreviewListScreen extends React.Component {
  state = {
    userSelections: []
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title: `${PREVIEW_FULL_NAME} (${navigation.getParam('gameCount', '0')})`
    }
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.dispatch.loadPreview()
    })
  }

  reload = () => {
    if (!this.global.previewLoading) this.dispatch.loadPreview(true)
  }

  render = () => {
    const { navigation } = this.props
    const { previewFetchedAt, previewFiltersDefault } = this.global

    let previewGames = [],
      previewCompanies = [],
      previewLoading = false,
      previewSortBy = 'publisherGame',
      previewFilters

    if (previewFetchedAt > 0) {
      ;({
        previewGames,
        previewCompanies,
        previewLoading,
        previewSortBy,
        previewFilters
      } = this.global)
    }

    const { sections, gameCount } = buildSections(
      previewFilters,
      previewSortBy,
      previewGames,
      previewCompanies
    )

    return (
      <PreviewList
        filters={previewFilters || previewFiltersDefault}
        sortBy={previewSortBy}
        sections={sections}
        gameCount={gameCount}
        navigation={navigation}
        loading={previewLoading}
        firstLoad={previewFetchedAt === 0 ? 'ever' : 'complete'}
        onRefresh={this.reload}
        forceCompanyFullLoad={this.forceCompanyFullLoad}
      />
    )
  }
}

PreviewListScreen.propTypes = {
  navigation: PropTypes.shape({
    state: PropTypes.shape({
      params: PropTypes.shape({
        reload: PropTypes.func,
        next: PropTypes.func
      })
    }),
    navigate: PropTypes.func.isRequired,
    setParams: PropTypes.func.isRequired
  }).isRequired
}

export default createStackNavigator({
  List: { screen: PreviewListScreen, headerBackTitle: 'Back' },
  Game: { screen: GameScreen },
  Filter: { screen: PreviewFilters },
  AddTo: { screen: GameAddTo },
  EditNotes: { screen: PreviewEdit },
  Map: { screen: PreviewMap }
})
