import type { FormEventHandler, ReactNode } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

type ListPageProps = {
  title: string
  addTo: string
  search: string
  onSearchChange: (value: string) => void
  children: ReactNode
  filters?: ReactNode
}

export function ListPage({ title, addTo, search, onSearchChange, children, filters }: ListPageProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <Button asChild>
          <Link to={addTo}>Add</Link>
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search"
          className="max-w-sm"
        />
        {filters}
      </div>
      {children}
    </div>
  )
}

export function FormPage({
  title,
  error,
  onSubmit,
  onCancel,
  children,
  submitting
}: {
  title: string
  error?: string
  onSubmit: FormEventHandler
  onCancel: () => void
  children: ReactNode
  submitting?: boolean
}) {
  return (
    <form className="mx-auto max-w-2xl space-y-5" onSubmit={onSubmit}>
      <h1 className="text-2xl font-semibold">{title}</h1>
      {error ? <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">{error}</p> : null}
      {children}
      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          Save
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export function Field({
  label,
  error,
  children
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error ? <span className="text-sm text-destructive">{error}</span> : null}
    </label>
  )
}

export { Select }
