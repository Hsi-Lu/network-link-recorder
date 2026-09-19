import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data-table'
import { ListPage } from '@/components/page'
import { Button } from '@/components/ui/button'
import { unwrap } from '@/lib/api'
import type { RackRecord } from '@shared/api'

export function RacksListPage() {
  const [search, setSearch] = useState('')
  const query = useQuery({
    queryKey: ['racks', search],
    queryFn: () => unwrap(window.api.racks.list({ search }))
  })

  const columns = useMemo<ColumnDef<RackRecord>[]>(
    () => [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'roomLabel', header: 'Room' },
      {
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <Button asChild variant="link" size="sm">
            <Link to={`/racks/${row.original.id}/edit`}>Edit</Link>
          </Button>
        )
      }
    ],
    []
  )

  return (
    <ListPage title="Racks" addTo="/racks/new" search={search} onSearchChange={setSearch}>
      <DataTable columns={columns} data={query.data ?? []} />
    </ListPage>
  )
}
