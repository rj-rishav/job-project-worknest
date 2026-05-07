# Deployment Guide - Render

This guide will help you deploy WorkNest to Render.

## Prerequisites

- A Render account (https://render.com)
- A Supabase account with a database set up
- Your GitHub repository connected to Render

## Step 1: Create a Web Service on Render

1. Go to your Render dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `worknest` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

## Step 2: Set Environment Variables

In your Render service settings, go to **Environment** and add these variables:

### Required Environment Variables

| Variable          | Value                                    | Description                       |
| ----------------- | ---------------------------------------- | --------------------------------- |
| `NODE_ENV`        | `production`                             | Node environment                  |
| `DATABASE_URL`    | Your Supabase connection string          | Direct connection URL (port 5432) |
| `DIRECT_URL`      | Your Supabase connection string          | Same as DATABASE_URL              |
| `NEXTAUTH_SECRET` | Generate with: `openssl rand -base64 32` | Secret for NextAuth               |
| `NEXTAUTH_URL`    | `https://your-app.onrender.com`          | Your Render app URL               |

### Getting Your Supabase Connection String

1. Go to your Supabase project dashboard
2. Click **Settings** → **Database**
3. Scroll to **Connection string** section
4. Copy the **Direct connection** URI (port 5432, not pooler)
5. Replace `[YOUR-PASSWORD]` with your actual database password

Example:

```
postgresql://postgres.abcdefg:your-password@aws-0-region.pooler.supabase.com:5432/postgres
```

### Generating NEXTAUTH_SECRET

Run this command locally:

```bash
openssl rand -base64 32
```

Copy the output and use it as your `NEXTAUTH_SECRET`.

## Step 3: Deploy

1. Click **"Create Web Service"** or **"Manual Deploy"**
2. Wait for the build to complete (usually 2-5 minutes)
3. Once deployed, your app will be available at `https://your-app.onrender.com`

## Step 4: Set Up Database

After the first deployment, you need to push the Prisma schema to your database:

### Option A: Using Render Shell (Recommended)

1. In your Render dashboard, go to your service
2. Click **"Shell"** in the top right
3. Run these commands:
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

### Option B: Using Local Machine

1. Create a `.env.production` file locally with your production DATABASE_URL
2. Run:
   ```bash
   DATABASE_URL="your-production-url" npx prisma db push
   DATABASE_URL="your-production-url" npx tsx prisma/seed.ts
   ```

## Step 5: Verify Deployment

1. Visit your app URL: `https://your-app.onrender.com`
2. Try signing in with demo credentials:
   - **Email**: `owner@worknest.com`
   - **Password**: `Password123`

## Troubleshooting

### Build Fails with "Cannot find module"

- Make sure all required dependencies are in `dependencies` (not `devDependencies`)
- Check that `@tailwindcss/postcss` and `tailwindcss` are in `dependencies`

### "UntrustedHost" Error

- Verify `NEXTAUTH_URL` is set to your full Render URL
- Make sure `trustHost: true` is in `lib/auth/config.ts`

### Database Connection Error

- Verify `DATABASE_URL` is correct
- Use the **direct connection** URL (port 5432), not the pooler
- Check that your Supabase project is active
- Verify the password in the connection string is correct

### "Missing Secret" Error

- Make sure `NEXTAUTH_SECRET` is set in Render environment variables
- Generate a new secret with `openssl rand -base64 32`

### App Crashes on Start

- Check the logs in Render dashboard
- Verify all environment variables are set
- Make sure the database schema is pushed

## Updating Your Deployment

Render automatically deploys when you push to your main branch:

```bash
git add .
git commit -m "your changes"
git push origin main
```

Render will detect the push and automatically rebuild and redeploy.

## Manual Redeploy

If you need to manually trigger a deployment:

1. Go to your Render dashboard
2. Click on your service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**

## Environment-Specific Configuration

### Development

- Uses `.env` file
- Database: Local PostgreSQL or Supabase dev instance
- Hot reload enabled

### Production (Render)

- Uses Render environment variables
- Database: Supabase production instance
- Optimized build

## Security Checklist

- ✅ `NEXTAUTH_SECRET` is a strong random string
- ✅ Database credentials are not committed to git
- ✅ `.env` file is in `.gitignore`
- ✅ Production uses HTTPS (automatic on Render)
- ✅ Environment variables are set in Render dashboard

## Performance Tips

1. **Enable Render's CDN** for static assets
2. **Use connection pooling** if you have high traffic
3. **Monitor your database** connections in Supabase dashboard
4. **Set up health checks** in Render settings

## Cost Optimization

- **Free Tier**: Render offers a free tier with some limitations
- **Database**: Supabase free tier includes 500MB database
- **Upgrade**: Consider upgrading if you need:
  - No cold starts
  - More database storage
  - Higher connection limits

## Support

- **Render Docs**: https://render.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **NextAuth Docs**: https://next-auth.js.org

## Next Steps

After successful deployment:

1. **Change default passwords** for demo users
2. **Set up monitoring** (Render provides basic monitoring)
3. **Configure custom domain** (optional)
4. **Set up CI/CD** for automated testing before deployment
5. **Enable backups** for your Supabase database

---

🎉 **Congratulations!** Your WorkNest application is now live in production!
