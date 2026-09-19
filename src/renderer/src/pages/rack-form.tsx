import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Field, FormPage } from '@/components/page'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { unwrap } from '@/lib/api'
import { rackInputSchema, type RackInput } from '@shared/schemas'

export function RackFormPage() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string>()

  const rooms = useQuery({
    queryKey: ['rooms', ''],
    queryFn: () => unwrap(window.api.rooms.list({ search: '' }))
  })
  const existing = useQuery({
    queryKey: ['rack', id],
    queryFn: () => unwrap(window.api.racks.get(Number(id))),
    enabled: editing
  })

  const form = useForm<RackInput>({
    resolver: zodResolver(rackInputSchema),
    defaultValues: { roomId: undefined as unknown as number, name: '' }
  })

  useEffect(() => {
    if (existing.data) {
      form.reset({ roomId: existing.data.roomId, name: existing.data.name })
    }
  }, [existing.data, form])

  const mutation = useMutation({
    mutationFn: (values: RackInput) =>
      editing ? unwrap(window.api.racks.update(Number(id), values)) : unwrap(window.api.racks.create(values)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['racks'] })
      navigate('/racks')
    },
    onError: (err: Error) => setError(err.message)
  })

  return (
    <FormPage
      title={editing ? 'Edit rack' : 'Add rack'}
      error={error}
      submitting={mutation.isPending}
      onCancel={() => navigate('/racks')}
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    >
      <Field label="Room" error={form.formState.errors.roomId?.message}>
        <Select {...form.register('roomId', { valueAsNumber: true })}>
          <option value="">Select a room</option>
          {(rooms.data ?? []).map((room) => (
            <option key={room.id} value={room.id}>
              {room.building} / {room.floor}-{room.roomNumber}
              {room.name ? ` (${room.name})` : ''}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Name" error={form.formState.errors.name?.message}>
        <Input {...form.register('name')} placeholder="Rack-A" />
      </Field>
    </FormPage>
  )
}
