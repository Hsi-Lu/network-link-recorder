import { and, asc, desc, eq, like, or, sql, type SQL } from 'drizzle-orm'
import type { AppDatabase } from './sqlite'
import { alias } from 'drizzle-orm/sqlite-core'
import { devices, interfaces, links, racks, rooms } from './schema'
import type {
  DeviceInput,
  InterfaceInput,
  InterfaceSearchQuery,
  LinkInput,
  ListQuery,
  RackInput,
  RoomInput
} from '@shared/schemas'
import type {
  DeviceRecord,
  InterfaceOption,
  InterfaceRecord,
  LinkRecord,
  MediaWarning,
  RackRecord,
  RoomRecord
} from '@shared/api'
import type { Media } from '@shared/enums'

const ROOM_LABEL = sql<string>`${rooms.floor} || '-' || ${rooms.roomNumber}`
const INTERFACE_LABEL = sql<string>`${rooms.floor} || '-' || ${rooms.roomNumber} || ' / ' || ${racks.name} || ' / ' || ${devices.name} || ' / ' || ${interfaces.name}`

function likePattern(search: string): string {
  return `%${search.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_')}%`
}

function constraintMessage(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message : String(error)
  if (message.includes('room_location_unique') || message.includes('UNIQUE constraint failed: room.building')) {
    return 'A room with this building, floor, and number already exists'
  }
  if (message.includes('rack_room_name_unique') || message.includes('UNIQUE constraint failed: rack.room_id')) {
    return 'A rack with this name already exists in the selected room'
  }
  if (message.includes('device_rack_name_unique') || message.includes('UNIQUE constraint failed: device.rack_id')) {
    return 'A device with this name already exists in the selected rack'
  }
  if (
    message.includes('interface_device_name_unique') ||
    message.includes('UNIQUE constraint failed: interface.device_id')
  ) {
    return 'An interface with this name already exists on the selected device'
  }
  if (message.includes('at most one link')) {
    return 'An interface can appear in at most one link'
  }
  if (message.includes('CHECK constraint failed')) {
    return 'A link must connect two different interfaces'
  }
  if (message.includes('FOREIGN KEY')) {
    return 'Related record was not found'
  }
  return message || fallback
}

function orderedEndpoints(a: number, b: number): { aInterfaceId: number; bInterfaceId: number } {
  return a < b ? { aInterfaceId: a, bInterfaceId: b } : { aInterfaceId: b, bInterfaceId: a }
}

function roomWhere(search: string): SQL | undefined {
  if (!search.trim()) return undefined
  const pattern = likePattern(search.trim())
  return or(
    like(rooms.building, pattern),
    like(rooms.floor, pattern),
    like(rooms.roomNumber, pattern),
    like(rooms.name, pattern)
  )
}

export function listRooms(db: AppDatabase, query: ListQuery = { search: '' }): RoomRecord[] {
  const where = roomWhere(query.search ?? '')
  const rows = db
    .select({
      id: rooms.id,
      name: rooms.name,
      building: rooms.building,
      floor: rooms.floor,
      roomNumber: rooms.roomNumber
    })
    .from(rooms)
    .where(where)
    .orderBy(asc(rooms.building), asc(rooms.floor), asc(rooms.roomNumber))
    .all()
  return rows
}

export function getRoom(db: AppDatabase, id: number): RoomRecord {
  const row = db
    .select({
      id: rooms.id,
      name: rooms.name,
      building: rooms.building,
      floor: rooms.floor,
      roomNumber: rooms.roomNumber
    })
    .from(rooms)
    .where(eq(rooms.id, id))
    .get()
  if (!row) throw new Error('Room not found')
  return row
}

export function createRoom(db: AppDatabase, input: RoomInput): RoomRecord {
  try {
    const inserted = db
      .insert(rooms)
      .values({
        name: input.name ?? null,
        building: input.building,
        floor: input.floor,
        roomNumber: input.roomNumber
      })
      .returning()
      .get()
    return getRoom(db, inserted.id)
  } catch (error) {
    throw new Error(constraintMessage(error, 'Could not create room'))
  }
}

