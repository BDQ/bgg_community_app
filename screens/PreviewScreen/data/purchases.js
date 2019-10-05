import { EVENT_ID } from 'react-native-dotenv'
import { fetchJSON } from '../../../shared/HTTP'
import { logger } from '../../../shared/debug'

// import { loadPersistedData } from './common'

export const getPurchases = async (force = false) => {
  let purchaseRecords = [] //= loadPersistedData(`Event:Purchases:${EVENT_ID}`)
  // console.log(purchaseRecords)

  if (force || Object.keys(purchaseRecords).length === 0) {
    purchaseRecords = await fetchPurchases()
  }

  const purchases = {}

  purchaseRecords.forEach(purchase => {
    purchases[purchase.objectId] = purchase
  })
  return purchases
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
