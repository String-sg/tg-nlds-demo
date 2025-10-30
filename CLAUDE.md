# Project Guidelines: Next.js 15 + shadcn/ui + Tailwind CSS 4

## Stack Overview

- **Framework**: Next.js 15.5.4 with App Router
- **React**: 19.1.0
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **TypeScript**: Strict mode enabled
- **Icons**: lucide-react

## Next.js 15 App Router Best Practices

### Server Components (Default)

- **All components are Server Components by default** - no 'use client' needed
- Fetch data directly in Server Components using async/await
- Access request data with `headers()`, `cookies()` from 'next/headers'
- Server Components cannot use React hooks, event handlers, or browser APIs

```tsx
// ✅ Good: Server Component with data fetching
export default async function Page() {
  const data = await fetch('https://api.example.com/data')
  const posts = await data.json()
  return <PostList posts={posts} />
}
```

### Client Components ('use client')

- **Only use when needed**: interactivity, hooks, browser APIs, event handlers
- Place 'use client' at the **top of the file**
- Keep Client Components as leaf nodes in the tree when possible
- Pass fetched data from Server Components to Client Components as props

```tsx
// ✅ Good: Client Component for interactivity
'use client'

import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### Data Fetching

#### When to Use SSR vs SSG vs ISR

**Static Site Generation (SSG)** - Best for content that rarely changes:
- Marketing pages, landing pages
- Blog posts, documentation
- Terms of service, privacy policy
- Use: Default `fetch()` or `{ cache: 'force-cache' }`

**Server-Side Rendering (SSR)** - Best for frequently changing data:
- User dashboards, personalized content
- Real-time data feeds
- Pages requiring auth/session data
- Use: `{ cache: 'no-store' }`

**Incremental Static Regeneration (ISR)** - Best for balancing freshness and performance:
- Product listings, category pages
- News articles, content feeds
- Data that updates periodically (hourly/daily)
- Use: `{ next: { revalidate: seconds } }`

#### Caching Strategies

```tsx
// Static (cached by default) - SSG
const data = await fetch('https://...', { cache: 'force-cache' })

// Dynamic (no cache) - SSR
const data = await fetch('https://...', { cache: 'no-store' })

// Revalidate every 60 seconds - ISR
const data = await fetch('https://...', { next: { revalidate: 60 } })

// Tag-based revalidation
const data = await fetch('https://...', { next: { tags: ['posts'] } })
```

#### Parallel Data Fetching

```tsx
// ✅ Good: Fetch in parallel to avoid waterfalls
export default async function Page() {
  const artistData = getArtist()
  const albumsData = getAlbums()

  const [artist, albums] = await Promise.all([artistData, albumsData])

  return <div>{/* render */}</div>
}
```

#### Sequential with Suspense

```tsx
// ✅ Good: Use Suspense for dependent data
export default async function Page() {
  const artist = await getArtist()

  return (
    <>
      <h1>{artist.name}</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <Albums artistID={artist.id} />
      </Suspense>
    </>
  )
}
```

### Cache Revalidation

```tsx
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

// Revalidate specific path
export async function updatePost() {
  await db.update()
  revalidatePath('/posts')
}

// Revalidate by tag
export async function createPost() {
  await db.create()
  revalidateTag('posts')
}
```

### Server Actions

- Use for form submissions and mutations
- Always add 'use server' directive
- Validate and authorize all inputs
- Use with forms or call from Client Components

```tsx
'use server'

export async function createItem(formData: FormData) {
  // Validate
  const name = formData.get('name')
  if (!name) throw new Error('Name required')

  // Authorize
  const user = await auth()
  if (!user) throw new Error('Unauthorized')

  // Mutate
  await db.create({ name })
  revalidatePath('/items')
}
```

### Route Handlers

- Use for external API routes, webhooks, or Client Component data fetching
- **Don't** call Route Handlers from Server Components - fetch directly instead

```tsx
// app/api/users/route.ts
export async function GET() {
  const data = await db.query()
  return Response.json(data)
}
```

### Dynamic Routes

```tsx
// app/blog/[slug]/page.tsx
interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params
  const post = await getPost(slug)
  return <article>{post.content}</article>
}
```

### Metadata

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description',
}

// Dynamic metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const post = await getPost(id)
  return {
    title: post.title,
    description: post.excerpt,
  }
}
```

## shadcn/ui Guidelines

### Component Philosophy

- **Copy-paste, don't install as dependency** - components live in your codebase
- Customize components directly in `components/ui/`
- Compose components to build complex UIs

### Installation

```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
```

### Theming with CSS Variables

