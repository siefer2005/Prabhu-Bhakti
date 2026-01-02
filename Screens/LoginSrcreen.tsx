import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { auth, db } from '../config/firebase';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;


            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                router.replace('/home');
            } else {
                Alert.alert('Error', 'User not found in database');
            }
        } catch (error: any) {
            Alert.alert('Login Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                createdAt: new Date().toISOString(),
            });

            router.replace('/home');
        } catch (error: any) {
            Alert.alert('Sign Up Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <LinearGradient
                colors={['#FF9900', '#FFCC66', '#FFFDF5']}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            >
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.content}>

                       
                        <View style={styles.logoContainer}>
                            <View style={styles.logoCircle}>
                                <Ionicons name="moon" size={50} color="#DAA520" />
                                <Ionicons name="sparkles" size={24} color="#DAA520" style={styles.logoSparkle} />
                            </View>
                            <Text style={styles.title}>Prabhu Bhakti</Text>
                        </View>

                        
                        <View style={styles.form}>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email"
                                    placeholderTextColor="#333"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Password"
                                    placeholderTextColor="#333"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                            </View>
                        </View>

                     
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
                                {loading ? <ActivityIndicator color="#2d2d2d" /> : <Text style={styles.loginButtonText}>Login</Text>}
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp} disabled={loading}>
                                <Text style={styles.signUpButtonText}>Sign Up</Text>
                            </TouchableOpacity>
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
    },
    gradient: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 50,
    },
    logoCircle: {
        width: 100,
        height: 100,
        backgroundColor: '#FFF8E1', 
        borderRadius: 30, 
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#DAA520',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        marginBottom: 20,
        position: 'relative',
    },
    logoSparkle: {
        position: 'absolute',
        top: 20,
        right: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '500',
        color: '#2d2d2d',
        marginTop: 10,
    },
    form: {
        gap: 20,
        marginBottom: 40,
    },
    inputContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        height: 55,
        justifyContent: 'center',
        paddingHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)' 
    },
    input: {
        fontSize: 16,
        color: '#333',
        height: '100%',
    },
    buttonContainer: {
        gap: 15,
    },
    loginButton: {
        backgroundColor: '#DAA520', 
        height: 55,
        borderRadius: 27.5,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#DAA520',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    loginButtonText: {
        color: '#2d2d2d',
        fontSize: 18,
        fontWeight: '600',
    },
    signUpButton: {
        backgroundColor: 'transparent',
        height: 55,
        borderRadius: 27.5,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#333',
    },
    signUpButtonText: {
        color: '#2d2d2d',
        fontSize: 18,
        fontWeight: '500',
    },
});
