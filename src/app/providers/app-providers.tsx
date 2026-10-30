import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { MantineProvider } from '@mantine/core'
import { Notifications, notifications } from '@mantine/notifications'
import { AppError, isAbortError, parseApiError } from '@/shared/api'
import { shouldShowAppErrorNotification } from '@/shared/api/error-notification-guard'

function notifyApiError(error: unknown, silent: boolean): void {
  if (silent || isAbortError(error)) {
    return
  }

  const appError =
    error instanceof AppError ? error : parseApiError(undefined, 0)

  if (!shouldShowAppErrorNotification(appError)) {
    return
  }

  notifications.show({
    color: 'red',
    title: appError.title,
    message: appError.detail,
  })
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) =>
      notifyApiError(error, query.meta?.silent === true),
  }),
  mutationCache: new MutationCache({
    onError: (_error, _variables, _context, mutation) =>
      notifyApiError(_error, mutation.meta?.silent === true),
  }),
  defaultOptions: {
    queries: {
      retry: (failureCount, error) =>
        error instanceof AppError &&
        (error.kind === 'network' || error.kind === 'server') &&
        failureCount < 1,
    },
    mutations: {
      retry: false,
    },
  },
})

interface AppProvidersProps {
  children: ReactNode
}

function AppProviders({ children }: AppProvidersProps) {
  return (
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Notifications position="top-right" />
      </QueryClientProvider>
    </MantineProvider>
  )
}

export default AppProviders
