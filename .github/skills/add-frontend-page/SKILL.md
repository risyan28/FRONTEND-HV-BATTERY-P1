---
name: add-frontend-page
description: >
  Guide for adding a new page/route to this React Router v7 frontend.
  Use this when asked to add a new page, screen, or route to the frontend.
---

# Add New Frontend Page — Step-by-Step Pattern

This project uses: **React Router v7 + TypeScript + shadcn/ui + Axios + Zod + TanStack Query**

Folder structure convention:
```
app/
  routes/
    dashboard-user/manufacture/<page-name>.tsx  ← Route entry file (thin wrapper)
  dashboard-user/manufacture/<page-name>/
    index.tsx                                    ← Main page component
  services/
    <feature>Api.ts                              ← API calls (Axios via createApi())
  hooks/
    use-<feature>.ts                             ← Custom React hooks (optional)
  routes.ts                                      ← Route registration
```

---

## Step 1 — Create API Service (`app/services/<feature>Api.ts`)

```ts
import { createApi } from '@/lib/api'
import { z } from 'zod'

// 1. Define response schema
const <Feature>Schema = z.object({
  FID: z.number(),
  FIELD_NAME: z.string(),
  DATETIME_MODIFIED: z.string().nullable(),
})
export type <Feature> = z.infer<typeof <Feature>Schema>

// 2. Export API functions
export const <feature>Api = {
  getAll: async (): Promise<<Feature>[]> => {
    const api = createApi()
    const res = await api.get('/<features>')
    return res.data
  },

  create: async (data: Omit<<Feature>, 'FID' | 'DATETIME_MODIFIED'>): Promise<<Feature>> => {
    const api = createApi()
    const res = await api.post('/<features>', data)
    return res.data
  },

  update: async (id: number, data: Partial<<Feature>>): Promise<<Feature>> => {
    const api = createApi()
    const res = await api.put(`/<features>/${id}`, data)
    return res.data
  },

  delete: async (id: number): Promise<void> => {
    const api = createApi()
    await api.delete(`/<features>/${id}`)
  },
}
```

Rules:
- Always call `createApi()` inside each function (not at module level) — this ensures correct base URL in SSR/browser
- Import types from the Zod schema using `z.infer<typeof ...>`
- API base path matches the backend route (e.g. `/sequences`, `/production-plan`)

---

## Step 2 — Create Page Component (`app/dashboard-user/manufacture/<page-name>/index.tsx`)

```tsx
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { <feature>Api, type <Feature> } from '@/services/<feature>Api'
import { Button } from '@/components/ui/button'
import { RefreshCw, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function <Feature>Page() {
  const [data, setData] = useState<<Feature>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await <feature>Api.getAll()
      setData(result)
    } catch (err) {
      setError('Failed to load data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold"><Feature> Title</h1>
        <Button onClick={fetchData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive p-3 text-sm">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Data</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Table or content here */}
        </CardContent>
      </Card>
    </motion.div>
  )
}
```

Rules:
- Always add `'use client'` at top of interactive components
- Use `motion.div` from framer-motion for page enter animation
- Show loading state with `<Loader2 className="animate-spin" />`
- Use shadcn/ui components: `Button`, `Card`, `Table`, `Dialog`, `Select`, etc.
- Import icons from `lucide-react`

---

## Step 3 — Create Route Entry File (`app/routes/dashboard-user/manufacture/<page-name>.tsx`)

```tsx
import type { Route } from '@/routes/+types/root'
import { <Feature>Page } from '@/dashboard-user/manufacture/<page-name>'

export function meta({}: Route.MetaArgs) {
  return [
    { title: '<Page Title>' },
    { name: 'description', content: '<Page description>' },
  ]
}

export default function <Feature>Route() {
  return <<Feature>Page />
}
```

This is intentionally thin — only `meta()` and a default export that renders the page component.

---

## Step 4 — Register Route in `app/routes.ts`

```ts
import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  // ... existing routes
  route(
    '/dashboard-user/manufacture/<page-name>',
    'routes/dashboard-user/manufacture/<page-name>.tsx',
  ),
] satisfies RouteConfig
```

---

## Step 5 — Add Navigation Link (Optional)

If the page needs a sidebar link, update `app/dashboard-user/manufacture/MainMenu.tsx` or `app/components/app-sidebar.tsx` to include the new route.

---

## Checklist

- [ ] Service file created in `app/services/<feature>Api.ts` with `createApi()` usage
- [ ] Page component created in `app/dashboard-user/manufacture/<page-name>/index.tsx`
- [ ] Route entry file created in `app/routes/dashboard-user/manufacture/<page-name>.tsx`
- [ ] Route registered in `app/routes.ts`
- [ ] Loading state handled with `<Loader2>`
- [ ] Error state displayed to user
- [ ] Page wrapped in `motion.div` for animation
- [ ] Uses shadcn/ui components for UI elements
