# iOS/Android Environment Setup Guide

## Current Status Check

Run these commands to check what's installed:
- `xcodebuild -version` - Check Xcode
- `pod --version` - Check CocoaPods
- `java -version` - Check Java/JDK
- `echo $ANDROID_HOME` - Check Android SDK path

## iOS Setup (macOS only)

### 1. Install Xcode
1. Open the App Store
2. Search for "Xcode"
3. Install Xcode (this will take a while, ~10-15 GB)
4. After installation, open Xcode once to accept the license agreement
5. Install additional components when prompted

### 2. Install Xcode Command Line Tools (if not already installed)
```bash
xcode-select --install
```

### 3. Install CocoaPods
CocoaPods is required for iOS dependencies:
```bash
sudo gem install cocoapods
```

### 4. Verify iOS Setup
```bash
xcodebuild -version
pod --version
```

## Android Setup

### 1. Install Java Development Kit (JDK)
React Native requires JDK 11 or higher. Recommended: JDK 17 or 21

**Option A: Using Homebrew (Recommended)**
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install JDK 17
brew install openjdk@17

# Link and set JAVA_HOME
sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
echo 'export JAVA_HOME="/opt/homebrew/opt/openjdk@17"' >> ~/.zshrc
source ~/.zshrc
```

**Option B: Download from Oracle/Adoptium**
- Visit: https://adoptium.net/
- Download JDK 17 or 21 for macOS
- Install the .pkg file
- Set JAVA_HOME in your shell profile

### 2. Install Android Studio
1. Download Android Studio from: https://developer.android.com/studio
2. Install Android Studio
3. Open Android Studio and go through the setup wizard
4. Install Android SDK (API level 33 or higher recommended)
5. Install Android SDK Platform-Tools
6. Install Android Emulator

### 3. Configure Android Environment Variables
Add these to your `~/.zshrc` file:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

Then reload your shell:
```bash
source ~/.zshrc
```

### 4. Verify Android Setup
```bash
java -version
echo $ANDROID_HOME
adb version
```

## Initialize Native Projects

If iOS/Android folders don't exist, you may need to:

1. **For React Native 0.73+**: The native projects should be initialized automatically
2. If they're missing, you might need to create a new React Native project and copy the native folders, OR
3. Use React Native CLI to initialize:
```bash
npx react-native init TempProject --version 0.73.0
# Copy ios/ and android/ folders from TempProject to this project
# Then delete TempProject
```

## Next Steps After Setup

### iOS
1. Navigate to ios folder: `cd ios`
2. Install pods: `pod install`
3. Return to root: `cd ..`
4. Run: `npm run ios`

### Android
1. Start Android Studio
2. Open an Android emulator or connect a physical device
3. Run: `npm run android`

## Troubleshooting

### iOS Issues
- **Xcode not found**: Make sure Xcode is installed from App Store, not just command line tools
- **CocoaPods permission error**: Use `sudo gem install cocoapods` or install via Homebrew: `brew install cocoapods`
- **Pod install fails**: Try `cd ios && pod deintegrate && pod install`

### Android Issues
- **JAVA_HOME not set**: Add export statements to ~/.zshrc and reload shell
- **ANDROID_HOME not found**: Check Android Studio SDK location (usually `~/Library/Android/sdk`)
- **Emulator not starting**: Open Android Studio > AVD Manager > Create/Start emulator
- **Build fails**: Make sure you have accepted Android licenses: `sdkmanager --licenses`

## Quick Verification Commands

```bash
# Check all prerequisites
echo "Node: $(node --version)"
echo "npm: $(npm --version)"
echo "Xcode: $(xcodebuild -version 2>&1)"
echo "CocoaPods: $(pod --version 2>&1)"
echo "Java: $(java -version 2>&1 | head -1)"
echo "ANDROID_HOME: $ANDROID_HOME"
echo "ADB: $(adb version 2>&1 | head -1)"
```


