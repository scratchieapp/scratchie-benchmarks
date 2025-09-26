# Vercel Environment Variables

Copy and paste these environment variables into your Vercel project settings:

## Required Environment Variables

### Authentication Passwords
```
AUTH_PASSWORD_FULL=sync2025
AUTH_PASSWORD_SIMPLE=simple2025
```

### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://cvyeupcpsddspemlwkhd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Your Supabase Anon Key]
SUPABASE_SERVICE_KEY=[Your Supabase Service Key - if needed]
```

### Application Configuration
```
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
NEXT_PUBLIC_DEFAULT_TENANT=sync-industries
```

## How to Add to Vercel

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Navigate to "Environment Variables" in the left sidebar
4. Add each variable one by one:
   - Enter the Key (e.g., `AUTH_PASSWORD_FULL`)
   - Enter the Value (e.g., `sync2025`)
   - Select which environments to apply to (Production, Preview, Development)
   - Click "Save"

## Important Security Notes

- **AUTH_PASSWORD_FULL** and **AUTH_PASSWORD_SIMPLE** should be kept secret
- Consider changing these passwords to something more secure for production
- These passwords control access to different dashboard views:
  - `AUTH_PASSWORD_FULL`: Full dashboard with all features
  - `AUTH_PASSWORD_SIMPLE`: Simplified dashboard with key metrics only
- Never commit actual passwords to your repository

## After Deployment

Once deployed with these environment variables:
- Users will no longer see password hints on the login screen
- Passwords will be validated server-side using the API route
- You can change passwords by updating the environment variables in Vercel (no code changes needed)