import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'hi';

interface Translations {
    [key: string]: {
        [key: string]: string;
    };
}

const translations: Translations = {
    en: {
        // Settings
        settingsTitle: "Settings",
        accountResult: "ACCOUNT",
        editDetails: "Edit Details",
        preferences: "PREFERENCES",
        changeLanguage: "Change Language",
        darkMode: "Dark Mode",
        logout: "Logout",
        comingSoon: "Coming Soon",
        multiLangMsg: "Multi-language support is coming soon!",
        logoutError: "Logout Error",

        // Home
        detailsForm: "Details Form",
        fullName: "Full Name",
        gender: "Gender",
        dob: "Date of Birth",
        tob: "Time of Birth",
        pob: "Place of Birth",
        currentConcern: "Current Concern",
        startChat: "Start Astrology Chat",

        // Login
        login: "Login",
        signUp: "Sign Up",
        email: "Email",
        password: "Password",

        // ChatBot
        astrologyChat: "Astrology Chat",
        clearChat: "Clear Chat",
        askQuestion: "Ask your question...",
        clearChatTitle: "Clear Chat",
        clearChatMsg: "Are you sure you want to clear your chat history?",
        cancel: "Cancel",
        clear: "Clear",
        loadingChart: "Loading Chart...",
        chartError: "Unable to load birth chart.",
    },
    hi: {
        // Settings
        settingsTitle: "सेटिंग्स",
        accountResult: "खाता",
        editDetails: "विवरण संपादित करें",
        preferences: "प्राथमिकताएं",
        changeLanguage: "भाषा बदलें",
        darkMode: "डार्क मोड",
        logout: "लॉग आउट",
        comingSoon: "शीघ्र आ रहा है",
        multiLangMsg: "बहु-भाषा समर्थन शीघ्र आ रहा है!",
        logoutError: "लॉग आउट त्रुटि",

        // Home
        detailsForm: "विवरण फॉर्म",
        fullName: "पूरा नाम",
        gender: "लिंग",
        dob: "जन्म तिथि",
        tob: "जन्म समय",
        pob: "जन्म स्थान",
        currentConcern: "वर्तमान चिंता",
        startChat: "ज्योतिष चैट शुरू करें",

        // Login
        login: "लॉग इन",
        signUp: "साइन अप",
        email: "ईमेल",
        password: "पासवर्ड",

        // ChatBot
        astrologyChat: "ज्योतिष चैट",
        clearChat: "चैट साफ़ करें",
        askQuestion: "अपना प्रश्न पूछें...",
        clearChatTitle: "चैट साफ़ करें",
        clearChatMsg: "क्या आप वाकई अपना चैट इतिहास साफ़ करना चाहते हैं?",
        cancel: "रद्द करें",
        clear: "साफ़ करें",
        loadingChart: "कुंडली लोड हो रही है...",
        chartError: "कुंडली लोड करने में असमर्थ।",
    }
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        loadLanguage();
    }, []);

    const loadLanguage = async () => {
        try {
            const storedLang = await AsyncStorage.getItem('user-language');
            if (storedLang === 'en' || storedLang === 'hi') {
                setLanguageState(storedLang);
            }
        } catch (error) {
            console.error("Failed to load language", error);
        }
    };

    const setLanguage = async (lang: Language) => {
        setLanguageState(lang);
        try {
            await AsyncStorage.setItem('user-language', lang);
        } catch (error) {
            console.error("Failed to save language", error);
        }
    };

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};
