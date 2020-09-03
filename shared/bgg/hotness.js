import { fetchJSON } from '../HTTP'
export const fetchHotnessFromBGG = async () => {
  const path =
    '/api/hotness?geeksite=boardgame&nosession=1&objecttype=thing&showcount=30'

  try {
    const { items: hotness } = await fetchJSON(path)

    return hotness.map((item) => {
      const { name, yearpublished: yearPublished } = item
      return {
        objectId: item.objectid,
        name,
        yearPublished,
        image: item.imageurl,
        delta: item.delta,
        rank: item.rank,
        thumbnail: item.squareimg.src,
      }
    })
  } catch (error) {
    console.error(error)
    return []
  }
}
