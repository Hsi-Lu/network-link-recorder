export const MEDIA = ['copper', 'smf', 'mmf'] as const
export const SPEEDS = ['1G', '10G', '25G', '100G', 'unknown'] as const
export const DEVICE_ROLES = [
  'switch',
  'router',
  'server',
  'patch_panel',
  'firewall',
  'pdu',
  'other'
] as const

export type Media = (typeof MEDIA)[number]
export type Speed = (typeof SPEEDS)[number]
export type DeviceRole = (typeof DEVICE_ROLES)[number]
