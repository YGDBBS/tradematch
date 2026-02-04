# TradeMatch – app architecture

Principles: **DRY**, **parent-controlled UI**, **reusable presentational components**, **TanStack Query for server state**.

---

## 1. TanStack Query (server state)

We use **TanStack Query** for all server data to avoid repeated API calls, get caching, and keep logic in one place.

- **Reads (GET):** Use **`useQuery`**. Same query key = one request, cached. No refetch storms when multiple components need the same data. Enable the query only when you have what you need (e.g. `enabled: !!accessToken`).
- **Writes (POST/PATCH/DELETE):** Use **`useMutation`**. Each intent = one request. On success, **invalidate** the relevant query (e.g. `queryClient.invalidateQueries({ queryKey: ['profile'] })`) so the next read is fresh; avoid manual refetch and duplicate logic.
- **Query keys:** One place for keys (e.g. `['profile']`, `['jobs']`, `['job', id]`). Use a small `queryKeys` helper so keys stay consistent and easy to invalidate.
- **Provider:** Wrap the app in `QueryClientProvider` (in root layout). One `QueryClient` with sensible defaults (e.g. staleTime so we don’t refetch on every focus if you don’t want it).

No microservices or extra complexity—just useQuery for reads and useMutation for writes, with invalidation to keep the UI in sync.

---

## 2. Data flow (parent-down)

- **Screens** (and sometimes layouts) own **state and data fetching**. They are the single source of truth for what the user sees.
- **Components** are **presentational**: they receive data and callbacks via **props** and render. They do not fetch from the API or auth; they do not own business state.
- **Hooks** encapsulate **shared logic** (API calls, derived state). Screens use hooks, then pass the result as props to components.

So: **Screen → hook (useQuery/useMutation) → pass props → presentational component**.

---

## 3. Layers

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Screens** | `mobile/app/*.tsx` | Route entry, auth guard, use hooks, pass data to components, handle navigation. |
| **Hooks** | `mobile/hooks/*.ts` | Server state via TanStack Query (`useQuery` for reads, `useMutation` for writes). Return query/mutation result; no duplicate fetch logic. No UI. |
| **Context** | `mobile/contexts/*.tsx` | Global app state (e.g. auth session). Used by screens, not by generic components. |
| **Presentational components** | `mobile/components/*.tsx` | Receive props, render UI. Optional: local UI state (e.g. input value, expanded). No direct API/auth. |
| **API / lib** | `mobile/lib/*.ts` | API client, Supabase client, shared types. Used by hooks (and sometimes context). |
| **Constants** | `mobile/constants/*.ts` | Theme, config. Used by components. |

---

## 4. Conventions

- **Components are reusable and dumb where possible.** If a component needs "current user" or "job list", it gets them as props (e.g. `profile`, `jobs`), not from `useAuth()` or a direct API call.
- **One place for each piece of logic.** API calls live in hooks (or in one API module). Auth state lives in AuthContext. Don’t duplicate fetch logic in multiple screens.
- **Naming:** Presentational components describe what they show (e.g. `ProfileBlock`, `JobCard`). Hooks are `useX` (e.g. `useProfile`, `useJobs`). Screens are the route name (e.g. `index`, `login`).
- **Types:** Define shared types (e.g. Profile, Job) in `mobile/lib/types.ts` (or a small types folder). Use them in hooks, API, and components so props are typed.

---

## 5. Example pattern (with TanStack Query)

**Screen** (owns flow, uses hook, passes props):

```tsx
// app/profile.tsx
export default function ProfileScreen() {
  const { session } = useAuth()
  const { profile, loading, error, refetch } = useProfile(session?.user?.id)

  if (!session) return <Redirect toLogin />
  if (loading) return <Loading />
  if (error) return <Error message={error.message} onRetry={refetch} />

  return (
    <Screen>
      <ProfileBlock profile={profile} onEdit={...} />
    </Screen>
  )
}
```

**Hook** (useQuery + useMutation; one place for API logic):

```ts
// hooks/useProfile.ts
const queryKeys = { profile: ['profile'] as const }

export function useProfile(accessToken: string | undefined) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => api.get<Profile>('api/me', accessToken!),
    enabled: !!accessToken,
  })
  const mutation = useMutation({
    mutationFn: (body: ProfileUpdate) => api.patch<Profile>('api/me', body, accessToken!),
    onSuccess: (data) => queryClient.setQueryData(queryKeys.profile, data),
  })
  return {
    profile: query.data ?? null,
    loading: query.isLoading,
    error: query.error ?? mutation.error ?? null,
    refetch: query.refetch,
    updateProfile: mutation.mutateAsync,
  }
}
```

**Component** (reusable, parent-driven):

```tsx
// components/ProfileBlock.tsx
type Props = { profile: Profile | null; onEdit?: () => void }
export function ProfileBlock({ profile, onEdit }: Props) {
  if (!profile) return null
  return (
    <Card>
      <Text>{profile.display_name ?? 'No name'}</Text>
      <Text>{profile.role}</Text>
      {onEdit && <Button title="Edit" onPress={onEdit} />}
    </Card>
  )
}
```

---

## 6. Backend

- **API routes** under `app/api/`. Auth via JWT in `Authorization` header; use `getSessionUserId()` and Supabase server client.
- **Shared types** in `lib/types/`. **No UI** in the backend; it’s JSON in/out.

---

## 7. Where to start next

1. **API client** in `mobile/lib/api.ts`: base URL, `get(path, token)`, `patch(path, body, token)`.
2. **Hooks** that use TanStack Query: `useQuery` for GET (profile, jobs, etc.), `useMutation` for PATCH/POST; invalidate or setQueryData on success so the UI stays in sync without extra refetches.
3. **Presentational components** that receive that data as props (e.g. `ProfileBlock(profile)`).
4. **Screens** that use the hook and render the component with the passed-in data.

Once this pattern is in place, new features (jobs, messages, etc.) follow the same structure: hook in `hooks/`, presentational pieces in `components/`, screen in `app/`.
