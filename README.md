# HEIC Converter - Android App

A professional Android application for converting HEIC (High Efficiency Image Container) images to JPEG, PNG, and WebP formats.

## Features

- **Multi-Format Support**: Convert HEIC to JPEG, PNG, or WebP
- **Batch Conversion**: Convert multiple images at once
- **Quality Control**: Choose between High (100%), Medium (80%), or Low (60%) quality
- **Free & Premium Tiers**:
  - Free: Convert up to 5 images at once with ads
  - Premium: Unlimited batch conversions, ad-free experience for $2.99 (one-time payment)
- **Modern UI**: Material Design with intuitive interface
- **Native HEIC Support**: Uses Android's built-in ImageDecoder API (Android 9+)

## Built by Metanoia Unlimited LLC

Website: [www.metanoiaunlimited.com](https://www.metanoiaunlimited.com)

## Setup Instructions

### 1. Import Project into Android Studio

1. Open Android Studio
2. Click "File" → "Open"
3. Navigate to the `HeicConverter` folder and select it
4. Wait for Gradle sync to complete

### 2. Configure AdMob

**Important**: Replace the test AdMob IDs with your own production IDs before publishing.

1. Create an AdMob account at [https://admob.google.com](https://admob.google.com)
2. Create a new app in AdMob
3. Create a Banner ad unit
4. Replace the following IDs in the code:

**In `AndroidManifest.xml`** (line 28):
```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="YOUR_ADMOB_APP_ID"/>
```

**In `activity_main.xml`** (line 271):
```xml
app:adUnitId="YOUR_BANNER_AD_UNIT_ID"
```

Current values are Google's test IDs and will not generate revenue.

### 3. Configure Google Play Billing

1. Create an app in Google Play Console
2. Go to "Monetize" → "Products" → "One-time products"
3. Create a new product with ID: `premium_unlock`
4. Set the price to $2.99 USD
5. The product ID in `BillingManager.kt` is already set to `premium_unlock`

**Note**: In-app purchases only work when the app is published (even in internal testing track).

### 4. Update Package Name (Optional)

If you want to change the package name from `com.metanoiaunlimited.heicconverter`:

1. In Android Studio, right-click the package in Project view
2. Select "Refactor" → "Rename"
3. Update the `applicationId` in `app/build.gradle`
4. Update the `namespace` in `app/build.gradle`

### 5. Generate App Icons

Replace the default launcher icons in:
- `app/src/main/res/mipmap-hdpi/`
- `app/src/main/res/mipmap-mdpi/`
- `app/src/main/res/mipmap-xhdpi/`
- `app/src/main/res/mipmap-xxhdpi/`
- `app/src/main/res/mipmap-xxxhdpi/`

You can use Android Studio's Image Asset Studio:
1. Right-click `res` folder → "New" → "Image Asset"
2. Follow the wizard to generate icons

### 6. Build and Test

1. Connect an Android device or start an emulator (Android 9.0+ recommended)
2. Click "Run" (green play button) in Android Studio
3. Test the following:
   - Image selection
   - Format conversion (JPEG, PNG, WebP)
   - Quality settings
   - Free user limit (5 images)
   - Ad display (test ads will show)

### 7. Prepare for Release

1. Generate a signed APK/Bundle:
   - "Build" → "Generate Signed Bundle / APK"
   - Create a new keystore (keep it safe!)
   - Follow the wizard

2. Update version in `app/build.gradle`:
   ```gradle
   versionCode 1
   versionName "1.0"
   ```

3. Test thoroughly on multiple devices

4. Upload to Google Play Console

## Technical Details

### Minimum Requirements
- Android 9.0 (API 28) or higher
- HEIC support is native on Android 9+

### Dependencies
- AndroidX Core & AppCompat
- Material Components
- Kotlin Coroutines
- Google Play Billing Library 6.1.0
- Google Mobile Ads SDK 22.6.0
- Glide (image loading)

### Permissions
- `READ_MEDIA_IMAGES` (Android 13+)
- `READ_EXTERNAL_STORAGE` (Android 12 and below)
- `INTERNET` (for ads)
- `ACCESS_NETWORK_STATE` (for ads)

## Monetization Strategy

### Free Tier
- Convert up to 5 images at once
- Banner ads displayed at bottom of screen
- Full access to all formats and quality settings

### Premium Tier ($2.99)
- Unlimited batch conversions
- No ads
- One-time payment (lifetime access)
- Restore purchase option available

## Output Location

Converted images are saved to:
```
Pictures/HeicConverter/
```

Files are named based on the original filename with the new extension.

## Troubleshooting

### Issue: "Billing client not connected"
- Make sure the app is published in Google Play Console (at least in internal testing)
- Verify the product ID matches exactly: `premium_unlock`

### Issue: "No ads showing"
- Test ads require the test IDs (already configured)
- Production ads require your own AdMob IDs and app approval

### Issue: "Cannot convert HEIC files"
- Ensure device is running Android 9.0 or higher
- Check that storage permissions are granted

### Issue: Gradle sync failed
- Update Android Studio to latest version
- File → Invalidate Caches → Invalidate and Restart

## License

This project is built for Metanoia Unlimited LLC. All rights reserved.

## Support

For questions or support, contact Metanoia Unlimited LLC at:
- Website: www.metanoiaunlimited.com

---

**Built with ❤️ by HaChazal for the Metanoia Empire**
