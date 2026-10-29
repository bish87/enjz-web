import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FolderTree, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { EmptyState, PageHeader } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useCategories } from '@/hooks/queries'
import { api, getErrorMessage } from '@/lib/api'
import { formatDate } from '@/lib/format'

export default function AdminCategories() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const categoriesQuery = useCategories()
  const [name, setName] = useState('')
  const [deleting, setDeleting] = useState(null)

  const createMutation = useMutation({
    mutationFn: async (categoryName) => {
      const { data } = await api.post('/categories', { name: categoryName })
      return data.category
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setName('')
      toast.success(t('admin.categoryCreated'))
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t('errors.generic')))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/categories/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setDeleting(null)
      toast.success(t('admin.categoryDeleted'))
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t('errors.generic')))
    },
  })

  const categories = categoriesQuery.data || []

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      return
    }
    createMutation.mutate(trimmed)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('admin.categoriesTitle')}
        subtitle={t('admin.categoriesSubtitle')}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('admin.addCategory')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t('admin.categoryNamePlaceholder')}
              aria-label={t('admin.categoryName')}
              maxLength={100}
              className="sm:max-w-sm"
            />
            <Button
              type="submit"
              variant="brand"
              disabled={createMutation.isPending || !name.trim()}
            >
              <Plus className="size-4" />
              {createMutation.isPending ? t('common.adding') : t('admin.addCategory')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {categoriesQuery.isError ? (
        <ErrorState onRetry={() => categoriesQuery.refetch()} />
      ) : categoriesQuery.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title={t('admin.noCategories')}
          description={t('admin.noCategoriesHint')}
        />
      ) : (
        <Card className="gap-0 py-0">
          <CardContent className="divide-y p-0">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{category.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(category.createdAt, i18n.resolvedLanguage)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleting(category)}
                  aria-label={t('common.delete')}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleting(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.deleteCategoryTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.deleteCategoryText')}
              {deleting ? (
                <span className="mt-2 block font-semibold text-foreground">
                  {deleting.name}
                </span>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => deleteMutation.mutate(deleting.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? t('common.deleting') : t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