- Use `cssVariables: true` in `components.json`
- Define theme colors in `globals.css` using CSS variables
- Supports automatic dark mode with next-themes

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
  }

  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
  }
}
```

### Component Usage

```tsx
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

export function Example() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open</Button>
      </DialogTrigger>
      <DialogContent>
        <h2>Dialog content</h2>
      </DialogContent>
    </Dialog>
  )
}
```

### Accessibility

- All shadcn/ui components are built with Radix UI primitives
- Include proper ARIA labels and semantic HTML
- Keyboard navigation works by default
- Screen reader support is built-in

## Icon Usage Guidelines

### Always Use lucide-react Icons

**IMPORTANT**: Never use emojis for UI icons. Always use lucide-react icons instead.

❌ **Bad**: Using emojis
```tsx
<span>⚠️</span>
<span>💬</span>
<span>🔔</span>
```

✅ **Good**: Using lucide-react icons
```tsx
import { AlertTriangle, MessageSquare, Bell } from 'lucide-react'

<AlertTriangle className="size-5 text-red-500" />
<MessageSquare className="size-5 text-blue-500" />
<Bell className="size-5 text-stone-500" />
```

### Icon Best Practices

1. **Import from lucide-react**: Always import icons from 'lucide-react' package
2. **Consistent sizing**: Use Tailwind size utilities (`size-4`, `size-5`, `size-6`)
3. **Semantic colors**: Apply appropriate colors based on context (red for alerts, blue for info, etc.)
4. **Accessibility**: Icons should have proper ARIA labels when used without text
5. **Consistent stroke width**: Lucide icons have consistent stroke width across the set

### Common Icon Mappings

- **Alerts/Warnings**: `AlertTriangle`, `AlertCircle`, `AlertOctagon`
- **Messages**: `MessageSquare`, `Mail`, `Inbox`
- **Time/Reminders**: `Clock`, `Calendar`, `Timer`
- **Announcements**: `Megaphone`, `Volume2`, `Radio`
- **Actions**: `Plus`, `X`, `Check`, `Trash2`, `Edit`
- **Navigation**: `ChevronRight`, `ChevronDown`, `ArrowRight`, `Menu`
- **Status**: `CheckCircle`, `XCircle`, `Info`, `HelpCircle`

### Example: Notification Type Icons

```tsx
const getTypeIcon = (type: string) => {
  const iconClass = 'size-5 shrink-0'
  switch (type) {
    case 'alert':
      return <AlertTriangle className={cn(iconClass, 'text-red-500')} />
    case 'message':
      return <MessageSquare className={cn(iconClass, 'text-blue-500')} />
    case 'reminder':
      return <Clock className={cn(iconClass, 'text-amber-500')} />
    case 'announcement':
      return <Megaphone className={cn(iconClass, 'text-purple-500')} />
    default:
      return <Bell className={cn(iconClass, 'text-stone-500')} />
  }
}
```

## Tailwind CSS 4 Guidelines

### New Syntax (v4)

#### Custom Utilities

```css
/* ❌ Old (v3): @layer utilities */
@layer utilities {
  .tab-4 {
    tab-size: 4;
  }
}

/* ✅ New (v4): @utility directive */
@utility tab-4 {
  tab-size: 4;
}
```

#### CSS Variables (Preferred)

```css
/* ✅ Good: Use CSS variables directly */
.my-class {
  background-color: var(--color-red-500);
  color: var(--color-gray-900);
}

/* ❌ Avoid: theme() function when CSS vars work */
.my-class {
  background-color: theme(colors.red.500);
}
```

#### Variant Stacking (Left-to-Right in v4)

```html
<!-- ✅ v4: Left-to-right stacking -->
<ul class="*:first:pt-0 *:last:pb-0">
  <li>One</li>
  <li>Two</li>
</ul>

<!-- ❌ v3: Right-to-left (old) -->
<ul class="first:*:pt-0 last:*:pb-0">
```

### Updated Utilities (v4)

#### Ring Width

```html
<!-- ✅ v4: ring = 1px (new default) -->
<button class="ring ring-blue-500">Default</button>

<!-- Use ring-3 for 3px width (v3 default) -->
<button class="ring-3 ring-blue-500">Thicker</button>
```

#### Shadow, Blur, Radius Scales

```html
<!-- ✅ v4: -xs suffix for smallest -->
<div class="shadow-xs">Small shadow</div>
<div class="rounded-xs">Small radius</div>

<!-- ❌ v3: -sm was smallest (now deprecated) -->
<div class="shadow-sm">Old small shadow</div>
```

### Container Customization

```css
/* ✅ v4: Customize with @utility */
@utility container {
  margin-inline: auto;
  padding-inline: 2rem;
  max-width: 1280px;
}
```

### Configuration

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Custom extensions
    },
  },
  plugins: [],
} satisfies Config
```

