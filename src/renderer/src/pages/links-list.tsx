import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data-table'
import { ListPage } from '@/components/page'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { unwrap } from '@/lib/api'
import type { LinkRecord } from '@shared/api'
import { MEDIA } from '@shared/enums'

function truncate(value: string | null, length = 48): string {
  if (!value) return ''
  return value.length > length ? `${value.slice(0, length)}…` : value
}

export function LinksListPage() {
  const [search, setSearch] = useState('')
  const [media, setMedia] = useState('')
  const [labeled, setLabeled] = useState('')
  const query = useQuery({
    queryKey: ['links', search, media, labeled],
    queryFn: () =>
      unwrap(
        window.api.links.list({
          search,
          media: media === '' ? undefined : (media as (typeof MEDIA)[number]),
          labeled: labeled === '' ? undefined : (labeled as 'yes' | 'no')
        })
      )
  })

  const columns = useMemo<ColumnDef<LinkRecord>[]>(
    () => [
      { accessorKey: 'aRoom', header: 'A room' },
      { accessorKey: 'aRack', header: 'A rack' },
      { accessorKey: 'aDevice', header: 'A device' },
      { accessorKey: 'aPort', header: 'A port' },
      { accessorKey: 'bRoom', header: 'B room' },
      { accessorKey: 'bRack', header: 'B rack' },
      { accessorKey: 'bDevice', header: 'B device' },
      { accessorKey: 'bPort', header: 'B port' },
      { accessorKey: 'media', header: 'Media' },
      {
        accessorKey: 'cableLabeled',
        header: 'Labeled',
        cell: ({ getValue }) => (getValue<boolean>() ? 'yes' : 'no')
      },
      {
        accessorKey: 'notes',
        header: 'Notes',
        cell: ({ getValue }) => truncate(getValue<string | null>())
      },
      {
        id: 'actions',
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <Button asChild variant="link" size="sm">
            <Link to={`/links/${row.original.id}/edit`}>Edit</Link>
          </Button>
        )
      }
    ],
    []
  )

  return (
    <ListPage
      title="Links"
      addTo="/links/new"
      search={search}
      onSearchChange={setSearch}
      filters={
        <>
          <Select value={media} onChange={(event) => setMedia(event.target.value)} className="w-36">
            <option value="">All media</option>
            {MEDIA.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Select value={labeled} onChange={(event) => setLabeled(event.target.value)} className="w-36">
            <option value="">All labels</option>
            <option value="yes">Labeled</option>
            <option value="no">Unlabeled</option>
          </Select>
        </>
      }
    >
      <DataTable storageKey="links" columns={columns} data={query.data ?? []} />
    </ListPage>
  )
}
