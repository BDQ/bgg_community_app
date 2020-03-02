export const getElementValue = (item, name) => {
  const elements = item.getElementsByTagName(name)

  if (elements.length > 0) {
    return elements[0].value
  }
}
