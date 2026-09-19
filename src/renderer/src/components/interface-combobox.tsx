import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Combobox } from '@/components/ui/combobox'
import { unwrap } from '@/lib/api'

type Props = {
  value?: number
  onChange: (id: number | undefined) => void
  excludeInterfaceId?: number
  currentLinkId?: number
  placeholder?: string
}

export function InterfaceCombobox({
  value,
  onChange,
  excludeInterfaceId,
  currentLinkId,
  placeholder = 'Select interface'
}: Props) {
  const [search, setSearch] = useState('')
  const query = useQuery({
    queryKey: ['interface-search', search, excludeInterfaceId, currentLinkId],
    queryFn: () =>
      unwrap(
        window.api.interfaces.search({
          search,
          excludeInterfaceId,
          currentLinkId,
          limit: 50
        })
      )
  })

  const selectedQuery = useQuery({
    queryKey: ['interface', value],
    queryFn: () => unwrap(window.api.interfaces.get(value!)),
    enabled: Boolean(value)
  })

  const options = useMemo(() => {
    const rows = query.data ?? []
    const mapped = rows.map((row) => ({ value: String(row.id), label: row.label }))
    if (selectedQuery.data && !mapped.some((row) => row.value === String(selectedQuery.data.id))) {
      mapped.unshift({ value: String(selectedQuery.data.id), label: selectedQuery.data.label })
    }
    return mapped
  }, [query.data, selectedQuery.data])

  return (
    <Combobox
      value={value ? String(value) : undefined}
      onChange={(next) => onChange(next ? Number(next) : undefined)}
      options={options}
      placeholder={placeholder}
      searchPlaceholder="Type to search ports"
      emptyText="No unused ports match"
      onSearchChange={setSearch}
    />
  )
}
