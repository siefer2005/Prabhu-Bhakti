import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, SafeAreaView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../config/firebase';
import { useLanguage } from '../context/LanguageContext';

export default function Settings() {
    const router = useRouter();
    const { language, setLanguage, t } = useLanguage();
    const [isDarkMode, setIsDarkMode] = useState(false); 
    const [isLanguageOpen, setIsLanguageOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.replace('/');
        } catch (error: any) {
            Alert.alert(t('logoutError'), error.message);
        }
    };

    const handleLanguageChange = () => {
        setIsLanguageOpen(!isLanguageOpen);
    };

    const SettingItem = ({ icon, label, onPress, rightElement, isDestructive }: any) => (
        <TouchableOpacity
            style={styles.settingItem}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, isDestructive && styles.destructiveIcon]}>
                    <Ionicons name={icon} size={22} color={isDestructive ? "#FF4444" : "#333"} />
                </View>
                <Text style={[styles.settingLabel, isDestructive && styles.destructiveLabel]}>
                    {label}
                </Text>
            </View>
            {rightElement || <Ionicons name="chevron-forward" size={20} color="#999" />}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <LinearGradient
                colors={['#FFFDF5', '#FFFDF5']} 
                style={styles.gradient}
            >
                <SafeAreaView style={styles.safeArea}>

                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{t('settingsTitle')}</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    
                    <View style={styles.content}>

                      
                        <Text style={styles.sectionHeader}>{t('accountResult')}</Text>
                        <View style={styles.sectionContainer}>
                            <SettingItem
                                icon="person-outline"
                                label={t('editDetails')}
                                onPress={() => router.push('/home')} 
                            />
                        </View>

                        
                        <Text style={styles.sectionHeader}>{t('preferences')}</Text>
                        <View style={styles.sectionContainer}>
                            <SettingItem
                                icon="language-outline"
                                label={t('changeLanguage')}
                                onPress={handleLanguageChange}
                                rightElement={
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={{ marginRight: 8, color: '#666' }}>
                                            {language === 'en' ? 'English' : 'हिंदी'}
                                        </Text>
                                        <Ionicons name={isLanguageOpen ? "chevron-up" : "chevron-down"} size={20} color="#999" />
                                    </View>
                                }
                            />
                            {isLanguageOpen && (
                                <View style={styles.languageDropdown}>
                                    <TouchableOpacity
                                        style={[styles.languageOption, language === 'en' && styles.selectedLanguage]}
                                        onPress={() => {
                                            setLanguage('en');
                                            setIsLanguageOpen(false);
                                        }}
                                    >
                                        <Text style={[styles.languageText, language === 'en' && styles.selectedLanguageText]}>English</Text>
                                        {language === 'en' && <Ionicons name="checkmark" size={20} color="#FF9900" />}
                                    </TouchableOpacity>
                                    <View style={styles.separator} />
                                    <TouchableOpacity
                                        style={[styles.languageOption, language === 'hi' && styles.selectedLanguage]}
                                        onPress={() => {
                                            setLanguage('hi');
                                            setIsLanguageOpen(false);
                                        }}
                                    >
                                        <Text style={[styles.languageText, language === 'hi' && styles.selectedLanguageText]}>हिंदी (Hindi)</Text>
                                        {language === 'hi' && <Ionicons name="checkmark" size={20} color="#FF9900" />}
                                    </TouchableOpacity>
                                </View>
                            )}
                            <View style={styles.separator} />
                            <SettingItem
                                icon="moon-outline"
                                label={t('darkMode')}
                                onPress={() => setIsDarkMode(!isDarkMode)}
                                rightElement={
                                    <Switch
                                        value={isDarkMode}
                                        onValueChange={setIsDarkMode}
                                        trackColor={{ false: "#E0E0E0", true: "#FF9900" }}
                                    />
                                }
                            />
                        </View>

                        {/* Section: Support & Logout */}
                        <View style={[styles.sectionContainer, { marginTop: 30 }]}>
                            <SettingItem
                                icon="log-out-outline"
                                label={t('logout')}
                                onPress={handleLogout}
                                isDestructive
                            />
                        </View>

                    </View>

                </SafeAreaView>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    gradient: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        backgroundColor: '#FFF',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '600',
        color: '#888',
        marginBottom: 10,
        marginTop: 20,
        marginLeft: 10,
        letterSpacing: 0.5,
    },
    sectionContainer: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: '#FFF',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    destructiveIcon: {
        backgroundColor: '#FFF0F0',
    },
    settingLabel: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    destructiveLabel: {
        color: '#FF4444',
    },
    separator: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginLeft: 67,
    },
    languageDropdown: {
        backgroundColor: '#fafafa',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 20,
        paddingLeft: 67,
    },
    selectedLanguage: {
        backgroundColor: '#fff9f0',
    },
    languageText: {
        fontSize: 15,
        color: '#333',
    },
    selectedLanguageText: {
        color: '#FF9900',
        fontWeight: '600',
    }
});
