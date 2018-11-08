import Sentry from 'sentry-expo'
import parse from 'xml-parser'
import { AsyncStorage } from 'react-native'

export const removeDuplicates = (myArr, prop) => {
  return myArr.filter((obj, pos, arr) => {
    return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos
  })
}

export const fetchCollection = async username => {
  if (!username) {
    return false
  }

  const url = `https://www.boardgamegeek.com/xmlapi2/collection?username=${username}`

  try {
    let response = await fetch(url)

    if (response.status == 202) {
      setTimeout(fetchCollection, 5000)
    } else if (response.status == 200) {
      let xml = await response.text()

      let doc = await parseXML(xml)

      let collection = doc.root.children.map(item => {
        let objectId = item.attributes.objectid
        let name = item.children.find(e => e.name == 'name').content
        let yearpublished = (
          item.children.find(e => e.name == 'yearpublished') || {}
        ).content
        let image = (item.children.find(e => e.name == 'image') || {}).content
        let thumbnail = (item.children.find(e => e.name == 'thumbnail') || {})
          .content

        let status = item.children.find(e => e.name == 'status') || {}
        let own = status.attributes.own == '1'
        let wishlist = status.attributes.wishlist == '1'

        let subtitle = `Year: ${yearpublished}`

        return {
          objectId,
          name,
          subtitle,
          yearpublished,
          image,
          thumbnail,
          own,
          wishlist
        }
      })

      collection = removeDuplicates(collection, 'objectId')

      return collection
    } else {
      Sentry.captureMessage(
        'Non 200/202 Response from BGG when loading collection.',
        (extra: { url: url, stauts: response.status })
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
