import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Field, FormPage } from '@/components/page'
import { Input } from '@/components/ui/input'
import { unwrap } from '@/lib/api'
import { roomInputSchema, type RoomInput } from '@shared/schemas'

export function RoomFormPage() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string>()

  const existing = useQuery({
    queryKey: ['room', id],
    queryFn: () => unwrap(window.api.rooms.get(Number(id))),
    enabled: editing
  })

  const form = useForm<RoomInput>({
    resolver: zodResolver(roomInputSchema),
    defaultValues: { building: '', floor: '', roomNumber: '', name: undefined }
  })

  useEffect(() => {
    if (existing.data) {
      form.reset({
        building: existing.data.building,
        floor: existing.data.floor,
        roomNumber: existing.data.roomNumber,
        name: existing.data.name ?? undefined
      })
    }
  }, [existing.data, form])

  const mutation = useMutation({
    mutationFn: (values: RoomInput) =>
      editing ? unwrap(window.api.rooms.update(Number(id), values)) : unwrap(window.api.rooms.create(values)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['rooms'] })
      navigate('/rooms')
    },
    onError: (err: Error) => setError(err.message)
  })

  return (
    <FormPage
      title={editing ? 'Edit room' : 'Add room'}
      error={error}
      submitting={mutation.isPending}
      onCancel={() => navigate('/rooms')}
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    >
      <Field label="Building" error={form.formState.errors.building?.message}>
        <Input {...form.register('building')} />
      </Field>
      <Field label="Floor" error={form.formState.errors.floor?.message}>
        <Input {...form.register('floor')} placeholder="B1, 3F, RF" />
      </Field>
      <Field label="Room number" error={form.formState.errors.roomNumber?.message}>
        <Input {...form.register('roomNumber')} />
      </Field>
      <Field label="Name (optional)" error={form.formState.errors.name?.message}>
        <Input {...form.register('name')} placeholder="Core MDF" />
      </Field>
    </FormPage>
  )
}
