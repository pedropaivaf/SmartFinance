# Syros Mobile — Setup Guide

This document lists **everything you need to do manually** to ship Syros as native iOS + Android apps with premium subscriptions. All code work (Phases 1-6) is already committed on the `mobile` branch. This guide covers Phase 7 (external setup + store submission) and Phase 8 (post-launch).

Follow the sections in order. Each step says **what to do**, **where**, and **what value to write down** so you can paste it back later.

---

## 0. Pre-flight

- [ ] Credit card ready (Apple = US$ 99/ano, Google = US$ 25 one-time)
- [ ] Checkout the mobile branch locally: `git checkout mobile && git pull`
- [ ] Confirm build still works: `npm install && npm run build`
- [ ] Confirm the Supabase migration ran (you already did this — Phase 3)

---

## 1. Apple Developer + App Store Connect

### 1.1 Enroll
1. Go to https://developer.apple.com/programs/enroll/ — enroll as **Individual** (simpler) or **Organization** (requires DUNS number, 1-2 weeks).
2. Pay US$ 99. Wait for confirmation email (can take up to 48h).

### 1.2 Register the App ID
1. https://developer.apple.com/account/resources/identifiers/list
2. **+** → App IDs → App → Continue
3. Description: `Syros`
4. Bundle ID (Explicit): `com.syros.app`
5. Capabilities: enable **In-App Purchase**
6. Register

### 1.3 Create the app in App Store Connect
1. https://appstoreconnect.apple.com/apps
2. **+** → New App
3. Platform: iOS · Name: `Syros` · Primary language: Portuguese (Brazil) · Bundle ID: `com.syros.app` · SKU: `syros-ios-001`
4. Create

### 1.4 Create subscription products
1. App Store Connect → your app → **Monetization → Subscriptions**
2. Create Subscription Group: `Syros Premium`
3. Add subscription:
   - Product ID: `syros_premium_monthly`
   - Reference name: `Syros Premium Monthly`
   - Duration: 1 Month · Price: **R$ 14,90** (Brazil)
   - Introductory Offer: **Free · 7 days · New Subscribers**
   - Localizations (pt-BR): Display name `Premium Mensal`, description `Acesso a todos os recursos premium.`
4. Add subscription:
   - Product ID: `syros_premium_annual`
   - Reference name: `Syros Premium Annual`
   - Duration: 1 Year · Price: **R$ 119,90**
   - Introductory Offer: **Free · 7 days · New Subscribers**
   - Localizations (pt-BR): Display name `Premium Anual`, description `Acesso a todos os recursos premium. Economize com o plano anual.`
5. **Submit for review** (status will be "Waiting for Review" until the app is submitted)

### 1.5 Sandbox tester (for local testing)
1. App Store Connect → **Users and Access → Sandbox → Testers**
2. **+** → create test account with a fake email that **you control** (e.g. `syros-sandbox-01@gmail.com` with a plus-alias)
3. On your iPhone: Settings → App Store → scroll to **Sandbox Account** → sign in with that tester

---

## 2. Google Play Console

### 2.1 Enroll
1. https://play.google.com/console/signup
2. Pay US$ 25 (one-time). Approval usually same-day.

### 2.2 Create the app
1. Play Console → **Create app**
2. App name: `Syros` · Default language: Portuguese (Brazil) · App or game: App · Free or paid: Free
3. Accept declarations → Create

### 2.3 Create subscription products
1. Play Console → your app → **Monetize → Subscriptions**
2. **Create subscription**:
   - Product ID: `syros_premium_monthly`
   - Name: `Syros Premium Mensal`
   - Base plan ID: `monthly` · Auto-renewing · Billing period: 1 month · Price: **R$ 14,90**
   - Add offer: `free-trial` · Eligibility: New customer only · Phase: Free trial · Duration: 7 days
3. **Create subscription** (second one):
   - Product ID: `syros_premium_annual`
   - Name: `Syros Premium Anual`
   - Base plan ID: `annual` · Auto-renewing · Billing period: 1 year · Price: **R$ 119,90**
   - Add offer: `free-trial` · New customer only · Free trial · 7 days