export function updateRoom(db: AppDatabase, id: number, input: RoomInput): RoomRecord {
  try {
    const updated = db
      .update(rooms)
      .set({
        name: input.name ?? null,
        building: input.building,
        floor: input.floor,
        roomNumber: input.roomNumber
      })
      .where(eq(rooms.id, id))
      .returning()
      .get()
    if (!updated) throw new Error('Room not found')
    return getRoom(db, updated.id)
  } catch (error) {
    throw new Error(constraintMessage(error, 'Could not update room'))
  }
}

const rackSelect = {
  id: racks.id,
  roomId: racks.roomId,
  name: racks.name,
  roomLabel: sql<string>`${rooms.building} || ' / ' || ${rooms.floor} || '-' || ${rooms.roomNumber}`.as(
    'roomLabel'
  )
}

export function listRacks(db: AppDatabase, query: ListQuery = { search: '' }): RackRecord[] {
  const pattern = likePattern(query.search?.trim() ?? '')
  const where = query.search?.trim()
    ? or(like(racks.name, pattern), like(rooms.building, pattern), like(ROOM_LABEL, pattern), like(rooms.name, pattern))
    : undefined
  return db
    .select(rackSelect)
    .from(racks)
    .innerJoin(rooms, eq(racks.roomId, rooms.id))
    .where(where)
    .orderBy(asc(rooms.building), asc(racks.name))
    .all()
}

export function getRack(db: AppDatabase, id: number): RackRecord {
  const row = db
    .select(rackSelect)
    .from(racks)
    .innerJoin(rooms, eq(racks.roomId, rooms.id))
    .where(eq(racks.id, id))
    .get()
  if (!row) throw new Error('Rack not found')
  return row
}

export function createRack(db: AppDatabase, input: RackInput): RackRecord {
  try {
    const inserted = db.insert(racks).values({ roomId: input.roomId, name: input.name }).returning().get()
    return getRack(db, inserted.id)
  } catch (error) {
    throw new Error(constraintMessage(error, 'Could not create rack'))
  }
}

export function updateRack(db: AppDatabase, id: number, input: RackInput): RackRecord {
  try {
    const updated = db
      .update(racks)
      .set({ roomId: input.roomId, name: input.name })
      .where(eq(racks.id, id))
      .returning()
      .get()
    if (!updated) throw new Error('Rack not found')
    return getRack(db, updated.id)
  } catch (error) {
    throw new Error(constraintMessage(error, 'Could not update rack'))
  }
}

const deviceSelect = {
  id: devices.id,
  rackId: devices.rackId,
  name: devices.name,
  role: devices.role,
  model: devices.model,
  uPosition: devices.uPosition,
  rackName: racks.name,
  roomLabel: sql<string>`${rooms.building} || ' / ' || ${rooms.floor} || '-' || ${rooms.roomNumber}`.as(
    'roomLabel'
  )
}

export function listDevices(db: AppDatabase, query: ListQuery = { search: '' }): DeviceRecord[] {
  const pattern = likePattern(query.search?.trim() ?? '')
  const where = query.search?.trim()
    ? or(
        like(devices.name, pattern),
        like(devices.role, pattern),
        like(devices.model, pattern),
        like(racks.name, pattern),
        like(rooms.building, pattern),
        like(ROOM_LABEL, pattern)
      )
    : undefined
  return db
    .select(deviceSelect)
    .from(devices)
    .innerJoin(racks, eq(devices.rackId, racks.id))
    .innerJoin(rooms, eq(racks.roomId, rooms.id))
    .where(where)
    .orderBy(asc(devices.name))
    .all()
    .map((row) => ({ ...row, role: row.role as DeviceRecord['role'] }))
}

export function getDevice(db: AppDatabase, id: number): DeviceRecord {
  const row = db
    .select(deviceSelect)
    .from(devices)
    .innerJoin(racks, eq(devices.rackId, racks.id))
    .innerJoin(rooms, eq(racks.roomId, rooms.id))
    .where(eq(devices.id, id))
    .get()
  if (!row) throw new Error('Device not found')
  return { ...row, role: row.role as DeviceRecord['role'] }
}

