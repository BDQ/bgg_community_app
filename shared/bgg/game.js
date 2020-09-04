import { fetchJSON } from '../HTTP'

const baseURL = 'https://api.geekdo.com/api'

export const fetchGameDetails = async (objectId) => {
  const url = `${baseURL}/geekitems?objectid=${objectId}&showcount=10&nosession=1&ajax=1&objecttype=thing`

  const { item } = await fetchJSON(url)

  return item
}

export const fetchGameStats = async (objectId) => {
  const url = `${baseURL}/dynamicinfo?objectid=${objectId}&showcount=10&nosession=1&ajax=1&objecttype=thing`
  return fetchJSON(url)
}

export const fetchGameImages = async (objectId) => {
  const url = `${baseURL}/images?objectid=${objectId}&ajax=1&galleries%5B%5D=game&galleries%5B%5D=creative&nosession=1&objecttype=thing&showcount=17&size=crop100&sort=hot`
  let { images } = await fetchJSON(url)
  return images.map((img) => ({ id: img.imageid, url: img.imageurl_lg }))
}
