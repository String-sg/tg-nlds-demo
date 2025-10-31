#!/bin/bash

# Migration Runner Script
# Runs the conduct grade and report removal migrations

echo "🗄️  Running Database Migrations"
echo "================================"
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check if we have Supabase URL
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL not set in .env"
    exit 1
fi

echo "📍 Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"
echo ""

# Extract project ref from URL
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed -n 's/.*\/\/\([^.]*\).*/\1/p')
echo "📦 Project Ref: $PROJECT_REF"
echo ""

echo "🔧 Migration files to run:"
echo "  1. 20251031000001_remove_conduct_grade.sql"
echo "  2. 20251031000002_remove_reports_system.sql"
echo ""

# Check if migrations exist
if [ ! -f "supabase/migrations/20251031000001_remove_conduct_grade.sql" ]; then
    echo "❌ Error: Migration file 20251031000001_remove_conduct_grade.sql not found"
    exit 1
fi

if [ ! -f "supabase/migrations/20251031000002_remove_reports_system.sql" ]; then
    echo "❌ Error: Migration file 20251031000002_remove_reports_system.sql not found"
    exit 1
fi

echo "✅ Migration files found"
echo ""

# Option 1: Try using Supabase CLI
echo "📋 Option 1: Using Supabase CLI"
echo "================================"
echo ""

if command -v supabase &> /dev/null; then
    echo "Supabase CLI found. Attempting to run migrations..."

    # Try to run db push
    if npx supabase db push --project-ref $PROJECT_REF 2>&1; then
        echo ""
        echo "✅ Migrations applied successfully via Supabase CLI!"
        exit 0
    else
        echo "⚠️  Supabase CLI push failed. Trying alternative methods..."
    fi
else
    echo "⚠️  Supabase CLI not available"
fi

echo ""
echo "📋 Option 2: Using psql"
echo "======================="
echo ""

if command -v psql &> /dev/null; then
    echo "psql found. Running migrations..."

    # Run migration 1
    echo "Running migration 1..."
    PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DATABASE -f supabase/migrations/20251031000001_remove_conduct_grade.sql

    if [ $? -eq 0 ]; then
        echo "✅ Migration 1 applied successfully"
    else
        echo "❌ Migration 1 failed"
        exit 1
    fi

    # Run migration 2
    echo "Running migration 2..."
    PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DATABASE -f supabase/migrations/20251031000002_remove_reports_system.sql

    if [ $? -eq 0 ]; then
        echo "✅ Migration 2 applied successfully"
        echo ""
        echo "🎉 All migrations completed successfully!"
        exit 0
    else
        echo "❌ Migration 2 failed"
        exit 1
    fi
else
    echo "⚠️  psql not available"
fi

echo ""
echo "📋 Option 3: Manual SQL Execution"
echo "=================================="
echo ""
echo "Since automated tools are not available, please run migrations manually:"
echo ""
echo "1. Go to: https://app.supabase.com/project/$PROJECT_REF/sql/new"
echo "2. Copy and run the SQL from: supabase/migrations/20251031000001_remove_conduct_grade.sql"
echo "3. Then copy and run: supabase/migrations/20251031000002_remove_reports_system.sql"
echo ""
echo "Migration files location:"
echo "  - $(pwd)/supabase/migrations/20251031000001_remove_conduct_grade.sql"
echo "  - $(pwd)/supabase/migrations/20251031000002_remove_reports_system.sql"
echo ""

exit 1
