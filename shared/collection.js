import Sentry from 'sentry-expo'
import parse from 'xml-parser'
import { AsyncStorage } from 'react-native'

const timeout = ms => new Promise(res => setTimeout(res, ms))

export const removeDuplicates = (myArr, prop) => {
  return myArr.filter((obj, pos, arr) => {
    return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos
  })
}

export const fetchCollectionFromBGG = async username => {
  if (!username) {
    return false
  }

  const url = `https://www.boardgamegeek.com/xmlapi2/collection?username=${username}`

  try {
    const response = await fetch(url)

    if (response.status == 202) {
      // collection is being prepared, come back late to try again
      console.log('gonna sleep on it')
      await timeout(2000)
      return fetchCollectionFromBGG(username)
    } else if (response.status == 200) {
      // yay! we have a collection response
      const xml = await response.text()

      const doc = await parseXML(xml)

      let collection = doc.root.children.map(item => {
        const objectId = item.attributes.objectid
        const name = item.children.find(e => e.name == 'name').content
        const yearpublished = (
          item.children.find(e => e.name == 'yearpublished') || {}
        ).content
        const image = (item.children.find(e => e.name == 'image') || {}).content
        const thumbnail = (item.children.find(e => e.name == 'thumbnail') || {})
          .content

        let statusElement = item.children.find(e => e.name == 'status') || {}

        let subtitle = `Year: ${yearpublished}`

        return {
          objectId,
          name,
          subtitle,
          yearpublished,
          image,
          thumbnail,
          status: statusElement.attributes
        }
      })

      // not really duplicates, just multiple copies, need to figure out how that should be handled? HELP???
      collection = removeDuplicates(collection, 'objectId')

      return collection
    } else {
      Sentry.captureMessage(
        'Non 200/202 Response from BGG when loading collection.',
        {
          extra: { url: url, stauts: response.status }
        }
      )
    }
  } catch (error) {
    Sentry.captureException(error)
  }
  return []
}

export const loadCollection = async updatedAt => {
  if (!updatedAt) {
    try {
      const value = await AsyncStorage.getItem('@BGGApp:collection')
      if (value !== null) {
        const { games, updatedAt } = JSON.parse(value)

        return { games, updatedAt }
      }
    } catch (error) {
      Sentry.captureException(error)
      return {}
    }
  }
}

const parseXML = async xml => new Promise(resolve => resolve(parse(xml)))