4. **Activate** both.

### 2.4 License testers
1. Play Console → **Setup → License testing**
2. Add your Gmail(s) that will test purchases. License response: `RESPOND_NORMALLY`.

---

## 3. RevenueCat

### 3.1 Create project
1. https://app.revenuecat.com → Sign up → Create project `Syros`
2. **Project settings → Apps → + New**
   - iOS app: name `Syros iOS` · Bundle ID `com.syros.app` · App Store Connect App-Specific Shared Secret (generate in App Store Connect → Users and Access → Integrations → App-Specific Shared Secret)
   - Android app: name `Syros Android` · Package name `com.syros.app` · upload **Google Service Account JSON** (create in Google Cloud Console → IAM → Service Accounts → grant access in Play Console → Users and permissions → invite the service account email with Financial data + Manage orders)

### 3.2 Import products
1. Project → **Products** → Import from App Store / Play Store (one per platform). RevenueCat will auto-detect `syros_premium_monthly` and `syros_premium_annual`.
2. Confirm all 4 products show up (iOS monthly, iOS annual, Android monthly, Android annual).

### 3.3 Create entitlement
1. Project → **Entitlements → + New**
2. Identifier: **`premium`** (must match exactly — the code reads this)
3. Attach all 4 products.

### 3.4 Create offering + packages
1. Project → **Offerings → + New**
2. Identifier: `default` · mark as **Current**
3. Add packages inside the offering:
   - Identifier `monthly` · attach iOS `syros_premium_monthly` + Android `syros_premium_monthly`
   - Identifier `annual` · attach iOS `syros_premium_annual` + Android `syros_premium_annual`

### 3.5 Get API keys
1. Project → **API keys**
2. Copy the **iOS public SDK key** (starts with `appl_...`) and **Android public SDK key** (starts with `goog_...`).
3. Paste into the local `.env` file at the repo root:
   ```
   VITE_REVENUECAT_IOS_KEY=appl_xxx
   VITE_REVENUECAT_ANDROID_KEY=goog_xxx
   ```
4. These are **public** keys — safe to ship in the client bundle.

### 3.6 Webhook shared secret
1. Project → **Integrations → Webhooks → + New webhook**
2. URL: `https://<your-project-ref>.functions.supabase.co/billing-webhook`
   (You will get the real URL after step 5.3 below — come back and paste it here.)
3. Authorization header value: **generate a random string** (e.g. `openssl rand -hex 32`). Save it — you will paste it into Supabase secrets in step 5.
4. Events: leave all defaults enabled.
5. Save. You can come back to finish this after Phase 5.

---

## 4. Stripe (web billing)

### 4.1 Activate account
1. https://dashboard.stripe.com → create account → fill in Brazilian business info (MEI/CNPJ/CPF).
2. Enable **Pix** and **Boleto** in Settings → Payment methods.
3. Stay in **test mode** for the first dry-run — flip to live only when everything works.

### 4.2 Create products
1. Stripe Dashboard → **Products → + Add product**
2. Product 1: Name `Syros Premium Mensal`
   - Add price: Recurring · Billing period: Monthly · Price: **R$ 12,90** (BRL)
   - Copy the **Price ID** (`price_...`) — this goes into a Supabase secret later
3. Product 2: Name `Syros Premium Anual`
   - Add price: Recurring · Yearly · **R$ 99,90**
   - Copy the Price ID

### 4.3 Get API keys
1. Stripe → **Developers → API keys**
2. Copy **Secret key** (`sk_test_...` or `sk_live_...` later) — goes into Supabase secret.

### 4.4 Webhook endpoint
1. Stripe → **Developers → Webhooks → + Add endpoint**
2. URL: `https://<your-project-ref>.functions.supabase.co/billing-webhook` (same URL as RevenueCat — the code routes by header)
3. Events to send:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. After creation, click the endpoint and copy the **Signing secret** (`whsec_...`) — goes into Supabase secret.

---

## 5. Supabase — deploy edge functions and secrets

### 5.1 Install the CLI
```bash
npm install -g supabase
supabase login
```

