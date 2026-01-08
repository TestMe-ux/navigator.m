# How to Check/Run the Application

## ⚠️ Prerequisites

Before you can run the app, you need:
1. ✅ Node.js and npm (already installed)
2. ⚠️ iOS/Android native folders (need to be created)
3. ⚠️ iOS: Xcode and CocoaPods
4. ⚠️ Android: Android Studio, Java, and Android SDK

## 🚀 Running the Application

### Step 1: Start Metro Bundler

The Metro bundler is the JavaScript bundler for React Native. Start it in one terminal:

```bash
npm start
```

This will:
- Start the Metro bundler on `http://localhost:8081`
- Show a QR code (for Expo/development builds)
- Wait for the app to connect

**Metro Bundler URL:** `http://localhost:8081`

### Step 2: Run on iOS (macOS only)

**In a new terminal window:**

```bash
npm run ios
```

This will:
- Build the iOS app
- Launch iOS Simulator (if Xcode is installed)
- Install and run the app on the simulator

**Requirements:**
- Xcode installed from App Store
- iOS Simulator available
- CocoaPods dependencies installed (`cd ios && pod install`)

### Step 3: Run on Android

**In a new terminal window:**

```bash
npm run android
```

This will:
- Build the Android app
- Launch Android emulator (or use connected device)
- Install and run the app

**Requirements:**
- Android Studio installed
- Android emulator running OR physical device connected
- Android SDK configured
- `ANDROID_HOME` environment variable set

## 📱 Options to View the App

### Option 1: iOS Simulator (macOS only)
1. Install Xcode from App Store
2. Open Xcode > Preferences > Components
3. Download an iOS Simulator
4. Run: `npm run ios`

### Option 2: Android Emulator
1. Install Android Studio
2. Open Android Studio > AVD Manager
3. Create a new Virtual Device
4. Start the emulator
5. Run: `npm run android`

### Option 3: Physical Device

**iOS:**
- Connect iPhone via USB
- Trust the computer on your iPhone
- Run: `npm run ios --device`

**Android:**
- Enable USB Debugging on your Android device
- Connect via USB
- Run: `npm run android`

## 🔍 Checking the App Without Native Folders

Currently, your project is missing `ios/` and `android/` folders. You have a few options:

### Option A: Create Native Folders (Recommended)

```bash
# Create temporary project to get native folders
npx react-native@0.73.0 init TempProject --skip-install

# Copy native folders
cp -r TempProject/ios .
cp -r TempProject/android .

# Install iOS dependencies
cd ios && pod install && cd ..

# Clean up
rm -rf TempProject
```

Then you can run the app normally.

### Option B: Use Expo (Alternative)

If you want to test quickly without native setup, you could use Expo:
```bash
npx create-expo-app --template
# Then migrate your code
```

### Option C: Check Metro Bundler Only

You can at least verify the JavaScript bundle works:

```bash
npm start
```

Then visit: `http://localhost:8081` in your browser (you'll see Metro bundler info, but not the app UI)

## 🎯 Quick Start Commands

```bash
# Terminal 1: Start Metro
npm start

# Terminal 2: Run iOS (macOS)
npm run ios

# Terminal 2: Run Android
npm run android
```

## 📊 Metro Bundler Interface

When you run `npm start`, you'll see:
- Metro bundler running on port 8081
- Options to:
  - Press `a` to open Android
  - Press `i` to open iOS
  - Press `r` to reload
  - Press `m` to toggle menu

## 🔧 Troubleshooting

### "iOS folder not found"
- You need to create the iOS native project (see Option A above)

### "Android folder not found"
- You need to create the Android native project (see Option A above)

### "Metro bundler not starting"
```bash
npm start -- --reset-cache
```

### "Build fails"
- Make sure all dependencies are installed: `npm install`
- For iOS: `cd ios && pod install && cd ..`
- For Android: Check `ANDROID_HOME` is set

### "Simulator/Emulator not found"
- iOS: Open Xcode and download a simulator
- Android: Open Android Studio > AVD Manager > Create device

## 🌐 Accessing Metro Bundler

The Metro bundler runs on:
- **URL:** `http://localhost:8081`
- **Status:** `http://localhost:8081/status`
- **Bundle:** `http://localhost:8081/index.bundle?platform=ios`

**Note:** These URLs show bundler info, not the app UI. The app UI only appears in simulators/emulators/devices.

## ✅ Verification Checklist

Before running:
- [ ] Node.js installed
- [ ] npm dependencies installed (`npm install`)
- [ ] iOS/Android folders exist
- [ ] iOS: Xcode installed, CocoaPods installed
- [ ] Android: Android Studio installed, SDK configured
- [ ] Simulator/Emulator available or device connected