export function createDevice(db: AppDatabase, input: DeviceInput): DeviceRecord {
  try {
    const inserted = db
      .insert(devices)
      .values({
        rackId: input.rackId,
        name: input.name,
        role: input.role,
        model: input.model ?? null,
        uPosition: input.uPosition ?? null
      })
      .returning()
      .get()
    return getDevice(db, inserted.id)
  } catch (error) {
    throw new Error(constraintMessage(error, 'Could not create device'))
  }
}

export function updateDevice(db: AppDatabase, id: number, input: DeviceInput): DeviceRecord {
  try {
    const updated = db
      .update(devices)
      .set({
        rackId: input.rackId,
        name: input.name,
        role: input.role,
        model: input.model ?? null,
        uPosition: input.uPosition ?? null
      })
      .where(eq(devices.id, id))
      .returning()
      .get()
    if (!updated) throw new Error('Device not found')
    return getDevice(db, updated.id)
  } catch (error) {
    throw new Error(constraintMessage(error, 'Could not update device'))
  }
}

const interfaceSelect = {
  id: interfaces.id,
  deviceId: interfaces.deviceId,
  name: interfaces.name,
  media: interfaces.media,
  speed: interfaces.speed,
  notes: interfaces.notes,
  deviceName: devices.name,
  rackName: racks.name,
  roomLabel: sql<string>`${rooms.building} || ' / ' || ${rooms.floor} || '-' || ${rooms.roomNumber}`.as(
    'roomLabel'
  ),
  label: INTERFACE_LABEL.as('label')
}

function mapInterface(row: typeof interfaceSelect extends infer _ ? {
  id: number
  deviceId: number
  name: string
  media: string
  speed: string | null
  notes: string | null
  deviceName: string
  rackName: string
  roomLabel: string
  label: string
} : never): InterfaceRecord {
  return {
    ...row,
    media: row.media as InterfaceRecord['media'],
    speed: row.speed as InterfaceRecord['speed']
  }
}

export function listInterfaces(db: AppDatabase, query: ListQuery = { search: '' }): InterfaceRecord[] {
  const pattern = likePattern(query.search?.trim() ?? '')
  const where = query.search?.trim()
    ? or(
        like(interfaces.name, pattern),
        like(interfaces.media, pattern),
        like(interfaces.speed, pattern),
        like(interfaces.notes, pattern),
        like(devices.name, pattern),
        like(racks.name, pattern),
        like(INTERFACE_LABEL, pattern)
      )
    : undefined
  return db
    .select(interfaceSelect)
    .from(interfaces)
    .innerJoin(devices, eq(interfaces.deviceId, devices.id))
    .innerJoin(racks, eq(devices.rackId, racks.id))
    .innerJoin(rooms, eq(racks.roomId, rooms.id))
    .where(where)
    .orderBy(asc(interfaces.name))
    .all()
    .map(mapInterface)
}

export function getInterface(db: AppDatabase, id: number): InterfaceRecord {
  const row = db
    .select(interfaceSelect)
    .from(interfaces)
    .innerJoin(devices, eq(interfaces.deviceId, devices.id))
    .innerJoin(racks, eq(devices.rackId, racks.id))
    .innerJoin(rooms, eq(racks.roomId, rooms.id))
    .where(eq(interfaces.id, id))
    .get()
  if (!row) throw new Error('Interface not found')
  return mapInterface(row)
}

export function searchInterfaces(db: AppDatabase, query: InterfaceSearchQuery): InterfaceOption[] {
  const pattern = likePattern(query.search?.trim() ?? '')
  const searchClause = query.search?.trim() ? like(INTERFACE_LABEL, pattern) : undefined
  const unusedOrCurrent = sql`
    ${interfaces.id} NOT IN (
      SELECT a_interface_id FROM link
      UNION
      SELECT b_interface_id FROM link
    )
    OR ${interfaces.id} IN (
      SELECT a_interface_id FROM link WHERE ${query.currentLinkId ?? -1} > 0 AND id = ${query.currentLinkId ?? -1}
      UNION
      SELECT b_interface_id FROM link WHERE ${query.currentLinkId ?? -1} > 0 AND id = ${query.currentLinkId ?? -1}
    )
  `
  const exclude = query.excludeInterfaceId ? sql`${interfaces.id} != ${query.excludeInterfaceId}` : undefined

  return db
    .select({
      id: interfaces.id,
      label: INTERFACE_LABEL.as('label'),
      media: interfaces.media
    })
    .from(interfaces)
    .innerJoin(devices, eq(interfaces.deviceId, devices.id))
    .innerJoin(racks, eq(devices.rackId, racks.id))
    .innerJoin(rooms, eq(racks.roomId, rooms.id))
    .where(and(unusedOrCurrent, exclude, searchClause))
    .orderBy(INTERFACE_LABEL)
    .limit(query.limit ?? 50)
    .all()
    .map((row) => ({ ...row, media: row.media as Media }))
}

