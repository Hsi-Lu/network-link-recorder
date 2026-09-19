import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data-table'
import { ListPage } from '@/components/page'
import { Button } from '@/components/ui/button'
import { unwrap } from '@/lib/api'
import type { RoomRecord } from '@shared/api'

export function RoomsListPage() {
  const [search, setSearch] = useState('')
  const query = useQuery({
    queryKey: ['rooms', search],
    queryFn: () => unwrap(window.api.rooms.list({ search }))
  })

  const columns = useMemo<ColumnDef<RoomRecord>[]>(
    () => [
      { accessorKey: 'building', header: 'Building' },
      { accessorKey: 'floor', header: 'Floor' },
      { accessorKey: 'roomNumber', header: 'Room' },
      { accessorKey: 'name', header: 'Name' },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <Button asChild variant="link" size="sm">
            <Link to={`/rooms/${row.original.id}/edit`}>Edit</Link>
          </Button>
        )
      }
    ],
    []
  )

  return (
    <ListPage title="Rooms" addTo="/rooms/new" search={search} onSearchChange={setSearch}>
      <DataTable storageKey="rooms" columns={columns} data={query.data ?? []} />
    </ListPage>
  )
}
