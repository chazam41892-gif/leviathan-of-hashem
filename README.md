# HeyChat SDK Integration

## SDK Integration Setup

To integrate the HeyChat SDK into your application, follow these steps:
1. Install the SDK using the package manager of your choice.
2. Import the necessary modules into your application.
3. Initialize the SDK with your API key.

## Implementation Status

- **Module 1**: Completed
- **Module 2**: In Progress
- **Module 3**: Pending

We are actively developing and testing the modules to ensure seamless integration and functionality.

## Development Timeline
| Date        | Task                               | Status      |
|-------------|------------------------------------|-------------|
| 2026-02-01  | Initial SDK Integration            | Completed   |
| 2026-02-05  | Module 1 Implementation            | Completed   |
| 2026-02-08  | Module 2 Development               | In Progress |
| 2026-02-10  | Implement Testing                  | Pending     |
| 2026-02-15  | Final Review                       | Pending     |

## Real-World Use Cases
- **Example App 1**: Description of how HeyChat SDK was integrated and its functionalities.
- **Example App 2**: Another example demonstrating the SDK's capabilities in a real-world scenario.

This README will continue to be updated as progress is made in the development of the HeyChat SDK integration.
```markdown
# HaShem's Leviathan - Android App

Android companion app for M02 smart glasses (sanvnet gs4 max_c1af) with AI integration, powered by HeyCyan SDK.

## Overview

Leviathan is a **layered multi-agent AI command hub** that integrates:
- **HeyCyan M02 Smart Glasses** — camera, microphone, head-tracking, haptic feedback
- **ChatGPT & Manus** — cognition, memory, collaboration, execution agents
- **Generative AI** — Sora, Midjourney, DALL·E for image synthesis
- **MQTT pub/sub** — real-time agent communication with presigned media uploads
- **BLE/GATT** — direct M02 glasses pairing and control

## Features

- **AI Chat** - ChatGPT/Manus integration with memory and context windows
- **Vision Mode** - Real-time camera capture from M02 glasses with AI analysis
- **BLE Connection** - Direct connection to M02 glasses via HeyCyan SDK (sanvnet gs4 max_c1af)
- **Media Pipeline** - Capture → thumbnail (MQTT) + full-res upload (presigned) → multi-agent rooms
- **Voice Commands** - (Coming soon) STT → agents → TTS playback
- **Translation** - 144 languages (Coming soon)
- **Audio Routing** - Responses through glasses speakers (Coming soon)
- **Agent Collaboration** - ChatRooms with provenance tracking, embeddings, and conflict resolution

## Requirements

- **Android 6.0+ (API 23+)** — runtime permissions for Camera, Bluetooth, Microphone
- **Android 14 (API 34)** — target SDK for compatibility
- **Bluetooth LE support** — BLE scanning and pairing
- **Camera & Microphone** — M02 glasses hardware via HeyCyan SDK
- **Internet connection** — MQTT broker, presigned uploads, API calls
- **HeyCyan SDK** — provided as `libs/glasses_sdk_20250723_v01.aar`
- **(Optional) Test HeyCyan license key** — for full initialization (debug mode can bypass)

## Installation

### Quick Start

1. **Clone the repo and open in Android Studio**
   ```bash
   git clone <your-repo-url>
   cd HaShems-Leviathan
   open -a "Android Studio" .
   ```

2. **Sync Gradle**
   - File → Sync with Gradle Files (or ./gradlew sync)

3. **Connect Android device and enable USB debugging**
   ```bash
   adb devices  # Confirm device is listed
   ```

4. **Build & install**
   ```bash
   ./gradlew installDebug
   ```

### Detailed Setup Guide

See `ANDROID-APP-INSTALLATION-GUIDE.md` for step-by-step instructions, troubleshooting, and emulator setup notes.

## HeyCyan Integration (NEW)

The Leviathan app now includes **direct integration with the HeyCyan M02 smart glasses SDK**. This section explains how to discover, pair, capture images/audio, and publish to agent rooms over MQTT.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Leviathan App (Android)                                      │
├────────────────────────���────────────────────────────────────┤
│                                                              │
│  HeyCyanManager (high-level facade)                         │
│  ├─ HeyCyanAarBinder (reflection-based vendor API wrapper)  │
│  ├─ DeviceDiscoveryManager (BLE scan + pairing)            │
│  ├─ MqttManager (Paho MQTT client)                         │
│  ├─ MediaUploader (presigned URL uploads)                  │
│  ├─ LicenseManager (secure key storage)                    │
│  └─ PermissionsHelper (runtime permission requests)        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
            │
            ├── BLE ──► M02 Glasses (sanvnet gs4 max_c1af)
            │           Camera, Microphone, Head-tracking
            │
            ├── MQTT ──► Broker (Mosquitto)
            │            Publish: media_ref + thumbnail
            │
            └── HTTPS ──► Object Store (MinIO / S3 / R2)
                         Full-res image uploads (presigned)
```