### 5.2 Link the project
```bash
cd "/c/Users/Pedro/OneDrive/Documentos/SmartFinance"
supabase link --project-ref <your-project-ref>
```
Find `<your-project-ref>` in Supabase Dashboard → Project settings → General → Reference ID.

### 5.3 Deploy both functions
```bash
supabase functions deploy create-checkout-session
supabase functions deploy billing-webhook --no-verify-jwt
```
The `--no-verify-jwt` flag is critical for the webhook — Stripe and RevenueCat don't send Supabase JWTs.

After deploy, your webhook URL is:
```
https://<your-project-ref>.functions.supabase.co/billing-webhook
```
**Go back to steps 3.6 and 4.4** and paste this URL into RevenueCat and Stripe webhook configs.

### 5.4 Set secrets
```bash
supabase functions secrets set \
  STRIPE_SECRET_KEY=sk_test_xxx \
  STRIPE_PRICE_MONTHLY=price_xxx \
  STRIPE_PRICE_ANNUAL=price_xxx \
  STRIPE_WEBHOOK_SECRET=whsec_xxx \
  REVENUECAT_WEBHOOK_SECRET=<the-random-string-from-step-3.6> \
  PUBLIC_APP_URL=https://syrosfinance.netlify.app
```
Supabase auto-injects `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — you don't set those.

### 5.5 Smoke test
- From Stripe Dashboard → Developers → Webhooks → your endpoint → **Send test webhook** → `checkout.session.completed` → expect **200 ok**.
- From RevenueCat → Integrations → Webhooks → **Send test event** → expect **200 ok**.
- Check Supabase Dashboard → Edge Functions → Logs for any error lines.

---

## 6. Local dry-run on emulators

### 6.1 Build and sync
```bash
cd "/c/Users/Pedro/OneDrive/Documentos/SmartFinance"
npm run build
npx cap sync
```

### 6.2 Open iOS (requires Mac + Xcode)
```bash
npx cap open ios
```
- Xcode → Signing & Capabilities → select your team
- Add **In-App Purchase** capability
- Run on simulator or physical device (must be signed in with a **Sandbox tester** account)
- Try to buy monthly → expect "TEST purchase" confirmation → expect premium unlocked

### 6.3 Open Android
```bash
npx cap open android
```
- Android Studio → sync Gradle → run on emulator or physical device
- Sign in to the Play Store with a **license tester** account
- Install via internal testing track (see 7.2) because IAP **does not work on debug builds** outside a signed track
- Try to buy monthly → expect test purchase → premium unlocked

### 6.4 Web dry-run
```bash
npm run dev
```
- Open Settings → Ativar Premium → confirm the paywall appears
- Click CTA → expect redirect to Stripe Checkout (test mode)
- Use card `4242 4242 4242 4242` · any future expiry · any CVC
- After checkout, redirect back to app → expect premium unlocked within a few seconds
- Verify in Supabase → `user_preferences` table → your row should show `plan = 'premium'`, `premium_expires_at` in the future, `plan_source = 'web'`

---

## 7. Store submission (Phase 7)

### 7.1 Screenshots and metadata (both stores)
- [ ] **iPhone 6.7"** screenshots (iPhone 15 Pro Max): 1290×2796 · at least 3
- [ ] **iPhone 6.5"** screenshots: 1284×2778 or 1242×2688 · at least 3
- [ ] **iPhone 5.5"** screenshots: 1242×2208 · at least 3 (can be up-scaled — Apple still requires this size)
- [ ] **iPad 12.9"** screenshots: 2048×2732 · at least 3 (only if app supports iPad)
- [ ] **Android phone** screenshots: 1080×1920 · at least 2
- [ ] **Android 7"** tablet screenshots: 1200×1920 · at least 2
- [ ] **Android 10"** tablet: 1920×1200 · at least 2
- [ ] App icon **1024×1024** (App Store) and **512×512** (Play)
- [ ] Short description (80 chars, pt-BR): `Controle financeiro pessoal simples e bonito para iOS e Android.`
- [ ] Long description (up to 4000 chars, pt-BR): write a selling copy covering envelopes, cartões, insights, trial de 7 dias
- [ ] Keywords (App Store, 100 chars): `finanças,orçamento,despesas,cartão de crédito,dinheiro,controle,investimento`
- [ ] **Privacy policy URL**: publish `PrivacyPolicyModal.jsx` content to a public route like `https://syrosfinance.netlify.app/privacy` and link it
- [ ] **Support URL**: `https://syrosfinance.netlify.app` or a Notion/Google Sites page
- [ ] **Support email**: `contactsyros@gmail.com`

