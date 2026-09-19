export const PINNED_LAST_COLUMN = 'actions'

export function columnId(column: { id?: string; accessorKey?: unknown }): string {
  return String(column.id ?? column.accessorKey)
}

export function mergeColumnOrder(columnIds: string[], stored?: string[]): string[] {
  const rest = columnIds.filter((id) => id !== PINNED_LAST_COLUMN)
  const pinned = columnIds.filter((id) => id === PINNED_LAST_COLUMN)
  if (!stored?.length) return [...rest, ...pinned]
  const allowed = new Set(rest)
  const ordered = stored.filter((id) => allowed.has(id))
  for (const id of rest) {
    if (!ordered.includes(id)) ordered.push(id)
  }
  return [...ordered, ...pinned]
}

export function moveColumn(order: string[], fromId: string, toId: string): string[] {
  if (fromId === toId || fromId === PINNED_LAST_COLUMN || toId === PINNED_LAST_COLUMN) return order
  const rest = order.filter((id) => id !== PINNED_LAST_COLUMN)
  const from = rest.indexOf(fromId)
  const to = rest.indexOf(toId)
  if (from < 0 || to < 0) return order
  const next = [...rest]
  next.splice(from, 1)
  next.splice(to, 0, fromId)
  return order.includes(PINNED_LAST_COLUMN) ? [...next, PINNED_LAST_COLUMN] : next
}

export function nudgeColumn(order: string[], id: string, direction: -1 | 1): string[] {
  const rest = order.filter((item) => item !== PINNED_LAST_COLUMN)
  const index = rest.indexOf(id)
  const target = rest[index + direction]
  if (!target) return order
  return moveColumn(order, id, target)
}

export type TableLayout = {
  columnVisibility: Record<string, boolean>
  columnOrder: string[]
}

export function loadTableLayout(key: string): Partial<TableLayout> {
  try {
    const raw = localStorage.getItem(`table-layout:${key}`)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Partial<TableLayout>
    return {
      columnVisibility: parsed.columnVisibility ?? {},
      columnOrder: parsed.columnOrder ?? []
    }
  } catch {
    return {}
  }
}

export function saveTableLayout(key: string, layout: TableLayout): void {
  localStorage.setItem(`table-layout:${key}`, JSON.stringify(layout))
}
