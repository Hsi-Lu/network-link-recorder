import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { InterfaceCombobox } from '@/components/interface-combobox'
import { Field, FormPage } from '@/components/page'
import { Checkbox } from '@/components/ui/checkbox'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { unwrap } from '@/lib/api'
import { MEDIA } from '@shared/enums'
import { linkInputSchema, type LinkInput } from '@shared/schemas'

export function LinkFormPage() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string>()

  const existing = useQuery({
    queryKey: ['link', id],
    queryFn: () => unwrap(window.api.links.get(Number(id))),
    enabled: editing
  })

  const form = useForm<LinkInput>({
    resolver: zodResolver(linkInputSchema),
    defaultValues: {
      aInterfaceId: undefined as unknown as number,
      bInterfaceId: undefined as unknown as number,
      media: 'copper',
      cableLabeled: false,
      notes: undefined
    }
  })

  useEffect(() => {
    if (existing.data) {
      form.reset({
        aInterfaceId: existing.data.aInterfaceId,
        bInterfaceId: existing.data.bInterfaceId,
        media: existing.data.media,
        cableLabeled: existing.data.cableLabeled,
        notes: existing.data.notes ?? undefined
      })
    }
  }, [existing.data, form])

  const aInterfaceId = useWatch({ control: form.control, name: 'aInterfaceId' })
  const bInterfaceId = useWatch({ control: form.control, name: 'bInterfaceId' })
  const media = useWatch({ control: form.control, name: 'media' })

  const warnings = useQuery({
    queryKey: ['media-warnings', aInterfaceId, bInterfaceId, media],
    queryFn: () =>
      unwrap(
        window.api.links.mediaWarnings({
          aInterfaceId: aInterfaceId || undefined,
          bInterfaceId: bInterfaceId || undefined,
          media
        })
      ),
    enabled: Boolean(aInterfaceId || bInterfaceId || media)
  })

  const mutation = useMutation({
    mutationFn: (values: LinkInput) =>
      editing ? unwrap(window.api.links.update(Number(id), values)) : unwrap(window.api.links.create(values)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['links'] })
      await queryClient.invalidateQueries({ queryKey: ['interface-search'] })
      navigate('/links')
    },
    onError: (err: Error) => setError(err.message)
  })

  return (
    <FormPage
      title={editing ? 'Edit link' : 'Add link'}
      error={error}
      submitting={mutation.isPending}
      onCancel={() => navigate('/links')}
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    >
      <Field label="Side A" error={form.formState.errors.aInterfaceId?.message}>
        <Controller
          control={form.control}
          name="aInterfaceId"
          render={({ field }) => (
            <InterfaceCombobox
              value={field.value}
              onChange={field.onChange}
              excludeInterfaceId={bInterfaceId || undefined}
              currentLinkId={editing ? Number(id) : undefined}
              placeholder="Select Side A port"
            />
          )}
        />
      </Field>
      <Field label="Side B" error={form.formState.errors.bInterfaceId?.message}>
        <Controller
          control={form.control}
          name="bInterfaceId"
          render={({ field }) => (
            <InterfaceCombobox
              value={field.value}
              onChange={field.onChange}
              excludeInterfaceId={aInterfaceId || undefined}
              currentLinkId={editing ? Number(id) : undefined}
              placeholder="Select Side B port"
            />
          )}
        />
      </Field>
      <Field label="Cable media" error={form.formState.errors.media?.message}>
        <Select {...form.register('media')}>
          {MEDIA.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <Controller
          control={form.control}
          name="cableLabeled"
          render={({ field }) => (
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
        Physical cable label present
      </label>
      <Field label="Notes (optional)" error={form.formState.errors.notes?.message}>
        <Textarea {...form.register('notes')} />
      </Field>
      {(warnings.data ?? []).length > 0 ? (
        <div className="space-y-1 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          {(warnings.data ?? []).map((warning) => (
            <p key={`${warning.field}-${warning.message}`}>{warning.message}</p>
          ))}
        </div>
      ) : null}
    </FormPage>
  )
}
