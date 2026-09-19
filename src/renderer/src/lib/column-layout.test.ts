import { describe, expect, it } from 'vitest'
import { mergeColumnOrder, moveColumn, nudgeColumn } from './column-layout'

describe('column layout', () => {
  it('keeps the actions column last and inserts newly added columns', () => {
    expect(mergeColumnOrder(['aRoom', 'notes', 'actions'])).toEqual(['aRoom', 'notes', 'actions'])
    expect(mergeColumnOrder(['aRoom', 'media', 'notes', 'actions'], ['notes', 'aRoom', 'actions'])).toEqual([
      'notes',
      'aRoom',
      'media',
      'actions'
    ])
  })

  it('moves a column before the drop target and never moves actions', () => {
    const order = ['aRoom', 'aRack', 'media', 'actions']
    expect(moveColumn(order, 'media', 'aRoom')).toEqual(['media', 'aRoom', 'aRack', 'actions'])
    expect(moveColumn(order, 'aRoom', 'actions')).toEqual(order)
    expect(moveColumn(order, 'actions', 'media')).toEqual(order)
  })

  it('nudges a column one step without moving actions', () => {
    const order = ['aRoom', 'aRack', 'media', 'actions']
    expect(nudgeColumn(order, 'aRoom', 1)).toEqual(['aRack', 'aRoom', 'media', 'actions'])
    expect(nudgeColumn(order, 'media', -1)).toEqual(['aRoom', 'media', 'aRack', 'actions'])
    expect(nudgeColumn(order, 'aRoom', -1)).toEqual(order)
  })
})
