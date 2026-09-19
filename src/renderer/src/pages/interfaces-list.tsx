import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data-table'
import { ListPage } from '@/components/page'
import { Button } from '@/components/ui/button'
import { unwrap } from '@/lib/api'
import type { InterfaceRecord } from '@shared/api'

export function InterfacesListPage() {
  const [search, setSearch] = useState('')
  const query = useQuery({
    queryKey: ['interfaces', search],
    queryFn: () => unwrap(window.api.interfaces.list({ search }))
  })

  const columns = useMemo<ColumnDef<InterfaceRecord>[]>(
    () => [
      { accessorKey: 'name', header: 'Port' },
      { accessorKey: 'media', header: 'Media' },
      { accessorKey: 'speed', header: 'Speed' },
      { accessorKey: 'deviceName', header: 'Device' },
      { accessorKey: 'rackName', header: 'Rack' },
      { accessorKey: 'roomLabel', header: 'Room' },
      { accessorKey: 'notes', header: 'Notes' },
      {
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <Button asChild variant="link" size="sm">
            <Link to={`/interfaces/${row.original.id}/edit`}>Edit</Link>
          </Button>
        )
      }
    ],
    []
  )

  return (
    <ListPage title="Interfaces" addTo="/interfaces/new" search={search} onSearchChange={setSearch}>
      <DataTable columns={columns} data={query.data ?? []} />
    </ListPage>
  )
}
