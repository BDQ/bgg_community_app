import React from 'react'
import PropTypes from 'prop-types'
import { createStackNavigator } from 'react-navigation'
import { AsyncStorage } from 'react-native'

import GameScreen from '../GameScreen'
import GameAddTo from '../GameAddTo'
import PreviewFilters from '../../components/PreviewFilters'
import PreviewList from '../../components/PreviewList'
import PreviewEdit from '../../components/PreviewEdit'
import PreviewMap from '../../components/PreviewMap'

import { PREVIEW_ID, PREVIEW_FULL_NAME } from 'react-native-dotenv'
import { fetchJSON } from '../../shared/HTTP'

class PreviewListScreen extends React.Component {
  state = {
    games: [],
    companies: [],
    userSelections: [],
    previewId: PREVIEW_ID,
    loading: false,
    firstLoad: 'ever'
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title: `${PREVIEW_FULL_NAME} (${navigation.getParam('gameCount', '0')})`
    }
  }

  componentDidMount() {
    this.loadAllData()
  }

  pageLimit = objectType => (objectType === 'thing' ? 10 : 50)

  buildItemURL = (pageId, objectType) => {
    if (objectType === 'thing') {
      return `https://api.geekdo.com/api/geekpreviewitems?nosession=1&pageid=${pageId}&previewid=${
        this.state.previewId
      }`
    } else if (objectType === 'company') {
      return `https://api.geekdo.com/api/geekpreviewparentitems?nosession=1&pageid=${pageId}&previewid=${
        this.state.previewId
      }`
    } else {
      console.warn(`Got unexpected objectType: '${objectType}'`)
    }
  }

  loadAllData = async () => {
    this.setState({ loading: true })

    // load user selections and companies first, as they are need
    // when we load companies so we can enrich using them
    await Promise.all([this.getUserItems(), this.getPreviewItems('company')])

    // get the games!
    await this.getPreviewItems('thing')

    this.setState({ loading: false, firstLoad: 'complete' })
  }

  // updates cached user priorities, so filtering will
  // show the correct data (after swipe to prioritize)
  //
  setUserSelection = (itemId, selection) => {
    let { userSelections } = this.state

    if (userSelections) {
      if (userSelections[itemId]) {
        Object.assign(userSelections[itemId], selection)
      } else {
        userSelections[itemId] = selection
      }

      this.setState({ userSelections })
    }
  }

  getUserItems = async () => {
    const path = `/api/geekpreviewitems/userinfo?previewid=${
      this.state.previewId
    }`

    // const { items: userSelections } = await fetchJSON(path)

    // this.setState({ userSelections })
  }

  getPreviewItems = async (objectType, force = false) => {
    let loadStatus
    try {
      loadStatus =
        JSON.parse(
          await AsyncStorage.getItem(
            `@BGGApp:EventPreview${objectType}${this.state.previewId}`
          )
        ) || {}
    } catch (e) {
      console.warn('Persisted EventPreview data is not JSON', objectType)
      console.log(e)
    }

    // if (objectType === 'thing') {
    //   Object.keys(loadStatus).forEach(key => {
    //     console.log(key, loadStatus[key].items.length)
    //   })

    //   console.log(loadStatus['1'])
    // }

    if (force || Object.keys(loadStatus).length === 0) {
      // firstLoad: 'ever' <-- already set by default
      // so "Importing" overlay will apppear.
      console.log('full load', objectType)
      await this.fullLoad(loadStatus, objectType, force)
    } else {
      // only show overlay on first load when app boots
      if (this.state.firstLoad === 'ever') {
        this.setState({ firstLoad: 'sinceAppStart' })
      }
      console.log('partial load', objectType)
      await this.checkForNewPages(loadStatus, objectType)

      let all = []
      Object.values(loadStatus).forEach(pageData => {
        let { items } = pageData
        all = [...all, ...items]
      })

      all = all.sort(this.sortByName)

      if (objectType === 'thing') {
        this.setState({ games: all })
      } else {
        this.setState({ companies: all })
      }
    }
  }

  checkForNewPages = async (loadStatus, objectType) => {
    // get the last page id
    const pageId = Object.keys(loadStatus).pop()

    const fetches = {}
    fetches[pageId] = fetchJSON(this.buildItemURL(pageId, objectType))

    loadStatus = await this.processItems(fetches, loadStatus, objectType)

    let pageCount = loadStatus[pageId].items.length

    // less than X items, so this is still the last page
    if (pageCount < this.pageLimit(objectType)) {
      // no items, so page doesn't exist
      if (pageCount === 0) {
        this.trimEmptyPages(loadStatus)
      }

      this.persistLoadStatus(loadStatus, objectType)
    } else {
      console.log('got full page on the last page, do a full load')
      return this.fullLoad(loadStatus, objectType)
    }
  }

  forceCompanyFullLoad = () => {
    this.getPreviewItems('company', true)
  }

  fullLoad = async (loadStatus, objectType, force = false) => {
    let pageId = 1
    let continueProcessing = true
    let fetches = {}

    while (continueProcessing) {
      const { loadedAt } = loadStatus[pageId.toString()] || {}

      const anHourAgo = new Date().getTime() - 1000 * 60 * 60

      if (!loadedAt || loadedAt < anHourAgo || force) {
        console.log(`  - updating page: ${pageId} `)

        // start the fetch
        fetches[pageId] = fetchJSON(this.buildItemURL(pageId, objectType))

        // we only block and process when we have 5 requests in parallel
        if (Object.keys(fetches).length === 5) {
          console.log('awaiting for 5 fetches')
          // wait for the fetchs and parse responses
          loadStatus = await this.processItems(fetches, loadStatus, objectType)

          // if the last page has a full page of records we'll keep processing
          continueProcessing =
            loadStatus[pageId.toString()].items.length ===
            this.pageLimit(objectType)

          // clear out old requests
          fetches = {}
        }
      }
      pageId += 1
    }

    // process any remaining fetches
    if (Object.keys(fetches).length > 0) {
      loadStatus = await this.processItems(fetches, loadStatus, objectType)
    }

    this.trimEmptyPages(loadStatus)
  }

  processItems = (fetches, loadStatus, objectType) =>
    objectType === 'thing'
      ? this.processGames(fetches, loadStatus, objectType)
      : this.processCompanies(fetches, loadStatus, objectType)

  processCompanies = async (fetches, loadStatus, objectType) => {
    console.log('processing companies')
    const promises = Object.entries(fetches).map(async ([pageId, request]) => {
      const response = await request

      const items = response.map(record => {
        return {
          key: `${record.objectid}-${objectType}-${record.parentitemid}`,
          publisherId: record.objectid,
          parentItemId: record.parentitemid,
          name: record.geekitem.item.primaryname.name,
          objectId: record.objectid,
          objectType: record.objecttype,
          thumbnail: record.geekitem.item.images.thumb,
          location: record.location,
          previewItemIds: record.previewitemids
        }
      })

      // record the page, when it was last loaded (epoch) and the items it returned.
      loadStatus[pageId] = { loadedAt: new Date().getTime(), items }
      const companies = []
        .concat(...Object.values(loadStatus).map(c => c.items))
        .sort(this.sortByName)

      // set the state
      this.setState({
        companies
      })
    })

    await Promise.all(promises)

    this.persistLoadStatus(loadStatus, objectType)

    return loadStatus
  }

  processGames = async (fetches, loadStatus, objectType) => {
    console.log('processing games')
    const promises = Object.entries(fetches).map(async ([pageId, request]) => {
      const response = await request

      const items = response.map(record => {
        let game = {}
        try {
          const {
            geekitem: { item },
            version
          } = record

          game = {
            key: `${record.objectid}-${objectType}-${record.versionid}-${
              record.itemid
            }`,
            itemId: record.itemid,
            name: item.primaryname.name,
            versionName: version ? version.item.primaryname.name : '',
            objectId: record.objectid,
            objectType: record.objecttype,
            thumbnail: item.images.thumb,
            yearPublished: item.yearpublished,
            priceCurrency: record.msrp_currency,
            price: record.msrp,
            status: record.pretty_availability_status,
            reactions: record.reactions,
            stats: record.stats
          }

          game
        } catch (err) {
          console.warn(err)
          console.warn('Bad data:')
          console.warn(record)
        }

        return game
      })

      // record the page, when it was last loaded (epoch) and the items it returned.
      loadStatus[pageId] = { loadedAt: new Date().getTime(), items }

      let games = [].concat(...Object.values(loadStatus).map(g => g.items))

      // set the state
      this.setState({
        games
      })
    })

    await Promise.all(promises)

    this.persistLoadStatus(loadStatus, objectType)

    return loadStatus
  }

  trimEmptyPages = loadStatus => {
    // trim any empty pages at the end
    for (let pageId of Object.keys(loadStatus).reverse()) {
      let pageCount = loadStatus[pageId].items.length

      if (pageCount === 0) {
        delete loadStatus[pageId]
      } else {
        break
      }
    }

    return loadStatus
  }

  persistLoadStatus = (loadStatus, objectType) => {
    // persist the preview data
    try {
      AsyncStorage.setItem(
        `@BGGApp:EventPreview${objectType}${this.state.previewId}`,
        JSON.stringify(loadStatus)
      )
    } catch (err) {
      console.warn(err)
    }
  }

  render = () => {
    const { navigation } = this.props
    const { games, companies, userSelections, loading, firstLoad } = this.state

    return (
      <PreviewList
        companies={companies} //.slice(1, 5)}
        games={games}
        userSelections={userSelections}
        navigation={navigation}
        loading={firstLoad !== 'complete' ? false : loading}
        firstLoad={firstLoad}
        onRefresh={this.loadAllData}
        forceCompanyFullLoad={this.forceCompanyFullLoad}
        setUserSelection={this.setUserSelection}
        style={{
          backgroundColor: 'green',
          flex: 1
        }}
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
