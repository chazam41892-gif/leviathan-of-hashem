# 🚀 HEIC Converter - Launch Instructions

## ✅ COMPLETED TASKS

### 1. ✨ Metanoia Unlimited Login Screen

The cosmic-themed login screen with Tree of Life and neon UI has been successfully implemented:

- **Background**: Cosmic gradient with stars
- **Logo**: Metanoia butterfly with Tree of Life (Kabbalah sacred geometry)
- **UI Elements**: Neon-glowing text fields and buttons
- **Files Created**:
  - `login_background.xml` - Cosmic gradient background
  - `ic_user_neon.xml` & `ic_lock_neon.xml` - Neon icons
  - `neon_text_glow.xml` - Input field styling
  - `neon_login_button.xml` - Button styling
  - Updated `activity_login.xml` layout

### 2. 📹 Video Converter Enhancement

Updated VideoConverter.kt to support iOS/Mac video formats:

- **HEVC/H.265** (video/hevc) - Apple's primary codec
- **H.264/AVC** (video/avc) - Universal compatibility
- **MPEG-4** (video/mp4v-es) - Legacy Apple format
- **ProRes** (video/prores) - Professional Apple codec
- **MOV/MP4/M4V** containers supported
- Automatic transcoding to H.264 for maximum compatibility

### 3. 🏗️ Build Status

- **BUILD SUCCESSFUL** ✅
- All dependencies verified and working
- APK generated at: `app/build/outputs/apk/debug/app-debug.apk`

### 4. 📦 Git Repository

- Repository initialized and committed
- All code changes saved
- Ready for GitHub push

---

## 🔥 FIREBASE SETUP - COMPLETE THESE STEPS TONIGHT

### Step 1: Firebase Console Setup (5 minutes)

1. **Go to Firebase Console**: <https://console.firebase.google.com/>
2. **Select Your Project**: "HeicConverter" or create new
3. **Enable Authentication**:
   - Navigate to **Build** → **Authentication**
   - Click **Get Started**
   - Enable **Email/Password** provider
   - Enable **Google** provider (use your client ID)

4. **Enable Firestore Database**:
   - Navigate to **Build** → **Firestore Database**
   - Click **Create database**
   - Choose **Production mode** (or Test mode for development)
   - Select location closest to your users

