import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState
} from '@tanstack/react-table'
import { ChevronDown, ChevronUp, Columns3, GripVertical } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  PINNED_LAST_COLUMN,
  columnId,
  loadTableLayout,
  mergeColumnOrder,
  moveColumn,
  nudgeColumn,
  saveTableLayout
} from '@/lib/column-layout'

type DataTableProps<T> = {
  columns: ColumnDef<T, unknown>[]
  data: T[]
  storageKey: string
}

function headerLabel(column: { id: string; columnDef: { header?: unknown } }): string {
  if (typeof column.columnDef.header === 'string' && column.columnDef.header.trim()) {
    return column.columnDef.header
  }
  if (column.id === PINNED_LAST_COLUMN) return 'Edit'
  return column.id
}

export function DataTable<T>({ columns, data, storageKey }: DataTableProps<T>) {
  const columnIds = useMemo(() => columns.map((column) => columnId(column)), [columns])
  const stored = useMemo(() => loadTableLayout(storageKey), [storageKey])
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(stored.columnVisibility ?? {})
  const [columnOrder, setColumnOrder] = useState<string[]>(() => mergeColumnOrder(columnIds, stored.columnOrder))
  const [draggingId, setDraggingId] = useState<string>()

  useEffect(() => {
    setColumnOrder((current) => mergeColumnOrder(columnIds, current.length ? current : stored.columnOrder))
  }, [columnIds, stored.columnOrder])

  useEffect(() => {
    saveTableLayout(storageKey, { columnVisibility, columnOrder })
  }, [storageKey, columnVisibility, columnOrder])

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility, columnOrder },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  const visibleCount = table.getVisibleLeafColumns().length

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              <Columns3 className="h-4 w-4" />
              Columns
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 p-2">
            <p className="px-1 pb-2 text-xs text-muted-foreground">Show, hide, or reorder columns</p>
            <div className="space-y-1">
              {table.getAllLeafColumns().map((column, _index, all) => {
                const locked = !column.getCanHide()
                const movable = all.filter((item) => item.getCanHide())
                const movableIndex = movable.findIndex((item) => item.id === column.id)
                return (
                  <div
                    key={column.id}
                    className="flex items-center gap-2 rounded-sm px-1 py-1 text-sm"
                    draggable={!locked}
                    onDragStart={() => setDraggingId(column.id)}
                    onDragOver={(event) => {
                      if (!locked) event.preventDefault()
                    }}
                    onDrop={() => {
                      if (draggingId) setColumnOrder((order) => moveColumn(order, draggingId, column.id))
                      setDraggingId(undefined)
                    }}
                  >
                    <GripVertical className={`h-3.5 w-3.5 ${locked ? 'opacity-20' : 'cursor-grab text-muted-foreground'}`} />
                    <Checkbox
                      checked={column.getIsVisible()}
                      disabled={locked}
                      onCheckedChange={(checked) => column.toggleVisibility(Boolean(checked))}
                    />
                    <span className="flex-1 truncate">{headerLabel(column)}</span>
                    {locked ? null : (
                      <span className="flex">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          disabled={movableIndex <= 0}
                          aria-label={`Move ${headerLabel(column)} left`}
                          onClick={() => setColumnOrder((order) => nudgeColumn(order, column.id, -1))}
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          disabled={movableIndex === movable.length - 1}
                          aria-label={`Move ${headerLabel(column)} right`}
                          onClick={() => setColumnOrder((order) => nudgeColumn(order, column.id, 1))}
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => {
                const locked = header.column.id === PINNED_LAST_COLUMN
                return (
                  <TableHead
                    key={header.id}
                    draggable={!locked}
                    onDragStart={() => setDraggingId(header.column.id)}
                    onDragOver={(event) => {
                      if (!locked) event.preventDefault()
                    }}
                    onDrop={() => {
                      if (draggingId) setColumnOrder((order) => moveColumn(order, draggingId, header.column.id))
                      setDraggingId(undefined)
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center gap-1">
                        {locked ? null : <GripVertical className="h-3.5 w-3.5 cursor-grab text-muted-foreground" />}
                        <button
                          type="button"
                          className={header.column.getCanSort() ? 'cursor-pointer select-none' : undefined}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getIsSorted() === 'asc'
                            ? ' ↑'
                            : header.column.getIsSorted() === 'desc'
                              ? ' ↓'
                              : ''}
                        </button>
                      </div>
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={visibleCount || 1} className="h-24 text-center text-muted-foreground">
                No records
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
