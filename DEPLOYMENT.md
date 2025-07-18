# PlantID Production Deployment Guide

## Security-First Approach for Production

### 🔒 Environment Variables (CRITICAL for Security)

**NEVER hardcode API keys in your source code!** Here's how to handle secrets properly:

#### 1. For Replit Deployment
- Go to your Replit project
- Click "Secrets" tab in the left sidebar
- Add these secrets:
  ```
  STRIPE_SECRET_KEY=sk_live_your_actual_live_key_here
  VITE_STRIPE_PUBLIC_KEY=pk_live_your_actual_live_key_here
  ```

#### 2. For Mobile App (Android/iOS)
Since this is a web app that can work as a PWA (Progressive Web App), you have these options:

**Option A: Deploy as Web App First**
1. Deploy to a hosting service (Vercel, Netlify, Railway, etc.)
2. Set environment variables in your hosting platform
3. Use the web app URL in a WebView container for mobile stores

**Option B: Convert to React Native**
1. Use React Native with your existing React components
2. Store secrets in secure storage (React Native Keychain/Async Storage)
3. Use environment variables during build time

### 🚀 Recommended Deployment Platforms

#### 1. Vercel (Easiest)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

#### 2. Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up

# Add environment variables in Railway dashboard
```

#### 3. Replit Deployments
```bash
# Already configured! Just click "Deploy" button
# Add secrets in Replit Secrets tab
```

### 🔑 Getting Production Stripe Keys

1. Go to https://dashboard.stripe.com/
2. Switch from "Test mode" to "Live mode" (toggle in left sidebar)
3. Go to "Developers" > "API Keys"
4. Copy:
   - **Publishable key** (starts with `pk_live_`) → `VITE_STRIPE_PUBLIC_KEY`
   - **Secret key** (starts with `sk_live_`) → `STRIPE_SECRET_KEY`

### 📱 For Mobile App Stores

#### Progressive Web App (PWA) Approach
1. Your app is already PWA-ready with offline capabilities
2. Users can "Add to Home Screen" on mobile
3. No app store submission needed!

#### Native App Approach
1. Use Capacitor to wrap your web app:
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init
   npx cap add android
   npx cap add ios
   ```
2. Build and deploy to stores

### 🛡️ Security Checklist

- ✅ Never commit `.env` file to git
- ✅ Use environment variables for all secrets
- ✅ Use HTTPS in production
- ✅ Enable Stripe webhook signatures
- ✅ Validate all user inputs
- ✅ Use live Stripe keys only in production

### 🔧 Production Environment Setup

```bash
# Production environment variables
STRIPE_SECRET_KEY=sk_live_your_actual_secret_key
VITE_STRIPE_PUBLIC_KEY=pk_live_your_actual_publishable_key
DATABASE_URL=your_production_database_url
NODE_ENV=production
```

### 📊 Testing Production Setup

1. **Test with Stripe's test cards:**
   - Success: `4242424242424242`
   - Decline: `4000000000000002`

2. **Verify environment variables:**
   ```bash
   # Check if variables are loaded
   console.log('Stripe keys loaded:', !!process.env.STRIPE_SECRET_KEY)
   ```

3. **Test payment flow:**
   - Create subscription
   - Process payment
   - Verify premium status updates

### 🚨 Important Notes

- **Test keys vs Live keys**: Always test with test keys first
- **Webhook endpoints**: Set up Stripe webhooks for production
- **SSL required**: Stripe requires HTTPS for live keys
- **Domain verification**: Add your production domain to Stripe settings

Your app is now ready for secure production deployment! 🎉