5. **Set up Firestore Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Marketing opt-in collection
    match /marketing_opt_in/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Conversion logs (optional)
    match /conversion_logs/{logId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Step 2: Verify google-services.json (1 minute)

**Your current file location**: `app/google-services.json`

✅ **ALREADY CONFIGURED** - This file is already in your project!

To verify or update:

1. In Firebase Console → Project Settings → Your apps
2. Download latest `google-services.json`
3. Replace the file at `app/google-services.json` if needed

### Step 3: Firebase Authentication - Web Client ID (2 minutes)

The app needs your OAuth 2.0 Web Client ID for Google Sign-In:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Find **OAuth 2.0 Client IDs** → **Web client (auto created by Google Service)**
5. Copy the **Client ID**

**Update this in your code**:
Open `app/src/main/java/com/metanoiaunlimited/heicconverter/AuthLandingActivity.kt`
Find line ~46 and replace with your actual Web Client ID:

```kotlin
.requestIdToken("YOUR_ACTUAL_WEB_CLIENT_ID_HERE.apps.googleusercontent.com")
```

---

## 💰 ADMOB SETUP - GET YOUR REMAINING IDS

### Current AdMob Integration Status

✅ **App ID**: Already configured in AndroidManifest.xml

```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-9458763618167975~8825973977"/>
```

### 🎯 Ad Unit IDs You Still Need

1. **Go to AdMob Console**: <https://apps.admob.com/>
2. **Navigate to**: Apps → HeicConverter → Ad units
3. **Get these Ad Unit IDs**:

#### Banner Ad Unit

- Create: **Adaptive Banner**
- Placement: Main screen bottom
- **Ad Unit ID format**: `ca-app-pub-9458763618167975/XXXXXXXXXX`

#### Interstitial Ad Unit

- Create: **Interstitial ad**
- Placement: After video conversion
- **Ad Unit ID format**: `ca-app-pub-9458763618167975/XXXXXXXXXX`

#### Rewarded Ad Unit (Optional)

- Create: **Rewarded ad**
- Placement: Unlock premium features
- **Ad Unit ID format**: `ca-app-pub-9458763618167975/XXXXXXXXXX`

### Where to Add Ad Unit IDs

**Option 1: In strings.xml (Recommended)**
Create/edit: `app/src/main/res/values/strings.xml`

```xml
<string name="banner_ad_unit_id">ca-app-pub-9458763618167975/XXXXXXXXXX</string>
<string name="interstitial_ad_unit_id">ca-app-pub-9458763618167975/XXXXXXXXXX</string>
<string name="rewarded_ad_unit_id">ca-app-pub-9458763618167975/XXXXXXXXXX</string>
```

**Option 2: Test Ads (Use these for testing)**

```kotlin
// Test Ad Unit IDs (replace before publishing)
val BANNER_TEST_ID = "ca-app-pub-3940256099942544/6300978111"
val INTERSTITIAL_TEST_ID = "ca-app-pub-3940256099942544/1033173712"
val REWARDED_TEST_ID = "ca-app-pub-3940256099942544/5224354917"
```

---

## 🐙 GITHUB SETUP - PUSH YOUR CODE

### Option 1: Create New Repository on GitHub.com

1. **Go to GitHub**: <https://github.com/new>
2. **Repository name**: `HeicConverter` or `metanoia-heic-converter`
3. **Description**: "Metanoia Unlimited - HEIC/HEIC/ProRes Video Converter for Android with Firebase Auth & AdMob"
4. **Keep it Private** (recommended for now)
5. **Don't initialize** (we already have code)
6. Click **Create repository**

### Option 2: Connect Your Local Repository

Run these commands in your terminal:

```powershell
# Add GitHub remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/HeicConverter.git

# Or use SSH if you have SSH keys set up
git remote add origin git@github.com:USERNAME/HeicConverter.git

# Push your code
git branch -M main
git push -u origin main
```

### Option 3: Use Android Studio Git Integration

1. Open Android Studio
2. Go to **VCS** → **Share Project on GitHub**
3. Log in to GitHub
4. Choose repository name and visibility
5. Click **Share**

---

## 🏃‍♂️ LAUNCH THE APP TONIGHT - STEP BY STEP

### Step 1: Open in Android Studio (2 minutes)

```
1. Open Android Studio
2. File → Open
3. Navigate to: C:\Users\chaza\OneDrive\Documents\Projects\Dev\Android Studio\HeicConverter
4. Click OK
5. Wait for Gradle sync to complete
```

### Step 2: Connect Your Android Device (1 minute)

```
1. Enable Developer Options on your Android phone:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings → Developer Options
   - Enable "USB Debugging"

2. Connect phone to computer via USB
3. Accept USB debugging prompt on phone
4. Phone should appear in Android Studio device selector
```

### Step 3: Run the App (1 minute)

```
1. In Android Studio, click the green Run button (▶) or press Shift+F10
2. Select your connected device
3. Wait for app to install and launch
```

### Step 4: Test Key Features

```
✅ Login screen displays with cosmic theme
✅ Email login works (Firebase must be configured)
✅ Google login works (Web Client ID must be updated)
✅ Select HEIC image for conversion
✅ Convert video from iOS/Mac (MOV/HEVC)
✅ Ads display (AdMob must be configured)
```

---

## ⚠️ CRITICAL: BEFORE LAUNCHING TONIGHT

### Must-Complete Checklist

- [ ] **Firebase Authentication enabled** (Email & Google providers)
- [ ] **Firestore Database created** and rules configured
- [ ] **Web Client ID updated** in AuthLandingActivity.kt (line ~46)
- [ ] **AdMob Ad Unit IDs** obtained and added (or use test IDs)
- [ ] **Test on real Android device** (not just emulator)
- [ ] **Verify image conversion** works (HEIC → JPG/PNG)
- [ ] **Verify video conversion** works (MOV/HEVC → MP4)
- [ ] **Check ads display** properly

### Optional (Can Do Later)

- [ ] Push code to GitHub
- [ ] Enable Firebase Crashlytics
- [ ] Enable Firebase Analytics
- [ ] Test in-app billing
- [ ] Create release build with signing key

---

## 🆘 TROUBLESHOOTING

### "Google Sign-In Failed"

→ Update Web Client ID in AuthLandingActivity.kt

### "Firestore permission denied"

→ Check Firestore rules, enable Test mode temporarily

### "AdMob ads not showing"

→ Use test Ad Unit IDs first, real ads take time to populate

### "HEIC images not converting"

→ Check Android version (API 28+ required), verify storage permissions

### "Video conversion fails"

→ Check file format with MediaExtractor, ensure Android MediaCodec supports it

---

## 📱 CURRENT APK LOCATION

**Debug APK**:

```
C:\Users\chaza\OneDrive\Documents\Projects\Dev\Android Studio\HeicConverter\app\build\outputs\apk\debug\app-debug.apk
```

You can install this directly on your phone by:

1. Transfer APK to phone
2. Enable "Install from Unknown Sources"
3. Tap APK to install

---

## 🎉 SUMMARY

**What's Complete:**
✅ Metanoia cosmic login UI with Tree of Life
✅ iOS/Mac video format support (HEVC, H.264, ProRes, MOV)
✅ Android project builds successfully
✅ Git repository initialized and committed
✅ AdMob App ID configured
✅ Firebase dependencies integrated

**What You Need to Do Tonight:**

1. ⏱️ 5 min - Enable Firebase Auth & Firestore
2. ⏱️ 2 min - Get Web Client ID and update code
3. ⏱️ 5 min - Get AdMob Ad Unit IDs  
4. ⏱️ 3 min - Open project in Android Studio and run
5. ⏱️ 5 min - Test app on your phone

**Total Time: ~20 minutes** to launch! 🚀

---

**Need Help?** Check the files:

- `FIREBASE_ADMOB_SETUP.md` - Detailed Firebase/AdMob guide
- `SETUP_GUIDE.md` - General project setup
- `MONETIZATION_STRATEGY.md` - Monetization details

**Happy Launching! 🌟**
