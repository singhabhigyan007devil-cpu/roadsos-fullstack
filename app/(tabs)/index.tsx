import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Location from 'expo-location';
const SunCalc = require('suncalc');

import { BlurView } from 'expo-blur';
import { Accelerometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';

import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import ChatbotPanel from "@/components/home/ChatbotPanel";
import ContactsPanel from "@/components/home/ContactsPanel";
import MapSection from "@/components/home/MapSection";
import MedicalVault from "@/components/home/MedicalVault";
import PanelModal from "@/components/home/PanelModal";
import RiskFullPanel from "@/components/home/RiskFullPanel";
import RiskShield from "@/components/home/RiskShield";
import SOSPanel from "@/components/home/SOSPanel";
import Animated, {
  FadeIn,
  FadeOut
} from 'react-native-reanimated';


type Place = {
  id: number;
  lat: number;
  lon: number;
  name: string;
  type: string;
};

type Panel =
  | 'chatbot'
  | 'contacts'
  | 'safety'
  | 'assist'
  | 'vehicle'
  | 'vault'
  | 'hero'
  | 'police'
  | 'license'
  | 'fleet'
  | 'insurance'
  | 'risk'
  |'calculator'
  | null;

type ChatMessage = {
  role: 'bot' | 'user';
  text: string;
};

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#ffffff' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#000000' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
];

const lifeMessages = [
  'Every second matters. Stay calm. Call help fast.',
  'Your life is worth more than speed.',
  'Seat belts save families, not just drivers.',
  'Don’t panic. Breathe. Share your location.',
];

const adMessages = [
  'Sponsored: Roadside assistance plans for safer journeys',
  'Sponsored: Accident insurance options for daily commuters',
  'Sponsored: Helmet, dashcam and vehicle-safety deals',
];

const assistanceOptions = [
  { title: 'Tow Truck', icon: '🚚', type: 'towing', desc: 'Vehicle stuck or not moving' },
  { title: 'Mechanic', icon: '🔧', type: 'mechanic', desc: 'Breakdown or engine issue' },
  { title: 'Fuel Help', icon: '⛽', type: 'fuel', desc: 'Out of fuel support' },
  { title: 'EV Charge', icon: '⚡', type: 'charging', desc: 'EV charging assistance' },
];

const countryCodes = [
  { name: 'India', code: '+91', flag: '🇮🇳' },
  { name: 'United States', code: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪' },
  { name: 'Canada', code: '+1', flag: '🇨🇦' },
  { name: 'Australia', code: '+61', flag: '🇦🇺' },
  { name: 'Singapore', code: '+65', flag: '🇸🇬' },
  { name: 'Germany', code: '+49', flag: '🇩🇪' },
  { name: 'France', code: '+33', flag: '🇫🇷' },
  { name: 'Japan', code: '+81', flag: '🇯🇵' },
];

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [message, setMessage] = useState('Loading ROADSoS...');
  const [panel, setPanel] = useState<Panel>(null);
  const [isNight, setIsNight] = useState(false);
  const [ghostMode, setGhostMode] = useState(false);
  const [calculatorInput, setCalculatorInput] = useState('');
  const SECRET_CALC_PIN = '112=';
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'bot',
      text: 'Hi, I am ROADSoS AI. Tell me what happened: accident, bleeding, breathing issue, unsafe location, or panic.',
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  const [emergencyContact, setEmergencyContact] = useState('');
  const [savedContacts, setSavedContacts] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [placesLoading, setPlacesLoading] = useState(true);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [fuelType, setFuelType] = useState('Petrol');

  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseHolderName, setLicenseHolderName] = useState('');
  const [licenseValidTill, setLicenseValidTill] = useState('');
  const [licenseLinked, setLicenseLinked] = useState(false);

  const [bloodType, setBloodType] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medications, setMedications] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [primaryContactName, setPrimaryContactName] = useState('');
  const [primaryContactPhone, setPrimaryContactPhone] = useState('');
  const [heroMode, setHeroMode] = useState(false);

  const [fakeCallActive, setFakeCallActive] = useState(false);
  const [flashlightActive, setFlashlightActive] = useState(false);
  const [voiceSOSActive, setVoiceSOSActive] = useState(false);
  const [heroAlert, setHeroAlert] = useState(false);

  const [accidentDetected, setAccidentDetected] = useState(false);
  const [countdown, setCountdown] = useState(10);

  const [lifeIndex, setLifeIndex] = useState(0);
  const [adIndex, setAdIndex] = useState(0);

  const [riskScore, setRiskScore] = useState(0);
  const [riskLevel, setRiskLevel] = useState<'LOW' | 'MODERATE' | 'HIGH'>('LOW');
  const [riskReasons, setRiskReasons] = useState<string[]>([]);
  const [movementAlert, setMovementAlert] = useState(false);
  const [lastForce, setLastForce] = useState(0);

  const [tripMode, setTripMode] = useState(false);
  const [tripCheckTime, setTripCheckTime] = useState(300);
  const [tripAlertVisible, setTripAlertVisible] = useState(false);

  const accidentIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastForceRef = useRef(0);

  const BASE_URL = 'https://roadsos-backend-sieq.onrender.com';

  const theme = isNight
    ? { text: '#F8FAFC', sub: '#CBD5E1', input: '#1E293B', chip: '#334155', glass: 'dark' as const }
    : { text: '#111827', sub: '#4B5563', input: '#F3F4F6', chip: '#E5E7EB', glass: 'light' as const };

  // Panel colors stay dark in both day and night mode so text is always readable.
  const panelTheme = {
    text: '#F8FAFC',
    sub: '#CBD5E1',
    input: '#111827',
    chip: '#1E293B',
    border: 'rgba(255,255,255,0.14)',
    background: 'rgba(2,6,23,0.96)',
  };
