import { persistGlobal, getPersisted } from '../../helpers/persistence'

import { PREVIEW_ID } from 'react-native-dotenv'
const previewKey = `preview:${PREVIEW_ID}`
const filtersKey = `${previewKey}:filters`

export const previewFiltersLoad = async state => {
  const {
    previewFiltersSet,
    previewFilters = state.previewFiltersDefault
  } = await getPersisted(filtersKey)

  return {
    previewFiltersSet,
    previewFilters
  }
}

export const previewFiltersSet = async (state, dispatch, previewFilters) => {
  return persistAndReturnFilterState({
    previewFilters: {
      ...state.previewFilters, //fallback to already stored value
      ...previewFilters
    }
  })
}

const persistAndReturnFilterState = async newFilterState => {
  await persistGlobal(filtersKey, newFilterState)

  return newFilterState
}
