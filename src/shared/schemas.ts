import { z } from 'zod'
import { DEVICE_ROLES, MEDIA, SPEEDS } from './enums'

const emptyToUndefined = (value: unknown) => {
  if (value === '' || value === null) return undefined
  return value
}

export const mediaSchema = z.enum(MEDIA)
export const speedSchema = z.enum(SPEEDS)
export const deviceRoleSchema = z.enum(DEVICE_ROLES)

export const roomInputSchema = z.object({
  name: z.preprocess(emptyToUndefined, z.string().trim().min(1).optional()),
  building: z.string().trim().min(1, 'Building is required'),
  floor: z.string().trim().min(1, 'Floor is required'),
  roomNumber: z.string().trim().min(1, 'Room number is required')
})

export const roomUpdateSchema = roomInputSchema

export const rackInputSchema = z.object({
  roomId: z.coerce.number().int().positive('Room is required'),
  name: z.string().trim().min(1, 'Name is required')
})

export const deviceInputSchema = z.object({
  rackId: z.coerce.number().int().positive('Rack is required'),
  name: z.string().trim().min(1, 'Name is required'),
  role: deviceRoleSchema,
  model: z.preprocess(emptyToUndefined, z.string().trim().min(1).optional()),
  uPosition: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional())
})

export const interfaceInputSchema = z.object({
  deviceId: z.coerce.number().int().positive('Device is required'),
  name: z.string().trim().min(1, 'Name is required'),
  media: mediaSchema,
  speed: z.preprocess(emptyToUndefined, speedSchema.optional()),
  notes: z.preprocess(emptyToUndefined, z.string().trim().min(1).optional())
})

export const linkInputSchema = z
  .object({
    aInterfaceId: z.coerce.number().int().positive('Side A is required'),
    bInterfaceId: z.coerce.number().int().positive('Side B is required'),
    media: mediaSchema,
    cableLabeled: z.boolean(),
    notes: z.preprocess(emptyToUndefined, z.string().trim().min(1).optional())
  })
  .refine((value) => value.aInterfaceId !== value.bInterfaceId, {
    message: 'Side A and Side B cannot be the same port',
    path: ['bInterfaceId']
  })

export const listQuerySchema = z.object({
  search: z.string().optional().default(''),
  media: z.union([mediaSchema, z.literal('')]).optional(),
  labeled: z.union([z.enum(['yes', 'no', '']), z.boolean()]).optional(),
  sortBy: z.string().optional(),
  sortDir: z.enum(['asc', 'desc']).optional()
})

export const interfaceSearchQuerySchema = z.object({
  search: z.string().optional().default(''),
  excludeInterfaceId: z.number().int().positive().optional(),
  currentLinkId: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional().default(50)
})

export type RoomInput = z.infer<typeof roomInputSchema>
export type RackInput = z.infer<typeof rackInputSchema>
export type DeviceInput = z.infer<typeof deviceInputSchema>
export type InterfaceInput = z.infer<typeof interfaceInputSchema>
export type LinkInput = z.infer<typeof linkInputSchema>
export type ListQuery = z.infer<typeof listQuerySchema>
export type InterfaceSearchQuery = z.infer<typeof interfaceSearchQuerySchema>
