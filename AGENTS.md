# network-link-recorder

Electron desktop app for recording **physical network links**. Next step is a working prototype. Follow this file unless the user changes it.

## Stack

| Layer | Choice |
|---|---|
| Shell | Electron |
| UI | React + TypeScript |
| Bundler | Vite (`electron-vite` or Electron Forge + Vite) |
| Components | Tailwind + shadcn/ui |
| Tables | TanStack Table |
| Routing | React Router v8 **Declarative** + **`HashRouter`** |
| Server state | TanStack Query |
| Forms | react-hook-form + Zod |
| DB | SQLite (`better-sqlite3`) in the **main process** only |
| ORM | Drizzle |

Renderer talks to the DB only through **preload IPC**. Store the SQLite file under `app.getPath('userData')`. Share Zod schemas between renderer forms and main-process writes.

## Schema

```
room
  id, name?, building, floor, room_number
  unique (building, floor, room_number)
  floor: text (B1, 3F, RF)
  name: optional nickname (e.g. Core MDF)

rack
  id, room_id, name
  unique (room_id, name)

device
  id, rack_id, name, role, model?, u_position?
  role: switch | router | server | patch_panel | firewall | pdu | other
  unique (rack_id, name)
  v1: rack_id required (racked gear only)

interface
  id, device_id, name, media, speed?, notes?
  media: copper | smf | mmf
  speed?: 1G | 10G | 25G | 100G | unknown
  unique (device_id, name)

link
  id, a_interface_id, b_interface_id
  cable_labeled   -- boolean: physical tag present, not a cable ID string
  media           -- cable plant type; may differ from port media
  notes?
```

A link is identified by **A port + B port**. `cable_labeled` only means a physical label exists.

## Link integrity

1. `a_interface_id != b_interface_id`
2. Always store `a_interface_id < b_interface_id` (no A–B / B–A duplicates)
3. An interface appears in at most one link
4. Warn if A / B / link `media` disagree; do not auto-fix
5. Foreign keys on every `*_id`

## Navigation

Left **sidebar**, five items. Default `#/links`.

- Links
- Rooms
- Racks
- Devices
- Interfaces

## Add / edit

**Full pages**, not dialogs.

| List | Create | Edit |
|---|---|---|
| `#/links` | `#/links/new` | `#/links/:id/edit` |
| `#/rooms` | `#/rooms/new` | `#/rooms/:id/edit` |
| `#/racks` | `#/racks/new` | `#/racks/:id/edit` |
| `#/devices` | `#/devices/new` | `#/devices/:id/edit` |
| `#/interfaces` | `#/interfaces/new` | `#/interfaces/:id/edit` |

List toolbar: Add. Row action: Edit. Cancel returns to the list.

## Link endpoints

Two shadcn **Combobox**es (Side A, Side B). Choose existing `interface` rows; do not type endpoint strings.

Option label: `3F-301 / Rack-A / SW-01 / Gi1/0/24`  
Type-ahead matches any part of that string.

- Exclude ports already used, except the current link’s ports when editing
- A and B cannot be the same port
- If the list is large, filter in SQLite from the query string; do not mount thousands of DOM items

## Links table

Columns: A room, A rack, A device, A port, B room, B rack, B device, B port, media, labeled (yes/no), notes (truncated).

Toolbar: global search (those fields + notes), filter by media, filter by labeled. Sortable columns. Edit action → edit page.

Other entity lists: same pattern (table + search + Add + Edit) with obvious columns.

## Prototype order

1. Electron + Vite + React + shadcn layout (sidebar + outlet)
2. SQLite schema + IPC
3. CRUD pages for room → rack → device → interface
4. Links list + full-page form with two interface comboboxes
