# Complete Setup Guide for HEIC Converter App

## Quick Start Checklist

- [ ] Import project into Android Studio
- [ ] Set up AdMob account and replace test IDs
- [ ] Create Google Play Console account
- [ ] Configure in-app product ($2.99 premium unlock)
- [ ] Generate app signing key
- [ ] Test on real device
- [ ] Upload to Play Console
- [ ] Publish to internal testing
- [ ] Test in-app purchases
- [ ] Publish to production

---

## Part 1: AdMob Setup (Revenue from Ads)

### Step 1: Create AdMob Account

1. Go to [https://admob.google.com](https://admob.google.com)
2. Sign in with your Google account
3. Click "Get Started"
4. Accept terms and conditions

### Step 2: Create Your App in AdMob

1. Click "Apps" in the sidebar
2. Click "Add App"
3. Select "No" for "Is your app listed on a supported app store?"
4. Enter app name: "HEIC Converter"
5. Select platform: Android
6. Click "Add"
7. **Copy your App ID** (format: ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX)

### Step 3: Create Banner Ad Unit

1. Click "Ad units" in the sidebar
2. Click "Get Started"
3. Select "Banner"
4. Enter ad unit name: "Main Banner"
5. Click "Create ad unit"
6. **Copy your Ad Unit ID** (format: ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX)

### Step 4: Replace Test IDs in Code

**File: `app/src/main/AndroidManifest.xml`** (Line 28)

Replace:
```xml
android:value="ca-app-pub-3940256099942544~3347511713"
```

With your App ID:
```xml
android:value="YOUR_ADMOB_APP_ID"
```

**File: `app/src/main/res/layout/activity_main.xml`** (Line 271)

Replace:
```xml
app:adUnitId="ca-app-pub-3940256099942544/6300978111"
```

With your Ad Unit ID:
```xml
app:adUnitId="YOUR_BANNER_AD_UNIT_ID"
```

### Step 5: Link AdMob to Play Console (After App is Published)

1. In AdMob, go to "Apps" → Your App
2. Click "App settings"
3. Under "Store presence", click "Link to Google Play"
4. Select your app from the list

---

## Part 2: Google Play Console Setup

### Step 1: Create Developer Account

1. Go to [https://play.google.com/console](https://play.google.com/console)
2. Pay one-time $25 registration fee
3. Complete account setup

### Step 2: Create App

1. Click "Create app"
2. Enter details:
   - **App name**: HEIC Converter
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free
3. Accept declarations
4. Click "Create app"

### Step 3: Set Up In-App Product

1. Go to "Monetize" → "Products" → "One-time products"
2. Click "Create product"
3. Enter product details:
   - **Product ID**: `premium_unlock` (MUST match code exactly)
   - **Name**: Premium Unlock
   - **Description**: Remove ads and unlock unlimited batch conversions
4. Set pricing:
   - **Price**: $2.99 USD
   - Auto-convert to other currencies
5. Click "Save"
6. Click "Activate"

**Important**: The product ID `premium_unlock` is hardcoded in `BillingManager.kt`. Do not change it unless you also update the code.

---

## Part 3: Build and Sign Your App

### Step 1: Generate Signing Key

1. In Android Studio, go to "Build" → "Generate Signed Bundle / APK"
2. Select "Android App Bundle"
3. Click "Create new..." under Key store path
4. Fill in details:
   - **Key store path**: Choose location (e.g., `heic-converter-key.jks`)
   - **Password**: Create strong password (SAVE THIS!)
   - **Alias**: heic-converter
   - **Password**: Same or different password (SAVE THIS!)
   - **Validity**: 25 years
   - **First and Last Name**: Your name
   - **Organization**: Metanoia Unlimited LLC
5. Click "OK"
6. **BACKUP THIS KEYSTORE FILE SECURELY** - You cannot update your app without it!

### Step 2: Build Release Bundle

1. Select "release" build variant
2. Click "Next"
3. Click "Finish"
4. Find the AAB file in `app/release/app-release.aab`

---

## Part 4: Upload to Play Console

### Step 1: Complete Store Listing

1. Go to "Store presence" → "Main store listing"
2. Fill in required fields:
   - **App name**: HEIC Converter
   - **Short description**: Convert HEIC images to JPEG, PNG, WebP
   - **Full description**: (See example below)
   - **App icon**: 512x512 PNG
   - **Feature graphic**: 1024x500 PNG
   - **Screenshots**: At least 2 phone screenshots

**Example Full Description**:
```
Convert your HEIC (High Efficiency Image Container) photos to JPEG, PNG, or WebP format with ease!

✨ FEATURES:
• Convert HEIC to JPEG, PNG, or WebP
• Batch conversion support
• Adjustable quality settings (High, Medium, Low)
• Fast and efficient conversion
• Save to Pictures folder
• Modern, intuitive interface

📱 FREE VERSION:
• Convert up to 5 images at once
• All formats supported
• Ad-supported

💎 PREMIUM VERSION ($2.99 - One-time payment):
• Unlimited batch conversions
• Ad-free experience
• Lifetime access

Perfect for iPhone users who need to share photos with Android users or anyone working with HEIC files!

Built by Metanoia Unlimited LLC
```

3. Select category: "Tools"
4. Add contact email
5. Save

### Step 2: Upload App Bundle

1. Go to "Release" → "Production"
2. Click "Create new release"
3. Upload your AAB file
4. Enter release notes:
   ```
   Initial release:
   - HEIC to JPEG/PNG/WebP conversion
   - Batch conversion support
   - Quality settings
   - Premium unlock option
   ```
5. Click "Save"

### Step 3: Complete Content Rating

1. Go to "Policy" → "App content"
2. Complete the questionnaire
3. Submit for rating

### Step 4: Set Up Pricing & Distribution

1. Go to "Policy" → "Pricing & distribution"
2. Select countries (or select all)
3. Confirm app is free
4. Accept content guidelines
5. Save

---

## Part 5: Testing

### Step 1: Internal Testing First

1. Go to "Release" → "Testing" → "Internal testing"
2. Create new release
3. Upload AAB
4. Create email list of testers
5. Send them the opt-in link
6. Test thoroughly:
   - Image selection
   - All format conversions
   - Quality settings
   - Free limit (5 images)
   - **In-app purchase** (this only works in published app)
   - Ad display

### Step 2: Test In-App Purchases

1. Add test accounts in Play Console:
   - Go to "Setup" → "License testing"
   - Add Gmail addresses of testers
2. Testers can make purchases without being charged
3. Test the full purchase flow
4. Test "Restore Purchase" button

---

## Part 6: Launch to Production

### Step 1: Final Checks

- [ ] All AdMob IDs replaced
- [ ] In-app product activated
- [ ] App tested on multiple devices
- [ ] Screenshots look good
- [ ] Store listing complete
- [ ] Privacy policy uploaded (if collecting data)

### Step 2: Submit for Review

1. Go to "Release" → "Production"
2. Click "Create new release"
3. Upload final AAB
4. Add release notes
5. Click "Review release"
6. Click "Start rollout to Production"

### Step 3: Wait for Approval

- Review typically takes 1-3 days
- You'll receive email when approved
- App will be live on Google Play Store

---

## Part 7: Monitoring & Optimization

### Monitor Revenue

1. **AdMob Dashboard**: Track ad impressions and revenue
   - Go to [https://admob.google.com](https://admob.google.com)
   - View daily earnings

2. **Play Console**: Track in-app purchases
   - Go to "Monetize" → "Financial reports"
   - View premium unlock sales

### Optimize for More Revenue

1. **Increase downloads**:
   - Optimize store listing (keywords, screenshots)
   - Encourage user reviews
   - Share on social media

2. **Increase premium conversions**:
   - Test different pricing ($1.99, $2.99, $4.99)
   - Add more premium features
   - Show upgrade prompts strategically

3. **Increase ad revenue**:
   - Add interstitial ads (full-screen) after conversions
   - Add rewarded ads for extra features
   - Optimize ad placement

---

## Expected Revenue

### Conservative Estimates

**Assumptions**:
- 1,000 downloads/month
- 50% active users = 500
- 10% click ads = 50 ad clicks/month
- $0.50 per click = $25/month from ads
- 2% buy premium = 10 purchases/month
- $2.99 per purchase = $29.90/month
- **Total: ~$55/month**

**At 10,000 downloads/month**:
- Ads: $250/month
- Premium: $299/month
- **Total: ~$550/month**

**At 100,000 downloads/month**:
- Ads: $2,500/month
- Premium: $2,990/month
- **Total: ~$5,500/month**

### Growth Strategy

1. **Month 1-3**: Focus on getting first 1,000 users
2. **Month 4-6**: Optimize conversion rate, add features
3. **Month 7-12**: Scale marketing, aim for 10,000+ users
4. **Year 2+**: Consider additional apps, cross-promotion

---

## Troubleshooting

### "Billing unavailable"
- App must be published (even internal testing)
- Product ID must match exactly: `premium_unlock`
- Product must be activated in Play Console

### "Ads not showing"
- Test IDs work immediately
- Real IDs require app approval (can take hours)
- Check AdMob account is not suspended

### "App rejected"
- Read rejection reason carefully
- Common issues: privacy policy, permissions, content
- Fix and resubmit

---

## Next Steps After Launch

1. **Monitor daily**: Check downloads, revenue, crashes
2. **Respond to reviews**: Engage with users
3. **Update regularly**: Add features, fix bugs
4. **Market your app**: Social media, forums, blogs
5. **Build more apps**: Reuse this monetization model

---

## Support

For questions about this setup:
- Email: [Your email]
- Website: www.metanoiaunlimited.com

**Good luck with your app! 🚀**

Remember: The first $10,000 is the hardest. Stay consistent, keep improving, and scale up!
