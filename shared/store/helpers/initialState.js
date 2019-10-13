// initial state, expect nothing will come from async

const previewFiltersDefault = {
  name: '',
  priorities: [],
  halls: [],
  seen: [],
  availability: [],
  preorders: [],
  filterTextOn: 'game'
}

export default {
  collection: [],
  collectionFetchedAt: 0,
  loggedIn: false,
  bggCredentials: {},

  // previews
  previewFetchedAt: 0,
  previewPurchases: {},
  previewPurchasesFetchedAt: 0,
  previewGames: [],
  previewCompanies: [],
  previewUserSelections: [],
  previewLoading: false,
  previewFilters: previewFiltersDefault,
  previewFiltersDefault,
  previewFiltersSet: false,
  previewSortBy: 'publisherGame'
}
