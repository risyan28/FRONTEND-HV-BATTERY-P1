import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router'
import { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useRegisterSW } from 'virtual:pwa-register/react'

import type { Route } from './+types/root'
import './app.css'
import { NotFoundPage } from './not-found'
import { Toaster } from '@/components/ui/sonner'
import { initSentry } from '@/lib/sentry'
import { initTelemetry } from '@/lib/telemetry'
import { queryClient } from '@/lib/query-client'

export const links: Route.LinksFunction = () => []

export function Layout({ children }: { children: React.ReactNode }) {
  // ✅ Initialize Sentry and OpenTelemetry on app startup
  useEffect(() => {
    initSentry()
    initTelemetry()
  }, [])

  // ✅ Register PWA service worker
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('✅ PWA: Service Worker registered')
    },
    onRegisterError(error) {
      console.error('❌ PWA: Service Worker registration failed', error)
    },
  })

  // Auto update when new version available
  useEffect(() => {
    if (needRefresh) {
      console.log('🔄 PWA: New version available, updating...')
      updateServiceWorker(true)
    }
  }, [needRefresh, updateServiceWorker])

  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta name='theme-color' content='#1e3a8a' />
        <link rel='manifest' href='/manifest.json' />
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress error dari browser extension
              window.addEventListener('unhandledrejection', (event) => {
                if (event.reason?.message?.includes('message channel closed')) {
                  event.preventDefault();
                  return false;
                }
              });
              
              // Suppress error dari extension message listener
              const originalError = console.error;
              console.error = function(...args) {
                if (args[0]?.includes?.('message channel closed')) {
                  return;
                }
                originalError.apply(console, args);
              };
            `,
          }}
        />
      </head>
      <body className='font-mono overflow-hidden'>
        {children}
        <ScrollRestoration />
        <Scripts />
        <Toaster />
      </body>
    </html>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      {/* React Query DevTools - only in development */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let stack: string | undefined

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage />
  }

  let message = 'Oops!'
  let details = 'An unexpected error occurred.'

  if (import.meta.env.DEV && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className='pt-16 p-4 container mx-auto'>
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className='w-full p-4 overflow-x-auto'>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}
