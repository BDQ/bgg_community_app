import { logger } from '../../../debug'

export const processCompanies = async (fetches, loadStatus, objectType) => {
  logger('processing companies')

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
    // console.log(pageId, items.length)
    // .sort(sortByName)
  })

  await Promise.all(promises)

  // this.persistLoadStatus(loadStatus, objectType)
  return loadStatus
}
