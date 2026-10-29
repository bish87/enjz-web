import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories')
      return data.categories
    },
  })
}

export function useAreas(state) {
  return useQuery({
    queryKey: ['areas', state || 'all'],
    queryFn: async () => {
      const { data } = await api.get('/areas', {
        params: state ? { state } : undefined,
      })
      return data.areas
    },
  })
}

export function useProviders(filters = {}) {
  return useQuery({
    queryKey: ['providers', filters],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const params = Object.fromEntries(
        Object.entries(filters).filter(
          ([, value]) => value !== '' && value !== null && value !== undefined
        )
      )
      const { data } = await api.get('/providers', { params })
      return data
    },
  })
}

export function useProvider(id) {
  return useQuery({
    queryKey: ['provider', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await api.get(`/providers/${id}`)
      return data.provider
    },
  })
}

export function useMyProvider(enabled = true) {
  return useQuery({
    queryKey: ['provider', 'me'],
    enabled,
    queryFn: async () => {
      const { data } = await api.get('/providers/me')
      return data.provider
    },
  })
}

export function useAdminProviders(status) {
  return useQuery({
    queryKey: ['admin', 'providers', status || 'all'],
    queryFn: async () => {
      const { data } = await api.get('/admin/providers', {
        params: status ? { status } : undefined,
      })
      return data.providers
    },
  })
}