### File Structure

```
app/src/main/
├── java/com/metanoiaunlimited/leviathan/
│   ├── heycyan/                           # NEW: HeyCyan integration module
│   │   ├── HeyCyanManager.kt              # Main facade (high-level API)
│   │   ├── HeyCyanDeviceAdapter.kt        # Adapter interface (vendor-agnostic)
│   │   ├── HeyCyanAarBinder.kt            # Reflection binder + AARMapping
│   │   ├── DeviceDiscoveryManager.kt      # BLE discovery using HeyCyan UUIDs
│   │   ├── MqttManager.kt                 # MQTT pub/sub (Paho)
│   │   ├── MediaUploader.kt               # Presigned URL upload helper
│   │   ├── LicenseManager.kt              # Secure license key storage
│   │   ├── PermissionsHelper.kt           # Runtime permission requests
│   │   ├── CameraUtil.kt                  # Thumbnail generation
│   │   ├── ReflectionMethodLister.kt      # Runtime introspection utility
│   │   ├── AutoScanActivity.kt            # Auto-enumerate vendor classes
│   │   ├── MethodListerActivity.kt        # Manual method signature lister
│   │   ├── DebugLicenseActivity.kt        # (DEBUG) License key input UI
│   │   ├── LicenseBroadcastReceiver.kt    # (DEBUG) adb license broadcast
│   │   ├── HeyCyanSampleActivity.kt       # Sample usage (capture + publish)
│   │   └── models/
│   │       └── MediaRef.kt                # MQTT media reference schema
│   ├── MainActivity.kt
│   ├── LeviathanApplication.kt
│   ├── ui/
│   │   ├── GlassesConnectionActivity.kt
│   │   ├── AIChatActivity.kt
│   │   ├── VisionModeActivity.kt
│   │   ├── SettingsActivity.kt
│   │   └── adapter/
│   ├── model/
│   └── network/
├── res/
│   ├── layout/
│   ├── values/
│   └── drawable/
└── AndroidManifest.xml
└── libs/
    └── glasses_sdk_20250723_v01.aar       # HeyCyan SDK (vendor-provided)
```

### Quick Start: Discover & Pair M02 Glasses

#### 1. Request Runtime Permissions

```kotlin
import com.metanoiaunlimited.leviathan.heycyan.PermissionsHelper
import com.guolindev.permissionx.PermissionX

class YourActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        PermissionX.init(this)
            .permissions(*PermissionsHelper.requiredPermissions())
            .request { allGranted, _, _ ->
                if (allGranted) startHeyCyanIntegration()
            }
    }
}
```

#### 2. Initialize HeyCyan Manager

```kotlin
import com.metanoiaunlimited.leviathan.heycyan.HeyCyanManager

val manager = HeyCyanManager.getInstance(applicationContext)
manager.start()  // Starts BLE discovery + MQTT connection

// Listen to events
manager.events.collect { event ->
    println("HeyCyan event: $event")
}
```

#### 3. Pair to M02 Glasses

