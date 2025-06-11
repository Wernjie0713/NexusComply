# NexusComply Mobile Application

This is the Outlet User's mobile application for the NexusComply compliance management system. Built with React Native using Expo, this application enables outlet users to handle all compliance-related tasks directly from their mobile devices.

## Overview

The NexusComply mobile app is designed specifically for Outlet Users, providing a streamlined interface for:
- Completing and submitting compliance audits
- Tracking audit statuses and history
- Viewing compliance requirements
- Managing outlet-specific compliance documentation

## Technology Stack

- **Framework:** React Native with Expo
- **Navigation:** Expo Router (file-based routing)
- **UI Components:** Native React Native components
- **Styling:** React Native StyleSheet API
- **Icons:** Expo Vector Icons (primarily Ionicons)
- **State Management:** React Hooks

## Key Features

### Authentication
- Secure login with email/password
- Password recovery flow
- Session management

### Dashboard
- Personalized welcome with outlet information
- Summary cards showing pending and completed audits
- Quick access to forms requiring attention
- Recent submission history with status indicators

### Audit Management
- Select from available compliance form types
- Dynamic form filling with various input types:
  - Text fields
  - Yes/No/N/A selections
  - Photo uploads
  - Document attachments
  - Notes and comments
  - Issue flagging
- Save and resume draft audits
- Submit completed forms for review
- Track status of submissions

### Records & Reporting
- View past audit history
- Access detailed audit submissions
- Print preview of completed forms
- Generate reports of compliance status

## Application Structure

The app uses Expo Router's file-based routing system:

```
app/
├── (auth)/               # Authentication flow screens
│   ├── landing.jsx       # Initial landing page
│   ├── login.jsx         # Login screen
│   ├── forgot-password.jsx  # Password recovery
│   └── reset-password.jsx   # Reset password
├── (app)/                # Main application screens (post-login)
│   ├── _layout.jsx       # Bottom tab navigator
│   ├── dashboard.jsx     # Home dashboard
│   ├── profile.jsx       # User profile
│   └── audits/           # Audit module
│       ├── _layout.jsx   # Audit stack navigator
│       ├── index.jsx     # Audit home screen
│       ├── select-compliance.jsx  # Form type selector
│       ├── perform-audit.jsx      # Dynamic form filling
│       ├── past-records.jsx       # Audit history
│       ├── view-submission.jsx    # View submitted audit
│       ├── my-reports.jsx         # Reports list
│       ├── view-report-detail.jsx # Detailed report view
│       └── print-preview.jsx      # Print/export view
└── _layout.jsx           # Root layout with stack navigator
```

## Getting Started

### Prerequisites
- Node.js and npm
- Expo CLI
- iOS Simulator (for iOS testing) or Android Emulator (for Android testing)
- Expo Go app (for testing on physical devices)

### Installation

1. Clone the repository and navigate to the app_mobile directory:
```bash
cd app_mobile
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx expo start
```

4. Run on your preferred platform:
   - Press `i` to open in iOS Simulator
   - Press `a` to open in Android Emulator
   - Scan the QR code with Expo Go app on your device
   - Press `w` to open in web browser

## API Integration

The mobile app communicates with the NexusComply Laravel backend API. During development:
- Ensure the Laravel backend is running
- Check that the API base URL is correctly configured

## Development Guidelines

- Follow the existing component structure and styling patterns
- Use the StyleSheet API for styling components
- Leverage Expo Router for navigation
- Maintain consistent UI/UX patterns throughout the app
