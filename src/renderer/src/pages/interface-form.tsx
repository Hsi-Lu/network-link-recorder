import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Field, FormPage } from '@/components/page'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { unwrap } from '@/lib/api'
import { MEDIA, SPEEDS } from '@shared/enums'
import { interfaceInputSchema, type InterfaceInput } from '@shared/schemas'

export function InterfaceFormPage() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string>()

  const devices = useQuery({
    queryKey: ['devices', ''],
    queryFn: () => unwrap(window.api.devices.list({ search: '' }))
  })
  const existing = useQuery({
    queryKey: ['interface', id],
    queryFn: () => unwrap(window.api.interfaces.get(Number(id))),
    enabled: editing
  })

  const form = useForm<InterfaceInput>({
    resolver: zodResolver(interfaceInputSchema),
    defaultValues: {
      deviceId: undefined as unknown as number,
      name: '',
      media: 'copper',
      speed: undefined,
      notes: undefined
    }
  })

  useEffect(() => {
    if (existing.data) {
      form.reset({
        deviceId: existing.data.deviceId,
        name: existing.data.name,
        media: existing.data.media,
        speed: existing.data.speed ?? undefined,
        notes: existing.data.notes ?? undefined
      })
    }
  }, [existing.data, form])

  const mutation = useMutation({
    mutationFn: (values: InterfaceInput) =>
      editing
        ? unwrap(window.api.interfaces.update(Number(id), values))
        : unwrap(window.api.interfaces.create(values)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['interfaces'] })
      await queryClient.invalidateQueries({ queryKey: ['interface-search'] })
      navigate('/interfaces')
    },
    onError: (err: Error) => setError(err.message)
  })

  return (
    <FormPage
      title={editing ? 'Edit interface' : 'Add interface'}
      error={error}
      submitting={mutation.isPending}
      onCancel={() => navigate('/interfaces')}
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    >
      <Field label="Device" error={form.formState.errors.deviceId?.message}>
        <Select {...form.register('deviceId', { valueAsNumber: true })}>
          <option value="">Select a device</option>
          {(devices.data ?? []).map((device) => (
            <option key={device.id} value={device.id}>
              {device.roomLabel} / {device.rackName} / {device.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Name" error={form.formState.errors.name?.message}>
        <Input {...form.register('name')} placeholder="Gi1/0/24" />
      </Field>
      <Field label="Media" error={form.formState.errors.media?.message}>
        <Select {...form.register('media')}>
          {MEDIA.map((media) => (
            <option key={media} value={media}>
              {media}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Speed (optional)" error={form.formState.errors.speed?.message}>
        <Select {...form.register('speed')}>
          <option value="">Unknown / unset</option>
          {SPEEDS.map((speed) => (
            <option key={speed} value={speed}>
              {speed}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Notes (optional)" error={form.formState.errors.notes?.message}>
        <Textarea {...form.register('notes')} />
      </Field>
    </FormPage>
  )
}
