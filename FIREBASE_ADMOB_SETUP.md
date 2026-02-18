# FIREBASE & ADMOB SETUP GUIDE
## What You Need to Get/Check from Firebase & AdMob Consoles

---

## 🔥 FIREBASE CONSOLE (console.firebase.google.com)

### ✅ ALREADY CONFIGURED:
- ✅ Firebase project: **heic-converter-50b73**
- ✅ google-services.json file: **Already in app folder**
- ✅ AdMob App ID in AndroidManifest.xml: **ca-app-pub-9458763618167975~8825973977**

### 🚨 REQUIRED ACTIONS IN FIREBASE:

#### 1. Add SHA-1 Fingerprint for Google Sign-In
**Location:** Firebase Console → Project Settings → Your Apps → Android App

**Get Debug SHA-1 (for testing):**
```bash
keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android
```
Copy the SHA-1 and add it to Firebase.

**Get Release SHA-1 (for production):**
After generating your production keystore, run:
```bash
keytool -list -v -keystore path\to\your-release-keystore.jks -alias your-alias
```
Add this SHA-1 too.

**WHY:** Google Sign-In won't work without this!

---

#### 2. Enable Authentication Methods
**Location:** Firebase Console → Authentication → Sign-in method

Enable:
- ✅ Email/Password
- ✅ Google

**Status Check:** Make sure both are showing "Enabled" status.

---

#### 3. Create Firestore Database
**Location:** Firebase Console → Firestore Database → Create database

**Settings:**
- Start in **production mode** (or test mode for now)
- Choose location: **us-central (or closest to your users)**

**Basic Security Rules (for launch):**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
(Only authenticated users can read/write)

---

#### 4. Enable Analytics & Crashlytics
**Analytics:** Should be enabled by default
**Crashlytics:** 
- Go to Crashlytics in Firebase Console
- Click "Enable Crashlytics"
- Wait for first app launch to see data

---

## 💰 ADMOB CONSOLE (apps.admob.google.com)

### ✅ ALREADY CONFIGURED:
- ✅ AdMob App ID: **ca-app-pub-9458763618167975~8825973977**
- ✅ Test Banner Ad Unit currently in use: **ca-app-pub-3940256099942544/6300978111**

### 🚨 REQUIRED ACTIONS IN ADMOB:

#### 1. Get Production Ad Unit IDs
**Location:** AdMob Console → Apps → HEIC Converter → Ad units

**Create these ad units:**

**A. Banner Ad (for MainActivity):**
- Click "Add Ad Unit" → Banner
- Copy the Ad Unit ID (looks like: ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX)
- **REPLACE THIS LINE** in app/src/main/res/layout/activity_main.xml:
  ```xml
  app:adUnitId="ca-app-pub-3940256099942544/6300978111"
  ```
  With your production banner ad unit ID:
  ```xml
  app:adUnitId="YOUR_PRODUCTION_BANNER_AD_UNIT_ID"
  ```

**B. Interstitial Ad (Optional - for between conversions):**
- Click "Add Ad Unit" → Interstitial
- Copy Ad Unit ID
- Save for future implementation

**C. Rewarded Ad (Optional - for premium features):**
- Click "Add Ad Unit" → Rewarded
- Copy Ad Unit ID
- Save for future implementation

---

#### 2. Link Firebase & AdMob
**Location:** AdMob Console → Settings → Connected accounts

- Should show Firebase project: **heic-converter-50b73**
- If not linked, click "Link to Firebase"

**WHY:** Better analytics and user insights.

---

#### 3. Check Payment Settings
**Location:** AdMob Console → Payments

Make sure:
- Payment profile is set up
- Tax information submitted
- Payment threshold set (default $100)

---

## 📱 GOOGLE PLAY CONSOLE (play.google.com/console)

### REQUIRED FOR LAUNCH:

