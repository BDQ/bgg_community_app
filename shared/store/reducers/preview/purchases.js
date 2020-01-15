import { EVENT_ID } from 'react-native-dotenv'
import { fetchJSON } from '../../../../shared/HTTP'
import { logger } from '../../../../shared/debug'
import { persistGlobal, getPersisted } from '../../helpers/persistence'

const previewPurchasesKey = `previewPurchases:${EVENT_ID}`

export const getPurchases = async (state, dispatch, force = false) => {
  let purchaseRecords = []

  let { previewPurchases, previewPurchasesFetchedAt = 0 } = await getPersisted(
    previewPurchasesKey
  )

  if (force || previewPurchasesFetchedAt === 0) {
    purchaseRecords = await fetchPurchases()
    previewPurchases = {}

    // restucture data for easier lookups by objectId
    purchaseRecords.forEach(purchase => {
      previewPurchases[purchase.objectId] = purchase
    })

    previewPurchasesFetchedAt = new Date().getTime()

    await persistGlobal(previewPurchasesKey, {
      previewPurchases,
      previewPurchasesFetchedAt
    })
  }

  return {
    previewPurchases,
    previewPurchasesFetchedAt
  }
}

const fetchPurchases = async () => {
  const path = `/api/geekmarket/account/purchases?eventid=${EVENT_ID}&pageid=1&itemsperpage=50`

  const { sales: purchases } = await fetchJSON(path)

  const lookups = purchases.map(async purchase => {
    if (purchase.listings.length !== 1) {
      logger(
        `Purchase has an unexpected amount of listings: ${purchase.listings.length}`
      )
    }

    const productId = purchase.listings[0].productid
    const { objectid } = await fetchJSON(
      `/api/geekmarket/products/${productId}`
    )

    return {
      productId,
      saleState: purchase.salestate,
      formattedPrice: purchase.formattedprice,
      currency: purchase.currency,
      objectId: objectid
    }
  })

  return await Promise.all(lookups)
}
