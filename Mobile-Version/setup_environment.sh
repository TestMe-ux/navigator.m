#!/bin/bash

# iOS/Android Environment Setup Script
# Run this script to set up your React Native development environment

set -e

echo "🚀 React Native iOS/Android Environment Setup"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not found. Please install Node.js 18+ first.${NC}"
    exit 1
fi

# Check npm
echo "📦 Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓ npm installed: $NPM_VERSION${NC}"
else
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi

# Check Homebrew
echo ""
echo "🍺 Checking Homebrew..."
if command -v brew &> /dev/null; then
    echo -e "${GREEN}✓ Homebrew installed${NC}"
    BREW_INSTALLED=true
else
    echo -e "${YELLOW}⚠ Homebrew not installed${NC}"
    echo "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH for Apple Silicon Macs
    if [[ $(uname -m) == "arm64" ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
    
    BREW_INSTALLED=true
    echo -e "${GREEN}✓ Homebrew installed${NC}"
fi

# iOS Setup
echo ""
echo "🍎 iOS Setup"
echo "-----------"

# Check Xcode
echo "Checking Xcode..."
if command -v xcodebuild &> /dev/null; then
    XCODE_VERSION=$(xcodebuild -version 2>&1 | head -1)
    if [[ $XCODE_VERSION == *"Xcode"* ]]; then
        echo -e "${GREEN}✓ $XCODE_VERSION${NC}"
    else
        echo -e "${YELLOW}⚠ Xcode command line tools only. Full Xcode required.${NC}"
        echo "Please install Xcode from the App Store:"
        echo "1. Open App Store"
        echo "2. Search for 'Xcode'"
        echo "3. Install Xcode (this will take a while)"
        echo "4. Open Xcode once to accept license"
    fi
else
    echo -e "${YELLOW}⚠ Xcode not found${NC}"
    echo "Please install Xcode from the App Store"
fi

# Install CocoaPods
echo ""
echo "Installing CocoaPods..."
if command -v pod &> /dev/null; then
    POD_VERSION=$(pod --version)
    echo -e "${GREEN}✓ CocoaPods installed: $POD_VERSION${NC}"
else
    echo "Installing CocoaPods (this may require your password)..."
    if sudo gem install cocoapods; then
        echo -e "${GREEN}✓ CocoaPods installed${NC}"
    else
        echo -e "${YELLOW}⚠ Failed to install CocoaPods. Trying with Homebrew...${NC}"
        if brew install cocoapods; then
            echo -e "${GREEN}✓ CocoaPods installed via Homebrew${NC}"
        else
            echo -e "${RED}✗ Could not install CocoaPods. Please install manually.${NC}"
        fi
    fi
fi

# Android Setup
echo ""
echo "🤖 Android Setup"
echo "---------------"

# Check Java
echo "Checking Java..."
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -1)
    echo -e "${GREEN}✓ Java found: $JAVA_VERSION${NC}"
    
    # Check JAVA_HOME
    if [ -z "$JAVA_HOME" ]; then
        echo -e "${YELLOW}⚠ JAVA_HOME not set${NC}"
        echo "Setting JAVA_HOME..."
        
        # Try to find Java
        if [[ $(uname -m) == "arm64" ]]; then
            JAVA_PATH="/opt/homebrew/opt/openjdk@17"
        else
            JAVA_PATH="/usr/libexec/java_home"
        fi
        
        if [ -d "$JAVA_PATH" ]; then
            echo "export JAVA_HOME=\"$JAVA_PATH\"" >> ~/.zshrc
            echo "export PATH=\"\$JAVA_HOME/bin:\$PATH\"" >> ~/.zshrc
            export JAVA_HOME="$JAVA_PATH"
            export PATH="$JAVA_HOME/bin:$PATH"
            echo -e "${GREEN}✓ JAVA_HOME set${NC}"
        fi
    else
        echo -e "${GREEN}✓ JAVA_HOME: $JAVA_HOME${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Java not found${NC}"
    echo "Installing OpenJDK 17..."
    if brew install openjdk@17; then
        echo -e "${GREEN}✓ OpenJDK 17 installed${NC}"
        
        # Set JAVA_HOME
        if [[ $(uname -m) == "arm64" ]]; then
            JAVA_HOME_PATH="/opt/homebrew/opt/openjdk@17"
        else
            JAVA_HOME_PATH="/usr/local/opt/openjdk@17"
        fi
        
        sudo ln -sfn "$JAVA_HOME_PATH/libexec/openjdk.jdk" /Library/Java/JavaVirtualMachines/openjdk-17.jdk
        echo "export JAVA_HOME=\"$JAVA_HOME_PATH\"" >> ~/.zshrc
        echo "export PATH=\"\$JAVA_HOME/bin:\$PATH\"" >> ~/.zshrc
        export JAVA_HOME="$JAVA_HOME_PATH"
        export PATH="$JAVA_HOME/bin:$PATH"
        echo -e "${GREEN}✓ JAVA_HOME configured${NC}"
    else
        echo -e "${RED}✗ Could not install Java. Please install manually.${NC}"
        echo "Visit: https://adoptium.net/"
    fi
fi

# Check Android SDK
echo ""
echo "Checking Android SDK..."
if [ -n "$ANDROID_HOME" ]; then
    echo -e "${GREEN}✓ ANDROID_HOME: $ANDROID_HOME${NC}"
else
    echo -e "${YELLOW}⚠ ANDROID_HOME not set${NC}"
    
    # Common Android SDK locations
    ANDROID_SDK_PATHS=(
        "$HOME/Library/Android/sdk"
        "$HOME/Android/Sdk"
    )
    
    ANDROID_FOUND=false
    for path in "${ANDROID_SDK_PATHS[@]}"; do
        if [ -d "$path" ]; then
            echo "Found Android SDK at: $path"
            echo "export ANDROID_HOME=\"$path\"" >> ~/.zshrc
            echo "export PATH=\"\$PATH:\$ANDROID_HOME/emulator\"" >> ~/.zshrc
            echo "export PATH=\"\$PATH:\$ANDROID_HOME/platform-tools\"" >> ~/.zshrc
            echo "export PATH=\"\$PATH:\$ANDROID_HOME/tools\"" >> ~/.zshrc
            echo "export PATH=\"\$PATH:\$ANDROID_HOME/tools/bin\"" >> ~/.zshrc
            export ANDROID_HOME="$path"
            export PATH="$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin"
            ANDROID_FOUND=true
            echo -e "${GREEN}✓ ANDROID_HOME configured${NC}"
            break
        fi
    done
    
    if [ "$ANDROID_FOUND" = false ]; then
        echo -e "${YELLOW}⚠ Android SDK not found${NC}"
        echo "Please install Android Studio:"
        echo "1. Download from: https://developer.android.com/studio"
        echo "2. Install Android Studio"
        echo "3. Open Android Studio > SDK Manager"
        echo "4. Install Android SDK (API 33+)"
        echo "5. Run this script again to configure paths"
    fi
fi

# Check ADB
if command -v adb &> /dev/null; then
    ADB_VERSION=$(adb version | head -1)
    echo -e "${GREEN}✓ ADB found: $ADB_VERSION${NC}"
else
    echo -e "${YELLOW}⚠ ADB not found (Android SDK Platform-Tools)${NC}"
fi

# Summary
echo ""
echo "================================================"
echo "📋 Setup Summary"
echo "================================================"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "Xcode: $(xcodebuild -version 2>&1 | head -1 || echo 'Not installed')"
echo "CocoaPods: $(pod --version 2>&1 || echo 'Not installed')"
echo "Java: $(java -version 2>&1 | head -1 || echo 'Not installed')"
echo "JAVA_HOME: ${JAVA_HOME:-'Not set'}"
echo "ANDROID_HOME: ${ANDROID_HOME:-'Not set'}"
echo "ADB: $(adb version 2>&1 | head -1 || echo 'Not installed')"
echo ""

# Next steps
echo "📝 Next Steps:"
echo "1. Reload your shell: source ~/.zshrc"
echo "2. For iOS: cd ios && pod install && cd .."
echo "3. For Android: Make sure Android Studio and emulator are set up"
echo "4. Run: npm start (in one terminal)"
echo "5. Run: npm run ios (or npm run android in another terminal)"
echo ""

echo -e "${GREEN}✨ Setup complete!${NC}"


