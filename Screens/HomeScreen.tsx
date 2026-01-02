
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { ASTROLOGY_API_ENDPOINT, ASTROLOGY_API_KEY } from '../config/astrologyConfig';
import { auth, db } from '../config/firebase';
import { useLanguage } from '../context/LanguageContext';

export default function HomeScreen() {
    const router = useRouter();
    const { t } = useLanguage();
    const [fullName, setFullName] = useState('');
    const [placeOfBirth, setPlaceOfBirth] = useState('');
    const [gender, setGender] = useState(t('gender'));
    const [currentConcern, setCurrentConcern] = useState(t('currentConcern'));


    const [dob, setDob] = useState(new Date());
    const [showDobPicker, setShowDobPicker] = useState(false);
    const [dobLabel, setDobLabel] = useState(t('dob'));

    const [timeLabel, setTimeLabel] = useState(t('tob'));
    const [time, setTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);

    const [isGenderOpen, setIsGenderOpen] = useState(false);
    const [isConcernOpen, setIsConcernOpen] = useState(false);

    const [isEditing, setIsEditing] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            if (auth.currentUser) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setFullName(data.fullName || '');
                        setPlaceOfBirth(data.placeOfBirth || '');
                        setGender(data.gender || t('gender'));
                        setCurrentConcern(data.currentConcern || t('currentConcern'));

                        if (data.dob) {
                            const d = new Date(data.dob);
                            setDob(d);
                            setDobLabel(d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear());
                        }
                        if (data.time) {
                            const t = new Date(data.time);
                            setTime(t);
               
                            let hours = t.getHours();
                            let minutes = t.getMinutes();
                            const ampm = hours >= 12 ? 'PM' : 'AM';
                            hours = hours % 12;
                            hours = hours ? hours : 12;
                            const strMinutes = minutes < 10 ? '0' + minutes : minutes;
                            setTimeLabel(hours + ':' + strMinutes + ' ' + ampm);
                        }
                    } else {
                        setIsEditing(true);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
        };
        fetchUserData();
    }, []);

    const concernOptions = ['Career', 'Marriage', 'Love', 'Health', 'Finance', 'General'];
    const genderOptions = ['Male', 'Female', 'Other'];

    const onDobChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || dob;
        setShowDobPicker(Platform.OS === 'ios'); 
        if (Platform.OS === 'android') {
            setShowDobPicker(false);
        }
        setDob(currentDate);

  
        let fDate = currentDate.getDate() + '/' + (currentDate.getMonth() + 1) + '/' + currentDate.getFullYear();
        setDobLabel(fDate);
    };


 
    const onTimeChange = (event: any, selectedTime?: Date) => {
        const currentTime = selectedTime || time;
        setShowTimePicker(Platform.OS === 'ios');
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
        }
        setTime(currentTime);

  
        let hours = currentTime.getHours();
        let minutes = currentTime.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; 
        const strMinutes = minutes < 10 ? '0' + minutes : minutes;
        const fTime = hours + ':' + strMinutes + ' ' + ampm;
        setTimeLabel(fTime);
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
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                       
                        <View style={styles.header}>
                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="person-circle-outline" size={35} color="#333" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>{t('detailsForm')}</Text>
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() => router.push('/settings')}
                            >
                                <Ionicons name="settings-outline" size={28} color="#333" />
                            </TouchableOpacity>
                        </View>

                      
                        <View style={styles.form}>
                            <InputField
                                placeholder={t('fullName')}
                                value={fullName}
                                onChangeText={setFullName}
                                editable={isEditing}
                            />

                          
                            <View style={{ zIndex: 2000 }}>
                                <SelectField
                                    label={t('gender')}
                                    value={gender}
                                    onPress={() => {
                                        setIsGenderOpen(!isGenderOpen);
                                        setIsConcernOpen(false);
                                    }}
                                    isOpen={isGenderOpen}
                                    disabled={!isEditing}
                                />
                                {isGenderOpen && (
                                    <View style={styles.dropdownList}>
                                        {genderOptions.map((option) => (
                                            <TouchableOpacity
                                                key={option}
                                                style={styles.dropdownItem}
                                                onPress={() => {
                                                    setGender(option);
                                                    setIsGenderOpen(false);
                                                }}
                                            >
                                                <Text style={styles.dropdownItemText}>{option}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            <DateTimeField
                                label={t('dob')}
                                value={dobLabel === t('dob') ? null : dobLabel}
                                iconName="calendar-outline"
                                onPress={() => setShowDobPicker(true)}
                                disabled={!isEditing}
                            />

                            {showDobPicker && (
                                <View style={{ backgroundColor: '#FFCC66', borderRadius: 10, overflow: 'hidden' }}>
                                    <DateTimePicker
                                        testID="dateTimePicker"
                                        value={dob}
                                        mode={'date'}
                                        is24Hour={true}
                                        display="spinner"
                                        onChange={onDobChange}
                                        maximumDate={new Date()}
                                        style={{ backgroundColor: '#FFCC66' }}
                                    />
                                </View>
                            )}

                            <DateTimeField
                                label={t('tob')}
                                value={timeLabel === t('tob') ? null : timeLabel}
                                iconName="time-outline"
                                onPress={() => setShowTimePicker(true)}
                                disabled={!isEditing}
                            />

                            {showTimePicker && (
                                <DateTimePicker
                                    testID="timePicker"
                                    value={time}
                                    mode={'time'}
                                    is24Hour={false}
                                    display="default"
                                    onChange={onTimeChange}
                                />
                            )}

                            <InputField
                                placeholder={t('pob')}
                                value={placeOfBirth}
                                onChangeText={setPlaceOfBirth}
                                editable={isEditing}
                            />

                        
                            <View style={{ marginBottom: 20, zIndex: 1000 }}>
                                <SelectField
                                    label={t('currentConcern')}
                                    value={currentConcern}
                                    onPress={() => {
                                        setIsConcernOpen(!isConcernOpen);
                                        setIsGenderOpen(false);
                                    }}
                                    disabled={!isEditing}
                                />

                                {isConcernOpen && (
                                    <View style={styles.dropdownList}>
                                        {concernOptions.map((option) => (
                                            <TouchableOpacity
                                                key={option}
                                                style={styles.dropdownItem}
                                                onPress={() => {
                                                    setCurrentConcern(option);
                                                    setIsConcernOpen(false);
                                                }}
                                            >
                                                <Text style={styles.dropdownItemText}>{option}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                        </View>

                        <View style={styles.footer}>


                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={async () => {
                                    let kundaliData = null;

                                    const day = dob.getDate();
                                    const month = dob.getMonth() + 1;
                                    const year = dob.getFullYear();
                                    const hour = time.getHours();
                                    const min = time.getMinutes();

                                    
                                    try {
                        
                                        const apiUrl = `${ASTROLOGY_API_ENDPOINT}?dob=${day}/${month}/${year}&tob=${hour}:${min}&lat=28.7041&lon=77.1025&tz=5.5&api_key=${ASTROLOGY_API_KEY}&lang=en`;
                                        const response = await fetch(apiUrl);
                                        const json = await response.json();
                                        if (json && json.response) {
                                            kundaliData = JSON.stringify(json.response);
                                        }
                                    } catch (error) {
                                        console.error("Error fetching Kundali:", error);
                                    }

                                    if (auth.currentUser) {
                                        try {
                                            await setDoc(doc(db, 'users', auth.currentUser.uid), {
                                                fullName,
                                                placeOfBirth,
                                                gender,
                                                currentConcern,
                                                dob: dob.toISOString(),
                                                time: time.toISOString()
                                            }, { merge: true });
                                        } catch (error) {
                                            console.error("Error saving user details:", error);
                                        }
                                    }

                                    if (router) {
                                        router.push({
                                            pathname: '/chatbot',
                                            params: {
                                                fullName,
                                                placeOfBirth,
                                                gender,
                                                currentConcern,
                                                dob: dob.toISOString(),
                                                time: time.toISOString(),
                                                kundaliData: kundaliData || ''
                                            }
                                        });
                                    } else {
                                        console.error("Router is not initialized");
                                    }
                                }}
                            >
                                <Text style={styles.submitButtonText}>{t('startChat')}</Text>
                            </TouchableOpacity>
                        </View>

                    </ScrollView>
                </SafeAreaView>
            </LinearGradient>
        </View >
    );
}


const InputField = ({ label, value, onChangeText, placeholder, editable = true }: any) => (
    <View style={[styles.inputContainer, !editable && styles.disabledInput]}>
        <TextInput
            style={[styles.input, !editable && { color: '#666' }]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#666"
            editable={editable}
        />
    </View>
);

const SelectField = ({ label, value, onPress, isOpen, disabled = false }: any) => (
    <TouchableOpacity
        style={[styles.inputContainer, disabled && styles.disabledInput]}
        onPress={onPress}
        disabled={disabled}
    >
        <Text style={[styles.inputText, value === label ? { color: '#666' } : { color: '#000' }, disabled && { color: '#666' }]}>
            {value}
        </Text>
        {!disabled && <Ionicons name="caret-down" size={16} color="#000" />}
    </TouchableOpacity>
);

const DateTimeField = ({ label, iconName, onPress, value, disabled = false }: any) => (
    <TouchableOpacity
        style={[styles.inputContainer, disabled && styles.disabledInput]}
        onPress={onPress}
        disabled={disabled}
    >
        <Text style={[styles.inputText, value ? { color: '#000' } : { color: '#333' }, disabled && { color: '#666' }]}>
            {value || label}
        </Text>
        {!disabled && <Ionicons name={iconName} size={20} color="#000" />}
    </TouchableOpacity>
);

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
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 30,
        marginTop: 20,
    },
    iconButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 30,
        fontWeight: '600',
        color: '#333',
    },
    form: {
        gap: 15, 
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 10, 
        paddingHorizontal: 15,
        height: 55, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 5, 
    },
    disabledInput: {
        backgroundColor: '#f5f5f5',
        elevation: 0,
        borderWidth: 1,
        borderColor: '#eee'
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        height: '100%',
    },
    inputText: {
        fontSize: 16,
        color: '#333',
    },
    dropdownList: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingVertical: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        zIndex: 999, 
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#333',
    },
    footer: {
        marginTop: 30,
        alignItems: 'center',
    },
    submitButton: {
        backgroundColor: '#DAA520', 
        paddingVertical: 15,
        width: '100%',
        borderRadius: 25, 
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    submitButtonText: {
        color: '#2d2d2d',
        fontSize: 18,
        fontWeight: '500',
    },
});