```kotlin
// After discovering glasses via BLE scan (Logcat will show "HeyCyan/M02 candidate")
manager.pairDevice("AA:BB:CC:DD:EE:FF")  // BLE MAC address
```

#### 4. Capture & Publish to Agent Room

```kotlin
// Capture image from glasses camera and publish to MQTT room
manager.captureAndPublish(
    roomTopic = "hub/rooms/vision-analysis/messages",
    requestId = "cap-${System.currentTimeMillis()}"
)
```

The HeyCyan integration will:
1. Capture JPEG from glasses camera (via HeyCyan SDK)
2. Create thumbnail (320px max dimension)
3. Publish thumbnail binary to MQTT topic (instant, low-latency)
4. Request presigned upload URL from Leviathan backend
5. Upload full-res JPEG to object store
6. Publish `media_ref` JSON to agent room with final URL

### BLE & GATT UUIDs (M02 Glasses)

The following UUIDs were extracted from the HeyCyan SDK and match the sanvnet gs4 max_c1af:

```kotlin
Service UUID:              de5bf728-d711-4e47-af26-65e3012a5dc7
Notify Characteristic:    de5bf729-d711-4e47-af26-65e3012a5dc7
Write Characteristic:     de5bf72a-d711-4e47-af26-65e3012a5dc7
```

These are used by `DeviceDiscoveryManager` to filter BLE scans and by vendor SDK for GATT operations.

### Debug Mode: License Key Setup

The HeyCyan SDK requires a license/dev key to initialize fully. For local development and testing, Leviathan provides two debug mechanisms:

#### Method 1: Broadcast Receiver (Recommended)

```bash
# On your development machine:
adb shell am broadcast \
  -a com.metanoiaunlimited.leviathan.SET_LICENSE \
  --es license "YOUR_HEYCYAN_TEST_KEY"
```

This stores the key in `LicenseManager` (encrypted SharedPreferences). The next app run will use it.

#### Method 2: Debug UI Activity

1. Add `DebugLicenseActivity` to your app (provided in HeyCyan integration files).
2. Launch the activity and paste your test key into the EditText.
3. Click "Store License" — the key is encrypted and stored locally.

#### Method 3: AllowUnlicensed Flag (AutoScan Only)

If you want to run `AutoScanActivity` without a license key (for method enumeration only):

```kotlin
HeyCyanManager.getInstance(context).start(allowUnlicensed = true)
```

This allows BLE discovery and reflection-based class scanning to proceed even if the vendor SDK init fails. Good for development; not recommended for production.

**Important**: Do NOT commit real HeyCyan license keys to git. Use environment variables, secrets managers, or this broadcast method for local development only.

### Running AutoScan (Method Enumeration)

To discover exact method signatures from the HeyCyan AAR (required for finalizing the reflection binder mapping):

1. **Build & install the app**:
   ```bash
   ./gradlew installDebug
   ```

2. **Launch AutoScanActivity** (from app UI or run configuration):
   - It will enumerate all classes in the APK prefixed with `com.oudmon.*` (vendor package).
   - Each class is passed to `ReflectionMethodLister`, which logs all public + declared methods and fields.

3. **Capture Logcat output**:
   ```bash
   adb logcat -s "ReflectionMethodLister" | tee autoscan.log
   ```

4. **Paste the output here** (to Copilot in chat or comment in a GitHub issue) and I will:
   - Generate the exact `AARMapping` with correct method names and parameter types.
   - Tighten `HeyCyanAarBinder` to invoke methods using precise signatures.
   - Provide a commit-ready patch.

### MQTT Broker & Presigned Uploads

Leviathan uses MQTT for agent collaboration and presigned URLs for large media uploads:

#### Local Testing (Docker Compose)

```bash
# Start Mosquitto + MinIO locally:
docker compose up -d

# Broker: tcp://localhost:1883 (or tcp://10.0.2.2:1883 from emulator)
# MinIO console: http://localhost:9001 (user: minioadmin, pass: minioadmin)
```

#### Production Setup

