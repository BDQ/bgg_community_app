export const previewFiltersSet = (state, dispatch, previewFilters) => {
  return {
    previewFiltersSet: true,
    previewFilters: {
      ...previewFilters,
      filterTextOn:
        previewFilters.filterTextOn || state.previewFilters.filterTextOn //fallback to already stored value
    }
  }
}

// export const previewSetFilterTextOn = (state, dispatch, filterTextOn) => {
//   return {
//     previewFiltersSet: true,
//     previewFilters: {
//       ...state.previewFilters,
//       filterTextOn
//     }
//   }
// }

export const previewSetFilterName = (state, dispatch, name) => {
  return {
    previewFiltersSet: true,
    previewFilters: {
      ...state.previewFilters,
      name
    }
  }
}

export const previewSetSortBy = (state, dispatch, previewSortBy) => {
  return {
    previewSortBy
  }
}
