import { persistGlobal } from '../../helpers/persistence'
import { fetchJSON } from '../../../HTTP'
import { previewKeyGames, previewKeyUserSelections } from './keys'

export const savePreviewPriority = async (
  state,
  dispatchEvent,
  itemId,
  priority
) => {
  const currentSelection = getCurrentUserSelection(state, itemId)

  return updateSelection(state, itemId, currentSelection, { priority })
}

export const savePreviewNotes = async (
  state,
  dispatchEvent,
  itemId,
  noteText
) => {
  const { notes: rawNotes, ...currentSelection } = getCurrentUserSelection(
    state,
    itemId
  )

  let notes = {}

  try {
    notes = { ...JSON.parse(rawNotes), text: noteText }
  } catch (err) {
    notes = { text: rawNotes }
  }

  return updateSelection(state, itemId, currentSelection, {
    notes: JSON.stringify(notes),
  })
}

export const savePreviewSeen = async (state, dispatchEvent, itemId, seen) => {
  const { notes: rawNotes, ...currentSelection } = getCurrentUserSelection(
    state,
    itemId
  )

  let notes = {}
  console.log('seeting', { seen })

  try {
    notes = { ...JSON.parse(rawNotes), seen }
  } catch (err) {
    notes = { seen, text: rawNotes }
  }

  return updateSelection(state, itemId, currentSelection, {
    notes: JSON.stringify(notes),
  })
}

const getCurrentUserSelection = (state, itemId) => {
  const { previewUserSelections } = state
  return (
    previewUserSelections[itemId] || {
      itemid: itemId,
      notes: '{}',
    }
  )
}

const updateSelection = async (
  state,
  itemId,
  currentSelection,
  changedAttrs
) => {
  const userSelection = { ...currentSelection, ...changedAttrs }

  const success = await persistUserSelectionToBGG(userSelection)

  if (success) return updateStore(state, itemId, userSelection)
}

const persistUserSelectionToBGG = async (data) => {
  const { message } = await fetchJSON('/api/geekpreviewitems/userinfo', {
    method: 'POST',
    body: { data },
  })

  return message === 'Info saved'
}

const updateStore = async (state, itemId, userSelection) => {
  const { previewUserSelections, previewGames } = state

  // add decision to current userSelections
  previewUserSelections[itemId] = userSelection

  // update the games to include the selection
  const game = previewGames.find((g) => g.itemId === userSelection.itemid)
  if (game) game.userSelection = userSelection

  // persist ain
  await persistGlobal(previewKeyUserSelections, { previewUserSelections })
  await persistGlobal(previewKeyGames, { previewGames })

  return { previewUserSelections, previewGames }
}
