# Deployment Guide for ip.tmflix.com

This guide will walk you through deploying the IP Information website to Vercel with the custom domain `ip.tmflix.com`.

## Prerequisites

- Vercel account: fadi@kelzia.com
- Domain `tmflix.com` configured in Cloudflare
- Vercel CLI installed globally (or use Vercel dashboard)

## Quick Deployment

### Option 1: Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```
   Use email: `fadi@kelzia.com`

3. **Navigate to project directory**:
   ```bash
   cd /home/mcp-admin/claude-code/projects/ip.tmflix.com
   ```

4. **Deploy to production**:
   ```bash
   vercel --prod
   ```

   When prompted:
   - Set up and deploy: `Y`
   - Which scope: Select your account (fadi@kelzia.com)
   - Link to existing project: `N`
   - Project name: `ip-tmflix` (or your preference)
   - Directory: `.` (current directory)
   - Override settings: `N`

5. **Note the deployment URL** - you'll get something like:
   ```
   https://ip-tmflix.vercel.app
   ```

### Option 2: Vercel Dashboard (Alternative)

1. Go to [vercel.com](https://vercel.com) and login with fadi@kelzia.com
2. Click "Add New Project"
3. Import from Git repository or upload the project folder
4. Configure:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
5. Click "Deploy"

## Configure Custom Domain

After deployment, configure the custom domain `ip.tmflix.com`:

### Step 1: Add Domain in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Domains**
3. Click "Add Domain"
4. Enter: `ip.tmflix.com`
5. Click "Add"

Vercel will provide DNS configuration instructions.

### Step 2: Configure DNS in Cloudflare

1. Login to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select the `tmflix.com` domain
3. Go to **DNS** → **Records**
4. Add a new CNAME record:

   ```
   Type: CNAME
   Name: ip
   Target: cname.vercel-dns.com
   Proxy status: Proxied (orange cloud icon)
   TTL: Auto
   ```

5. Click "Save"

### Step 3: Verify Domain

1. Return to Vercel dashboard
2. Wait for DNS propagation (usually 1-5 minutes with Cloudflare)
3. Vercel will automatically verify and issue SSL certificate
4. Once verified, `ip.tmflix.com` will be live!

## Environment Variables

This project doesn't require any environment variables for basic functionality. All geolocation APIs used are free-tier and don't require API keys.

If you want to add paid APIs in the future:

1. Go to Vercel project → **Settings** → **Environment Variables**
2. Add variables for production:
   ```
   IPAPI_KEY=your_key_here
   IPINFO_TOKEN=your_token_here
   ```

## Post-Deployment Checklist

After deployment, verify:

- [ ] Website loads at `https://ip.tmflix.com`
- [ ] SSL certificate is active (https with valid cert)
- [ ] IP address is displayed correctly
- [ ] Geolocation information loads
- [ ] "Show Detailed Network Information" button works
- [ ] API endpoints are accessible:
  - `https://ip.tmflix.com/api/ip` (returns JSON)
  - `https://ip.tmflix.com/api/ip/details?ip=1.2.3.4`
- [ ] Page loads fast (< 1s)
- [ ] Mobile responsive design works

## Testing the Deployment

1. **Test main page**:
   ```bash
   curl https://ip.tmflix.com
   ```

2. **Test API endpoint**:
   ```bash
   curl https://ip.tmflix.com/api/ip
   ```

3. **Test from different locations**:
   - Use a VPN to test geolocation from different countries
   - Test on mobile device
   - Test on different browsers

## Continuous Deployment

Vercel automatically redeploys when you push changes to your Git repository (if connected).

To manually redeploy:
```bash
vercel --prod
```

## Troubleshooting

### Domain not working
- Wait 5-10 minutes for DNS propagation
- Verify CNAME record in Cloudflare is correct
- Check Vercel dashboard for domain verification status

### API endpoints returning errors
- Check Vercel deployment logs
- Verify API rate limits aren't exceeded (ipapi.co: 1000/day)
- Check browser console for errors

### Build fails
- Verify all dependencies are installed: `npm install`
- Test build locally: `npm run build`
- Check Vercel build logs for specific errors

## Performance Monitoring

Monitor your deployment:

1. **Vercel Analytics** - Enable in project settings
2. **Vercel Speed Insights** - Track Core Web Vitals
3. **API Rate Limiting** - Monitor ipapi.co usage (1000 requests/day free tier)

## Updating the Site

1. Make changes locally
2. Test: `npm run dev`
3. Build: `npm run build`
4. Deploy: `vercel --prod`

## Rollback

If something goes wrong:

1. Go to Vercel dashboard → **Deployments**
2. Find a previous working deployment
3. Click the three dots → **Promote to Production**

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Contact: Your Vercel account support

---

**Current Status**: Development server running at http://localhost:3002

**Ready for deployment!** 🚀
