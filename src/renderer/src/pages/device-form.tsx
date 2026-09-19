import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Field, FormPage } from '@/components/page'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { unwrap } from '@/lib/api'
import { DEVICE_ROLES } from '@shared/enums'
import { deviceInputSchema, type DeviceInput } from '@shared/schemas'

export function DeviceFormPage() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string>()

  const racks = useQuery({
    queryKey: ['racks', ''],
    queryFn: () => unwrap(window.api.racks.list({ search: '' }))
  })
  const existing = useQuery({
    queryKey: ['device', id],
    queryFn: () => unwrap(window.api.devices.get(Number(id))),
    enabled: editing
  })

  const form = useForm<DeviceInput>({
    resolver: zodResolver(deviceInputSchema),
    defaultValues: {
      rackId: undefined as unknown as number,
      name: '',
      role: 'switch',
      model: undefined,
      uPosition: undefined
    }
  })

  useEffect(() => {
    if (existing.data) {
      form.reset({
        rackId: existing.data.rackId,
        name: existing.data.name,
        role: existing.data.role,
        model: existing.data.model ?? undefined,
        uPosition: existing.data.uPosition ?? undefined
      })
    }
  }, [existing.data, form])

  const mutation = useMutation({
    mutationFn: (values: DeviceInput) =>
      editing ? unwrap(window.api.devices.update(Number(id), values)) : unwrap(window.api.devices.create(values)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['devices'] })
      navigate('/devices')
    },
    onError: (err: Error) => setError(err.message)
  })

  return (
    <FormPage
      title={editing ? 'Edit device' : 'Add device'}
      error={error}
      submitting={mutation.isPending}
      onCancel={() => navigate('/devices')}
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    >
      <Field label="Rack" error={form.formState.errors.rackId?.message}>
        <Select {...form.register('rackId', { valueAsNumber: true })}>
          <option value="">Select a rack</option>
          {(racks.data ?? []).map((rack) => (
            <option key={rack.id} value={rack.id}>
              {rack.roomLabel} / {rack.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Name" error={form.formState.errors.name?.message}>
        <Input {...form.register('name')} placeholder="SW-01" />
      </Field>
      <Field label="Role" error={form.formState.errors.role?.message}>
        <Select {...form.register('role')}>
          {DEVICE_ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Model (optional)" error={form.formState.errors.model?.message}>
        <Input {...form.register('model')} />
      </Field>
      <Field label="U position (optional)" error={form.formState.errors.uPosition?.message}>
        <Input type="number" {...form.register('uPosition')} />
      </Field>
    </FormPage>
  )
}