### Vite Plugin (Recommended)

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
})
```

## TypeScript Standards

### Strict Mode

- Enable `strict: true` in `tsconfig.json`
- Use explicit types for props, state, and function returns
- Avoid `any` - use `unknown` if type is truly unknown

### Component Props

```tsx
interface ButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
}

export function Button({ variant = 'default', size = 'md', children, onClick }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>
}
```

### Async Functions

```tsx
async function getData(): Promise<Post[]> {
  const res = await fetch('https://api.example.com/posts')
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}
```

### JSX Best Practices

- **Always escape special characters in JSX text content** to prevent ESLint errors
- Common characters that need escaping:
  - Apostrophes: `'` → `&apos;` or `&#39;`
  - Quotes: `"` → `&quot;`
  - Less than: `<` → `&lt;`
  - Greater than: `>` → `&gt;`
  - Ampersand: `&` → `&amp;`

```tsx
// ❌ Bad: Unescaped apostrophe causes ESLint error
<CardTitle>Today's Attendance</CardTitle>

// ✅ Good: Properly escaped apostrophe
<CardTitle>Today&apos;s Attendance</CardTitle>

// ✅ Alternative: Use curly braces for complex strings
<CardTitle>{"Today's Attendance"}</CardTitle>
```

## File Structure

```
src/
├── app/
│   ├── (routes)/
│   │   ├── page.tsx          # Server Component
│   │   ├── layout.tsx        # Layout
│   │   └── loading.tsx       # Loading UI
│   ├── api/
│   │   └── [...]/route.ts    # Route Handlers
│   └── globals.css
├── components/
│   ├── ui/                   # shadcn/ui components
│   │   ├── button.tsx
│   │   └── dialog.tsx
│   └── [feature]/            # Feature components
│       ├── feature-card.tsx
│       └── feature-list.tsx
├── lib/
│   ├── utils.ts              # Utilities (cn, etc.)
│   └── db.ts                 # Database client
└── hooks/
    └── use-[name].ts         # Custom hooks
```

### Naming Conventions

- **Files**: kebab-case (`user-profile.tsx`, `api-client.ts`)
- **Components**: PascalCase exports (`export function UserProfile()`)
- **Utilities**: camelCase (`export function formatDate()`)
- **Constants**: UPPER_SNAKE_CASE (`export const API_URL`)

## Import Order

```tsx
// 1. React/Next.js
import { Suspense } from 'react'
import Link from 'next/link'

// 2. External libraries
import { clsx } from 'clsx'

// 3. Internal components
import { Button } from '@/components/ui/button'
import { UserCard } from '@/components/user/user-card'

// 4. Utilities/hooks
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'

// 5. Types
import type { User } from '@/types'
```

## Performance

- Use Server Components for data fetching to reduce client JS
- Implement streaming with Suspense for faster initial page loads
- Optimize images with next/image
- Use dynamic imports for large Client Components
- Leverage caching with fetch and unstable_cache

## Security

- Validate all Server Action inputs
- Use Server Actions for mutations, not GET requests
- Never expose sensitive data to Client Components
- Use `taint()` for sensitive data objects
- Sanitize user inputs before database operations

## Common Patterns

### Form with Server Action

```tsx
// Server Component
import { createUser } from '@/actions/user'

export default function SignupPage() {
  return (
    <form action={createUser}>
      <input name="email" type="email" required />
      <button type="submit">Sign Up</button>
    </form>
  )
}

// actions/user.ts
'use server'

export async function createUser(formData: FormData) {
  const email = formData.get('email')
  // Validate and create user
}
```

### Loading States

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <div>Loading dashboard...</div>
}
```

### Error Handling

```tsx
// app/dashboard/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

## Scrolling Patterns

### Standard Scrolling with ScrollArea

**Always use the `ScrollArea` component** from shadcn/ui for consistent scrollbar styling across the application. Never use direct `overflow-y-auto` or `overflow-x-auto` classes.

```tsx
import { ScrollArea } from '@/components/ui/scroll-area'

export function MyComponent() {
  return (
    <ScrollArea className="flex-1 min-h-0">
      {/* Scrollable content */}
    </ScrollArea>
  )
}
```

### Height Constraint Pattern

For scroll containers to work properly within flex layouts, follow this pattern:

```tsx
// Parent container
<div className="flex h-full flex-col">
  {/* Fixed header */}
  <div className="flex-shrink-0 border-b">
    Header content
  </div>

  {/* Scrollable content area */}
  <ScrollArea className="flex-1 min-h-0">
    Content that scrolls
  </ScrollArea>

  {/* Fixed footer */}
  <div className="flex-shrink-0 border-t">
    Footer content
  </div>
</div>
```

