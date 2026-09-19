import type {
  DeviceInput,
  InterfaceInput,
  InterfaceSearchQuery,
  LinkInput,
  ListQuery,
  RackInput,
  RoomInput
} from './schemas'
import type { DeviceRole, Media, Speed } from './enums'

export type Result<T> = { ok: true; data: T } | { ok: false; error: string }

export type RoomRecord = {
  id: number
  name: string | null
  building: string
  floor: string
  roomNumber: string
}

export type RackRecord = {
  id: number
  roomId: number
  name: string
  roomLabel: string
}

export type DeviceRecord = {
  id: number
  rackId: number
  name: string
  role: DeviceRole
  model: string | null
  uPosition: number | null
  rackName: string
  roomLabel: string
}

export type InterfaceRecord = {
  id: number
  deviceId: number
  name: string
  media: Media
  speed: Speed | null
  notes: string | null
  deviceName: string
  rackName: string
  roomLabel: string
  label: string
}

export type InterfaceOption = {
  id: number
  label: string
  media: Media
}

export type LinkRecord = {
  id: number
  aInterfaceId: number
  bInterfaceId: number
  aRoom: string
  aRack: string
  aDevice: string
  aPort: string
  aMedia: Media
  bRoom: string
  bRack: string
  bDevice: string
  bPort: string
  bMedia: Media
  media: Media
  cableLabeled: boolean
  notes: string | null
}

export type MediaWarning = {
  field: 'a' | 'b' | 'link'
  message: string
}

export type AppApi = {
  rooms: {
    list: (query?: ListQuery) => Promise<Result<RoomRecord[]>>
    get: (id: number) => Promise<Result<RoomRecord>>
    create: (input: RoomInput) => Promise<Result<RoomRecord>>
    update: (id: number, input: RoomInput) => Promise<Result<RoomRecord>>
  }
  racks: {
    list: (query?: ListQuery) => Promise<Result<RackRecord[]>>
    get: (id: number) => Promise<Result<RackRecord>>
    create: (input: RackInput) => Promise<Result<RackRecord>>
    update: (id: number, input: RackInput) => Promise<Result<RackRecord>>
  }
  devices: {
    list: (query?: ListQuery) => Promise<Result<DeviceRecord[]>>
    get: (id: number) => Promise<Result<DeviceRecord>>
    create: (input: DeviceInput) => Promise<Result<DeviceRecord>>
    update: (id: number, input: DeviceInput) => Promise<Result<DeviceRecord>>
  }
  interfaces: {
    list: (query?: ListQuery) => Promise<Result<InterfaceRecord[]>>
    get: (id: number) => Promise<Result<InterfaceRecord>>
    search: (query: InterfaceSearchQuery) => Promise<Result<InterfaceOption[]>>
    create: (input: InterfaceInput) => Promise<Result<InterfaceRecord>>
    update: (id: number, input: InterfaceInput) => Promise<Result<InterfaceRecord>>
  }
  links: {
    list: (query?: ListQuery) => Promise<Result<LinkRecord[]>>
    get: (id: number) => Promise<Result<LinkRecord>>
    create: (input: LinkInput) => Promise<Result<LinkRecord>>
    update: (id: number, input: LinkInput) => Promise<Result<LinkRecord>>
    mediaWarnings: (input: {
      aInterfaceId?: number
      bInterfaceId?: number
      media?: Media
    }) => Promise<Result<MediaWarning[]>>
  }
}