#### 1. Create Release Signing Key
**In Android Studio:**
- Build → Generate Signed Bundle / APK
- Create New Keystore
- **SAVE KEYSTORE FILE SECURELY** (you'll need it for all future updates!)
- Fill in:
  - Keystore path (e.g., C:\keystore\heicconverter.jks)
  - Password (SAVE THIS!)
  - Key alias (e.g., heicconverter-key)
  - Key password (SAVE THIS!)

---

#### 2. Privacy Policy URL
**REQUIRED** because you use:
- Firebase Auth (user data)
- AdMob (advertising)
- Firestore (user data storage)

**Quick solution:** Use a free privacy policy generator:
- https://www.privacypolicygenerator.info/
- https://app-privacy-policy-generator.firebaseapp.com/

Include:
- Personal data collected (email, authentication)
- Use of Google AdMob
- Use of Firebase Analytics
- Data storage in Firestore

Host on:
- GitHub Pages
- Firebase Hosting
- Your website

**Add URL to:** Play Console → App content → Privacy policy

---

#### 3. App Signing by Google Play
**Location:** Play Console → Setup → App signing

**Recommended:** Let Google Play manage your app signing key
- Provides key upgrade capability
- More secure
- Easier key management

Upload your upload key (the one you just created).

---

#### 4. Content Rating Questionnaire
**Location:** Play Console → App content → Content rating

Answer questions honestly:
- Target age: All ages
- Violence: None
- Sexual content: None
- etc.

---

#### 5. Target Audience
**Location:** Play Console → App content → Target audience

Select:
- Ages 13+ (or appropriate range)
- Not directed at children

---

## 🚀 FINAL CHECKLIST BEFORE UPLOADING TO PLAY STORE:

### In Firebase Console:
- [ ] SHA-1 fingerprints added (debug + release)
- [ ] Authentication methods enabled (Email + Google)
- [ ] Firestore database created with security rules
- [ ] Analytics enabled
- [ ] Crashlytics enabled

### In AdMob Console:
- [ ] Production banner ad unit created
- [ ] Ad unit ID replaced in activity_main.xml
- [ ] Firebase linked to AdMob
- [ ] Payment settings configured

### In Your Project:
- [ ] Replace test ad unit ID with production ID in activity_main.xml
- [ ] Generate production signing key
- [ ] Build signed AAB: `.\gradlew.bat bundleRelease` (after setting up signing)
- [ ] Test app on real device with HEIC/HEVC files

### In Play Console:
- [ ] Privacy policy uploaded
- [ ] Content rating completed
- [ ] Target audience set
- [ ] App signing configured
- [ ] Screenshots ready (minimum 2)
- [ ] Feature graphic ready (1024x500px)
- [ ] App description written
- [ ] Upload AAB file

---

## 📝 QUICK REFERENCE:

**Package Name:** com.metanoiaunlimited.heicconverter
**Firebase Project:** heic-converter-50b73
**AdMob App ID:** ca-app-pub-9458763618167975~8825973977
**Current Test Banner:** ca-app-pub-3940256099942544/6300978111 (MUST REPLACE)

**Admin Emails (for admin dashboard):**
- metanoiaunlimited418@gmail.com
- chazam41892@gmail.com

---

## 🎯 PRIORITY ORDER:

### HIGH PRIORITY (Must do before launch):
1. Add SHA-1 to Firebase (Google Sign-In won't work without it)
2. Enable Authentication methods in Firebase
3. Create Firestore database
4. Get production AdMob banner ad unit ID and replace in code
5. Privacy policy URL
6. Generate release signing key

### MEDIUM PRIORITY (Good to have):
7. Enable Crashlytics
8. Link AdMob to Firebase
9. Content rating & target audience

### LOW PRIORITY (Can do after launch):
10. Additional ad units (interstitial, rewarded)
11. Advanced Firestore security rules
12. AdMob payment settings (can wait until you hit threshold)

---

## ⚡ FASTEST PATH TO LAUNCH:

**If you only have 2 hours:**

1. **[5 min]** Firebase: Add SHA-1 fingerprint
2. **[2 min]** Firebase: Enable Email/Password + Google auth
3. **[3 min]** Firebase: Create Firestore database (test mode is fine for launch)
4. **[5 min]** AdMob: Create banner ad unit, copy ID
5. **[2 min]** Replace ad unit ID in activity_main.xml
6. **[10 min]** Generate privacy policy, host on GitHub Pages
7. **[10 min]** Android Studio: Generate Signed Bundle
8. **[5 min]** Test on device
9. **[30 min]** Play Console: Fill required fields, upload AAB
10. **[Submit]** Submit for review!

---

## 🆘 HELP:

**If Google Sign-In fails:** SHA-1 not added to Firebase
**If ads don't show:** Still using test ID or AdMob app not approved yet
**If Firestore errors:** Database not created or security rules blocking
**If app won't install:** Signing key mismatch or wrong package name

---

**Current Status:** App builds successfully. Debug APK ready at:
`app/build/outputs/apk/debug/app-debug.apk`

**Next Step:** Go to Firebase Console and complete the HIGH PRIORITY items above!
