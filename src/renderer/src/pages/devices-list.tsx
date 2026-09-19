import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data-table'
import { ListPage } from '@/components/page'
import { Button } from '@/components/ui/button'
import { unwrap } from '@/lib/api'
import type { DeviceRecord } from '@shared/api'

export function DevicesListPage() {
  const [search, setSearch] = useState('')
  const query = useQuery({
    queryKey: ['devices', search],
    queryFn: () => unwrap(window.api.devices.list({ search }))
  })

  const columns = useMemo<ColumnDef<DeviceRecord>[]>(
    () => [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'role', header: 'Role' },
      { accessorKey: 'model', header: 'Model' },
      { accessorKey: 'uPosition', header: 'U' },
      { accessorKey: 'rackName', header: 'Rack' },
      { accessorKey: 'roomLabel', header: 'Room' },
      {
        id: 'actions',
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <Button asChild variant="link" size="sm">
            <Link to={`/devices/${row.original.id}/edit`}>Edit</Link>
          </Button>
        )
      }
    ],
    []
  )

  return (
    <ListPage title="Devices" addTo="/devices/new" search={search} onSearchChange={setSearch}>
      <DataTable storageKey="devices" columns={columns} data={query.data ?? []} />
    </ListPage>
  )
}
