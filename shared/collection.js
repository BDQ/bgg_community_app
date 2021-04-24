import * as Sentry from 'sentry-expo'
const XMLParser = require('react-xml-parser')

import { AsyncStorage, InteractionManager } from 'react-native'
import styleconstants from './styles/styleconstants'

import nextFrame from 'next-frame'

import { logger } from './debug'
import { getElementValue } from './xml.js'

const timeout = ms => new Promise(res => setTimeout(res, ms))

export const removeDuplicates = (myArr, prop) => {
  return myArr.filter((obj, pos, arr) => {
    return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos
  })
}

export const fetchCollectionFromBGG = async username => {
  if (!username) {
    return []
  }

  const url = `https://www.boardgamegeek.com/xmlapi2/collection?username=${username}`

  try {
    const response = await fetch(url)

    if (response.status == 202) {
      // collection is being prepared, come back late to try again
      logger('gonna sleep on it')
      await timeout(2000)
      return fetchCollectionFromBGG(username)
    } else if (response.status == 200) {
      // yay! we have a collection response
      await nextFrame()
      const xml = await response.text()

      await nextFrame()
      // const doc = await parseXML(xml)
      var doc = new XMLParser().parseFromString(xml)

      let collection = []
      for (item of doc.getElementsByTagName('item')) {
        await nextFrame()

        const objectId = item.attributes.objectid

        const name = getElementValue(item, 'name')

        const yearpublished = getElementValue(item, 'yearpublished')

        const image = getElementValue(item, 'image')
        const thumbnail = getElementValue(item, 'thumbnail')
        let statusElement = item.getElementsByTagName('status')[0] || {}

        let subtitle = `Year: ${yearpublished}`

        collection.push({
          objectId,
          name,
          subtitle,
          yearpublished,
          image,
          thumbnail,
          status: statusElement.attributes
        })
      }

      // not really duplicates, just multiple copies, need to figure out how that should be handled? HELP???
      collection = removeDuplicates(collection, 'objectId')

      return collection
    } else {
      Sentry.captureMessage(
        'Non 200/202 Response from BGG when loading collection.',
        'error'
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

export function getRatingColor(rating) {
  if (rating > 8) {
    return '#1d804c'
  } else if (rating > 7) {
    return '#1978b3'
  } else if (rating > 5) {
    return styleconstants.bggpurple
  } else {
    return '#d71925'
  }

}