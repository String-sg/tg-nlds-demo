# Deployment Guide: Vercel + PostgreSQL

This guide explains how to deploy the MOE-TG-VX application to Vercel with a PostgreSQL database.

## Prerequisites

- Vercel account
- PostgreSQL database (options below)
- Git repository connected to Vercel

## Database Options

### Option 1: Vercel Postgres (Recommended)

1. **Create Vercel Postgres Database**
   - Go to your Vercel project dashboard
   - Navigate to "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Follow the setup wizard

2. **Automatic Configuration**
   - Vercel will automatically add `DATABASE_URL` to your environment variables
   - The connection string format will be:
     ```
     postgresql://username:password@hostname:5432/database_name?sslmode=require
     ```

### Option 2: Supabase

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your database connection string

2. **Get Connection String**
   - Go to Project Settings → Database
   - Copy the "Connection string" (URI format)
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### Option 3: Other PostgreSQL Providers

- **Neon**: [neon.tech](https://neon.tech)
- **Railway**: [railway.app](https://railway.app)
- **ElephantSQL**: [elephantsql.com](https://elephantsql.com)

## Vercel Environment Variables Setup

### Required Environment Variables

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Go to "Settings" → "Environment Variables"

2. **Add DATABASE_URL**
   ```
   Name: DATABASE_URL
   Value: postgresql://username:password@hostname:5432/database_name?sslmode=require
   Environment: Production, Preview, Development
   ```

3. **Add NODE_ENV** (optional)
   ```
   Name: NODE_ENV
   Value: production
   Environment: Production
   ```

### Important Notes

- ✅ Make sure to select **all environments** (Production, Preview, Development)
- ✅ Include `?sslmode=require` in your DATABASE_URL for secure connections
- ✅ Never commit `.env` files to git

## Database Migration

After setting up the database and deploying to Vercel:

### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Link Your Project**
   ```bash
   vercel link
   ```

3. **Pull Environment Variables**
   ```bash
   vercel env pull .env
   ```

4. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

5. **Seed Database** (optional)
   ```bash
   npx prisma db seed
   ```

### Option B: Using Database GUI Tool

1. **Connect to Your Database**
   - Use the DATABASE_URL to connect via:
     - TablePlus
     - DBeaver
     - pgAdmin
     - Prisma Studio (`npx prisma studio`)

2. **Run Migrations Manually**
   ```bash
   # Generate SQL from migrations
   npx prisma migrate diff \
     --from-empty \
     --to-schema-datamodel prisma/schema.prisma \
     --script > migration.sql

   # Apply the SQL to your database
   ```

## Deployment Checklist

- [ ] PostgreSQL database created
- [ ] DATABASE_URL environment variable set in Vercel
- [ ] Latest code pushed to git
- [ ] Vercel deployment triggered
- [ ] Database migrations applied
- [ ] Database seeded (if needed)
- [ ] Test the deployed application

## Troubleshooting

### Error: "Failed to fetch class data"

**Cause**: Database connection issue

**Solutions**:
1. Verify DATABASE_URL is set correctly in Vercel
2. Check database is accessible (not behind firewall)
3. Ensure connection string includes `?sslmode=require` or `?ssl=true`
4. Verify Prisma Client was generated (check build logs)

### Error: "prisma generate" not running

**Cause**: Prisma Client not generated during build

**Solution**:
- The `postinstall` script should handle this automatically
- Check Vercel build logs for errors
- Manually trigger: `npm install` (this runs postinstall)

### Error: Missing tables in database

**Cause**: Migrations not applied

**Solution**:
```bash
# Connect to production database
DATABASE_URL="your-production-url" npx prisma migrate deploy

# Or seed the database
DATABASE_URL="your-production-url" npx prisma db seed
```

### Error: "Invalid DATABASE_URL"

**Cause**: Incorrect connection string format

**Solution**: Ensure format is:
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

## Monitoring

After deployment:

1. **Check Vercel Logs**
   - Go to Deployments → Select deployment → View Logs
   - Look for Prisma-related errors

2. **Test API Endpoints**
   - `/api/classes/[classId]` - Should return class data
   - `/api/classes/[classId]/students` - Should return students

3. **Monitor Database**
   - Check database connection limits
   - Monitor query performance
   - Set up alerts for errors

## Maintenance

### Updating Schema

When you make changes to `prisma/schema.prisma`:

1. **Create Migration**
   ```bash
   npx prisma migrate dev --name description_of_change
   ```

2. **Push to Git**
   ```bash
   git add .
   git commit -m "feat: update database schema"
   git push
   ```

3. **Apply to Production**
   ```bash
   # After Vercel deployment
   DATABASE_URL="production-url" npx prisma migrate deploy
   ```

### Backup Database

Regular backups are crucial:

- **Vercel Postgres**: Automatic daily backups
- **Supabase**: Automatic backups (Pro plan)
- **Manual**: Use `pg_dump`
  ```bash
  pg_dump YOUR_DATABASE_URL > backup.sql
  ```

## Additional Resources

- [Prisma Deployment Docs](https://www.prisma.io/docs/guides/deployment)
- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review Prisma error messages
3. Verify environment variables are correct
4. Test database connection separately
