# IEBC Voting System - Mobile App

React Native mobile application for the IEBC-inspired blockchain voting system.

## Features

- **Voter Features**
  - Login/Registration with National ID
  - Biometric enrollment (face + fingerprint)
  - Active election browsing
  - Secure vote casting
  - Voting history

- **Admin Features**
  - Dashboard with real-time stats
  - Voter management
  - Election results
  - Notifications

- **Returning Officer Features**
  - QR batch scanning
  - Voter verification
  - Batch processing

## Prerequisites

- Node.js 18+
- Java JDK 17+
- Android Studio (for Android)
- Xcode 15+ (for iOS)

## Setup

```bash
# Install dependencies
npm install

# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## API Configuration

Update `src/config/api.ts` to point to your backend:

```typescript
const BASE_URL = 'http://YOUR_API_URL/api';
```

## Project Structure

```
mobile/
├── src/
│   ├── config/       # API configuration
│   ├── navigation/   # Navigation setup
│   ├── screens/     # UI screens
│   ├── store/       # State management
│   └── App.tsx      # Root component
├── index.js         # Entry point
├── package.json
└── tsconfig.json
```

## Building

### Android APK
```bash
npm run build:android:debug
# Output: android/app/build/outputs/apk/debug/
```

### iOS
```bash
npm run build:ios
# Requires Xcode
```

## Tech Stack

- React Native 0.74.2
- React Navigation 6
- Zustand (state)
- Axios (API)