export function createInterface(db: AppDatabase, input: InterfaceInput): InterfaceRecord {
  try {
    const inserted = db
      .insert(interfaces)
      .values({
        deviceId: input.deviceId,
        name: input.name,
        media: input.media,
        speed: input.speed ?? null,
        notes: input.notes ?? null
      })
      .returning()
      .get()
    return getInterface(db, inserted.id)
  } catch (error) {
    throw new Error(constraintMessage(error, 'Could not create interface'))
  }
}

export function updateInterface(db: AppDatabase, id: number, input: InterfaceInput): InterfaceRecord {
  try {
    const updated = db
      .update(interfaces)
      .set({
        deviceId: input.deviceId,
        name: input.name,
        media: input.media,
        speed: input.speed ?? null,
        notes: input.notes ?? null
      })
      .where(eq(interfaces.id, id))
      .returning()
      .get()
    if (!updated) throw new Error('Interface not found')
    return getInterface(db, updated.id)
  } catch (error) {
    throw new Error(constraintMessage(error, 'Could not update interface'))
  }
}

const aIface = alias(interfaces, 'a_iface')
const aDevice = alias(devices, 'a_device')
const aRack = alias(racks, 'a_rack')
const aRoom = alias(rooms, 'a_room')
const bIface = alias(interfaces, 'b_iface')
const bDevice = alias(devices, 'b_device')
const bRack = alias(racks, 'b_rack')
const bRoom = alias(rooms, 'b_room')

function linkJoin(db: AppDatabase) {
  return db
    .select({
      id: links.id,
      aInterfaceId: links.aInterfaceId,
      bInterfaceId: links.bInterfaceId,
      aRoom: sql<string>`${aRoom.floor} || '-' || ${aRoom.roomNumber}`.as('aRoom'),
      aRack: aRack.name,
      aDevice: aDevice.name,
      aPort: aIface.name,
      aMedia: aIface.media,
      bRoom: sql<string>`${bRoom.floor} || '-' || ${bRoom.roomNumber}`.as('bRoom'),
      bRack: bRack.name,
      bDevice: bDevice.name,
      bPort: bIface.name,
      bMedia: bIface.media,
      media: links.media,
      cableLabeled: links.cableLabeled,
      notes: links.notes
    })
    .from(links)
    .innerJoin(aIface, eq(aIface.id, links.aInterfaceId))
    .innerJoin(aDevice, eq(aDevice.id, aIface.deviceId))
    .innerJoin(aRack, eq(aRack.id, aDevice.rackId))
    .innerJoin(aRoom, eq(aRoom.id, aRack.roomId))
    .innerJoin(bIface, eq(bIface.id, links.bInterfaceId))
    .innerJoin(bDevice, eq(bDevice.id, bIface.deviceId))
    .innerJoin(bRack, eq(bRack.id, bDevice.rackId))
    .innerJoin(bRoom, eq(bRoom.id, bRack.roomId))
}

function mapLink(row: {
  id: number
  aInterfaceId: number
  bInterfaceId: number
  aRoom: string
  aRack: string
  aDevice: string
  aPort: string
  aMedia: string
  bRoom: string
  bRack: string
  bDevice: string
  bPort: string
  bMedia: string
  media: string
  cableLabeled: boolean
  notes: string | null
}): LinkRecord {
  return {
    ...row,
    aMedia: row.aMedia as Media,
    bMedia: row.bMedia as Media,
    media: row.media as Media
  }
}