**Key principles:**
- Parent: `h-full` or `flex-1` with flex direction
- Fixed sections: `flex-shrink-0` to prevent compression
- Scrollable sections: `flex-1 min-h-0` with `ScrollArea`
- The `min-h-0` is crucial - it allows flex children to shrink below their content size

### Multi-Column Layouts with Scroll

For complex layouts with multiple scroll areas (like inbox):

```tsx
<div className="flex h-full">
  {/* Left sidebar - fixed width, scrollable */}
  <div className="w-[360px] min-h-0 flex-shrink-0">
    <ScrollArea className="h-full">
      Sidebar content
    </ScrollArea>
  </div>

  {/* Main content - flexible, scrollable */}
  <div className="flex-1 min-h-0">
    <ScrollArea className="h-full">
      Main content
    </ScrollArea>
  </div>

  {/* Right sidebar - fixed width, scrollable */}
  <div className="w-[280px] min-h-0 flex-shrink-0">
    <ScrollArea className="h-full">
      Metadata sidebar
    </ScrollArea>
  </div>
</div>
```

### Auto-Scroll to Bottom (Chat/Messaging)

Use the `useScrollToBottom` hook for chat interfaces:

```tsx
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom'

export function ChatView() {
  const [messages, setMessages] = useState([])
  const { scrollRef } = useScrollToBottom({
    dependencies: [messages],
    behavior: 'smooth' // or 'instant'
  })

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-4">
        {messages.map(msg => (
          <Message key={msg.id} {...msg} />
        ))}
        {/* Scroll anchor - must be at the bottom */}
        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  )
}
```

### Common Mistakes to Avoid

❌ **Don't** use `overflow-y-auto` directly:
```tsx
<div className="flex-1 overflow-y-auto">
```

✅ **Do** use ScrollArea:
```tsx
<ScrollArea className="flex-1">
```

❌ **Don't** forget `min-h-0` on flex children:
```tsx
<div className="flex-1"> {/* Will not scroll properly */}
```

✅ **Do** include `min-h-0`:
```tsx
<ScrollArea className="flex-1 min-h-0">
```

❌ **Don't** nest ScrollArea components unnecessarily:
```tsx
<ScrollArea>
  <div>
    <ScrollArea> {/* Avoid nested scroll areas */}
```

✅ **Do** use a single ScrollArea for the entire scrollable region:
```tsx
<ScrollArea>
  <div>
    {/* All content scrolls together */}
  </div>
</ScrollArea>
```

### Popover with ScrollArea

When using Popover components with scrollable content:

```tsx
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'

<Popover>
  <PopoverTrigger asChild>
    <Button>Open</Button>
  </PopoverTrigger>
  <PopoverContent side="right" align="start" className="w-80 p-0">
    <div className="flex flex-col h-[480px]">
      {/* Fixed header */}
      <div className="flex-shrink-0 border-b px-4 py-3">
        <h3>Header</h3>
      </div>

      {/* Scrollable content */}
      <ScrollArea className="flex-1 min-h-0">
        {/* Content */}
      </ScrollArea>

      {/* Fixed footer */}
      <div className="flex-shrink-0 border-t px-4 py-2">
        <Button>Close</Button>
      </div>
    </div>
  </PopoverContent>
</Popover>
```

**Key points:**
- Use `side="right"` or `side="bottom"` depending on trigger position
- Parent container needs fixed height (`h-[480px]`)
- Header and footer use `flex-shrink-0`
- ScrollArea uses `flex-1 min-h-0` to fill remaining space
- Remove padding from PopoverContent (`p-0`) and apply to children

## Documentation Guidelines

### Agent Documentation Structure

We keep all important docs in `.agent` folder and keep updating them, structure like below:

**.agent**
- **Tasks**: PRD & implementation plan for each feature
- **System**: Document the current state of the system (project structure, tech stack, integration points, database schema, and core functionalities such as agent architecture, LLM layer, etc.)
- **SOP**: Best practices of execute certain tasks (e.g. how to add a schema migration, how to add a new page route, etc.)
- **README.md**: an index of all the documentations we have so people know what & where to look for things

**Important Rules:**
- Always update `.agent` docs after we implement certain feature, to make sure it fully reflects the up to date information
- Before you plan any implementation, always read the `.agent/README` first to get context
- When in plan mode, always store the created plan in `.agent/Tasks/[feature-name].md` BEFORE implementing, only after user accepts the plan

## Development Commands

```bash
# Development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format:fix

# Production build
npm run build
```
