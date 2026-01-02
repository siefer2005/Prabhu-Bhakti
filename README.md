# Prabhubhakti - AI-Powered Astrology Application

## Overview

**Prabhubhakti** is a comprehensive React Native mobile application designed to provide personalized astrological insights and spiritual guidance. By leveraging advanced AI and precise astronomical calculations, the application offers users a unique blend of traditional Vedic astrology and modern technology.

The core of the application features an intelligent Chatbot that acts as a personal astrologer, capable of interpreting Kundali (birth charts) and answering user queries in both English and Hindi.

## Key Features

-   **Personalized Kundali Generation**: Generates detailed Vedic birth charts (D1 Chart) based on the user's specific date, time, and place of birth.
-   **AI Astrologer Chatbot**:
    -   Interactive chat interface powered by advanced LLMs (via OpenRouter).
    -   Context-aware responses that utilize the user's generated Kundali data.
    -   **Multilingual Support**: Seamlessly communicates in English and Hindi (Devanagari script) based on user preference.
    -   **Typewriter Effect**: Engaging message delivery for a natural conversation flow.
-   **User Authentication**: Secure Login and Sign-up functionality integrated with Firebase Authentication (Email/Password & Google Sign-In).
-   **Profile Management**: Stores and manages user details and birth information efficiently using Cloud Firestore.
-   **Bilingual Interface**: Full application support for English and Hindi languages, managed via a dedicated Language Context.
-   **Modern UI/UX**: Aesthetically pleasing design featuring heavy use of linear gradients, smooth animations, and intuitive navigation.

This is the Google Drive Link where the Screen Recording of my App is uploaded https://drive.google.com/file/d/1vsPUUW87icgehZqc8uwbflbOTGg0rtMD/view?usp=sharing

## Technology Stack

### Frontend
-   **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/) (SDK 52)
-   **Language**: TypeScript
-   **Navigation**: Expo Router
-   **Styling**: React Native StyleSheet, `expo-linear-gradient`
-   **Icons**: Ionicons (`@expo/vector-icons`)

### Backend & Services
-   **Authentication**: Firebase Authentication
-   **Database**: Cloud Firestore
-   **AI Integration**: OpenRouter API (OpenAI/Other LLMs)
-   **Astrology Data**: Third-party Astrology API integration for planetary data and chart generation

## Prerequisites

Ensure you have the following installed on your development machine:

-   [Node.js](https://nodejs.org/) (LTS version recommended)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
-   [Android Studio](https://developer.android.com/studio) (for Android Emulator) or Xcode (for iOS Simulator)
-   [Expo Go](https://expo.dev/client) app installed on your physical device (optional)

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/prabhubhakti.git
    cd prabhubhakti
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

## Configuration

The application requires specific API keys to function correctly. Create a configuration file or environment variables as per your project structure (typically `config.ts` or `.env`).

**Required Keys:**
-   **Firebase Config**: `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`
-   **OpenAI / OpenRouter API Key**: For the chatbot functionality.
-   **Astrology API Key**: For fetching Kundali and planetary data.

*> Note: Never commit your API keys to version control.*

## Running the Application

Start the Expo development server:

```bash
npx expo start
```

-   **To run on Android Emulator**: Press `a` in the terminal.
-   **To run on iOS Simulator**: Press `i` in the terminal (macOS only).
-   **To run on Physical Device**: Scan the QR code using the Expo Go app.

## Project Structure

```
Prabhubhakti/
├── app/                 # Entry point and navigation setup
├── components/          # Reusable UI components
├── config/              # Configuration files (Firebase, APIs)
├── context/             # React Context Providers (e.g., LanguageContext)
├── navigation/          # Navigation configurations
├── Screens/             # Main application screens (ChatBot, Home, Login, etc.)
├── assets/              # Images, fonts, and static resources
└── utils/               # Helper functions and utilities
```

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes. Ensure that you follow the existing code style and best practices.

## License

This project is proprietary. All rights reserved.
