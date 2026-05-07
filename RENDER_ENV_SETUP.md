# Quick Setup: Render Environment Variables

Copy and paste these into your Render dashboard under **Environment** settings.

## Required Environment Variables

```
NODE_ENV=production
```

```
DATABASE_URL=postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres
```

```
DIRECT_URL=postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres
```

```
NEXTAUTH_SECRET=GENERATE_WITH_openssl_rand_-base64_32
```

```
NEXTAUTH_URL=https://your-app-name.onrender.com
```

## How to Get These Values

### 1. DATABASE_URL & DIRECT_URL

1. Go to Supabase → Your Project → Settings → Database
2. Find "Connection string" section
3. Copy the **Direct connection** string (port 5432)
4. Replace `[YOUR-PASSWORD]` with your actual database password
5. Use the same value for both `DATABASE_URL` and `DIRECT_URL`

### 2. NEXTAUTH_SECRET

Run this command in your terminal:

```bash
openssl rand -base64 32
```

Copy the output.

### 3. NEXTAUTH_URL

This is your Render app URL. Format:

```
https://your-app-name.onrender.com
```

You can find this in your Render dashboard after creating the service.

## After Setting Environment Variables

1. Click **"Save Changes"**
2. Render will automatically redeploy
3. Once deployed, run in Render Shell:
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

## Verify Setup

Visit your app and try signing in:

- Email: `owner@worknest.com`
- Password: `Password123`

---

**Need help?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.
