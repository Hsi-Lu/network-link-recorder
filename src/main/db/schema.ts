import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'

export const rooms = sqliteTable(
  'room',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name'),
    building: text('building').notNull(),
    floor: text('floor').notNull(),
    roomNumber: text('room_number').notNull()
  },
  (table) => [unique('room_location_unique').on(table.building, table.floor, table.roomNumber)]
)

export const racks = sqliteTable(
  'rack',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    roomId: integer('room_id')
      .notNull()
      .references(() => rooms.id),
    name: text('name').notNull()
  },
  (table) => [unique('rack_room_name_unique').on(table.roomId, table.name)]
)

export const devices = sqliteTable(
  'device',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    rackId: integer('rack_id')
      .notNull()
      .references(() => racks.id),
    name: text('name').notNull(),
    role: text('role').notNull(),
    model: text('model'),
    uPosition: integer('u_position')
  },
  (table) => [unique('device_rack_name_unique').on(table.rackId, table.name)]
)

export const interfaces = sqliteTable(
  'interface',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    deviceId: integer('device_id')
      .notNull()
      .references(() => devices.id),
    name: text('name').notNull(),
    media: text('media').notNull(),
    speed: text('speed'),
    notes: text('notes')
  },
  (table) => [unique('interface_device_name_unique').on(table.deviceId, table.name)]
)

export const links = sqliteTable(
  'link',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    aInterfaceId: integer('a_interface_id')
      .notNull()
      .references(() => interfaces.id),
    bInterfaceId: integer('b_interface_id')
      .notNull()
      .references(() => interfaces.id),
    cableLabeled: integer('cable_labeled', { mode: 'boolean' }).notNull(),
    media: text('media').notNull(),
    notes: text('notes')
  },
  (table) => [unique('link_endpoints_unique').on(table.aInterfaceId, table.bInterfaceId)]
)
