#!/bin/bash
set -e  # Exit on error

echo "🚀 Setting up moe-tg-vx workspace..."
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js $(node --version) and npm $(npm --version) found"
echo ""

# Copy environment file
echo "🔧 Setting up environment variables..."
if [ ! -f "$CONDUCTOR_ROOT_PATH/.env" ]; then
    echo "❌ .env file not found in base repository at $CONDUCTOR_ROOT_PATH/.env"
    echo "   Please create a .env file in your base repository with the required Supabase credentials."
    echo "   You can use .env.example as a template."
    exit 1
fi

cp "$CONDUCTOR_ROOT_PATH/.env" .env
echo "✅ Environment file copied from base repository"
echo ""

# Validate required environment variables
echo "🔍 Validating environment variables..."
required_vars=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "SUPABASE_SERVICE_ROLE_KEY")
missing_vars=()

for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" .env || grep -q "^${var}=.*your-.*-here" .env; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo "❌ Missing or incomplete environment variables in .env:"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "   Please update your .env file in the base repository with valid Supabase credentials."
    echo "   Get them from: https://app.supabase.com (Project Settings → API)"
    exit 1
fi

echo "✅ All required environment variables are set"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Generate TypeScript types from Supabase
echo "🔨 Generating TypeScript types from Supabase schema..."
if command -v npx &> /dev/null && npx supabase --version &> /dev/null 2>&1; then
    if [ -d "src/types" ]; then
        npx supabase gen types typescript --local > src/types/supabase.ts 2>/dev/null || echo "⚠️  Type generation skipped (requires local Supabase setup)"
    else
        echo "⚠️  src/types directory not found - skipping type generation"
    fi
else
    echo "⚠️  Supabase CLI not found - skipping type generation"
    echo "   This is optional and won't affect development"
fi
echo ""

# Success message
echo "✅ Workspace setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Click the 'Run' button to start the development server"
echo "   2. Visit http://localhost:3000 to view your app"
echo "   3. Edit files and see changes live with Turbopack"
echo ""
