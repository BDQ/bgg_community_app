import { persistGlobal } from '../helpers/persistence'
import { fetchHotnessFromBGG } from '../../bgg/hotness'

const baseKey = 'hotness'

export const fetchHotness = async () => {
  const hotness = await fetchHotnessFromBGG()

  const hotnessFetchedAt = new Date().getTime()

  persistGlobal(baseKey, { hotness, hotnessFetchedAt })

  return { hotness, hotnessFetchedAt }
}
