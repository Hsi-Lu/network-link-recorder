import { ipcMain } from 'electron'
import type { AppDatabase } from './db/sqlite'
import {
  createDevice,
  createInterface,
  createLink,
  createRack,
  createRoom,
  getDevice,
  getInterface,
  getLink,
  getRack,
  getRoom,
  listDevices,
  listInterfaces,
  listLinks,
  listRacks,
  listRooms,
  mediaWarnings,
  searchInterfaces,
  updateDevice,
  updateInterface,
  updateLink,
  updateRack,
  updateRoom
} from './db/queries'
import {
  deviceInputSchema,
  interfaceInputSchema,
  interfaceSearchQuerySchema,
  linkInputSchema,
  listQuerySchema,
  rackInputSchema,
  roomInputSchema
} from '@shared/schemas'
import type { Result } from '@shared/api'
import { z } from 'zod'

function wrap<T>(fn: () => T): Result<T> {
  try {
    return { ok: true, data: fn() }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}

const idSchema = z.coerce.number().int().positive()

export function registerIpc(db: AppDatabase): void {
  ipcMain.handle('rooms:list', (_event, query) => wrap(() => listRooms(db, listQuerySchema.parse(query ?? {}))))
  ipcMain.handle('rooms:get', (_event, id) => wrap(() => getRoom(db, idSchema.parse(id))))
  ipcMain.handle('rooms:create', (_event, input) => wrap(() => createRoom(db, roomInputSchema.parse(input))))
  ipcMain.handle('rooms:update', (_event, id, input) =>
    wrap(() => updateRoom(db, idSchema.parse(id), roomInputSchema.parse(input)))
  )

  ipcMain.handle('racks:list', (_event, query) => wrap(() => listRacks(db, listQuerySchema.parse(query ?? {}))))
  ipcMain.handle('racks:get', (_event, id) => wrap(() => getRack(db, idSchema.parse(id))))
  ipcMain.handle('racks:create', (_event, input) => wrap(() => createRack(db, rackInputSchema.parse(input))))
  ipcMain.handle('racks:update', (_event, id, input) =>
    wrap(() => updateRack(db, idSchema.parse(id), rackInputSchema.parse(input)))
  )

  ipcMain.handle('devices:list', (_event, query) => wrap(() => listDevices(db, listQuerySchema.parse(query ?? {}))))
  ipcMain.handle('devices:get', (_event, id) => wrap(() => getDevice(db, idSchema.parse(id))))
  ipcMain.handle('devices:create', (_event, input) => wrap(() => createDevice(db, deviceInputSchema.parse(input))))
  ipcMain.handle('devices:update', (_event, id, input) =>
    wrap(() => updateDevice(db, idSchema.parse(id), deviceInputSchema.parse(input)))
  )

  ipcMain.handle('interfaces:list', (_event, query) =>
    wrap(() => listInterfaces(db, listQuerySchema.parse(query ?? {})))
  )
  ipcMain.handle('interfaces:get', (_event, id) => wrap(() => getInterface(db, idSchema.parse(id))))
  ipcMain.handle('interfaces:search', (_event, query) =>
    wrap(() => searchInterfaces(db, interfaceSearchQuerySchema.parse(query ?? {})))
  )
  ipcMain.handle('interfaces:create', (_event, input) =>
    wrap(() => createInterface(db, interfaceInputSchema.parse(input)))
  )
  ipcMain.handle('interfaces:update', (_event, id, input) =>
    wrap(() => updateInterface(db, idSchema.parse(id), interfaceInputSchema.parse(input)))
  )

  ipcMain.handle('links:list', (_event, query) => wrap(() => listLinks(db, listQuerySchema.parse(query ?? {}))))
  ipcMain.handle('links:get', (_event, id) => wrap(() => getLink(db, idSchema.parse(id))))
  ipcMain.handle('links:create', (_event, input) => wrap(() => createLink(db, linkInputSchema.parse(input))))
  ipcMain.handle('links:update', (_event, id, input) =>
    wrap(() => updateLink(db, idSchema.parse(id), linkInputSchema.parse(input)))
  )
  ipcMain.handle('links:mediaWarnings', (_event, input) =>
    wrap(() =>
      mediaWarnings(db, {
        aInterfaceId: input?.aInterfaceId,
        bInterfaceId: input?.bInterfaceId,
        media: input?.media
      })
    )
  )
}
