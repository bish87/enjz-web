import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Mail, Phone, ShieldCheck, Users } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { EmptyState, PageHeader } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useAdminProviders } from '@/hooks/queries'
import { api, getErrorMessage } from '@/lib/api'
import { formatDate, initials } from '@/lib/format'

const filters = ['all', 'UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED']

function fullName(provider) {
  return [provider.user?.firstName, provider.user?.lastName]
    .filter(Boolean)
    .join(' ')
}

export default function AdminProviders() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [status, setStatus] = useState('all')
  const [selected, setSelected] = useState(null)
  const [note, setNote] = useState('')

  const providersQuery = useAdminProviders(
    status === 'all' ? undefined : status
  )
  const providers = providersQuery.data || []

  const verifyMutation = useMutation({
    mutationFn: async ({ id, nextStatus, reason }) => {
      const payload = { status: nextStatus }
      if (nextStatus === 'REJECTED' && reason) {
        payload.note = reason
      }
      const { data } = await api.patch(
        `/admin/providers/${id}/verification`,
        payload
      )
      return data.provider
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] })
      queryClient.invalidateQueries({ queryKey: ['providers'] })
      toast.success(t('admin.verificationUpdated'))
      setSelected(null)
      setNote('')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t('errors.generic')))
    },
  })

  function handleApprove() {
    if (!selected) {
      return
    }
    verifyMutation.mutate({
      id: selected.id,
      nextStatus: 'VERIFIED',
    })
  }

  function handleReject() {
    if (!selected) {
      return
    }
    if (!note.trim()) {
      toast.error(t('admin.noteRequired'))
      return
    }
    verifyMutation.mutate({
      id: selected.id,
      nextStatus: 'REJECTED',
      reason: note.trim(),
    })
  }

  function closeDialog(open) {
    if (!open) {
      setSelected(null)
      setNote('')
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('admin.providersTitle')}
        subtitle={t('admin.providersSubtitle')}
      />

      <Tabs value={status} onValueChange={setStatus}>
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1">
          {filters.map((filter) => (
            <TabsTrigger key={filter} value={filter} className="rounded-full">
              {filter === 'all' ? t('admin.all') : t(`admin.${filter.toLowerCase()}`)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {providersQuery.isError ? (
        <ErrorState onRetry={() => providersQuery.refetch()} />
      ) : providersQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : providers.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t('admin.noProviders')}
          description={t('admin.noProvidersHint')}
        />
      ) : (
        <div className="space-y-3">
          {providers.map((provider) => (
            <Card key={provider.id} className="gap-0 py-0">
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
                <Avatar className="size-12 shrink-0 rounded-xl">
                  <AvatarFallback className="rounded-xl bg-brand-soft text-sm font-bold text-emerald-800 dark:text-emerald-300">
                    {initials(provider.user?.firstName, provider.user?.lastName)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{fullName(provider)}</p>
                    <StatusBadge status={provider.verificationStatus} />
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Phone className="size-3.5" />
                      <span dir="ltr">{provider.user?.phone}</span>
                    </span>
                    {provider.user?.email ? (
                      <span className="inline-flex items-center gap-1">
                        <Mail className="size-3.5" />
                        {provider.user.email}
                      </span>
                    ) : null}
                    <span>{provider.user?.city}</span>
                    <span>
                      {t('admin.joined')}{' '}
                      {formatDate(provider.createdAt, i18n.resolvedLanguage)}
                    </span>
                  </div>

                  {provider.categories.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {provider.categories.map((category) => (
                        <Badge
                          key={category.id}
                          variant="secondary"
                          className="rounded-full text-[11px]"
                        >
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  ) : null}

                  {provider.areas.length > 0 ? (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {t('admin.serves')}:{' '}
                      </span>
                      {provider.areas
                        .slice(0, 4)
                        .map((area) => area.name)
                        .join(', ')}
                      {provider.areas.length > 4
                        ? ` +${provider.areas.length - 4}`
                        : ''}
                    </p>
                  ) : null}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 self-start"
                  onClick={() => {
                    setSelected(provider)
                    setNote(provider.verificationNote || '')
                  }}
                >
                  <ShieldCheck className="size-4" />
                  {t('admin.review')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={closeDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle>{t('admin.reviewTitle')}</DialogTitle>
                <DialogDescription>
                  {fullName(selected)} · {selected.user?.city}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={selected.verificationStatus} />
                  <Badge variant="outline" className="rounded-full">
                    {t('admin.user')}: {selected.user?.phone}
                  </Badge>
                </div>

                <div className="space-y-1.5 rounded-lg bg-muted/60 p-3 text-sm">
                  <p className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">{t('admin.user')}</span>
                    <span className="font-medium">{fullName(selected)}</span>
                  </p>
                  <p className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">{t('auth.email')}</span>
                    <span className="font-medium">
                      {selected.user?.email || '—'}
                    </span>
                  </p>
                  <p className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">{t('admin.offers')}</span>
                    <span className="text-end font-medium">
                      {selected.categories.length > 0
                        ? selected.categories
                            .map((category) => category.name)
                            .join(', ')
                        : '—'}
                    </span>
                  </p>
                  <p className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">{t('admin.serves')}</span>
                    <span className="text-end font-medium">
                      {selected.areas.length > 0
                        ? selected.areas.map((area) => area.name).join(', ')
                        : '—'}
                    </span>
                  </p>
                </div>

                {selected.bio ? (
                  <p className="max-h-32 overflow-y-auto whitespace-pre-line rounded-lg border p-3 text-sm text-muted-foreground">
                    {selected.bio}
                  </p>
                ) : null}

                <div className="space-y-1.5">
                  <Label htmlFor="verification-note">{t('admin.rejectNote')}</Label>
                  <Textarea
                    id="verification-note"
                    rows={3}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder={t('admin.rejectNotePlaceholder')}
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:justify-between">
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={handleReject}
                  disabled={verifyMutation.isPending}
                >
                  {t('admin.reject')}
                </Button>
                <Button
                  variant="brand"
                  onClick={handleApprove}
                  disabled={verifyMutation.isPending}
                >
                  {verifyMutation.isPending ? t('common.saving') : t('admin.approve')}
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
