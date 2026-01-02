import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp, writeBatch } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert, FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { ASTROLOGY_API_ENDPOINT, ASTROLOGY_API_KEY } from '../config/astrologyConfig';
import { CHATBOT_CONFIG, OPENAI_API_KEY } from '../config/chatConfig';
import { auth, db } from '../config/firebase';
import { useLanguage } from '../context/LanguageContext';


interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
}

const TypewriterEffect = ({ text, style }: { text: string; style: any }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        setDisplayedText('');
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                setDisplayedText((prev) => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(timer);
            }
        }, 5);

        return () => clearInterval(timer);
    }, [text]);

    return <Text style={style}>{displayedText}</Text>;
};

export default function ChatBot() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { fullName, kundaliData } = params;
    const displayName = typeof fullName === 'string' ? fullName : 'Devotee';

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [userDetails, setUserDetails] = useState<any>(null);
    const [chartUri, setChartUri] = useState<string | null>(null);
    const [chartXml, setChartXml] = useState<string | null>(null);
    const [chartLoading, setChartLoading] = useState(false);
    const [chartError, setChartError] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const user = auth.currentUser;
    const { language } = useLanguage();

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setUserDetails(data);

                        // Fetch Chart Image (D1)
                        if (data.dob && data.time) {
                            const d = new Date(data.dob);
                            const t = new Date(data.time);

                            const day = d.getDate();
                            const month = d.getMonth() + 1;
                            const year = d.getFullYear();
                            const hour = t.getHours();
                            const min = t.getMinutes();


                            const baseUrl = ASTROLOGY_API_ENDPOINT.replace('planet-details', 'chart-image');
                            const url = `${baseUrl}?dob=${day}/${month}/${year}&tob=${hour}:${min}&lat=28.7041&lon=77.1025&tz=5.5&api_key=${ASTROLOGY_API_KEY}&style=north&color=%23DAA520`;

                            console.log("Fetching Chart Image URL:", url);
                            setChartLoading(true);
                            setChartError(false);
                            try {
                                const res = await fetch(url);
                                console.log("Chart Image Response Status:", res.status);
                                const json = await res.json();
                                console.log("Chart API Full Response:", JSON.stringify(json));

                                const svgData = json.svg || json.response;

                                if (svgData) {
                                    if (typeof svgData === 'string' && svgData.startsWith('http')) {
                                        console.log("Chart Image is URL:", svgData);
                                        setChartUri(svgData);
                                        setChartXml(null);
                                    } else if (typeof svgData === 'string') {
                                        console.log("Chart Image is SVG String (Length: " + svgData.length + ")");
                                        const svgStart = svgData.indexOf('<svg');
                                        if (svgStart !== -1) {
                                            const cleanSvg = svgData.substring(svgStart);
                                            console.log("Setting Chart XML (Cleaned)");
                                            setChartXml(cleanSvg);
                                            setChartUri(null);
                                        } else {
                                            console.warn("SVG data does not contain <svg> tag. Data:", svgData.substring(0, 100));
                                        }
                                    } else {
                                        console.warn("SVG Data is not a string:", typeof svgData);
                                    }
                                } else {
                                    console.log("No valid chart data (svg or response) found in JSON");
                                    setChartError(true);
                                }
                            } catch (e) {
                                console.error("Error fetching chart image", e);
                                setChartError(true);
                            } finally {
                                setChartLoading(false);
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user details for chat:", error);
                }
            }
        };
        fetchUserDetails();
    }, [user]);

    useEffect(() => {
        if (!user) return;

        const messagesRef = collection(db, 'users', user.uid, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs: Message[] = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    text: data.text,
                    sender: data.sender
                };
            });

            if (msgs.length === 0) {
                let welcomeText = `Namaste ${displayName}! How can I help you with your astrological queries today?`;

                if (kundaliData && typeof kundaliData === 'string') {
                    try {
                        const kData = JSON.parse(kundaliData);

                        welcomeText += `\n\nI have received your birth chart details. I see your planetary positions.`;
                    } catch (e) {
                        console.error("Error parsing kundali data for welcome message", e);
                    }
                }
                setMessages([{ id: '1', text: welcomeText, sender: 'ai' }]);
            } else {
                setMessages(msgs);
            }
        });

        return () => unsubscribe();
    }, [user, displayName]);

    const sendMessage = async () => {
        if (inputText.trim().length === 0 || !user) return;

        const text = inputText;
        setInputText('');

        try {
            // Add user message
            await addDoc(collection(db, 'users', user.uid, 'messages'), {
                text: text,
                sender: 'user',
                createdAt: serverTimestamp()
            });

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'HTTP-Referer': 'https://prabhubhakti.app',
                    'X-Title': 'Prabhubhakti'
                },
                body: JSON.stringify({
                    model: CHATBOT_CONFIG.model,
                    messages: [
                        {
                            role: "system",
                            content: `${CHATBOT_CONFIG.systemPrompt} 
                            
                            Here are the details of the user you are conversing with:
                            Name: ${userDetails?.fullName || 'Devotee'}
                            Gender: ${userDetails?.gender || 'Not specified'}
                            Date of Birth: ${userDetails?.dob ? new Date(userDetails.dob).toDateString() : 'Not specified'}
                            Time of Birth: ${userDetails?.time ? new Date(userDetails.time).toLocaleTimeString() : 'Not specified'}
                            Place of Birth: ${userDetails?.placeOfBirth || 'Not specified'}
                            Current Concern: ${userDetails?.currentConcern || 'General'}

                            Kundali/Planetary Data (JSON): ${Array.isArray(kundaliData) ? kundaliData[0] : kundaliData || 'Not available'}
                            
                            IMPORTANT INSTRUCTION:
                            The user's current app language is set to: ${language === 'hi' ? 'Hindi (Devanagari script)' : 'English'}.
                            If the language is Hindi, you MUST respond in pure Hindi using the Devanagari script.
                            If the language is English, respond in English.

                            Please use these details to provide personalized astrological insights.`
                        },
                        { role: "user", content: text }
                    ],
                    temperature: CHATBOT_CONFIG.temperature,
                    max_tokens: CHATBOT_CONFIG.max_tokens,
                })
            });

            const data = await response.json();

            if (data.error) {
                console.error("OpenAI Error:", data.error);
                await addDoc(collection(db, 'users', user.uid, 'messages'), {
                    text: "I apologize, but I am having trouble connecting to the stars right now. Please try again later.",
                    sender: 'ai',
                    createdAt: serverTimestamp()
                });
                return;
            }

            const aiResponse = data.choices?.[0]?.message?.content || "I am unable to interpret that at the moment.";

            // Save AI response to Firestore
            await addDoc(collection(db, 'users', user.uid, 'messages'), {
                text: aiResponse.trim(),
                sender: 'ai',
                createdAt: serverTimestamp()
            });

        } catch (error) {
            console.error("Error sending message: ", error);
            await addDoc(collection(db, 'users', user.uid, 'messages'), {
                text: "Something went wrong. Connection might be unstable.",
                sender: 'ai',
                createdAt: serverTimestamp()
            });
        }
    };

    const clearChat = async () => {
        if (!user) return;

        Alert.alert(
            "Clear Chat",
            "Are you sure you want to clear your chat history?",
            [
                { text: "Cancel", style: "cancel", onPress: () => setIsMenuOpen(false) },
                {
                    text: "Clear",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setIsMenuOpen(false);
                            const messagesRef = collection(db, 'users', user.uid, 'messages');
                            const snapshot = await getDocs(messagesRef);
                            const batch = writeBatch(db);

                            snapshot.docs.forEach((doc) => {
                                batch.delete(doc.ref);
                            });

                            await batch.commit();

                        } catch (error) {
                            console.error("Error clearing chat:", error);
                            Alert.alert("Error", "Failed to clear chat history.");
                        }
                    }
                }
            ]
        );
    };


    const renderItem = ({ item, index }: { item: Message, index: number }) => {
        const isUser = item.sender === 'user';
        const isLatestAiMessage = !isUser && index === messages.length - 1;

        if (isUser) {
            return (
                <LinearGradient
                    colors={['#FF9900', '#FFCC66']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.messageBubble, styles.userBubble]}
                >
                    <Text style={[styles.messageText, styles.userText]}>
                        {item.text}
                    </Text>
                </LinearGradient>
            );
        }

        return (
            <View
                style={[styles.messageBubble, styles.aiBubble]}
            >
                {isLatestAiMessage ? (
                    <TypewriterEffect text={item.text} style={[styles.messageText, styles.aiText]} />
                ) : (
                    <Text style={[styles.messageText, styles.aiText]}>
                        {item.text}
                    </Text>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <LinearGradient
                colors={['#ffb442ff', '#FFCC66', '#FFFDF5']}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            >
                <SafeAreaView style={styles.safeArea}>

                    <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                                <Ionicons name="arrow-back" size={24} color="#333" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Astrology Chat</Text>


                            <TouchableOpacity
                                style={styles.menuButton}
                                onPress={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                <Ionicons name="ellipsis-horizontal" size={24} color="#333" />
                            </TouchableOpacity>


                            {isMenuOpen && (
                                <View style={styles.dropdownMenu}>
                                    <TouchableOpacity
                                        style={styles.dropdownItem}
                                        onPress={clearChat}
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#FF4444" />
                                        <Text style={styles.dropdownText}>Clear Chat</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        <FlatList
                            ref={flatListRef}
                            style={{ flex: 1 }}
                            data={messages}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                            ListHeaderComponent={() => (
                                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                                    {chartLoading ? (
                                        <View style={{ height: 300, justifyContent: 'center', alignItems: 'center' }}>
                                            <Text>Loading Chart...</Text>
                                        </View>
                                    ) : chartXml ? (
                                        <SvgXml
                                            xml={chartXml}
                                            width="300"
                                            height="300"
                                        />
                                    ) : chartUri ? (
                                        <Image
                                            source={{ uri: chartUri }}
                                            style={{ width: 300, height: 300 }}
                                            contentFit="contain"
                                        />
                                    ) : chartError ? (
                                        <View style={{ height: 300, justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ color: 'red' }}>Unable to load birth chart.</Text>
                                        </View>
                                    ) : null}
                                </View>
                            )}
                        />

                        <View style={styles.inputContainer}>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.textInput}
                                    value={inputText}
                                    onChangeText={setInputText}
                                    placeholder="Ask your question..."
                                    placeholderTextColor="#666"
                                />
                                <TouchableOpacity style={styles.micButton}>
                                    <Ionicons name="mic" size={20} color="#666" />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                                <Ionicons name="send" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>

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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginTop: 16,
        paddingVertical: 8,

        backgroundColor: '#ffb442ff',
        zIndex: 10,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    menuButton: {
        padding: 8,
    },
    dropdownMenu: {
        position: 'absolute',
        top: 60,
        right: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        zIndex: 1000,
        padding: 5,
        minWidth: 150,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    dropdownText: {
        marginLeft: 10,
        color: '#FF4444',
        fontSize: 16,
        fontWeight: '500',
    },
    listContent: {
        padding: 16,
        paddingBottom: 20,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginVertical: 4,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    userBubble: {
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFF',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#FFE0B2',
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    userText: {
        color: '#FFF',
    },
    aiText: {
        color: '#333',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 24,
        paddingHorizontal: 16,
        height: 50,
        marginRight: 12,
    },
    textInput: {
        flex: 1,
        height: 50,
        color: '#333',
        fontSize: 16,
    },
    micButton: {
        padding: 8,
    },
    sendButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FF9900',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#FF9900',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
});


