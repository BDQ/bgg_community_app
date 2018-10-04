import React from 'react'
import { createStackNavigator } from 'react-navigation'
import { AsyncStorage } from 'react-native'

import GameScreen from './GameScreen'
import GameAddTo from './GameAddTo'
import PreviewFilters from '../components/PreviewFilters'
import PreviewList from '../components/PreviewList'

import { fetchJSONAsUser } from '../shared/HTTP'

class PreviewListScreen extends React.Component {
  state = {
    loadStatus: {},
    games: [],
    companies: [],
    userSelections: [],
    previewId: 6,
    loading: true
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title: `Essen Preview (${navigation.getParam('gameCount', '0')})`
    }
  }

  pageLimit = objectType => (objectType === 'thing' ? 10 : 50)

  buildItemURL = (pageId, objectType) =>
    objectType === 'thing'
      ? `https://api.geekdo.com/api/geekpreviewitems?nosession=1&pageid=${pageId}&previewid=${
          this.state.previewId
        }`
      : `https://api.geekdo.com/api/geekpreviewparentitems?nosession=1&pageid=${pageId}&previewid=${
          this.state.previewId
        }`

  loadAllData = async () => {
    this.setState({ loading: true })

    await this.getUserItems()

    await Promise.all([
      this.getPreviewItems('thing'),
      this.getPreviewItems('company')
    ])

    const { setParams } = this.props.navigation
    setParams({ gameCount: this.state.games.length })

    this.setState({ loading: false })
  }

  getUserItems = async () => {
    const url = `https://bgg.cc/api/geekpreviewitems/userinfo?previewid=${
      this.state.previewId
    }`

    const { items: userSelections } = await fetchJSONAsUser(url)
    this.setState({ userSelections })
  }

  getPreviewItems = async objectType => {
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

    if (Object.keys(loadStatus).length === 0) {
      console.log('full load', objectType)
      await this.fullLoad(loadStatus, objectType)
    } else {
      console.log('partial load', objectType)
      await this.checkForNewPages(loadStatus, objectType)

      let all = []
      Object.values(loadStatus).forEach(pageData => {
        let { items } = pageData
        all = [...all, ...items]
      })

      all = all.sort(this.sortByName)

      console.log('setting state', objectType)

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

    console.log(pageId, loadStatus[pageId])
    const fetches = {}
    fetches[pageId] = fetchJSONAsUser(this.buildItemURL(pageId, objectType))

    loadStatus = await this.processItems(fetches, loadStatus, objectType)

    let pageCount = loadStatus[pageId].items.length
    console.log({ pageId, objectType, pageCount })

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

  fullLoad = async (loadStatus, objectType) => {
    // https://bgg.cc/api/geekpreviewitems/userinfo?previewid=6
    // https://bgg.cc/api/geekpreviewitems/userinfo/sharekey?previewid=6

    let pageId = 1
    let continueProcessing = true
    let fetches = {}

    while (continueProcessing) {
      const { loadedAt } = loadStatus[pageId.toString()] || {}

      const anHourAgo = new Date().getTime() - 1000 * 60 * 60

      if (!loadedAt || loadedAt < anHourAgo) {
        console.log(`  - updating page: ${pageId} `)

        // start the fetch
        fetches[pageId] = fetchJSONAsUser(this.buildItemURL(pageId, objectType))

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
          objectid: record.objectid,
          objecttype: record.objecttype,
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
        loadStatus,
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
            objectid: record.objectid,
            objecttype: record.objecttype,
            thumbnail: item.images.thumb,
            yearpublished: item.yearpublished,
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

      // const games = [...this.state.games, ...items]
      // set the state
      this.setState({
        loadStatus,
        games
      })

      this.props.navigation.setParams({ gameCount: games.length })
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
        console.log(`triming page ${pageId} as it has ${pageCount} items`)
        delete loadStatus[pageId]
      } else {
        console.log(`Not triming page ${pageId} as it has ${pageCount} items`)
        break
      }
    }

    return loadStatus
  }

  persistLoadStatus = (loadStatus, objectType) => {
    // persist the preview data
    AsyncStorage.setItem(
      `@BGGApp:EventPreview${objectType}${this.state.previewId}`,
      JSON.stringify(loadStatus)
    )
  }

  componentDidMount() {
    this.loadAllData()
  }

  render = () => {
    const { navigation } = this.props
    const { games, companies, userSelections, loading } = this.state

    return (
      <PreviewList
        companies={companies} //.slice(1, 5)}
        games={games}
        userSelections={userSelections}
        navigation={navigation}
        loading={loading}
        onRefresh={this.loadAllData}
      />
    )
  }
}

export default createStackNavigator({
  List: { screen: PreviewListScreen },
  Game: { screen: GameScreen },
  Filter: { screen: PreviewFilters },
  AddTo: { screen: GameAddTo }
})
