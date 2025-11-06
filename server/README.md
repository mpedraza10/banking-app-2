# Database Setup Script

This directory contains the all-in-one database setup script for managing your database migrations and seeding.

## 🚀 Quick Start

For complete database initialization, use the all-in-one setup script:

```bash
npm run db:setup
```

This single command handles everything:
1. ✅ **Check Migrations:** Validates if migrations already exist
2. ✅ **Generate Migrations:** Creates migration files from your schema (only if they don't exist)
3. ✅ **Run Migrations:** Applies migrations to your database
4. ✅ **Seed Database:** Creates the default admin user (if not exists)

**Default Admin Credentials:**
- **Email:** `admin@admin.com`
- **Password:** `admin`
- **Name:** Administrator

## Script Details

### `setup.ts` - All-in-One Database Setup

**Key Features:**
- ✅ **Smart & Idempotent** - Safe to run multiple times, skips unnecessary steps
- ✅ **Comprehensive Logging** - Clear progress indicators at each step
- ✅ **Error Handling** - Helpful troubleshooting tips if something goes wrong
- ✅ **Fallback Support** - Works with or without service role key

**What it does:**
1. Checks if migration files already exist in `server/migrations`
2. Generates migrations from your Drizzle schema (if needed)
3. Applies migrations to your Supabase database
4. Creates default admin user in both Supabase Auth and your users table
5. Prevents duplicate users - checks before creating

**Important:** Add `SUPABASE_SERVICE_ROLE_KEY` to your `.env.local` file for full functionality:
```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

You can find this key in your Supabase project settings under **Settings > API > service_role key**.

> **Note:** If the service role key is not available, the script will fallback to using the anon key with the signup endpoint. However, this may require email confirmation depending on your Supabase auth settings.

## Common Workflows

### First Time Setup
When setting up the database for the first time:

```bash
# Install dependencies first
npm install

# Setup database (generates migrations, migrates, and seeds)
npm run db:setup
```

### After Schema Changes
When you've modified your Drizzle schema in `src/lib/db/schema.ts`:

```bash
# Generate new migrations
npm run drizzle:generate

# Apply the migrations
npm run drizzle:migrate
```

Or simply run the complete setup again (it will skip existing migrations):

```bash
npm run db:setup
```

### Re-running Setup
You can safely run `npm run db:setup` multiple times. It will:
- Skip migration generation if migrations already exist
- Skip migration application if already applied
- Skip admin user creation if user already exists

This makes it perfect for:
- First-time setup
- Re-initializing after database reset
- Ensuring everything is properly configured

## Environment Variables Required

Make sure your `.env.local` file contains:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Database Connection (Direct connection to PostgreSQL)
NEXT_PUBLIC_SUPABASE_DB_URL=postgresql://postgres:[password]@[host]:[port]/postgres

# Required for seeding (Service Role Key)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Troubleshooting

### "SUPABASE_SERVICE_ROLE_KEY is required"
- Get your service role key from Supabase dashboard: **Settings > API > service_role**
- Add it to `.env.local`
- **Security Note:** Never commit the service role key to version control!

### "Migration files already exist"
- This is normal! The setup script will skip generation and proceed to migration
- If you want to regenerate, delete the contents of `server/migrations` first

### "Admin user already exists"
- This is expected behavior - the setup script prevents duplicates
- The existing admin user will continue to work with the same credentials
- You can safely run `npm run db:setup` again without creating duplicates

### Migration Errors
- Ensure your database URL is correct in `.env.local`
- Check that you have network access to your Supabase database
- Verify your database credentials are valid

## Security Notes

⚠️ **Important Security Considerations:**

1. **Change Default Password:** The default admin password (`admin`) should be changed immediately in production
2. **Service Role Key:** Keep your `SUPABASE_SERVICE_ROLE_KEY` secure and never expose it in client-side code
3. **Environment Files:** Never commit `.env.local` to version control (it should be in `.gitignore`)
4. **Production Setup:** Consider using environment-specific seeding scripts for production vs development

## Available Scripts

```json
{
  "scripts": {
    "db:setup": "tsx server/setup.ts",           // 🌟 All-in-one setup (recommended)
    "drizzle:generate": "drizzle-kit generate",  // Generate migrations only
    "drizzle:migrate": "drizzle-kit migrate"     // Apply migrations only
  }
}
```

**Recommended:** Use `npm run db:setup` for all database initialization tasks.

