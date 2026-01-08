# How to Check Your Application

## 🎯 Quick Answer

To check/run your React Native app, you need **2 terminals**:

### Terminal 1: Start Metro Bundler
```bash
npm start
```
This starts the JavaScript bundler at `http://localhost:8081`

### Terminal 2: Run the App

**For iOS (Mac only):**
```bash
npm run ios
```

**For Android:**
```bash
npm run android
```

---

## ⚠️ Current Issue

Your project is **missing the `ios/` and `android/` folders**. These are required to run the app.

### Fix: Create Native Folders

Run these commands to create the native projects:

```bash
# Create temporary project to get native folders
npx react-native@0.73.0 init TempProject --skip-install

# Copy the native folders to your project
cp -r TempProject/ios .
cp -r TempProject/android .

# Install iOS dependencies (if on Mac)
cd ios && pod install && cd ..

# Clean up
rm -rf TempProject
```

**After this, you can run the app!**

---

## 📱 Where You'll See the App

React Native apps **don't run in a browser**. They run on:

1. **iOS Simulator** (Mac only) - Looks like an iPhone/iPad
2. **Android Emulator** - Looks like an Android phone
3. **Physical Device** - Your actual phone connected via USB

The Metro bundler (`http://localhost:8081`) is just the JavaScript server - it doesn't show the app UI.

---

## 🚀 Step-by-Step: First Time Setup

### 1. Create Native Folders (if missing)
```bash
npx react-native@0.73.0 init TempProject --skip-install
cp -r TempProject/ios .
cp -r TempProject/android .
cd ios && pod install && cd ..
rm -rf TempProject
```

### 2. Start Metro Bundler
```bash
# Terminal 1
npm start
```

### 3. Run on Device/Simulator

**iOS:**
```bash
# Terminal 2 (make sure Xcode is installed)
npm run ios
```

**Android:**
```bash
# Terminal 2 (make sure Android Studio emulator is running)
npm run android
```

---

## 🔍 What You'll See

### Metro Bundler (Terminal 1)
```
               ######                ######               
             ###     ####        ####     ###             
            ##          ###    ###          ##            
            ##             ####             ##            
            ##             ####             ##            
            ##           ##    ##           ##            
            ##         ###      ###         ##            
             ##  ########################  ##             
          ######    ###            ###    ######          
      ###     ##    ##              ##    ##     ###      
   ###         ## ###      ####      ### ##         ###   
  ##           ####      ########      ####           ##  
 ##             ###     ##########     ###             ## 
  ##           ####      ########      ####           ##  
   ###         ## ###      ####      ### ##         ###   
      ###     ##    ##              ##    ##     ###      
          ######    ###            ###    ######          
             ##  ########################  ##             
            ##         ###      ###         ##            
            ##           ##    ##           ##            
            ##             ####             ##            
            ##             ####             ##            
            ##          ###    ###          ##            
             ###     ####        ####     ###             
               ######                ######               

                 Welcome to Metro!
```

### App Running
- **iOS:** iPhone/iPad simulator window opens
- **Android:** Android emulator window opens
- Your app UI appears in the simulator/emulator

---

## 🌐 Metro Bundler URLs

While Metro runs, you can access:
- **Main:** `http://localhost:8081`
- **Status:** `http://localhost:8081/status`
- **Bundle:** `http://localhost:8081/index.bundle?platform=ios`

**Note:** These show bundler info, not your app UI. The app only appears in simulators/emulators.

---

## ✅ Quick Checklist

Before running:
- [ ] `npm install` completed
- [ ] `ios/` and `android/` folders exist
- [ ] iOS: Xcode installed (Mac only)
- [ ] iOS: `cd ios && pod install` completed
- [ ] Android: Android Studio installed
- [ ] Android: Emulator running or device connected

---

## 🆘 Common Issues

**"iOS/android folder not found"**
→ Run the native folder creation commands above

**"Metro bundler won't start"**
→ Try: `npm start -- --reset-cache`

**"Build fails"**
→ Make sure all prerequisites are installed (see `ENVIRONMENT_SETUP.md`)

**"Simulator not found"**
→ iOS: Open Xcode > Download simulator
→ Android: Open Android Studio > AVD Manager > Create device

---

## 📚 More Help

- **Detailed setup:** See `ENVIRONMENT_SETUP.md`
- **Quick start:** See `QUICK_START.md`
- **How to run:** See `HOW_TO_RUN.md`


