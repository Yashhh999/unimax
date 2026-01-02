# UNIMAX Studios - Serverless Setup Guide

## 🚀 Deploy to Vercel

### Step 1: Create Upstash Redis Database (Free)

1. Go to [Upstash Console](https://console.upstash.com/)
2. Sign up/Login (free)
3. Click **"Create Database"**
4. Choose:
   - Name: `unimax-db`
   - Region: Select closest to your users
   - Type: Regional
5. Copy these values from the database dashboard:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### Step 2: Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click **"New Project"** → Import your GitHub repo
4. Add Environment Variables (in Vercel project settings):

```
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
ADMIN_PASSWORD=your-secure-password-here
JWT_SECRET=generate-a-random-32-char-string
```

5. Click **Deploy**

### Step 3: Generate Secure Secrets

Run this in terminal to generate a JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: 5 failed attempts → 15 min lockout
- **Password Hashing**: bcrypt with 12 rounds
- **CORS Protection**: Configurable origins
- **Login Logging**: Tracks login attempts

## 📁 Project Structure

```
/api
  /auth
    login.js          # Login endpoint
    verify.js         # Token verification
    change-password.js # Password change
  /lib
    auth.js           # JWT utilities
    redis.js          # Database connection
  /projects
    all.js            # Get all projects (admin)
  projects.js         # CRUD operations
  settings.js         # Theme/background settings
```

## 🔧 Local Development

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```
UPSTASH_REDIS_REST_URL=your-url
UPSTASH_REDIS_REST_TOKEN=your-token
ADMIN_PASSWORD=test123
JWT_SECRET=local-dev-secret-key
```

3. Run with Vercel CLI:
```bash
npm install -g vercel
vercel dev
```

## 📝 API Endpoints

### Public
- `GET /api/projects` - Get visible projects
- `GET /api/settings` - Get themes/backgrounds/fonts

### Protected (requires JWT)
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verify token
- `POST /api/projects` - Create project
- `PUT /api/projects` - Update project
- `DELETE /api/projects` - Delete project
- `GET /api/projects/all` - Get all projects (including hidden)
- `POST /api/settings` - Update settings
- `POST /api/auth/change-password` - Change password

## 🔄 Migration from localStorage

When deploying, your first admin login will:
1. Use the `ADMIN_PASSWORD` from environment variables
2. Hash and store it in Redis
3. Future logins use the stored hash

To migrate existing projects:
1. Login to admin panel
2. Go to Settings
3. Export your data (if using old localStorage version)
4. Import after deploying new version

## 💡 Tips

- Change your admin password after first login
- The JWT token expires after 7 days
- Use the Export feature to backup your data
- Add your domain to CORS if needed
