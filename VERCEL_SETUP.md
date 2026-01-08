# Vercel Deployment Setup

## Important: Root Directory Configuration

To deploy Navigator2.0 to Vercel, you **must** configure the Root Directory in Vercel Dashboard:

### Steps:

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your project (`navigator-m` or similar)
3. Go to **Settings** → **General**
4. Scroll to **Root Directory**
5. Set it to: `Navigator2.0`
6. Click **Save**

### Why This Is Needed

Vercel detects the Next.js framework **before** running build commands. Since the Next.js app is in the `Navigator2.0` subdirectory, Vercel needs to know where to look for `package.json` with the `next` dependency.

### Alternative: Manual Configuration

If you prefer not to use Root Directory, you can also configure in **Settings** → **Build & Development Settings**:
- **Root Directory**: `Navigator2.0`
- **Build Command**: `npm run build` (Vercel will run this in Navigator2.0 automatically)
- **Output Directory**: `.next` (default for Next.js)
- **Install Command**: `npm install` (default)

### Current vercel.json

The `vercel.json` file in the root contains build commands, but Vercel still needs the Root Directory setting to detect Next.js correctly.

