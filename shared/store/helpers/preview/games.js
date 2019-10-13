import { logger } from '../../../debug'

export const processGames = async (fetches, loadStatus, objectType) => {
  logger('processing games')

  const promises = Object.entries(fetches).map(async ([pageId, request]) => {
    const response = await request

    const items = response.map(record => {
      let game = {}
      try {
        const {
          preorder,
          geekitem: { item },
          version
        } = record

        game = {
          key: `${record.objectid}-${objectType}-${record.versionid}-${record.itemid}`,
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
          stats: record.stats,
          preorder: preorder.map(({ product }) => ({
            productId: product.productid,
            currency: product.currency,
            currencySymbol: product.currencysymbol,
            price: product.price,
            notes: product.notes
          }))
        }

        game
      } catch (err) {
        logger(err)
        logger('Bad data:')
        logger(record)
      }

      return game
    })

    // record the page, when it was last loaded (epoch) and the items it returned.
    loadStatus[pageId] = { loadedAt: new Date().getTime(), items }

    // let games = [].concat(...Object.values(loadStatus).map(g => g.items))
  })

  await Promise.all(promises)

  // persistLoadStatus(loadStatus, objectType)

  return loadStatus
}