### 7.2 Apple-specific
- [ ] **Data Collection survey**: in App Store Connect → App Privacy → declare what you collect
  - Identifiers → User ID → linked to user → used for App Functionality (Supabase UUID)
  - Contact Info → Email → linked to user → App Functionality (login)
  - Financial Info → Other Financial Info → linked to user → App Functionality (the transactions)
  - Nothing is used for tracking
- [ ] **Encryption**: declare "Uses standard encryption" (HTTPS) — no export compliance needed
- [ ] **Demo account**: in App Information → App Review → create a demo Supabase user and paste credentials (the reviewer will use it)
- [ ] **Review notes**: paste a short flow — "Login → add a transaction → Settings → tap Ativar Premium → try subscribing with sandbox account"
- [ ] **Age rating**: 4+ (no adult content)
- [ ] **Advertising Identifier (IDFA)**: No
- [ ] Upload the build: Xcode → Product → Archive → Distribute App → App Store Connect → Upload
- [ ] After processing (15-30 min), select the build in the app version → Submit for review
- [ ] **First review**: expect 1-3 days. Common first-time rejections to prepare for:
  - Missing restore purchases button (you have it — verify it works)
  - IAP products not attached to this version (check the Subscription section in the app submission)
  - Screenshots showing features only available with subscription without explaining the trial

### 7.3 Google-specific
- [ ] **Data Safety form**: Play Console → Policy → Data Safety → declare same categories as Apple
- [ ] **Content rating**: Play Console → Policy → Content Rating → fill IARC questionnaire → expect **L (Livre)**
- [ ] **Target audience and content**: ages 18+ (financial app) — avoids mixed-audience rules
- [ ] **News app**: No
- [ ] **Ads**: No
- [ ] **Target API level**: must be 34+ (Android 14). Capacitor 6 defaults are correct.
- [ ] **App signing**: use **Play App Signing** (Google holds the upload key — default and recommended)
- [ ] Build AAB:
  ```bash
  cd android
  ./gradlew bundleRelease
  ```
  Output: `android/app/build/outputs/bundle/release/app-release.aab`
- [ ] Upload to **Internal testing track** first → add testers → verify install and purchase work
- [ ] Promote to **Closed testing → Open testing → Production** as you gain confidence
- [ ] First review: expect 1-3 days

---

## 8. Post-launch (Phase 8)

### 8.1 Monitoring dashboards (bookmark these)
- **RevenueCat Charts**: conversion funnel, trial → paid, churn, MRR by cohort
- **Stripe Dashboard**: MRR, failed charges, dispute alerts
- **Supabase Dashboard → Edge Functions → Logs**: watch for webhook errors — any 5xx here means plan state went out of sync
- **Supabase Dashboard → Database → `user_preferences`**: run `SELECT plan, count(*) FROM user_preferences GROUP BY plan;` weekly

### 8.2 Pricing experiments
- RevenueCat → Experiments → A/B test different offerings (e.g. keep `default` at R$ 14,90/R$ 119,90 and test `higher` at R$ 19,90/R$ 149,90)
- Read results after ~500 impressions per variant

### 8.3 Churn recovery
- RevenueCat → Integrations → Email (or use your own Supabase Edge Function triggered from `billing-webhook` on `BILLING_ISSUE`) to send a "Update your payment" email
- Stripe Dashboard → Settings → Subscriptions → Smart Retries: enable

