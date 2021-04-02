import { persistGlobal, getPersisted } from '../../helpers/persistence'
import { fetchJSON } from '../../../HTTP'
import { logger } from '../../../debug'

import { processGames } from '../../helpers/preview/games'
import { processCompanies } from '../../helpers/preview/companies'

import { companiesOverride } from '../../../previewOverride'
import { PREVIEW_ID } from 'react-native-dotenv'
import { previewKey, previewKeyGames, previewKeyUserSelections } from './keys'

export const loadPreview = async (state, dispatch, force = false) => {
  await dispatch.startPreviewLoading()
  await dispatch.getPreviewUserItems(force)
  await dispatch.getPreviewCompanys(force)
  await dispatch.getPreviewGames(force)
  await dispatch.getPurchases(force)
  await dispatch.enrichGames()
  await dispatch.applyOverrides()

  await dispatch.previewFiltersLoad()

  const previewFetchedAt = new Date().getTime()
  await persistGlobal(previewKey, { previewFetchedAt })

  return { previewFetchedAt, previewLoading: false }
}

export const startPreviewLoading = async () => ({ previewLoading: true })

export const getPreviewUserItems = async (state, dispatch, force) => {
  let { previewUserSelections = [] } = await getPersisted(
    previewKeyUserSelections
  )

  if (force || previewUserSelections.length === 0) {
    const path = `/api/geekpreviewitems/userinfo?previewid=${PREVIEW_ID}`
    const { items } = await fetchJSON(path)

    previewUserSelections = items

    await persistGlobal(previewKeyUserSelections, { previewUserSelections })
  }

  return { previewUserSelections }
}

export const getPreviewGames = async (state, dispatch, force) => {
  let { previewGames = [] } = await getPersisted(previewKeyGames)

  if (force || previewGames.length === 0) {
    previewGames = await getPreviewItems('thing')

    await persistGlobal(previewKeyGames, { previewGames })
  }

  return { previewGames }
}

export const getPreviewCompanys = async (state, dispatch, force) => {
  const key = `${previewKey}:companies`
  let { previewCompanies = [] } = await getPersisted(key)

  if (force || previewCompanies.length === 0) {
    previewCompanies = await getPreviewItems('company')
    await persistGlobal(key, { previewCompanies })
  }

  // dump ALL locations's
  // const locs = new Set(
  //   previewCompanies.map(c => c.locationParsed).filter(l => l)
  // )
  // console.log([...locs].sort())

  return { previewCompanies }
}

// injects userSelections & purchases into the game data
//
export const enrichGames = async (state) => {
  const { previewGames, previewUserSelections, previewPurchases } = state
  const enrichedGames = previewGames.map((game) => {
    game.userSelection = previewUserSelections[game.itemId]

    const purchase = previewPurchases[game.objectId]
    if (
      purchase &&
      game.preorder.some(
        (preorder) => preorder.productId === purchase.productId
      )
    ) {
      game.purchase = purchase
    }

    return game
  })

  return { previewGames: enrichedGames }
}

export const applyOverrides = async (state) => {
  const { previewCompanies } = state

  companiesOverride.forEach((companyOveride) => {
    if (!companyOveride.publisherId) return

    const idx = previewCompanies.findIndex(
      (company) => company.publisherId === companyOveride.publisherId
    )

    const previewCompany = previewCompanies[idx]

    previewCompanies[idx] = { ...previewCompany, ...companyOveride }
  })

  return { previewCompanies }
}

const getPreviewItems = async (objectType, force = false) => {
  let loadStatus = {}
  let pageId = 1
  let continueProcessing = true
  let fetches = {}

  while (continueProcessing) {
    const { loadedAt } = loadStatus[pageId.toString()] || {}

    const anHourAgo = new Date().getTime() - 1000 * 60 * 60

    if (!loadedAt || loadedAt < anHourAgo || force) {
      logger(`  - updating ${objectType} page: ${pageId} `)

      // start the fetch
      fetches[pageId] = fetchJSON(buildItemURL(pageId, objectType))

      // we only block and process when we have 5 requests in parallel
      if (Object.keys(fetches).length === 5) {
        logger('awaiting for 5 fetches')
        // wait for the fetchs and parse responses
        loadStatus = await processItems(fetches, loadStatus, objectType)
        // if the last page has a full page of records we'll keep processing
        continueProcessing =
          loadStatus[pageId.toString()].items.length === pageLimit(objectType)

        // clear out old requests
        fetches = {}
      }
    }
    pageId += 1
  }

  // process any remaining fetches
  if (Object.keys(fetches).length > 0) {
    loadStatus = await processItems(fetches, loadStatus, objectType)
  }

  loadStatus = trimEmptyPages(loadStatus)
  return [].concat(...Object.values(loadStatus).map((c) => c.items))
}

const buildItemURL = (pageId, objectType) => {
  if (objectType === 'thing')
    return `https://api.geekdo.com/api/geekpreviewitems?nosession=1&pageid=${pageId}&previewid=${PREVIEW_ID}`
  if (objectType === 'company')
    return `https://api.geekdo.com/api/geekpreviewparentitems?nosession=1&pageid=${pageId}&previewid=${PREVIEW_ID}`

  logger(`Got unexpected objectType: '${objectType}'`)
}

const processItems = (fetches, loadStatus, objectType) =>
  objectType === 'thing'
    ? processGames(fetches, loadStatus, objectType)
    : processCompanies(fetches, loadStatus, objectType)

const pageLimit = (objectType) => (objectType === 'thing' ? 10 : 50)

const trimEmptyPages = (loadStatus) => {
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
