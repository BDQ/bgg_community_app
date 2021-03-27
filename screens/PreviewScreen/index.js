import React from 'reactn'
import PropTypes from 'prop-types'
import { createStackNavigator } from '@react-navigation/stack'
import { InteractionManager } from 'react-native'

import GameScreen from '../GameScreen'
import GameAddTo from '../GameAddTo'
import LogPlay from '../Plays/Log'
import PreviewFilters from '../../components/PreviewFilters'
import PreviewList from '../../components/PreviewList'
import PreviewEdit from '../../components/PreviewEdit'
import PreviewMap from '../../components/PreviewMap'

import { buildSections } from './sections'

import { PREVIEW_FULL_NAME } from 'react-native-dotenv'
import { points } from '../../shared/points'

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
    const { previewFetchedAt, previewFilters } = this.global

    let previewGames = [],
      previewCompanies = [],
      previewLoading = false

    if (previewFetchedAt > 0) {
      ; ({ previewGames, previewCompanies, previewLoading } = this.global)
    }

    const { sections, gameCount } = buildSections(
      previewFilters,
      previewGames,
      previewCompanies
    )

    // dumps parsed locations that aren't present
    // in the points data
    // if (previewCompanies.length > 0) {
    //   previewCompanies.forEach(c => {
    //     const pt = points[c.locationParsed]
    //     const miss = points[`${c.locationParsed}-missing`]

    //     if (!pt && c.locationParsed && !miss) {
    //       console.log(c.locationParsed)
    //     }
    //   })
    // }

    return (
      <PreviewList
        filters={previewFilters}
        sortBy={previewFilters.sortBy}
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

// export default createStackNavigator({
//   List: { screen: PreviewListScreen, headerBackTitle: 'Back' },
//   Game: { screen: GameScreen },
//   Filter: { screen: PreviewFilters },
//   AddTo: { screen: GameAddTo },
//   EditNotes: { screen: PreviewEdit },
//   Map: { screen: PreviewMap }
// })

const Stack = createStackNavigator()

export default () => (
  <Stack.Navigator>
    <Stack.Screen name="List" component={PreviewListScreen} />
    <Stack.Screen
      name="Game"
      component={GameScreen}
      options={({ route }) => ({ title: route.params.game.name })}
    />
    <Stack.Screen name="Filter" component={PreviewFilters} />
    <Stack.Screen name="AddTo" component={GameAddTo} />
    <Stack.Screen name="EditNotes" component={PreviewEdit} />
    <Stack.Screen name="Map" component={PreviewMap} />
    <Stack.Screen name="LogPlay" component={LogPlay} />
  </Stack.Navigator>
)