- Update `MqttManager.broker` to your production MQTT broker (use MQTTS over TLS).
- Implement `MediaUploader.requestPresignedUrl()` to call your Leviathan backend, which returns a presigned PUT URL from S3/MinIO/Cloudflare R2.
- Store MQTT credentials and backend endpoints in Android Keystore or a secure secrets manager.

### HeyCyan SDK Reflection Binder (Advanced)

The `HeyCyanAarBinder` uses **reflection** to invoke the vendor SDK without hard-coding class names. This allows Leviathan to work with different HeyCyan SDK versions by simply updating the `AARMapping`:

```kotlin
val mapping = AARMapping(
    managerClassName = "com.oudmon.ble.base.bluetooth.BleOperateManager",
    connectMethodName = "connect",
    disconnectMethodName = "disconnect",
    startPreviewMethodName = "startPreview",
    stopPreviewMethodName = "stopPreview",
    capturePhotoMethodName = "capturePhoto",
    startAudioMethodName = "startAudio",
    stopAudioMethodName = "stopAudio",
    serviceUuids = listOf("de5bf728-d711-4e47-af26-65e3012a5dc7")
)

val adapter = HeyCyanAarBinder.create(mapping)
adapter.initialize(context)
adapter.connect("AA:BB:CC:DD:EE:FF")
```

If you change HeyCyan SDK versions, simply update the `AARMapping` and the binder will re-bind automatically (as long as method signatures remain compatible).

### ProGuard / R8 Rules

The following rules are already in `app/proguard-rules.pro` to keep the vendor classes from being stripped or obfuscated:

```proguard
-keep class com.oudmon.** { *; }
-keepclassmembers class com.oudmon.** { *; }
-keepclassmembers class * {
    public <methods>;
}
```

## Build Instructions

1. **Open project in Android Studio**
   ```bash
   open -a "Android Studio" .
   ```

2. **Sync Gradle**
   - File → Sync with Gradle Files

3. **Build APK**
   - Build → Build Bundle(s) / APK(s) → Build APK(s)
   - Find APK in `app/build/outputs/apk/debug/`

4. **Install on device**
   ```bash
   adb install -r app/build/outputs/apk/debug/app-debug.apk
   ```

## Project Structure

```
app/
├── src/main/
│   ├── java/com/metanoiaunlimited/leviathan/
│   │   ├── heycyan/                       # HeyCyan integration (NEW)
│   │   ├── MainActivity.kt
│   │   ├── LeviathanApplication.kt
│   │   ├── ui/
│   │   │   ├── GlassesConnectionActivity.kt
│   │   │   ├── AIChatActivity.kt
│   │   │   ├── VisionModeActivity.kt
│   │   │   ├── SettingsActivity.kt
│   │   │   └── adapter/
│   │   ├── model/
│   │   └── network/
│   ├── res/
│   │   ├── layout/
│   │   ├── values/
│   │   └── drawable/
│   └── AndroidManifest.xml
└── libs/
    └── glasses_sdk_20250723_v01.aar      # HeyCyan SDK

docker-compose.yml                         # Local test harness (Mosquitto + MinIO)
mosquitto/config/mosquitto.conf            # Mosquitto config

.github/workflows/
└── android-build.yml                      # CI pipeline
```

## Dependencies

### Core Android & AndroidX
- `androidx.core:core-ktx` — Kotlin extensions
- `androidx.appcompat:appcompat` — AppCompat activities
- `com.google.android.material:material` — Material Design
- `androidx.constraintlayout:constraintlayout` — ConstraintLayout
- `androidx.lifecycle:*` — Lifecycle & ViewModel
- `androidx.security:security-crypto` — Encrypted SharedPreferences

### Coroutines & Async
- `org.jetbrains.kotlinx:kotlinx-coroutines-android` — Coroutine support

### Networking
- `com.squareup.okhttp3:okhttp` — HTTP client
- `com.squareup.retrofit2:retrofit` — REST API client
- `com.squareup.retrofit2:converter-gson` — JSON serialization