export function listLinks(db: AppDatabase, query: ListQuery = { search: '' }): LinkRecord[] {
  const conditions: SQL[] = []
  if (query.search?.trim()) {
    const pattern = likePattern(query.search.trim())
    conditions.push(
      or(
        like(sql`${aRoom.floor} || '-' || ${aRoom.roomNumber}`, pattern),
        like(aRack.name, pattern),
        like(aDevice.name, pattern),
        like(aIface.name, pattern),
        like(sql`${bRoom.floor} || '-' || ${bRoom.roomNumber}`, pattern),
        like(bRack.name, pattern),
        like(bDevice.name, pattern),
        like(bIface.name, pattern),
        like(links.notes, pattern),
        like(links.media, pattern)
      )!
    )
  }
  if (query.media) {
    conditions.push(eq(links.media, query.media))
  }
  if (query.labeled === 'yes' || query.labeled === true) {
    conditions.push(eq(links.cableLabeled, true))
  }
  if (query.labeled === 'no' || query.labeled === false) {
    conditions.push(eq(links.cableLabeled, false))
  }

  const sortMap: Record<string, SQL> = {
    aRoom: sql`${aRoom.floor} || '-' || ${aRoom.roomNumber}`,
    aRack: aRack.name,
    aDevice: aDevice.name,
    aPort: aIface.name,
    bRoom: sql`${bRoom.floor} || '-' || ${bRoom.roomNumber}`,
    bRack: bRack.name,
    bDevice: bDevice.name,
    bPort: bIface.name,
    media: links.media,
    cableLabeled: links.cableLabeled,
    notes: links.notes
  }
  const sortExpr = (query.sortBy && sortMap[query.sortBy]) || sql`${aRoom.floor} || '-' || ${aRoom.roomNumber}`
  const order = query.sortDir === 'desc' ? desc(sortExpr) : asc(sortExpr)

  const rows = linkJoin(db)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(order)
    .all()
  return rows.map(mapLink)
}

export function getLink(db: AppDatabase, id: number): LinkRecord {
  const row = linkJoin(db).where(eq(links.id, id)).get()
  if (!row) throw new Error('Link not found')
  return mapLink(row)
}

export function createLink(db: AppDatabase, input: LinkInput): LinkRecord {
  const endpoints = orderedEndpoints(input.aInterfaceId, input.bInterfaceId)
  try {
    const inserted = db
      .insert(links)
      .values({
        aInterfaceId: endpoints.aInterfaceId,
        bInterfaceId: endpoints.bInterfaceId,
        media: input.media,
        cableLabeled: input.cableLabeled,
        notes: input.notes ?? null
      })
      .returning()
      .get()
    return getLink(db, inserted.id)
  } catch (error) {
    throw new Error(constraintMessage(error, 'Could not create link'))
  }
}

export function updateLink(db: AppDatabase, id: number, input: LinkInput): LinkRecord {
  const endpoints = orderedEndpoints(input.aInterfaceId, input.bInterfaceId)
  try {
    const updated = db
      .update(links)
      .set({
        aInterfaceId: endpoints.aInterfaceId,
        bInterfaceId: endpoints.bInterfaceId,
        media: input.media,
        cableLabeled: input.cableLabeled,
        notes: input.notes ?? null
      })
      .where(eq(links.id, id))
      .returning()
      .get()
    if (!updated) throw new Error('Link not found')
    return getLink(db, updated.id)
  } catch (error) {
    throw new Error(constraintMessage(error, 'Could not update link'))
  }
}

export function mediaWarnings(
  db: AppDatabase,
  input: { aInterfaceId?: number; bInterfaceId?: number; media?: Media }
): MediaWarning[] {
  const warnings: MediaWarning[] = []
  const a = input.aInterfaceId ? getInterface(db, input.aInterfaceId) : undefined
  const b = input.bInterfaceId ? getInterface(db, input.bInterfaceId) : undefined
  if (a && b && a.media !== b.media) {
    warnings.push({
      field: 'a',
      message: `Port media differs: Side A is ${a.media}, Side B is ${b.media}`
    })
  }
  if (a && input.media && a.media !== input.media) {
    warnings.push({
      field: 'link',
      message: `Link media (${input.media}) does not match Side A port media (${a.media})`
    })
  }
  if (b && input.media && b.media !== input.media) {
    warnings.push({
      field: 'b',
      message: `Link media (${input.media}) does not match Side B port media (${b.media})`
    })
  }
  return warnings
}
