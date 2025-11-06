# Project Summary: Next.js Full-Stack Template

## What's Already Implemented

This project is a **complete, functional template** with the following pre-built components and systems, consider what is already done before adding new features.

### Core Infrastructure
- **Next.js 15 Application** - Fully configured with App Router
- **TypeScript Setup** - Complete type safety configuration
- **Tailwind CSS Integration** - Styling system ready to use
- **shadcn/ui Components** - Pre-installed in \`components/ui/\` directory
- **Toast Notifications** - Already set up, just import and use \`import { toast } from "sonner";\`
- **Supabase Client** - Configured at \`src/lib/supabase.ts\`
- **next-themes Integration** - Theme management system
- **TanStack Query** - Server state management and caching

### Authentication System (FULLY FUNCTIONAL)
- **Supabase Auth Integration** - Complete authentication backend
- **Email/Password Authentication** - Login and SignUp with email and password
- **Login Page** - Functional UI with form handling and validation
- **SignUp Page** - User registration with email/password and database sync

### Database Layer (READY TO USE)
- **Drizzle ORM Setup** - Type-safe database operations
- **PostgreSQL Integration** - Database connection configured via Supabase
- **Database Synchronization** - Users automatically created in both Supabase Auth and PostgreSQL. There is a user table defined in \`src/lib/db/schema.ts\`.

---

## What's Available to Build Upon

### READY FOR EXTENSION:
1. **Add New Database Tables** - Extend schema.ts with new entities (provide complete schema, do not run migrations)
2. **Create New Pages** - Add routes in src/app/ directory
3. **Build New Components** - Add to src/components/
4. **Use shadcn/ui Components** - Import from \`components/ui/\` directory
5. **Add API Routes** - Create API endpoints
6. **Extend User Features** - Build on existing user system
7. **Add New Queries** - Use existing TanStack Query setup and create query functions on src/lib/actions/
8. **Style Components** - Use configured Tailwind classes
9. **Add Business Logic** - Build features on authentication foundation
10. **Add Theme Toggle** - Use ModeToggle component anywhere

---

## Authentication System Architecture

### Overview

This application uses **Supabase Auth** for authentication with dual-system user management:
- **Supabase Auth**: Handles login, signup, sessions, tokens
- **PostgreSQL Database**: Stores additional user data via Drizzle ORM

---

## Development Guidelines

### Authentication State Access
**CRITICAL:** Always use the `useAuth` hook to access the current user's authentication state. Never create custom authentication state management.
**Hook Location:** `src/lib/hooks/useAuth.ts`

**Returns:**
\`\`\`typescript
{
  user: User | null,       // Current authenticated user
  session: Session | null, // Current session
  loading: boolean         // Loading state
}
\`\`\`

**✅ DO:**
\`\`\`typescript
// Always use the useAuth hook for authentication state
import { useAuth } from "@/lib/hooks/useAuth";

function MyComponent() {
  const { user, loading } = useAuth();
  // Use user and loading
}
\`\`\`

**❌ DON'T:**
\`\`\`typescript
// Don't create custom auth state or call supabase.auth.getUser() repeatedly
const [user, setUser] = useState(null);
useEffect(() => {
  supabase.auth.getUser().then(({data}) => setUser(data.user));
}, []);
\`\`\`

---

### Protected Routes
**CRITICAL:** Wrap EVERY page that requires authentication with `<ProtectedRoute>`. Use it at the page level, not on individual components.

**Component Location:** `src/components/protected-route/index.tsx`

**Behavior:**
- Checks authentication using `useAuth` hook
- Redirects to `/auth/login` if not authenticated
- Handles loading state automatically
- Once the page is wrapped, all content inside is protected

**✅ DO:**
\`\`\`typescript
// Wrap the entire page content
export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>
        <h1>Dashboard</h1>
        <UserProfile />
        <DataTable />
      </div>
    </ProtectedRoute>
  );
}
\`\`\`

**❌ DON'T:**
\`\`\`typescript
// Never implement manual redirect logic
export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/auth/login");
  }, [user]);

  return <div>Content</div>;
}
\`\`\`

---

### Database Schema Management
**CRITICAL:** When adding or modifying database tables, ALWAYS provide complete Drizzle schema definitions.

**Schema Location:** `src/lib/db/schema.ts`

**Always Include:**
- Complete table definitions with all columns
- All relationships and foreign keys
- Indexes and constraints
- Type inference (InferSelectModel, InferInsertModel)

**Example Schema:**
\`\`\`typescript
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // UUID from Supabase Auth
  email: text("email").notNull().unique(),
  name: text("name"),
  created_at: timestamp("created_at").defaultNow(),
});

// Always infer types from schema
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
\`\`\`

**Migration Scripts:**
After updating the schema, use these pre-configured npm scripts:
- `npm run drizzle:generate` - Generate migration files
- `npm run drizzle:migrate` - Apply migrations to database

**❌ DON'T:**
Never run raw drizzle-kit commands directly:
\`\`\`bash
npx drizzle-kit generate  # Don't use
npx drizzle-kit migrate   # Don't use
npx drizzle-kit push      # Never use
\`\`\`

---

### User Schema & Authentication Sync

**IMPORTANT:** User authentication is already integrated with the database. When a user signs up:
1. User is created in Supabase Auth (handles authentication)
2. User is automatically created in PostgreSQL database (stores additional data)
3. Both use the same UUID as the primary key

**Existing User Table:** `src/lib/db/schema.ts`

\`\`\`typescript
export const users = pgTable("users", {
  id: uuid("id").primaryKey(),           // UUID from Supabase Auth
  email: text("email").notNull().unique(), // User email
  name: text("name"),                    // Display name
  created_at: timestamp("created_at").defaultNow(),
});
\`\`\`

**CRITICAL:** 
- The `id` field MUST be UUID to match Supabase Auth user ID
- When adding new user-related tables, always reference this `id` field for foreign keys
- Do NOT recreate this table - it already exists and is synchronized with Supabase Auth

**Example of referencing users:**
\`\`\`typescript
export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").references(() => users.id).notNull(),
  // other fields...
});
\`\`\`

---

### Database Operations & Data Fetching

**CRITICAL:** ALWAYS use server actions for database operations. Organize them by entity/responsibility in `src/lib/actions/`.

**Pattern:** Create one file per entity with all related server actions, then use them with TanStack Query in client components.

**✅ DO:**

**Step 1: Create Server Actions (one file per entity)**
\`\`\`typescript
// src/lib/actions/users.ts
"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function getUsers() {
  return await db.select().from(users);
}

export async function createUser(data: NewUser) {
  return await db.insert(users).values(data);
}

export async function getUserById(id: string) {
  return await db.select().from(users).where(eq(users.id, id));
}
\`\`\`

**Step 2: Use with TanStack Query in Client Components**
\`\`\`typescript
"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { getUsers, createUser } from "@/lib/actions/users";

function UsersPage() {
  // Fetch data with React Query + Server Actions
  const { data: users, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  // Mutations for create/update/delete
  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading users</div>;

  return <div>{/* Render users */}</div>;
}
\`\`\`

**File Organization:**
\`\`\`
src/lib/actions/
├── users.ts       # User-related actions
├── posts.ts       # Post-related actions
├── comments.ts    # Comment-related actions
└── ...
\`\`\`

**❌ DON'T:**
\`\`\`typescript
// Never import db directly in client components
"use client";

import { db } from "@/lib/db"; // ERROR: Node.js modules not available in browser
\`\`\`


---

### Supabase Client

**Client Location:** `src/lib/supabase.ts`

Use this client for Supabase operations needed (for example storage)

\`\`\`typescript
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, anonKey);
\`\`\`

**Usage:**
\`\`\`typescript
import { supabase } from "@/lib/supabase";

// Storage operations
await supabase.storage.from('bucket').upload('file', data);
\`\`\`

---

## Environment Variables
These are the environment variables already defined in the project. If during development we need more we can add them here:

\`\`\`.env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_DB_URL=your_database_connection_string
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`