const triggerSilentSOS = async () => {
  try {
    const phone = savedContacts[0];

    if (!phone) return;

    const message = encodeURIComponent(
      createEmergencyMessage()
    );

    Linking.openURL(
      `sms:${phone}?body=${message}`
    );

    setGhostMode(true);

  } catch (error) {
    console.log(error);
  }
};
const handleCalculatorPress = (value: string) => {
  const updated = calculatorInput + value;

  if (updated.endsWith(SECRET_CALC_PIN)) {
    setCalculatorInput('2468');
    triggerSilentSOS();
    return;
  }

  if (value === 'C') {
    setCalculatorInput('');
    return;
  }

  setCalculatorInput(updated);
};

  const inputStyle = {
    backgroundColor: theme.input,
    color: panelTheme.text,
    padding: 14,
    borderRadius: 18,
    marginTop: 10,
  };

  useEffect(() => {
    getLocationAndPlaces();
    loadEmergencyContacts();
    loadVehicleProfile();
    loadDrivingLicense();
    loadMedicalVault();

    const lifeTimer = setInterval(() => {
      setLifeIndex((prev) => (prev + 1) % lifeMessages.length);
    }, 3500);

    const adTimer = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % adMessages.length);
    }, 4500);

    return () => {
      clearInterval(lifeTimer);
      clearInterval(adTimer);
      if (accidentIntervalRef.current) clearInterval(accidentIntervalRef.current);
    };
  }, []);

  useEffect(() => {
  Accelerometer.setUpdateInterval(700);

  const subscription = Accelerometer.addListener((data) => {
    const totalForce =
      Math.abs(data.x) + Math.abs(data.y) + Math.abs(data.z);

    lastForceRef.current = totalForce;

    if (totalForce > 3.2 && !accidentDetected) {
      setLastForce(totalForce);
      triggerAccidentMode();
      return;
    }

    if (totalForce > 2.4 && !movementAlert && !accidentDetected) {
      setLastForce(totalForce);
      setMovementAlert(true);

      setTimeout(() => {
        setMovementAlert(false);
        setLastForce(0);
      }, 8000);
    }
  });

  return () => subscription.remove();
}, [accidentDetected, movementAlert]);
  useEffect(() => {
  calculateDangerScore();
}, [isNight, places, placesLoading, location, ghostMode, savedContacts, lastForce,movementAlert]);
 const getTripInterval = () => {
  if (riskLevel === 'HIGH') return 60;
  if (riskLevel === 'MODERATE') return 300;
  return 900;
};
  useEffect(() => {
  if (!tripMode || tripAlertVisible) return;

  const intervalTime = getTripInterval();

  setTripCheckTime(intervalTime);

  let timer = intervalTime;

  const interval = setInterval(() => {
    timer -= 1;
    setTripCheckTime(timer);

    if (timer <= 0) {
      clearInterval(interval);

      if (riskLevel === 'HIGH') {
        setTripAlertVisible(true);
      } else if (riskLevel === 'MODERATE') {
        Alert.alert(
          'Safety Reminder',
          'ROADSoS noticed moderate risk nearby. Stay alert.'
        );
      }

      timer = intervalTime;
    }
  }, 1000);

  return () => clearInterval(interval);
}, [tripMode, tripAlertVisible, riskLevel]);
const formatTripTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
  const calculateDangerScore = () => {
    let score = 0;
    const reasons: string[] = [];

    if (isNight) {
      score += 25;
      reasons.push('Night-time travel detected');
    }

    const nearbyHospitals = places.filter((place) => place.type === 'hospital').length;
const nearbyPolice = places.filter((place) => place.type === 'police').length;

if (!placesLoading) {
  if (nearbyHospitals === 0) {
    score += 15;
    reasons.push('No nearby hospital found');
  }

  if (nearbyPolice === 0) {
    score += 15;
    reasons.push('No nearby police help found');
  }
} else {
  reasons.push('Nearby safety places loading...');
}

    const speedKmh = location?.coords?.speed
      ? Math.max(0, location.coords.speed * 3.6)
      : 0;

    if (speedKmh > 90) {
      score += 20;
      reasons.push('High-speed movement detected');
    }

    if (ghostMode) {
      score += 25;
      reasons.push('Ghost Mode activated by user');
    }
if (lastForce >= 3.2) {
  score += 25;
  reasons.push("Possible crash-level movement detected");
} else if (lastForce >= 2.4 && movementAlert) {
  score += 10;
  reasons.push("Temporary abnormal phone movement detected");
}

    if (savedContacts.length === 0) {
      score += 10;
      reasons.push('No emergency contacts saved');
    }

    const finalScore = Math.min(score, 100);

    setRiskScore(finalScore);

    if (finalScore >= 70) {
      setRiskLevel('HIGH');
    } else if (finalScore >= 35) {
      setRiskLevel('MODERATE');
    } else {
      setRiskLevel('LOW');
    }

    setRiskReasons(reasons);
  };

  const updateThemeBySunset = (lat: number, lon: number) => {
    const times = SunCalc.getTimes(new Date(), lat, lon);
    const now = new Date();
    setIsNight(now < times.sunrise || now > times.sunset);
  };

  const getLocationAndPlaces = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setMessage('Location permission denied');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

      updateThemeBySunset(loc.coords.latitude, loc.coords.longitude);
      await fetchNearbyPlaces(loc.coords.latitude, loc.coords.longitude);
    } catch (error) {
      console.log(error);
      setMessage('Failed loading app');
    }
  };

  const fetchNearbyPlaces = async (lat: number, lon: number) => {
  try {
    setPlacesLoading(true);

    const response = await axios.get(`${BASE_URL}/nearby?lat=${lat}&lon=${lon}`, {
      timeout: 7000,
    });

    setPlaces(response.data.places || []);
  } catch (error) {
    console.log('NEARBY PLACES ERROR:', error);
    setPlaces([]);
  } finally {
    setPlacesLoading(false);
  }
};

  const getLocalBotReply = (text: string) => {
    const lower = text.toLowerCase().trim();
    const hasAny = (words: string[]) => words.some((word) => lower.includes(word));

    const addLocationLine = location
      ? '\n\nShare your location now: ' +
        `https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`
      : '\n\nTurn on GPS/location sharing if possible.';

    if (!lower) {
      return 'Tell me what happened in simple words. Example: “bike accident”, “person unconscious”, “heavy bleeding”, “car breakdown”, or “I feel unsafe”.';
    }

    if (hasAny(['hello', 'hi', 'hey'])) {
      return 'Hi, I am ROADSoS AI. I can help with accident response, first aid, road safety, breakdowns, unsafe situations, and SOS steps. What happened?';
    }

    if (hasAny(['112', 'ambulance', 'police', 'emergency number'])) {
      return 'In India, call 112 for emergency help. If there is injury, unconsciousness, heavy bleeding, fire, or danger, call immediately and share your exact location.' + addLocationLine;
    }

    if (hasAny(['unconscious', 'not conscious', 'fainted', 'passed out', 'not responding'])) {
      return 'This is serious.\n\n1. Call 112 immediately.\n2. Check if the person is breathing.\n3. Do not give food or water.\n4. Do not shake them aggressively.\n5. If they are breathing, keep them on their side if safe.\n6. If not breathing and you know CPR, start CPR.\n\nTell me: are they breathing?';
    }

    if (hasAny(['not breathing', 'no breathing', 'stopped breathing', 'breathless'])) {
      return 'Call 112 now. This is life-threatening.\n\n1. Lay the person flat on a firm surface.\n2. Check airway for blockage.\n3. If trained, start CPR: hard and fast chest compressions.\n4. Ask someone nearby to find an AED if available.\n5. Continue until help arrives.\n\nDo not delay emergency call.';
    }

    if (hasAny(['bleeding', 'blood', 'cut', 'wound', 'injury'])) {
      return 'For bleeding:\n\n1. Apply firm pressure using clean cloth/gauze.\n2. Keep pressure continuous for 10 minutes.\n3. Raise the injured part if possible.\n4. Do not remove deeply stuck objects.\n5. Call 112 if bleeding is heavy, spurting, or not stopping.\n\nIs the bleeding heavy or minor?';
    }

    if (hasAny(['helmet', 'head injury', 'head hit', 'skull', 'brain'])) {
      return 'Possible head/neck injury:\n\n1. Do NOT remove helmet after a crash unless breathing is blocked.\n2. Keep the person still.\n3. Call 112.\n4. Watch for vomiting, confusion, sleepiness, bleeding from nose/ear.\n5. Avoid moving the neck.\n\nTell me if the person is conscious and breathing.';
    }

    if (hasAny(['fracture', 'broken bone', 'bone', 'leg broken', 'arm broken'])) {
      return 'Possible fracture:\n\n1. Do not force the limb straight.\n2. Keep it still using cloth/cardboard support.\n3. Apply cold pack if available.\n4. Do not let the person walk if leg/spine injury is possible.\n5. Call ambulance if pain is severe or limb looks deformed.';
    }

    if (hasAny(['burn', 'fire', 'blast', 'smoke'])) {
      return 'For burns/fire:\n\n1. Move away from fire/smoke if safe.\n2. Cool burn under clean running water for 20 minutes.\n3. Do not apply toothpaste/oil/ice.\n4. Cover with clean cloth.\n5. Call 112 for large burns, face burns, or breathing trouble.';
    }

    if (hasAny(['accident', 'crash', 'collision', 'hit', 'bike fell', 'car hit', 'scooter', 'road accident'])) {
      return 'Road accident steps:\n\n1. Move yourself to safety first.\n2. Turn on hazard lights / warn traffic.\n3. Call 112 if anyone is injured.\n4. Do not move badly injured people unless there is fire or traffic danger.\n5. Share location with contacts.\n6. Check: conscious, breathing, bleeding.\n\nTell me which one is true: unconscious / bleeding / breathing problem / minor injury.' + addLocationLine;
    }

    if (hasAny(['unsafe', 'following me', 'stalking', 'road rage', 'angry driver', 'threat', 'scared'])) {
      return 'If you feel unsafe:\n\n1. Do not argue or confront.\n2. Move to a crowded, well-lit place.\n3. Call 112 if threatened.\n4. Share live location with trusted contact.\n5. Use Fake Call if you need an excuse to leave.\n6. Note vehicle number if safe.\n\nDo you want to send SOS to contacts?';
    }

    if (hasAny(['breakdown', 'puncture', 'flat tyre', 'flat tire', 'engine', 'battery', 'fuel', 'petrol', 'diesel', 'ev charge', 'charging'])) {
      return 'Vehicle breakdown steps:\n\n1. Park at the left side/shoulder if possible.\n2. Turn on hazard lights.\n3. Stay away from moving traffic.\n4. Use ROAD HELP for tow, mechanic, fuel, or EV charging.\n5. Share location with assistance contact.\n\nTell me your issue: tyre / battery / fuel / engine / EV charge.';
    }

    if (hasAny(['cpr', 'compressions'])) {
      return 'CPR basics if trained:\n\n1. Call 112 first or ask someone else to call.\n2. Place hands in center of chest.\n3. Push hard and fast, about 100–120 compressions/min.\n4. Let chest rise fully between pushes.\n5. Continue until ambulance arrives or person breathes.\n\nUse CPR only when the person is not breathing normally.';
    }

    if (hasAny(['what should i do', 'help me', 'help', 'urgent'])) {
      return 'I can help, but I need one detail first.\n\nChoose one:\n1. Accident/crash\n2. Unconscious person\n3. Bleeding\n4. Breathing problem\n5. Vehicle breakdown\n6. Feeling unsafe\n\nIf there is immediate danger, call 112 now.';
    }

    if (hasAny(['thank', 'thanks'])) {
      return 'You are welcome. Stay calm, keep yourself safe first, and call 112 if there is any serious risk.';
    }

    return 'I need a bit more detail to guide you safely.\n\nTell me:\n1. What happened?\n2. Is anyone unconscious?\n3. Are they breathing?\n4. Is there bleeding?\n5. Are you in a safe place?\n\nIf it is serious, call 112 immediately.';
  };

  const sendChatMessage = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;

    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', text }]);

    const instantReply = getLocalBotReply(text);
    setChatMessages((prev) => [...prev, { role: 'bot', text: instantReply }]);

    try {
      setChatLoading(true);

      const response = await axios.post(
        `${BASE_URL}/chat`,
        {
          message: text,
          app_context:
            'You are ROADSoS AI, a concise emergency road-safety assistant. Give practical step-by-step advice. For serious injury, tell user to call 112. Do not give long explanations.',
          location: location
            ? {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }
            : null,
        },
        { timeout: 2500 }
      );

      if (response?.data?.reply && response.data.reply !== instantReply) {
        setChatMessages((prev) => [...prev, { role: 'bot', text: response.data.reply }]);
      }
    } catch (error: any) {
      console.log('CHAT ERROR:', error?.message, error?.response?.data);
    } finally {
      setChatLoading(false);
    }
  };

  const loadEmergencyContacts = async () => {
    try {
      const contacts = await AsyncStorage.getItem('emergency_contacts');
      if (contacts) setSavedContacts(JSON.parse(contacts));
    } catch {
      setSavedContacts([]);
    }
  };

  const saveEmergencyContact = async () => {
    const rawNumber = emergencyContact.replace(/[^0-9]/g, '').trim();

    if (!rawNumber) {
      Alert.alert('Missing number', 'Please enter a phone number.');
      return;
    }

    const fullContact = `${selectedCountry.code}${rawNumber}`;
    const updated = Array.from(new Set([...savedContacts, fullContact]));

    await AsyncStorage.setItem('emergency_contacts', JSON.stringify(updated));

    setSavedContacts(updated);
    setEmergencyContact('');
    Alert.alert('Saved', `Emergency contact added: ${fullContact}`);
  };

  const deleteEmergencyContact = async (contact: string) => {
    const updated = savedContacts.filter((item) => item !== contact);
    await AsyncStorage.setItem('emergency_contacts', JSON.stringify(updated));
    setSavedContacts(updated);
  };

  const loadVehicleProfile = async () => {
    try {
      const saved = await AsyncStorage.getItem('vehicle_profile');
      if (!saved) return;

      const parsed = JSON.parse(saved);
      setVehicleNumber(parsed.vehicleNumber || '');
      setVehicleType(parsed.vehicleType || 'Car');
      setFuelType(parsed.fuelType || 'Petrol');
    } catch {
      console.log('Vehicle profile load failed');
    }
  };

  const saveVehicleProfile = async () => {
    const profile = { vehicleNumber, vehicleType, fuelType };
    await AsyncStorage.setItem('vehicle_profile', JSON.stringify(profile));
    Alert.alert('Saved', 'Vehicle profile updated');
  };

  const loadDrivingLicense = async () => {
    try {
      const saved = await AsyncStorage.getItem('driving_license');
      if (!saved) return;

      const parsed = JSON.parse(saved);
      setLicenseNumber(parsed.licenseNumber || '');
      setLicenseHolderName(parsed.licenseHolderName || '');
      setLicenseValidTill(parsed.licenseValidTill || '');
      setLicenseLinked(Boolean(parsed.licenseLinked));
    } catch {
      console.log('Driving license load failed');
    }
  };

  const saveDrivingLicense = async () => {
    if (!licenseNumber.trim() || !licenseHolderName.trim()) {
      Alert.alert('Missing details', 'Please enter license number and holder name.');
      return;
    }

    const license = {
      licenseNumber: licenseNumber.trim().toUpperCase(),
      licenseHolderName: licenseHolderName.trim(),
      licenseValidTill: licenseValidTill.trim(),
      licenseLinked: true,
    };

    await AsyncStorage.setItem('driving_license', JSON.stringify(license));
    setLicenseNumber(license.licenseNumber);
    setLicenseHolderName(license.licenseHolderName);
    setLicenseValidTill(license.licenseValidTill);
    setLicenseLinked(true);

    Alert.alert('License Linked', 'Driving license saved locally in ROADSoS.');
  };

  const unlinkDrivingLicense = async () => {
    await AsyncStorage.removeItem('driving_license');
    setLicenseNumber('');
    setLicenseHolderName('');
    setLicenseValidTill('');
    setLicenseLinked(false);
    Alert.alert('Removed', 'Driving license removed from this app.');
  };

  const openLicenseVerification = () => {
    Alert.alert('Verify License', 'Choose a verification option', [
      { text: 'DigiLocker', onPress: () => Linking.openURL('https://www.digilocker.gov.in/') },
      { text: 'Parivahan', onPress: () => Linking.openURL('https://parivahan.gov.in/') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const loadMedicalVault = async () => {
    try {
      const saved = await AsyncStorage.getItem('medical_vault');
      if (!saved) return;

      const parsed = JSON.parse(saved);
      setBloodType(parsed.bloodType || '');
      setAllergies(parsed.allergies || '');
      setMedications(parsed.medications || '');
      setMedicalConditions(parsed.medicalConditions || '');
      setPrimaryContactName(parsed.primaryContactName || '');
      setPrimaryContactPhone(parsed.primaryContactPhone || '');
    } catch {
      console.log('Medical vault load failed');
    }
  };

  const saveMedicalVault = async () => {
    const vault = {
      bloodType,
      allergies,
      medications,
      medicalConditions,
      primaryContactName,
      primaryContactPhone,
    };

    await AsyncStorage.setItem('medical_vault', JSON.stringify(vault));
    Alert.alert('Saved', 'Medical Vault updated locally');
  };

  const startFakeCall = () => setFakeCallActive(true);

  const activateGhostMode = async () => {
    setGhostMode(true);

    try {
      const shareMessage = location
        ? `⚠️ Ghost Mode Activated\n\nI may feel unsafe.\nPlease track my location:\nhttps://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`
        : '⚠️ Ghost Mode Activated. I may feel unsafe.';

      await Share.share({ message: shareMessage });
    } catch (error) {
      console.log(error);
    }
  };

  const startVoiceSOS = () => {
    setVoiceSOSActive(true);

    setTimeout(() => {
      setVoiceSOSActive(false);
      Alert.alert('Voice SOS Detected', 'Keyword “Help” detected. Opening SOS actions.', [
        { text: 'Open SOS', onPress: handleSOS },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }, 1800);
  };

  const startFlashlight = () => setFlashlightActive((prev) => !prev);

  const toggleHeroMode = () => {
    const next = !heroMode;
    setHeroMode(next);

    if (next) {
      setHeroAlert(true);
      setTimeout(() => setHeroAlert(false), 5000);
    }
  };

  const requestAssistance = async (serviceType: string) => {
    const mapSearches: Record<string, string> = {
      mechanic: 'mechanic+near+me',
      towing: 'tow+truck+near+me',
      fuel: 'petrol+pump+near+me',
      charging: 'EV+charging+station+near+me',
    };

    if (mapSearches[serviceType]) {
      Linking.openURL(`https://www.google.com/maps/search/${mapSearches[serviceType]}`);
    }

    if (!location) {
      Alert.alert('Location unavailable', 'Please enable GPS first');
      return;
    }

    const payload = {
      serviceType,
      vehicleNumber,
      vehicleType,
      fuelType,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    try {
      const response = await axios.post(`${BASE_URL}/assistance`, payload, { timeout: 8000 });
      Alert.alert('Request Sent', response?.data?.message || 'Assistance request created successfully.');
    } catch (error: any) {
      console.log('ASSISTANCE ERROR:', error?.message, error?.response?.data);
      Alert.alert(
        'Request Failed',
        error?.response?.data?.detail || error?.message || 'Backend not reachable. Check BASE_URL, WiFi, and FastAPI host.'
      );
    }
  };

  const createEmergencyMessage = () => {
    if (!location) return 'Emergency! I need help. Sent via ROADSoS';

    const lat = location.coords.latitude;
    const lon = location.coords.longitude;

    return `🚨 Emergency!\n\nI need help. My location:\nhttps://maps.google.com/?q=${lat},${lon}\n\nVehicle: ${vehicleNumber || 'Not added'}\nType: ${vehicleType} / ${fuelType}\nDriving License: ${licenseLinked ? licenseNumber : 'Not linked'}\n\nBlood Type: ${bloodType || 'Not added'}\nAllergies: ${allergies || 'Not added'}\nMedical Conditions: ${medicalConditions || 'Not added'}\n\nSent via ROADSoS`;
  };

  const createPoliceMessage = () => {
    if (!location) return 'Police help needed. I may be in danger. Sent via ROADSoS Police Connect';

    const lat = location.coords.latitude;
    const lon = location.coords.longitude;

    return `🚨 Police Help Needed\n\nI may be in danger / need urgent help.\n\nMy location:\nhttps://maps.google.com/?q=${lat},${lon}\n\nVehicle: ${vehicleNumber || 'Not added'}\nType: ${vehicleType} / ${fuelType}\nDriving License: ${licenseLinked ? licenseNumber : 'Not linked'}\n\nSent via ROADSoS Police Connect`;
  };

  const openWhatsAppSOS = () => {
    if (savedContacts.length === 0) {
      Alert.alert('No contacts saved', 'Add emergency contacts first.');
      return;
    }

    const phone = savedContacts[0].replace(/[^0-9]/g, '');
    const text = encodeURIComponent(createEmergencyMessage());
    Linking.openURL(`https://wa.me/${phone}?text=${text}`);
  };

  const sharePoliceSOS = async () => {
    await Share.share({ message: createPoliceMessage() });
  };

  const sendPoliceSMSToContacts = () => {
    if (savedContacts.length === 0) {
      Alert.alert('No contacts saved', 'Add emergency contacts first.');
      return;
    }

    const separator = Platform.OS === 'ios' ? '&' : '?';
    const phoneList = savedContacts.join(',');
    const body = encodeURIComponent(createPoliceMessage());

    Linking.openURL(`sms:${phoneList}${separator}body=${body}`);
  };

  const openPoliceConnect = () => {
    Alert.alert('Police Connect', 'Choose police help action', [
      { text: 'Call 112', onPress: () => Linking.openURL('tel:112') },
      { text: 'Share Police SOS', onPress: sharePoliceSOS },
      { text: 'SMS Contacts', onPress: sendPoliceSMSToContacts },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const sendSMSAll = () => {
    if (savedContacts.length === 0) {
      Alert.alert('No contacts saved', 'Add emergency contacts first.');
      return;
    }

    const separator = Platform.OS === 'ios' ? '&' : '?';
    const phoneList = savedContacts
      .map((contact) => contact.replace(/[^0-9+]/g, ''))
      .join(',');
    const body = encodeURIComponent(createEmergencyMessage());

    Linking.openURL(`sms:${phoneList}${separator}body=${body}`);
  };

  const handleSOS = () => {
    if (savedContacts.length === 0) {
      Alert.alert(
        'No Emergency Contacts',
        'Please add at least one emergency contact first.'
      );
      return;
    }

    const allPhones = savedContacts
      .map((contact) => contact.replace(/[^0-9+]/g, ''))
      .join(',');

    const message = encodeURIComponent(createEmergencyMessage());

    Alert.alert('ROADSoS Emergency', 'Choose SOS action', [
      {
        text: 'Call 112',
        onPress: () => Linking.openURL('tel:112'),
      },

      {
        text: 'SMS All Emergency Contacts',
        onPress: sendSMSAll,
      },

      {
        text: 'WhatsApp Emergency Contacts',
        onPress: () => {
          const whatsappText = encodeURIComponent(
            `${createEmergencyMessage()}

Emergency Contacts:
{savedContacts.join('
')}`
          );

          Linking.openURL(
            `https://wa.me/?text=${whatsappText}`
          );
        },
      },

      {
        text: 'Share with More People',
        onPress: async () =>
          Share.share({
            message: createEmergencyMessage(),
          }),
      },

      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const triggerAccidentMode = () => {
    if (accidentDetected || accidentIntervalRef.current) return;

    setAccidentDetected(true);
    setCountdown(10);

    let timer = 10;

    accidentIntervalRef.current = setInterval(() => {
      timer -= 1;
      setCountdown(timer);

      if (timer <= 0) {
        if (accidentIntervalRef.current) {
          clearInterval(accidentIntervalRef.current);
          accidentIntervalRef.current = null;
        }

        setAccidentDetected(false);
        handleSOS();
      }
    }, 1000);
  };

  const cancelAccidentAlert = () => {
    if (accidentIntervalRef.current) {
      clearInterval(accidentIntervalRef.current);
      accidentIntervalRef.current = null;
    }

    setAccidentDetected(false);
    setCountdown(10);
  };

  const openAdInfo = () => {
    Alert.alert(
      'Sponsored Safety Partner',
      'Use this space for AdMob banner ads or partner ads. Keep ads away from SOS emergency actions.'
    );
  };

  const openFleetForm = () => Linking.openURL('https://forms.gle/HGtRtNeqQxbiAfiT7');
  const openACKO = () => Linking.openURL('https://www.acko.com/');
  const openHDFC = () => Linking.openURL('https://www.hdfcergo.com/');
  const openICICI = () => Linking.openURL('https://www.icicilombard.com/');
  const openDigit = () => Linking.openURL('https://www.godigit.com/');

  const renderPanelContent = () => {
    if (panel === "chatbot") {
  return (
    <ChatbotPanel
      messages={chatMessages}
      input={chatInput}
      setInput={setChatInput}
      onSend={sendChatMessage}
      chatLoading={chatLoading}
      panelTheme={panelTheme}
      theme={theme}
      isNight={isNight}
    />
  );
}

   if (panel === "contacts") {
  return (
    <ContactsPanel
      panelTheme={panelTheme}
      inputStyle={inputStyle}
      countryCodes={countryCodes}
      selectedCountry={selectedCountry}
      showCountryDropdown={showCountryDropdown}
      emergencyContact={emergencyContact}
      savedContacts={savedContacts}
      setSelectedCountry={setSelectedCountry}
      setShowCountryDropdown={setShowCountryDropdown}
      setEmergencyContact={setEmergencyContact}
      saveEmergencyContact={saveEmergencyContact}
      deleteEmergencyContact={deleteEmergencyContact}
    />
  );
}

    if (panel === 'assist') {
      return (
        <>
          <Text style={{ color: panelTheme.text, fontSize: 24, fontWeight: '900' }}>Roadside Assistance</Text>
          <Text style={{ color: panelTheme.sub, marginTop: 4 }}>Pick the issue and ROADSoS will prepare a location-aware request.</Text>

          {assistanceOptions.map((item) => (
            <TouchableOpacity
              key={item.type}
              activeOpacity={0.86}
              onPress={() => requestAssistance(item.type)}
              style={{ backgroundColor: panelTheme.chip, padding: 16, borderRadius: 20, marginTop: 12, flexDirection: 'row', alignItems: 'center' }}
            >
              <Text style={{ fontSize: 28, marginRight: 14 }}>{item.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: panelTheme.text, fontSize: 16, fontWeight: '900' }}>{item.title}</Text>
                <Text style={{ color: panelTheme.sub, marginTop: 3 }}>{item.desc}</Text>
              </View>
              <Text style={{ color: '#38BDF8', fontWeight: '900' }}>SEND</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity activeOpacity={0.86} onPress={openWhatsAppSOS} style={{ backgroundColor: '#16A34A', padding: 16, borderRadius: 20, marginTop: 14 }}>
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: '900' }}>Send WhatsApp SOS to First Contact</Text>
          </TouchableOpacity>
        </>
      );
    }

    if (panel === 'vehicle') {
      return (
        <>
          <Text style={{ color: panelTheme.text, fontSize: 24, fontWeight: '900' }}>Vehicle Profile</Text>
          <Text style={{ color: panelTheme.sub, marginTop: 4 }}>These details get attached to SOS and roadside help requests.</Text>

          <TextInput
            placeholder="Vehicle number e.g. DL 01 AB 1234"
            placeholderTextColor={panelTheme.sub}
            value={vehicleNumber}
            onChangeText={setVehicleNumber}
            autoCapitalize="characters"
            style={inputStyle}
          />

          <Text style={{ color: panelTheme.text, fontWeight: '900', marginTop: 14 }}>Vehicle Type</Text>
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            {['Bike', 'Car', 'Truck'].map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setVehicleType(item)}
                style={{
                  backgroundColor: vehicleType === item ? '#2563EB' : theme.chip,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 16,
                  marginRight: 8,
                }}
              >
                <Text style={{ color: vehicleType === item ? 'white' : theme.text, fontWeight: '900' }}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ color: panelTheme.text, fontWeight: '900', marginTop: 14 }}>Fuel Type</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
            {['Petrol', 'Diesel', 'CNG', 'EV'].map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setFuelType(item)}
                style={{
                  backgroundColor: fuelType === item ? '#059669' : theme.chip,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 16,
                  marginRight: 8,
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: fuelType === item ? 'white' : theme.text, fontWeight: '900' }}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={saveVehicleProfile} style={{ backgroundColor: '#111827', padding: 16, borderRadius: 18, marginTop: 10 }}>
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: '900' }}>Save Vehicle</Text>
          </TouchableOpacity>
        </>
      );
    }

    if (panel === 'license') {
      return (
        <>
          <Text style={{ color: 'white', fontSize: 24, fontWeight: '900' }}>Driving License</Text>
          <Text style={{ color: '#CBD5E1', marginTop: 4 }}>Link license details locally for emergency identity and police help.</Text>

          <View style={{ backgroundColor: 'rgba(15,23,42,0.96)', padding: 18, borderRadius: 24, marginTop: 16 }}>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '900' }}>{licenseLinked ? 'License Linked' : 'License Not Linked'}</Text>

            <TextInput placeholder="License holder name" placeholderTextColor="#94A3B8" value={licenseHolderName} onChangeText={setLicenseHolderName} style={[inputStyle, { backgroundColor: '#111827', color: 'white' }]} />
            <TextInput placeholder="Driving license number" placeholderTextColor="#94A3B8" value={licenseNumber} onChangeText={setLicenseNumber} autoCapitalize="characters" style={[inputStyle, { backgroundColor: '#111827', color: 'white' }]} />
            <TextInput placeholder="Valid till e.g. 2032-05-20" placeholderTextColor="#94A3B8" value={licenseValidTill} onChangeText={setLicenseValidTill} style={[inputStyle, { backgroundColor: '#111827', color: 'white' }]} />

            <TouchableOpacity onPress={saveDrivingLicense} style={{ backgroundColor: '#2563EB', padding: 16, borderRadius: 18, marginTop: 14 }}>
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: '900' }}>Link Driving License</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={openLicenseVerification} style={{ backgroundColor: '#111827', padding: 14, borderRadius: 18, marginTop: 10 }}>
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: '900' }}>Verify with DigiLocker / Parivahan</Text>
            </TouchableOpacity>

            {licenseLinked && (
              <TouchableOpacity onPress={unlinkDrivingLicense} style={{ padding: 14, borderRadius: 18, marginTop: 10 }}>
                <Text style={{ color: '#FCA5A5', textAlign: 'center', fontWeight: '900' }}>Remove License</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      );
    }
if (panel === "vault") {
  return (
    <MedicalVault
      inputStyle={inputStyle}
      bloodType={bloodType}
      allergies={allergies}
      medications={medications}
      medicalConditions={medicalConditions}
      primaryContactName={primaryContactName}
      primaryContactPhone={primaryContactPhone}
      setBloodType={setBloodType}
      setAllergies={setAllergies}
      setMedications={setMedications}
      setMedicalConditions={setMedicalConditions}
      setPrimaryContactName={setPrimaryContactName}
      setPrimaryContactPhone={setPrimaryContactPhone}
      saveMedicalVault={saveMedicalVault}
    />
  );
}
    if (panel === 'hero') {
      return (
        <>
          <Text style={{ color: 'white', fontSize: 24, fontWeight: '900' }}>Bystander ARMY</Text>
          <Text style={{ color: '#CBD5E1', marginTop: 4 }}>Nearby distress signals seeking assistance.</Text>

          <TouchableOpacity onPress={toggleHeroMode} style={{ backgroundColor: heroMode ? '#16A34A' : '#DC2626', paddingVertical: 12, borderRadius: 16, marginTop: 14, alignItems: 'center' }}>
            <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>{heroMode ? 'Bystander ARMY Active' : 'Join Bystander ARMY'}</Text>
          </TouchableOpacity>

          <View style={{ backgroundColor: 'rgba(15,23,42,0.96)', padding: 22, borderRadius: 24, marginTop: 18, alignItems: 'center' }}>
            <Text style={{ fontSize: 46 }}>🛡️</Text>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '900', marginTop: 10 }}>{heroMode ? 'Bystander ARMY Active' : 'Not joined'}</Text>
            <Text style={{ color: '#94A3B8', textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
              {heroMode ? 'You can now receive nearby emergency alerts and help people around you.' : 'Join Bystander ARMY to see live emergency alerts in your vicinity.'}
            </Text>
          </View>
        </>
      );
    }

    if (panel === 'police') {
      return (
        <>
          <Text style={{ color: 'white', fontSize: 24, fontWeight: '900' }}>Police Connect 🚓</Text>
          <Text style={{ color: '#CBD5E1', marginTop: 4 }}>Fast police-help actions. For real emergencies, call 112 first.</Text>

          <TouchableOpacity onPress={openPoliceConnect} style={{ backgroundColor: '#2563EB', padding: 16, borderRadius: 18, marginTop: 16 }}>
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: '900' }}>Open Police SOS Actions</Text>
          </TouchableOpacity>

          <View style={{ backgroundColor: 'rgba(15,23,42,0.96)', padding: 18, borderRadius: 24, marginTop: 14 }}>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '900' }}>Police SOS Message Preview</Text>
            <Text style={{ color: '#CBD5E1', marginTop: 10, lineHeight: 21 }}>{createPoliceMessage()}</Text>
          </View>
        </>
      );
    }

    if (panel === 'fleet') {
      return (
        <>
          <Text style={{ color: 'white', fontSize: 24, fontWeight: '900' }}>Fleet Safety 🚛</Text>
          <Text style={{ color: '#CBD5E1', marginTop: 4 }}>Partner with ROADSoS for driver safety and roadside support.</Text>

          <View style={{ backgroundColor: 'rgba(15,23,42,0.96)', padding: 18, borderRadius: 24, marginTop: 18 }}>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '900' }}>For Logistics & Delivery Fleets</Text>
            <Text style={{ color: '#CBD5E1', marginTop: 10, lineHeight: 24 }}>
              • Driver SOS alerts{`\n`}• Accident detection{`\n`}• Towing and mechanic support{`\n`}• Fuel and EV help{`\n`}• Medical Vault for drivers{`\n`}• Police Connect and live location
            </Text>
          </View>

          <TouchableOpacity onPress={openFleetForm} style={{ backgroundColor: '#0EA5E9', padding: 16, borderRadius: 18, marginTop: 16 }}>
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: '900' }}>Request Fleet Integration</Text>
          </TouchableOpacity>
        </>
      );
    }

    if (panel === 'insurance') {
      return (
        <>
          <Text style={{ color: 'white', fontSize: 24, fontWeight: '900' }}>Insurance Partners 🛡️</Text>
          <Text style={{ color: '#CBD5E1', marginTop: 4 }}>Explore accident and roadside protection partners.</Text>

          {[
            { name: 'ACKO Insurance', action: openACKO },
            { name: 'HDFC ERGO', action: openHDFC },
            { name: 'ICICI Lombard', action: openICICI },
            { name: 'Digit Insurance', action: openDigit },
          ].map((item) => (
            <TouchableOpacity key={item.name} onPress={item.action} style={{ backgroundColor: 'rgba(15,23,42,0.96)', padding: 18, borderRadius: 22, marginTop: 14 }}>
              <Text style={{ color: 'white', fontSize: 17, fontWeight: '900' }}>{item.name}</Text>
              <Text style={{ color: '#94A3B8', marginTop: 6 }}>Accident coverage and roadside assistance</Text>
            </TouchableOpacity>
          ))}
        </>
      );
    }

   if (panel === "risk") {
  return (
    <RiskFullPanel
      panelTheme={panelTheme}
      riskScore={riskScore}
      riskLevel={riskLevel}
      riskReasons={riskReasons}
      lastForce={lastForce}
      savedContacts={savedContacts}
      ghostMode={ghostMode}
      handleSOS={handleSOS}
    />
  );
}
if (panel === 'calculator') {
  const buttons = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '-', '0', 'C', '=', '+'];

  return (
    <>
      <Text style={{ color: 'white', fontSize: 24, fontWeight: '900' }}>Calculator</Text>

      <View style={{ backgroundColor: '#020617', padding: 18, borderRadius: 24, marginTop: 18 }}>
        <Text style={{ color: 'white', fontSize: 34, textAlign: 'right', fontWeight: '800' }}>
          {calculatorInput || '0'}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 14 }}>
        {buttons.map((btn) => (
          <TouchableOpacity
            key={btn}
            onPress={() => handleCalculatorPress(btn)}
            style={{
              width: '23%',
              margin: '1%',
              backgroundColor: '#1E293B',
              paddingVertical: 18,
              borderRadius: 18,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontSize: 22, fontWeight: '900' }}>{btn}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}
  if (panel === 'safety') {
  return (
    <View style={{ paddingBottom: 80 }}>
      <Text style={{ color: panelTheme.text, fontSize: 24, fontWeight: '900' }}>
        Safety Hub
      </Text>

      <Text style={{ color: panelTheme.sub, marginTop: 4 }}>
        Quick safety tools, covert triggers, and emergency guidance.
      </Text>

      <View style={{ backgroundColor: 'rgba(15,23,42,0.96)', padding: 16, borderRadius: 22, marginTop: 14 }}>
        <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>
          Safety Tools
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
          <TouchableOpacity onPress={startFakeCall} style={{ width: '31%', backgroundColor: '#111827', padding: 12, borderRadius: 18, alignItems: 'center' }}>
            <Text style={{ fontSize: 24 }}>☎️</Text>
            <Text style={{ color: 'white', marginTop: 6, fontSize: 11, fontWeight: '900' }}>Fake Call</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={startVoiceSOS} style={{ width: '31%', backgroundColor: '#111827', padding: 12, borderRadius: 18, alignItems: 'center' }}>
            <Text style={{ fontSize: 24 }}>🎙️</Text>
            <Text style={{ color: 'white', marginTop: 6, fontSize: 11, fontWeight: '900' }}>Voice SOS</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={startFlashlight} style={{ width: '31%', backgroundColor: '#111827', padding: 12, borderRadius: 18, alignItems: 'center' }}>
            <Text style={{ fontSize: 24 }}>🔦</Text>
            <Text style={{ color: 'white', marginTop: 6, fontSize: 11, fontWeight: '900' }}>Flashlight</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => setPanel('calculator')}
          style={{
            backgroundColor: '#020617',
            padding: 15,
            borderRadius: 18,
            marginTop: 14,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.12)',
          }}
        >
          <Text style={{ color: 'white', fontWeight: '900' }}>
            🧮 Calculator SafeTrigger
          </Text>
          <Text style={{ color: '#94A3B8', marginTop: 4, fontSize: 12 }}>
            Opens fake calculator for hidden SOS
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ backgroundColor: panelTheme.chip, padding: 16, borderRadius: 20, marginTop: 14 }}>
        <Text style={{ color: panelTheme.text, fontWeight: '900', fontSize: 18 }}>
          🕶️ Covert SOS Triggers
        </Text>

        <Text style={{ color: panelTheme.sub, marginTop: 8, lineHeight: 24 }}>
          • Secret tap pattern{`\n`}
          • Fake calculator PIN{`\n`}
          • Hidden voice keyword{`\n`}
          • Smartwatch gesture support later{`\n`}
          • Invisible emergency activation
        </Text>
      </View>

      <View style={{ backgroundColor: panelTheme.chip, padding: 16, borderRadius: 20, marginTop: 14 }}>
        <Text style={{ color: panelTheme.text, fontWeight: '900', fontSize: 18 }}>
          ⚖️ Road Safety Challan Guide
        </Text>

        <Text style={{ color: panelTheme.sub, marginTop: 8, lineHeight: 24 }}>
          • No helmet: ₹1000 approx{`\n`}
          • No seat belt: ₹500–₹1000 approx{`\n`}
          • Drunk driving: ₹10000 approx{`\n`}
          • Overspeeding: ₹1000–₹2000 approx{`\n`}
          • Mobile use while driving: fine varies locally
        </Text>
      </View>

      <View style={{ backgroundColor: '#059669', padding: 16, borderRadius: 20, marginTop: 14 }}>
        <Text style={{ color: 'white', fontWeight: '900', fontSize: 18 }}>
          ❤️ Life-Saving Reminders
        </Text>

        <Text style={{ color: 'white', marginTop: 8, lineHeight: 24 }}>
          • Call ambulance before moving victim{`\n`}
          • Do not remove helmet after crash{`\n`}
          • Apply pressure on bleeding wounds{`\n`}
          • Keep emergency contacts updated{`\n`}
          • Share live location immediately
        </Text>
      </View>
    </View>
  );
}

    return null;
  };

  if (Platform.OS === 'web') {
    return (
      <View style={{ flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ color: 'white', fontSize: 28, fontWeight: '900' }}>ROADSoS Web</Text>
        <Text style={{ color: '#CBD5E1', textAlign: 'center', marginTop: 12 }}>Mobile app recommended for live GPS and emergency response.</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'white', fontSize: 20, fontWeight: '800' }}>{message}</Text>
      </View>
    );
  }

  const latitude = location.coords.latitude;
  const longitude = location.coords.longitude;

  return (
    <View style={{ flex: 1 }}>
     <MapSection
  location={location}
  places={places}
  isNight={isNight}
  theme={theme}
  lifeMessages={lifeMessages}
  lifeIndex={lifeIndex}
  darkMapStyle={darkMapStyle}
/>


     <RiskShield
  riskScore={riskScore}
  riskLevel={riskLevel}
  theme={theme}
  onOpenRisk={() => setPanel("risk")}
/>
<SOSPanel
  vehicleNumber={vehicleNumber}
  onOpenAssist={() => setPanel("assist")}
  onOpenVehicle={() => setPanel("vehicle")}
  onOpenContacts={() => setPanel("contacts")}
/>



<PanelModal
  visible={Boolean(panel)}
  onClose={() => setPanel(null)}
  panelTheme={panelTheme}
>
  {renderPanelContent()}
</PanelModal>
      {accidentDetected && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={{ position: 'absolute', top: 260, left: 24, right: 24, zIndex: 9999 }}>
          <BlurView intensity={100} tint={theme.glass} style={{ borderRadius: 28, padding: 24, overflow: 'hidden', alignItems: 'center' }}>
            <Text style={{ color: '#EF4444', fontSize: 28, fontWeight: '900' }}>Accident Detected 🚨</Text>
            <Text style={{ color: panelTheme.text, marginTop: 12, fontSize: 20, fontWeight: '800' }}>Sending SOS in {countdown}s</Text>

            <TouchableOpacity onPress={cancelAccidentAlert} style={{ marginTop: 20, backgroundColor: '#22C55E', paddingVertical: 14, paddingHorizontal: 26, borderRadius: 22 }}>
              <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>I AM SAFE</Text>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>
      )}

      {flashlightActive && (
        <TouchableOpacity activeOpacity={1} onPress={() => setFlashlightActive(false)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'white', zIndex: 2000, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#111827', fontSize: 24, fontWeight: '900' }}>Flashlight ON</Text>
          <Text style={{ color: '#475569', marginTop: 8 }}>Tap anywhere to turn off</Text>
        </TouchableOpacity>
      )}

      {fakeCallActive && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#020617', zIndex: 2100, justifyContent: 'space-between', alignItems: 'center', paddingTop: 90, paddingBottom: 70 }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#94A3B8', fontSize: 16 }}>Incoming call</Text>
            <Text style={{ color: 'white', fontSize: 34, fontWeight: '900', marginTop: 10 }}>Mom</Text>
            <Text style={{ color: '#CBD5E1', fontSize: 15, marginTop: 6 }}>Mobile</Text>
          </View>

          <View style={{ width: 118, height: 118, borderRadius: 59, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 48 }}>👤</Text>
          </View>

          <View style={{ flexDirection: 'row', width: '75%', justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={() => setFakeCallActive(false)} style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: '#DC2626', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: 'white', fontSize: 26 }}>✕</Text>
              <Text style={{ color: 'white', fontSize: 10, fontWeight: '900' }}>Decline</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setFakeCallActive(false);
                Alert.alert('Fake Call Active', 'Pretend you are speaking and move to a safer place.');
              }}
              style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: 'white', fontSize: 25 }}>☎</Text>
              <Text style={{ color: 'white', fontSize: 10, fontWeight: '900' }}>Answer</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {voiceSOSActive && (
        <View style={{ position: 'absolute', top: 190, left: 24, right: 24, backgroundColor: 'rgba(15,23,42,0.96)', borderRadius: 28, padding: 24, zIndex: 1900, alignItems: 'center' }}>
          <Text style={{ fontSize: 38 }}>🎙️</Text>
          <Text style={{ color: 'white', fontSize: 22, fontWeight: '900', marginTop: 8 }}>Listening for SOS...</Text>
          <Text style={{ color: '#CBD5E1', marginTop: 8, textAlign: 'center' }}>Demo: detecting emergency keyword</Text>
        
        </View>
      )}
      

      {heroAlert && (
        <TouchableOpacity activeOpacity={0.9} onPress={() => setHeroAlert(false)} style={{ position: 'absolute', top: 335, left: 16, right: 16, backgroundColor: '#7C2D12', borderRadius: 24, padding: 16, zIndex: 1200 }}>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '900' }}>Nearby Alert</Text>
          <Text style={{ color: '#FED7AA', marginTop: 6 }}>Someone 0.8 km away may need help. Open Hero Mode/Bystander ARMY for details.</Text>
        </TouchableOpacity>
      )}

      {movementAlert && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setPanel('risk')}
          style={{
            position: 'absolute',
            top: 405,
            left: 16,
            right: 16,
            backgroundColor: '#991B1B',
            borderRadius: 24,
            padding: 16,
            zIndex: 1250,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.18)',
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '900' }}>
            Movement Anomaly Detected ⚠️
          </Text>
          <Text style={{ color: '#FEE2E2', marginTop: 6, lineHeight: 20 }}>
            ROADSoS noticed unusual movement. Tap to view risk details or send SOS if unsafe.
          </Text>
        </TouchableOpacity>
      )}

      {tripAlertVisible && (
        <View
          style={{
            position: 'absolute',
            top: 240,
            left: 20,
            right: 20,
            backgroundColor: '#7F1D1D',
            borderRadius: 26,
            padding: 24,
            zIndex: 3000,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.18)',
          }}
        >
          <Text style={{ color: 'white', fontSize: 22, fontWeight: '900' }}>
            Safety Check-In 🛡️
          </Text>

          <Text
            style={{
              color: '#FEE2E2',
              textAlign: 'center',
              marginTop: 10,
              lineHeight: 22,
            }}
          >
            ROADSoS is checking if you are safe during your trip.
          </Text>

          <TouchableOpacity
            onPress={() => {
              setTripAlertVisible(false);
              setTripMode(true);
            }}
            style={{
              backgroundColor: '#22C55E',
              paddingVertical: 14,
              paddingHorizontal: 24,
              borderRadius: 18,
              marginTop: 18,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '900' }}>I'M SAFE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSOS}
            style={{
              backgroundColor: '#DC2626',
              paddingVertical: 14,
              paddingHorizontal: 24,
              borderRadius: 18,
              marginTop: 12,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '900' }}>SEND SOS</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        onPress={() => {
          setTripMode((prev) => !prev);
          setTripAlertVisible(false);
        }}
        activeOpacity={0.86}
        style={{
          position: 'absolute',
          bottom: 86,
          right: 16,
          backgroundColor: tripMode ? '#DC2626' : '#2563EB',
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 20,
          zIndex: 1600,
          elevation: 8,
        }}
      >
        <Text style={{ color: 'white', fontWeight: '900', fontSize: 12 }}>
          {tripMode ? 'End Trip' : 'Start Trip'}
        </Text>
        {tripMode && (
          <Text style={{ color: '#DBEAFE', fontWeight: '800', fontSize: 10, marginTop: 2 }}>
            {formatTripTime(tripCheckTime)}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={activateGhostMode} activeOpacity={0.86} style={{ position: 'absolute', top: 335, right: 16, backgroundColor: '#111827', width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
        <Text style={{ fontSize: 26 }}>👻</Text>
        <Text style={{ color: 'white', fontSize: 9, fontWeight: '900' }}>Ghost</Text>
      </TouchableOpacity>

      {ghostMode && (
        <TouchableOpacity activeOpacity={1} onLongPress={() => setGhostMode(false)} delayLongPress={3000} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#87CEEB', zIndex: 2500, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 56 }}>🌤️</Text>
          <Text style={{ color: '#0F172A', fontSize: 24, fontWeight: '900', marginTop: 12 }}>Normal Screen</Text>
          <Text style={{ color: '#334155', marginTop: 8, textAlign: 'center' }}>Long press for 3 seconds to exit Ghost Mode.</Text>
        </TouchableOpacity>
      )}

      <View style={{ position: 'absolute', bottom: 12, left: 0, right: 0 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
          {[
            { label: 'SOS', icon: '🚨', panelKey: null, color: '#DC2626', action: handleSOS },
            { label: 'Help', icon: '🛠️', panelKey: 'assist', color: '#EA580C', action: () => setPanel('assist') },
            { label: 'Contacts', icon: '☎️', panelKey: 'contacts', color: '#DC2626', action: () => setPanel('contacts') },
            { label: 'DL', icon: '🪪', panelKey: 'license', color: '#0F766E', action: () => setPanel('license') },
            { label: 'Vault', icon: '❤️', panelKey: 'vault', color: '#BE123C', action: () => setPanel('vault') },
            { label: 'AI', icon: '🤖', panelKey: 'chatbot', color: '#7C3AED', action: () => setPanel('chatbot') },
            { label: 'Army', icon: '🛡️', panelKey: 'hero', color: '#CA8A04', action: () => setPanel('hero') },
            { label: 'Police', icon: '🚓', panelKey: 'police', color: '#2563EB', action: () => setPanel('police') },
            { label: 'Fleet', icon: '🚛', panelKey: 'fleet', color: '#0EA5E9', action: () => setPanel('fleet') },
            { label: 'Insure', icon: '🛡️', panelKey: 'insurance', color: '#0891B2', action: () => setPanel('insurance') },
            { label: 'Risk', icon: '⚠️', panelKey: 'risk', color: '#B45309', action: () => setPanel('risk') },
            { label: 'Safety', icon: '⚙️', panelKey: 'safety', color: '#475569', action: () => setPanel('safety') },
          ].map((item) => {
            const active = item.panelKey !== null && panel === item.panelKey;

            return (
              <TouchableOpacity
                key={item.label}
                onPress={item.action}
                activeOpacity={0.86}
                style={{
                  backgroundColor: active || item.label === 'SOS' ? item.color : 'rgba(15,23,42,0.96)',
                  width: 50,
                  height: 58,
                  borderRadius: 21,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 10,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.16)',
                  elevation: item.label === 'SOS' ? 9 : 5,
                }}
              >
                <Text style={{ color: 'white', fontSize: 16 }}>{item.icon}</Text>
                <Text style={{ color: 'white', fontSize: 7, marginTop: 3, fontWeight: '900' }}>{item.label}</Text>
              </TouchableOpacity>
              
            );
          })}
        </ScrollView>
      </View>
      {/* FLOATING PREMIUM CALCULATOR */}
<Animated.View
  entering={FadeIn.delay(700)}
  style={{
    position: 'absolute',
    right: 20,
    bottom: 140,
    zIndex: 9999,
    elevation: 30,
  }}
>
  <TouchableOpacity
    activeOpacity={0.9}
    onPress={() => setPanel('calculator')}
    style={{
      width: 74,
      height: 74,
      borderRadius: 37,
      backgroundColor: '#020617',
      justifyContent: 'center',
      alignItems: 'center',

      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.18)',

      shadowColor: '#000',
      shadowOpacity: 0.45,
      shadowRadius: 16,
      shadowOffset: {
        width: 0,
        height: 10,
      },
    }}
  >
    <Text style={{ fontSize: 30 }}>🧮</Text>
  </TouchableOpacity>

  <View
    style={{
      marginTop: 8,
      alignSelf: 'center',
      backgroundColor: 'rgba(2,6,23,0.94)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
    }}
  >
    <Text
      style={{
        color: 'white',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
      }}
    >
      SAFE CALC
    </Text>
  </View>
</Animated.View>
    </View>
  );
}