### MQTT & Media
- `org.eclipse.paho:org.eclipse.paho.client.mqttv3` — MQTT pub/sub
- `com.google.code.gson:gson` — JSON (de)serialization

### Camera
- `androidx.camera:camera-core` — CameraX (future use)
- `androidx.camera:camera-camera2`
- `androidx.camera:camera-lifecycle`
- `androidx.camera:camera-view`

### Permissions & Events
- `com.guolindev.permissionx:permissionx` — Runtime permission requests
- `org.greenrobot:eventbus` — Event bus

### Testing
- `junit:junit` — Unit tests
- `androidx.test.ext:junit` — Android test extensions
- `androidx.test.espresso:espresso-core` — UI testing

## Troubleshooting

### "Failed to bind SDK class" in Logcat

**Cause**: HeyCyan SDK not initialized (likely missing license key or AAR not found).

**Solution**:
1. Confirm `libs/glasses_sdk_20250723_v01.aar` exists in your module.
2. Store a HeyCyan test key using the broadcast method (see "Debug Mode" above).
3. Or run with `allowUnlicensed = true` to skip vendor init (for scanning only).

### "BLE adapter is null" / Bluetooth not scanning

**Cause**: Bluetooth permissions not granted or adapter disabled.

**Solution**:
1. Confirm BLUETOOTH_SCAN, BLUETOOTH_CONNECT (API 31+) or BLUETOOTH, BLUETOOTH_ADMIN (API <31) are requested and granted.
2. Enable Bluetooth on the device: Settings → Bluetooth → On.
3. Ensure the M02 glasses are powered and in advertising mode.

### "No HeyCyan/M02 candidate found" in Logcat

**Cause**: BLE scan is not finding the glasses.

**Solution**:
1. Power off and on the M02 glasses.
2. Check Bluetooth MAC address matches expected pattern (usually AA:BB:CC:DD:EE:FF).
3. Filter Logcat by "DeviceDiscoveryManager" to see all discovered devices.
4. If you see other BLE devices but not M02, the glasses may not be advertising the SERIAL_PORT_SERVICE UUID (de5bf728-...). Confirm with the vendor.

### MQTT "Connection refused"

**Cause**: Broker not reachable or credentials incorrect.

**Solution**:
1. For local testing, start docker-compose: `docker compose up -d`
2. Confirm Mosquitto is running: `docker ps | grep mosquitto`
3. Update `MqttManager.broker` to the correct address (use `10.0.2.2` from emulator, `localhost` from physical device running docker).
4. For production, use MQTTS (TLS) and update credentials in `MqttManager`.

### ProGuard errors at runtime

**Cause**: Vendor classes stripped or obfuscated.

**Solution**: Confirm ProGuard keep rules in `app/proguard-rules.pro` include:
```proguard
-keep class com.oudmon.** { *; }
```

Then rebuild: `./gradlew clean build`

## Next Steps

1. ✅ **Build & install the app** on an Android device.
2. ✅ **Request runtime permissions** (Camera, Bluetooth, Microphone).
3. ✅ **Store a HeyCyan test license key** (broadcast or debug UI).
4. ✅ **Run AutoScanActivity** to enumerate vendor class methods.
5. ✅ **Paste Logcat output** to finalize `AARMapping` for exact vendor API calls.
6. ⏳ **Integrate with Leviathan agents** (ChatGPT, Manus, DALL·E, etc.).
7. ⏳ **Deploy to production** with real MQTT broker and S3/R2 object store.

## CI/CD Pipeline

A basic GitHub Actions workflow is included (`.github/workflows/android-build.yml`):

```bash
# Triggered on push and pull requests
./gradlew build -x test
```

To extend it (add tests, upload APK to artifact storage, etc.), edit the workflow file.

## License

**Proprietary** — Metanoia Unlimited

All rights reserved. The HeyCyan M02 SDK and integration code is for authorized use only.

## Version

**1.0.0** — Initial Release (HeyCyan Integration)

## Support & Contributions

