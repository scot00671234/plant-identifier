# Exact Steps to Deploy PlantID to Play Store

## Step 1: Deploy to Vercel (5 minutes)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy your app
vercel

# Follow prompts:
# - Project name: plantid-app
# - Deploy: Yes
# - Link to existing project: No
```

You'll get a URL like: `https://plantid-app-yourname.vercel.app`

## Step 2: Add Stripe Keys to Vercel (2 minutes)

1. Go to [vercel.com](https://vercel.com) and login
2. Find your project → Settings → Environment Variables
3. Add these variables:

```
STRIPE_SECRET_KEY = sk_live_51RfWPeP0VGlWmm... (your live key)
VITE_STRIPE_PUBLIC_KEY = pk_live_51RfWPeP0VGlWmm... (your live key)
```

4. Redeploy: `vercel --prod`

## Step 3: Install Capacitor (3 minutes)

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli

# Initialize Capacitor project
npx cap init "PlantID" "com.yourname.plantid"

# Add Android platform
npm install @capacitor/android
npx cap add android
```

## Step 4: Configure for Production (2 minutes)

Edit `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourname.plantid',
  appName: 'PlantID',
  webDir: 'dist/public',
  server: {
    url: 'https://plantid-app-yourname.vercel.app', // Your Vercel URL
    cleartext: true
  }
};

export default config;
```

## Step 5: Build Android App (5 minutes)

```bash
# Build your web app
npm run build

# Copy to Capacitor
npx cap copy

# Open in Android Studio
npx cap open android
```

## Step 6: Build APK in Android Studio

1. Android Studio opens automatically
2. Click "Build" → "Build Bundle(s) / APK(s)" → "Build APK(s)"
3. APK file created in `android/app/build/outputs/apk/`

## Step 7: Test Your APK

1. Install APK on Android device: `adb install app-debug.apk`
2. Test payment flow with live Stripe keys
3. Verify premium features work

## Step 8: Upload to Play Store

1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app
3. Upload your APK
4. Add app description (mention external payments):

```
PlantID - AI Plant Identification

Identify any plant instantly with AI-powered recognition. 
Take a photo and get detailed plant information including 
scientific names, care instructions, and more.

Premium subscriptions are processed through our secure 
payment system and provide unlimited plant identifications.

Features:
• AI plant identification
• Scientific and common names
• Plant family information
• Detailed descriptions
• Premium unlimited access
```

5. Submit for review

## Important Notes:

- **Your web app runs on Vercel** (where Stripe keys are safe)
- **Android app just displays** your web app
- **Payments happen on Vercel**, not on the phone
- **Money goes to your bank** via Stripe

## File Structure After Setup:

```
your-project/
├── android/          (Capacitor Android project)
├── client/          (Your React app)  
├── server/          (Your Express backend)
├── capacitor.config.ts
└── package.json
```

The beauty of this approach: Your existing code doesn't change at all! You just wrap it for Android and deploy the backend to Vercel.