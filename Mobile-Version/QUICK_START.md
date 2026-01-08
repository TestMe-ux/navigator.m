# Quick Start Guide - iOS/Android Setup

## 🚀 Automated Setup (Recommended)

Run the setup script:
```bash
./setup_environment.sh
```

This script will:
- Check and install Homebrew (if needed)
- Install CocoaPods for iOS
- Install Java/JDK for Android
- Configure environment variables
- Check for Android SDK

**Note:** Some steps may require your password (for sudo commands).

---

## 📋 Manual Setup Steps

### Step 1: Install Homebrew (if not installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

For Apple Silicon Macs, add to your shell:
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### Step 2: iOS Setup

#### 2.1 Install Xcode
1. Open **App Store**
2. Search for **"Xcode"**
3. Click **Install** (this is large, ~10-15 GB, takes time)
4. After installation, **open Xcode once** to accept the license
5. Install additional components when prompted

#### 2.2 Install CocoaPods
```bash
sudo gem install cocoapods
```
Or via Homebrew:
```bash
brew install cocoapods
```

### Step 3: Android Setup

#### 3.1 Install Java/JDK
```bash
brew install openjdk@17
```

For Apple Silicon Macs:
```bash
sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk
```

Add to `~/.zshrc`:
```bash
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
echo 'export JAVA_HOME="/opt/homebrew/opt/openjdk@17"' >> ~/.zshrc
source ~/.zshrc
```

#### 3.2 Install Android Studio
1. Download from: https://developer.android.com/studio
2. Install Android Studio
3. Open Android Studio
4. Go through the **Setup Wizard**
5. Install:
   - Android SDK (API level 33 or higher)
   - Android SDK Platform-Tools
   - Android Emulator

#### 3.3 Configure Android Environment Variables
Add to `~/.zshrc`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

Then reload:
```bash
source ~/.zshrc
```

### Step 4: Initialize Native Projects

If `ios/` and `android/` folders don't exist, you need to create them:

**Option A: Use React Native CLI (Recommended)**
```bash
# Install React Native CLI globally
npm install -g react-native-cli

# Initialize native projects (this might overwrite some files, so backup first)
npx react-native init TempProject --version 0.73.0 --skip-install
cp -r TempProject/ios .
cp -r TempProject/android .
rm -rf TempProject
```

**Option B: Manual Creation**
You'll need to create the native project structure manually, which is complex. Option A is recommended.

### Step 5: Install iOS Dependencies
```bash
cd ios
pod install
cd ..
```

### Step 6: Verify Setup
```bash
# Check all tools
node --version
npm --version
xcodebuild -version
pod --version
java -version
echo $JAVA_HOME
echo $ANDROID_HOME
adb version
```

---

## 🎯 Running the App

### Start Metro Bundler
```bash
npm start
```

### Run on iOS (in a new terminal)
```bash
npm run ios
```

### Run on Android (in a new terminal)
1. Start Android Studio
2. Open AVD Manager
3. Start an emulator (or connect a physical device)
4. Run:
```bash
npm run android
```

---

## ⚠️ Troubleshooting

### iOS Issues

**Xcode not found:**
- Make sure you installed Xcode from App Store, not just command line tools
- Run: `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer`

**CocoaPods permission error:**
- Use: `brew install cocoapods` instead of gem install
- Or: `sudo gem install cocoapods`

**Pod install fails:**
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Android Issues

**JAVA_HOME not set:**
- Check Java installation: `brew list openjdk@17`
- Add export statements to `~/.zshrc` and reload

**ANDROID_HOME not found:**
- Check Android Studio SDK location (usually `~/Library/Android/sdk`)
- Make sure you completed Android Studio setup wizard

**Emulator not starting:**
- Open Android Studio > Tools > AVD Manager
- Create a new virtual device if none exist
- Start the emulator from AVD Manager

**Build fails:**
- Accept Android licenses: `sdkmanager --licenses`
- Clean build: `cd android && ./gradlew clean && cd ..`

---

## 📞 Need Help?

1. Check `ENVIRONMENT_SETUP.md` for detailed instructions
2. Run `./setup_environment.sh` for automated setup
3. Verify all prerequisites with the verification commands above


