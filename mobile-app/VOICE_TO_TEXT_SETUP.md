# Voice-to-Text Setup for Mobile App

## Overview
The mobile app supports voice-to-text input just like the web dashboard, making data entry faster and easier for DSPs.

## Installation

### Step 1: Install Required Package

```bash
cd mobile-app
npm install @react-native-voice/voice
```

### Step 2: iOS Setup (if targeting iOS)

Add to `ios/Podfile`:
```ruby
permissions_path = '../node_modules/react-native-permissions/ios'
pod 'Permission-Microphone', :path => "#{permissions_path}/Microphone"
```

Then run:
```bash
cd ios && pod install && cd ..
```

### Step 3: Android Setup

The package works out of the box on Android. Microphone permissions are automatically requested.

### Step 4: Add Permissions

**iOS (ios/Info.plist):**
```xml
<key>NSMicrophoneUsageDescription</key>
<string>We need access to your microphone for voice-to-text input</string>
<key>NSSpeechRecognitionUsageDescription</key>
<string>We need access to speech recognition for voice-to-text</string>
```

**Android (android/app/src/main/AndroidManifest.xml):**
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

## Usage

The VoiceToTextInput component is already integrated into all forms:

```tsx
import VoiceToTextInput from '../components/VoiceToTextInput';

<VoiceToTextInput
  value={text}
  onChange={setText}
  placeholder="Type or speak..."
  multiline={true}
  numberOfLines={4}
/>
```

## Features

- ✅ Real-time speech recognition
- ✅ Automatic text append
- ✅ Visual listening indicator
- ✅ Error handling
- ✅ Works offline (on-device recognition)
- ✅ Multiple languages supported

## Alternative: Expo Speech

If you prefer Expo's solution, you can use:

```bash
npx expo install expo-speech
```

## Troubleshooting

### "Microphone permission denied"
- Check that permissions are added to Info.plist/AndroidManifest.xml
- Try uninstalling and reinstalling the app
- Check device settings

### "Voice recognition not available"
- Ensure device has speech recognition enabled
- Check internet connection (some devices require it)
- Try restarting the app

### Package not found
- Run `npm install` again
- Clear cache: `npm start --reset-cache`
- Check React Native version compatibility

## Browser Alternative

For development/testing, you can also use the web version which uses the browser's built-in SpeechRecognition API (no installation needed).

## Supported Platforms

- ✅ iOS 13+
- ✅ Android 5.0+
- ✅ Works on real devices (not simulators for best results)

## Privacy

- Voice recognition happens on-device
- No audio is sent to servers
- Compliant with HIPAA requirements
