import { contextBridge, ipcRenderer } from 'electron'
import type { AppApi } from '@shared/api'

const api: AppApi = {
  rooms: {
    list: (query) => ipcRenderer.invoke('rooms:list', query),
    get: (id) => ipcRenderer.invoke('rooms:get', id),
    create: (input) => ipcRenderer.invoke('rooms:create', input),
    update: (id, input) => ipcRenderer.invoke('rooms:update', id, input)
  },
  racks: {
    list: (query) => ipcRenderer.invoke('racks:list', query),
    get: (id) => ipcRenderer.invoke('racks:get', id),
    create: (input) => ipcRenderer.invoke('racks:create', input),
    update: (id, input) => ipcRenderer.invoke('racks:update', id, input)
  },
  devices: {
    list: (query) => ipcRenderer.invoke('devices:list', query),
    get: (id) => ipcRenderer.invoke('devices:get', id),
    create: (input) => ipcRenderer.invoke('devices:create', input),
    update: (id, input) => ipcRenderer.invoke('devices:update', id, input)
  },
  interfaces: {
    list: (query) => ipcRenderer.invoke('interfaces:list', query),
    get: (id) => ipcRenderer.invoke('interfaces:get', id),
    search: (query) => ipcRenderer.invoke('interfaces:search', query),
    create: (input) => ipcRenderer.invoke('interfaces:create', input),
    update: (id, input) => ipcRenderer.invoke('interfaces:update', id, input)
  },
  links: {
    list: (query) => ipcRenderer.invoke('links:list', query),
    get: (id) => ipcRenderer.invoke('links:get', id),
    create: (input) => ipcRenderer.invoke('links:create', input),
    update: (id, input) => ipcRenderer.invoke('links:update', id, input),
    mediaWarnings: (input) => ipcRenderer.invoke('links:mediaWarnings', input)
  }
}

contextBridge.exposeInMainWorld('api', api)
