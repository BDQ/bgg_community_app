import {
  fetchGameDetails,
  fetchGameStats,
  fetchGameImages,
} from '../../../bgg/game'

export const getGameDetails = async (global, _dispatch, objectId) => {
  const [details, itemStats, images] = await Promise.all([
    fetchGameDetails(objectId),
    fetchGameStats(objectId),
    fetchGameImages(objectId),
  ])

  const fetchedAt = new Date().getTime()

  return {
    [`game/${objectId}`]: {
      details,
      itemStats,
      images,
      fetchedAt,
    },
  }
}
