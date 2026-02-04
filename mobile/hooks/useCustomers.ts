import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { endpoints } from "@/lib/endpoints"
import type { Customer } from "@/lib/types"

export const customersQueryKey = ["customers"] as const

interface CustomerCreateInput {
  name: string
  email?: string | null
  phone?: string | null
  postcode?: string | null
  notes?: string | null
}

interface CustomerUpdateInput {
  name?: string
  email?: string | null
  phone?: string | null
  postcode?: string | null
  notes?: string | null
}

export function useCustomers(accessToken: string | undefined) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: customersQueryKey,
    queryFn: () => api.get<Customer[]>(endpoints.customers.list, accessToken!),
    enabled: !!accessToken,
  })

  const createCustomer = useMutation({
    mutationFn: (input: CustomerCreateInput) =>
      api.post<Customer>(endpoints.customers.list, input, accessToken!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customersQueryKey }),
  })

  const updateCustomer = useMutation({
    mutationFn: ({ id, ...input }: CustomerUpdateInput & { id: string }) =>
      api.patch<Customer>(endpoints.customers.get(id), input, accessToken!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customersQueryKey }),
  })

  const deleteCustomer = useMutation({
    mutationFn: (id: string) => api.delete(endpoints.customers.get(id), accessToken!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customersQueryKey }),
  })

  return {
    customers: query.data ?? null,
    loading: query.isLoading,
    error: (query.error ??
      createCustomer.error ??
      updateCustomer.error ??
      deleteCustomer.error) as Error | null,
    refetch: query.refetch,
    createCustomer: createCustomer.mutateAsync,
    isCreating: createCustomer.isPending,
    updateCustomer: updateCustomer.mutateAsync,
    isUpdating: updateCustomer.isPending,
    deleteCustomer: deleteCustomer.mutateAsync,
    isDeleting: deleteCustomer.isPending,
  }
}

export function useCustomer(id: string | undefined, accessToken: string | undefined) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ["customer", id],
    queryFn: () => api.get<Customer>(endpoints.customers.get(id!), accessToken!),
    enabled: !!id && !!accessToken,
  })

  const updateCustomer = useMutation({
    mutationFn: (input: CustomerUpdateInput) =>
      api.patch<Customer>(endpoints.customers.get(id!), input, accessToken!),
    onSuccess: (data) => {
      queryClient.setQueryData(["customer", data.id], data)
      queryClient.invalidateQueries({ queryKey: customersQueryKey })
    },
  })

  const deleteCustomer = useMutation({
    mutationFn: () => api.delete(endpoints.customers.get(id!), accessToken!),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["customer", id] })
      queryClient.invalidateQueries({ queryKey: customersQueryKey })
    },
  })

  return {
    customer: query.data ?? null,
    loading: query.isLoading,
    error: (query.error ?? updateCustomer.error ?? deleteCustomer.error) as Error | null,
    refetch: query.refetch,
    updateCustomer: updateCustomer.mutateAsync,
    isUpdating: updateCustomer.isPending,
    deleteCustomer: deleteCustomer.mutateAsync,
    isDeleting: deleteCustomer.isPending,
  }
}
