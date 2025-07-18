# How Payments Work: PlantID App → Stripe → Your Bank

## Simple Visual Flow

```
📱 User Opens Android App (from Play Store)
    ↓
🌐 App Loads Your Web App (hosted on cloud)
    ↓
💳 User Clicks "Upgrade to Premium" ($4.99/month)
    ↓
🔄 Your Backend Creates Stripe Subscription
    ↓
💰 Stripe Processes Payment (user's card charged)
    ↓
✅ Stripe Confirms Payment Success
    ↓
⭐ Your Backend Marks User as Premium
    ↓
🚀 User Gets Unlimited Plant Identifications
    ↓
💸 Money Goes to Your Bank Account (minus 2.9% Stripe fee)
```

## Where Your Stripe Keys Live:

### ❌ NOT in the Android App
- Android APK file does not contain secret keys
- Users cannot see your Stripe secret key

### ✅ On Your Cloud Server
- Vercel/Railway/Replit hosting stores your keys securely
- Keys are environment variables, not in code
- Only your server can use them

## Real Example:

1. **You deploy to Vercel:**
   ```bash
   vercel --prod
   # Your app is now at: https://plantid-yourname.vercel.app
   ```

2. **You add Stripe keys to Vercel:**
   - Go to Vercel dashboard
   - Add environment variables:
     - `STRIPE_SECRET_KEY=sk_live_51RfWPeP0VGlWmm...`
     - `VITE_STRIPE_PUBLIC_KEY=pk_live_51RfWPeP0VGlWmm...`

3. **You create Android app:**
   ```bash
   npx cap add android
   # Creates Android app that shows your web app
   ```

4. **User flow on Play Store app:**
   - Opens Android app → loads https://plantid-yourname.vercel.app
   - Clicks "Premium" → Stripe payment form appears
   - Pays $4.99 → Stripe charges their card
   - Success → Your server marks them premium
   - Gets unlimited features immediately

5. **You get paid:**
   - Stripe deposits money to your bank account
   - Usually within 2-7 business days
   - You keep $4.85 per $4.99 subscription (Stripe takes $0.14)

## The Key Point:

Your Android app is just a "browser" that shows your web app. All the payment processing happens on your cloud server, not on the phone. This keeps your secrets safe and lets you receive real money through Stripe.