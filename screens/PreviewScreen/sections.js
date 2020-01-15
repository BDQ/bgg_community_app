import { priorities, halls, availability } from '../../shared/data'

const applyCompanyFilters = (filters, companies) => {
  let filteredItems = companies

  // name
  if (filters.name !== '') {
    const filterTextRE = new RegExp(filters.name, 'gi')

    if (filters.filterTextOn === 'publisher') {
      // notes
      filteredItems = filteredItems.filter(item =>
        item.name.match(filterTextRE)
      )
    }
  }

  // halls
  if (filters.halls.length > 0 && filters.halls.length < halls.length) {
    let locationRE = new RegExp(`^[${filters.halls.join('')}]-.*`, 'gi')
    filteredItems = filteredItems.filter(
      item => item.location && item.location.match(locationRE)
    )
  }

  // filter only companies with no location - used for doing overrides only
  // filteredItems = filteredItems.filter(item => {
  //   return item.location === ''
  // })

  return filteredItems
}

const applyGameFilters = (filters, items) => {
  let filteredItems = items

  if (filters.name !== '') {
    const filterTextRE = new RegExp(filters.name, 'gi')

    if (filters.filterTextOn === 'note') {
      // notes
      filteredItems = filteredItems.filter(item => {
        const { userSelection: { notes = '' } = {} } = item
        return notes.match(filterTextRE)
      })
    } else if (filters.filterTextOn === 'game') {
      // game name
      filteredItems = filteredItems.filter(item =>
        item.name.match(filterTextRE)
      )
    }
  }

  // priorities
  if (
    filters.priorities.length > 0 &&
    filters.priorities.length < priorities.length
  ) {
    filteredItems = filteredItems.filter(item => {
      // zero === unprioritized
      const { priority } = item.userSelection || { priority: -1 }
      return filters.priorities.includes(priority)
    })
  }

  // seen
  // only applied when on is set
  if (filters.seen.length === 1) {
    const seen = filters.seen[0]

    let seenRE = new RegExp(`"seen":.?true`, 'g')

    filteredItems = filteredItems.filter(item => {
      const { notes } = item.userSelection || { notes: '' }
      const markedAsSeen = notes.match(seenRE)
      return seen === 1 ? markedAsSeen : !markedAsSeen
    })
  }

  // availability
  if (
    filters.availability &&
    filters.availability.length > 0 &&
    filters.availability.length < availability.length
  ) {
    filteredItems = filteredItems.filter(item => {
      return filters.availability.includes(item.status)
    })
  }

  // preorders (only supports Yes now)
  if (filters.preorders && filters.preorders.length > 0) {
    if (filters.preorders.includes('Yes')) {
      filteredItems = filteredItems.filter(item => {
        return item.purchase !== undefined
      })
    }
  }

  return filteredItems
}

const sortByName = (a, b) => sortByAttr(a, b, 'name')
const sortByLocation = (a, b) => sortByAttr(a, b, 'location')

const sortByAttr = (a, b, attr) => {
  if (a[attr] < b[attr]) return -1

  if (a[attr] > b[attr]) return 1

  // names must be equal
  return 0
}

export const buildSections = (filters, games, companies) => {
  if (games.length === 0 || companies.length === 0) {
    //data's not loaded yet, so render empty
    return { sections: [], gameCount: 0 }
  }

  const filteredCompanies = applyCompanyFilters(filters, companies)
  const filteredGames = [...applyGameFilters(filters, games)]

  const gameCount = filteredGames.length
  // build array of companies, followed by their games
  let sections = filteredCompanies.sort(sortByName).map(company => {
    let companyGames = []

    // some records can have not previewItems
    if (company.previewItemIds) {
      companyGames = company.previewItemIds
        .map(itemId => {
          const gameIndex = filteredGames.findIndex(g => g.itemId === itemId)

          if (gameIndex > -1) {
            const [game] = filteredGames.splice(gameIndex, 1)

            if (game) {
              game.location = company.location
            }

            return game
          }
        })
        .filter(g => g) //drop undefineds

      company.games = companyGames
    }

    return {
      ...company,
      data: companyGames.sort(sortByName).filter(g => g)
    }
  })

  if (filters.sortBy === 'locationPublisherGame') {
    sections = sections.sort(sortByLocation)
  }

  sections = sections.filter(section => section.data.length > 0)
  return { sections, gameCount }
}