### 8.4 Updates to the app
Every time you ship new JS/CSS:
```bash
npm run build
npx cap sync
# iOS:
npx cap open ios     # Archive → Upload
# Android:
cd android && ./gradlew bundleRelease
# upload AAB via Play Console
```
For small JS-only bug fixes, consider **Capacitor Live Updates** (Ionic Appflow) — Apple allows JS-bundle hot-fixes as long as native code doesn't change.

---

## 9. Final checklist before flipping to production

### 9.1 Merge mobile → main
Do this **only after** both stores have approved the app and Stripe is switched to live mode.
```bash
git checkout main
git pull
git merge mobile
git push origin main
```
Netlify will rebuild the web app. Confirm that:
- [ ] The web build still works (`npm run build` locally first)
- [ ] Existing users with `plan='premium'` and `premium_expires_at IS NULL` are still treated as premium (the `isPremiumActive` helper handles this — "lifetime grandfathered")
- [ ] The paywall modal opens without errors on the deployed Netlify site

### 9.2 Flip Stripe to live
- Stripe Dashboard → toggle from **Test mode** to **Live mode**
- Recreate the two products + prices in live mode
- Recreate the webhook endpoint in live mode
- Update Supabase secrets:
  ```bash
  supabase functions secrets set \
    STRIPE_SECRET_KEY=sk_live_xxx \
    STRIPE_PRICE_MONTHLY=price_live_xxx \
    STRIPE_PRICE_ANNUAL=price_live_xxx \
    STRIPE_WEBHOOK_SECRET=whsec_live_xxx
  ```
- Redeploy both functions: `supabase functions deploy create-checkout-session && supabase functions deploy billing-webhook --no-verify-jwt`

### 9.3 Announce
- Social posts, app store links in the Netlify site
- Email existing users about the new mobile apps (if you have a mailing list)

---

## 10. Values to keep in a password manager

Copy this template into 1Password / Bitwarden:

```
Apple Developer
  Account email:
  Team ID:
  App-Specific Shared Secret (RevenueCat):

Google Play
  Account email:
  Service account email (RevenueCat):
  Service account JSON location:

RevenueCat
  Project ID:
  iOS public SDK key (appl_...):
  Android public SDK key (goog_...):
  Webhook shared secret:

Stripe (test)
  Publishable key (pk_test_):
  Secret key (sk_test_):
  Monthly price ID (price_):
  Annual price ID (price_):
  Webhook signing secret (whsec_):

Stripe (live)  [fill after launch]
  ...

Supabase
  Project ref:
  Service role key: (never paste in code — only in `supabase functions secrets set`)
```

---

## Appendix A — Phase-by-phase code status

All code work is on the `mobile` branch. Main is untouched.

| Phase | Commit | Status |
|---|---|---|
| 1. Capacitor + Tailwind build-time | `cbf5f0d` | ✅ committed |
| 2. Paywall UI + tiers | `36b263e` | ✅ committed |
| 3. Backend of plans (SQL migration + helpers) | `4341667` | ✅ committed + migration applied |
| 4. RevenueCat + IAP | `14b2d29` | ✅ committed |
| 5. Stripe Checkout (web) | `dbaea42` | ✅ committed |
| 6. Unified webhook | `8c1653c` | ✅ committed |
| 7. Store submission | — | ⏳ this document |
| 8. Post-launch | — | ⏳ this document |

## Appendix B — When something breaks

- **"Paywall says 'unavailable'"** → RevenueCat offering `default` doesn't have packages `monthly`/`annual`, or the bundle ID mismatch. Check step 3.4.
- **"Purchase succeeds but app still says free"** → webhook didn't fire or 5xx'd. Check Supabase → Edge Functions → Logs → billing-webhook. Verify the shared secret matches.
- **"Stripe checkout redirects to 404"** → `PUBLIC_APP_URL` Supabase secret is wrong. Fix and redeploy `create-checkout-session`.
- **"Apple rejected for mentioning external payments"** → never link to the web site from inside the iOS app. The paywall on iOS must only show IAP.
- **"Legacy premium user lost their plan"** → check `isPremiumActive()` in `src/config.js` — it must return `true` when `plan='premium'` and `premium_expires_at IS NULL`.
