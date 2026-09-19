import { describe, expect, it } from 'vitest'
import { createDb } from './sqlite'
import {
  createDevice,
  createInterface,
  createLink,
  createRack,
  createRoom,
  listLinks,
  mediaWarnings,
  searchInterfaces,
  updateLink
} from './queries'

function setup() {
  const { db } = createDb(':memory:')
  const room = createRoom(db, { building: 'HQ', floor: '3F', roomNumber: '301' })
  const rack = createRack(db, { roomId: room.id, name: 'Rack-A' })
  const sw = createDevice(db, { rackId: rack.id, name: 'SW-01', role: 'switch' })
  const other = createDevice(db, { rackId: rack.id, name: 'SW-02', role: 'switch' })
  const a = createInterface(db, { deviceId: sw.id, name: 'Gi1/0/24', media: 'copper' })
  const b = createInterface(db, { deviceId: other.id, name: 'Gi1/0/1', media: 'smf' })
  const c = createInterface(db, { deviceId: sw.id, name: 'Gi1/0/2', media: 'copper' })
  return { db, a, b, c }
}

describe('link integrity', () => {
  it('stores endpoints with the lower interface id as A', () => {
    const { db, a, b } = setup()
    const link = createLink(db, {
      aInterfaceId: Math.max(a.id, b.id),
      bInterfaceId: Math.min(a.id, b.id),
      media: 'copper',
      cableLabeled: true
    })
    expect(link.aInterfaceId).toBeLessThan(link.bInterfaceId)
    expect([link.aInterfaceId, link.bInterfaceId].sort()).toEqual([a.id, b.id].sort())
  })

  it('rejects using the same interface twice', () => {
    const { db, a } = setup()
    expect(() =>
      createLink(db, {
        aInterfaceId: a.id,
        bInterfaceId: a.id,
        media: 'copper',
        cableLabeled: false
      })
    ).toThrow()
  })

  it('rejects an interface that is already linked', () => {
    const { db, a, b, c } = setup()
    createLink(db, {
      aInterfaceId: a.id,
      bInterfaceId: b.id,
      media: 'copper',
      cableLabeled: false
    })
    expect(() =>
      createLink(db, {
        aInterfaceId: a.id,
        bInterfaceId: c.id,
        media: 'copper',
        cableLabeled: false
      })
    ).toThrow(/at most one link/)
  })

  it('allows reusing the current link ports when editing', () => {
    const { db, a, b, c } = setup()
    const link = createLink(db, {
      aInterfaceId: a.id,
      bInterfaceId: b.id,
      media: 'copper',
      cableLabeled: false
    })
    const updated = updateLink(db, link.id, {
      aInterfaceId: a.id,
      bInterfaceId: c.id,
      media: 'copper',
      cableLabeled: true
    })
    expect(updated.cableLabeled).toBe(true)
    expect([updated.aInterfaceId, updated.bInterfaceId]).toEqual(
      [a.id, c.id].sort((x, y) => x - y)
    )
  })

  it('warns when A, B, and link media disagree without changing stored values', () => {
    const { db, a, b } = setup()
    const warnings = mediaWarnings(db, {
      aInterfaceId: a.id,
      bInterfaceId: b.id,
      media: 'mmf'
    })
    expect(warnings.length).toBeGreaterThan(0)
    const link = createLink(db, {
      aInterfaceId: a.id,
      bInterfaceId: b.id,
      media: 'mmf',
      cableLabeled: false
    })
    expect(link.media).toBe('mmf')
    expect(link.aMedia).toBe('copper')
    expect(link.bMedia).toBe('smf')
  })

  it('filters used ports from search except the current link', () => {
    const { db, a, b, c } = setup()
    const link = createLink(db, {
      aInterfaceId: a.id,
      bInterfaceId: b.id,
      media: 'copper',
      cableLabeled: false
    })
    const unused = searchInterfaces(db, { search: '', limit: 50 })
    expect(unused.map((row) => row.id)).toEqual([c.id])

    const editing = searchInterfaces(db, { search: 'Gi1', currentLinkId: link.id, limit: 50 })
    expect(editing.map((row) => row.id).sort()).toEqual([a.id, b.id, c.id].sort())

    const labeled = searchInterfaces(db, { search: '3F-301 / Rack-A / SW-01 / Gi1/0/2', limit: 50 })
    expect(labeled.map((row) => row.id)).toEqual([c.id])
  })

  it('searches link list fields', () => {
    const { db, a, b } = setup()
    createLink(db, {
      aInterfaceId: a.id,
      bInterfaceId: b.id,
      media: 'copper',
      cableLabeled: true,
      notes: 'uplink to core'
    })
    expect(listLinks(db, { search: 'Gi1/0/24' })).toHaveLength(1)
    expect(listLinks(db, { search: 'uplink' })).toHaveLength(1)
    expect(listLinks(db, { search: 'missing' })).toHaveLength(0)
    expect(listLinks(db, { search: '', labeled: 'yes' })).toHaveLength(1)
    expect(listLinks(db, { search: '', labeled: 'no' })).toHaveLength(0)
    expect(listLinks(db, { search: '', media: 'smf' })).toHaveLength(0)
  })
})