For issues, questions, or contributions:
1. Check `ANDROID-APP-INSTALLATION-GUIDE.md` for setup help.
2. Filter Logcat by relevant tags (ReflectionMethodLister, HeyCyanManager, DeviceDiscoveryManager) for debugging.
3. Run AutoScanActivity and paste method signatures if integration issues occur.
4. Contact Metanoia Unlimited for vendor-specific HeyCyan SDK support.

---

**Built with ❤️ for HaShem's Leviathan multi-agent AI hub.**

```
Absolutely. I’ll write this like a real production-grade GitHub README — professional, powerful, and clear — not hype fluff.

You can copy-paste this directly into README.md.

🐉 Leviathan
Modular AI Command Infrastructure on Solana

Leviathan is a sovereign AI orchestration layer designed to bridge intelligent agents, blockchain logic, and real-world automation.

🌊 Overview

Leviathan is a modular AI command system built to:

Orchestrate multiple AI agents

Integrate blockchain logic (Solana programs)

Manage wallets and automated transactions

Coordinate external tools (Shopify, WebSockets, MQTT, crypto feeds)

Scale toward a distributed intelligence architecture

Leviathan is not a chatbot.

It is a command hub.

🧠 Core Philosophy

Leviathan is designed around:

🔹 Multi-agent orchestration

🔹 Deterministic blockchain execution

🔹 Layered intelligence routing

🔹 Modular feature injection

🔹 Ethical override control

The system separates:

Execution layer (Solana programs)

AI cognition layer (LLMs / agents)

Interface layer (Android + UI)

Infrastructure layer (server / RPC / WebSocket)

Wallet authority layer

🏗 Architecture
User Interface (Android App)
        ↓
Copilot Agent Layer
        ↓
Task Router
        ↓
Execution Modules
        ├── Solana Program (leviathan_core)
        ├── Wallet Operations
        ├── Crypto Bots
        ├── Web Scrapers
        ├── Lead Gen Agents
        └── External API Bridges

🔗 Blockchain Layer

Leviathan currently includes:

Anchor-based Solana program (leviathan_core)

Program ID synchronization via anchor keys sync

Devnet deployment configuration

Localnet testing support

Program ID

Synced automatically via:

anchor keys sync


Artifacts:

target/deploy/leviathan_core.so
target/deploy/leviathan_core-keypair.json

💰 Wallet Structure

Wallets are managed via:

~/.config/solana/id.json
~/leviathan_wallets/


Development cluster:

devnet


Example commands:

solana config get
solana address
solana balance
solana airdrop 1

⚙️ Build Instructions
Install Solana CLI
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"

Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install latest
avm use latest

Build
anchor build

Clean
anchor clean

🧩 Modules (Planned & In Progress)

🔹 AI Copilot (Gemini / LLM integration)

🔹 Lead Generation Agents

🔹 Crypto Monitoring Agents

🔹 NFT Generator Module

🔹 Solana Bonding Curve Engine

🔹 Automated Trading Logic

🔹 Multi-Wallet Authority Layer

🔹 Secure Ethical Override System

🔐 Security Model

Leviathan enforces:

Local keypair storage only

No seed phrase exposure in app

Authority separation (deploy / treasury / execution)

Manual override capability

No automatic remote seed transmission

Seed phrases are never stored in this repository.

🛠 Development Environment

Ubuntu (WSL supported)

Rust

Solana CLI

Anchor 0.32+

Android Studio (for app layer)

Node.js (for auxiliary services)

🚀 Roadmap
Phase I

Core Solana program stabilization

Wallet orchestration

Copilot integration

Devnet deployment

Phase II

Multi-agent routing engine

AI decision + transaction layer

Real-time crypto monitoring

Phase III

On-chain governance

Distributed agent network

Sovereign intelligence protocol

🐉 Vision

Leviathan is not just an application.

It is:

A programmable intelligence system

A sovereign AI control layer

A modular blockchain execution engine

A scalable architecture for autonomous systems

📜 License

MIT (or replace with your chosen license)

👤 Creator

Chaz Leland Hamm
Metanoia Unlimited
