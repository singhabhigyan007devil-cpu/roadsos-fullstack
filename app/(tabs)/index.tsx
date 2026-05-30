import {
  createInitialSafetyContext,
  SafetyContext,
  SafetyEvent,
  transitionSafetyState,
} from "@/functions/safetyStateMachine";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Linking, PanResponder, Platform, Animated as RNAnimated,
  Share,
  Text,
  TextInput,
  TouchableOpacity,

  View
} from 'react-native';
import {
  Gesture,
  GestureDetector
} from 'react-native-gesture-handler';
import getRoadRoute from "../../functions/directionsEngine";
const SunCalc = require('suncalc');

import ChatbotPanel from "@/components/home/ChatbotPanel";
import ContactsPanel from "@/components/home/ContactsPanel";
import MapSection from "@/components/home/MapSection";
import MedicalVault from "@/components/home/MedicalVault";
import PanelModal from "@/components/home/PanelModal";
import RiskFullPanel from "@/components/home/RiskFullPanel";
import SOSPanel from "@/components/home/SOSPanel";
import Animated, {
  FadeIn,
  FadeOut,
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
  |'tools'
  | null;

type ChatMessage = {
  role: 'bot' | 'user';
  text: string;
};

const dayMapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#BFC8D2' }],
  },

  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#44505C' }],
  },

  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#CCD4DC' }],
  },

  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }],
  },

  {
    featureType: 'transit',
    stylers: [{ visibility: 'off' }],
  },

  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [
      { color: '#C5CED8' },
      { saturation: -50 },
      { lightness: -8 },
    ],
  },

  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [
      { color: '#97A6B5' },
      { saturation: -65 },
      { lightness: -10 },
    ],
  },

  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [
      { color: '#7E90A4' },
      { saturation: -55 },
      { lightness: -12 },
    ],
  },

  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [
      { color: '#A6B4C1' },
      { saturation: -55 },
      { lightness: -8 },
    ],
  },

  {
    featureType: 'road.local',
    elementType: 'geometry',
    stylers: [
      { color: '#B8C3CD' },
      { saturation: -60 },
      { lightness: -5 },
    ],
  },

  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [
      { color: '#8EA2B2' },
      { saturation: -45 },
      { lightness: -10 },
    ],
  },
];
const nightMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0A0F1C' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6B7A90' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0A0F1C' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#172033' }, { saturation: -100 }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#22314A' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#09121F' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#0A0F1C' }] },
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
const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";
export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [message, setMessage] = useState('Loading ROADSoS...');
  const [panel, setPanel] = useState<Panel>(null);
  const [isNight, setIsNight] = useState(false);

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
  const [journeyControlsVisible, setJourneyControlsVisible] = useState(false);
const stopProtectedJourney = () => {
  setProtectedJourney(false);
  setCovertMode(false);
  setEscalationActive(false);
  setTripAlertVisible(false);
  setJourneyControlsVisible(false);
  setRouteCoordinates([]);
  setRouteSteps([]);
  setRouteSummary(null);
  setJourneyDestination(null);
  sendSafetyEvent({ type: "END_JOURNEY" });
  setjourneyCheckTime(900);
  setTripAlertCountdown(30);
};
  const [mapFocusMode, setMapFocusMode] = useState(false);

  const [emergencyContact, setEmergencyContact] = useState('');
  const [savedContacts, setSavedContacts] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [placesLoading, setPlacesLoading] = useState(true);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [escalationActive, setEscalationActive] = useState(false);
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
  const [routeRiskScore, setRouteRiskScore] = useState(0);
const [routeRiskLabel, setRouteRiskLabel] = useState<
  "SECURE" | "WATCH" | "ELEVATED"
>("SECURE");
  const [tripAlertCountdown, setTripAlertCountdown] = useState(30);

  const [protectedJourney, setProtectedJourney] = useState(false);
  const [journeyCheckTime, setjourneyCheckTime] = useState(300);
  const [tripAlertVisible, setTripAlertVisible] = useState(false);
  const [safetyContext, setSafetyContext] = useState<SafetyContext>(
  createInitialSafetyContext()
);
const [journeyDestination, setJourneyDestination] = useState<{
  latitude: number;
  longitude: number;
} | null>(null);

const sendSafetyEvent = (event: SafetyEvent) => {
  setSafetyContext((current) =>
    transitionSafetyState(current, event)
  );
};
  type SafetyState = 'idle' | 'protected' | 'escalation' | 'sos';

const safetyState: SafetyState = accidentDetected
  ? 'sos'
  : escalationActive
  ? 'escalation'
  : protectedJourney
  ? 'protected'
  : 'idle';
const [covertMode, setCovertMode] = useState(false);
  const accidentIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastForceRef = useRef(0);

  const BASE_URL = 'https://asia-south1-roadsos-core.cloudfunctions.net';
const [routeCoordinates, setRouteCoordinates] = useState<
  { latitude: number; longitude: number }[]
>([]);

const [routeSteps, setRouteSteps] = useState<any[]>([]);
const [routeSummary, setRouteSummary] = useState<string | null>(null);
  const theme = isNight
    ? { text: '#F8FAFC', sub: '#CBD5E1', input: '#1E293B', chip: '#334155', glass: 'dark' as const }
    : { text: '#111827', sub: '#4B5563', input: '#F3F4F6', chip: '#E5E7EB', glass: 'light' as const };
function RoadsosStatusChipInline() {
  return (
  <View
    pointerEvents="none"
    style={{
      position: 'absolute',
      top: 58,
      left: 18,
      right: 18,
      zIndex: 9000,
      alignItems: 'center',
    }}
  >
    <View
      style={{
        minWidth: 240,
        maxWidth: 340,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 999,
        backgroundColor: 'rgba(2,6,23,0.72)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.14)',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 99,
          backgroundColor: accidentDetected
            ? '#EF4444'
            : escalationActive
            ? '#F59E0B'
            : protectedJourney
            ? '#22C55E'
            : '#38BDF8',
          marginRight: 10,
        }}
      />

      <View>
        <Text
          style={{
            color: '#F8FAFC',
            fontSize: 13,
            fontWeight: '900',
            letterSpacing: 0.3,
          }}
        >
          {accidentDetected
            ? 'SOS Emergency Live'
            : escalationActive
            ? 'Elevated Risk Detected'
            : protectedJourney
            ? 'Protected Journey Active'
            : 'ROADSoS Ready'}
        </Text>

        <Text
          style={{
            color: '#CBD5E1',
            fontSize: 10,
            marginTop: 2,
            fontWeight: '700',
          }}
        >
          {accidentDetected
            ? 'Emergency response and live tracking active'
            : escalationActive
            ? 'Escalation layer monitoring route anomalies'
            : protectedJourney
            ? 'AI route monitoring and safety checks active'
            : 'AI safety systems online'}
        </Text>
      </View>
    </View>
  </View>
);
}
  // Panel colors stay dark in both day and night mode so text is always readable.
  const panelTheme = {
    text: '#F8FAFC',
    sub: '#CBD5E1',
    input: '#111827',
    chip: '#1E293B',
    border: 'rgba(255,255,255,0.14)',
    background: 'rgba(5, 12, 45, 0.84)',
  };
const triggerSilentSOS = async () => {
  try {
    setCovertMode(true);
    setProtectedJourney(true);
    sendSafetyEvent({ type: "ENTER_COVERT" });
    setPanel(null);
    setjourneyCheckTime(300);

    const phone = savedContacts[0];

    if (!phone) {
      Alert.alert(
        'Protected Journey Active',
        'Covert safety tracking is active. Add an emergency contact for silent SMS escalation.'
      );
      return;
    }

    const message = encodeURIComponent(createEmergencyMessage());
    const separator = Platform.OS === 'ios' ? '&' : '?';

    Linking.openURL(`sms:${phone}${separator}body=${message}`);
  } catch (error) {
    console.error('Covert Mode activation failed', error);
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
}, [isNight, places, placesLoading, location, covertMode, savedContacts, lastForce,movementAlert]);
useEffect(() => {
  return () => {
    if (locationWatcher.current) {
      locationWatcher.current.remove();
    }
  };
}, []);
useEffect(() => {
  if (!protectedJourney || tripAlertVisible) return;

  const timer = setInterval(() => {
    setjourneyCheckTime((prev) => {
      if (prev <= 1) {
        setTripAlertVisible(true);
        setTripAlertCountdown(30);
        return covertMode ? 300 : 900;
      }

      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [protectedJourney, tripAlertVisible, covertMode]);

useEffect(() => {
  if (!tripAlertVisible) return;

  const timer = setInterval(() => {
    setTripAlertCountdown((prev) => {
      if (prev <= 1) {
        setTripAlertVisible(false);
        emergencyEscalation();
        return 30;
      }

      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [tripAlertVisible]);
const formatTripTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
  const calculateDangerScore = () => {
  let score = 0;
  const reasons: string[] = [];

  const nearbyHospitals = places.filter((place) => place.type === 'hospital').length;
  const nearbyPolice = places.filter((place) => place.type === 'police').length;

  const hasHospitalNearby = nearbyHospitals > 0;
  const hasPoliceNearby = nearbyPolice > 0;
  const hasSafetyNearby = hasHospitalNearby && hasPoliceNearby;

  if (isNight) {
    score += 25;
    reasons.push('Night-time travel detected');
  }

 if (!placesLoading) {
  if (!hasHospitalNearby) {
    score += 15;
    reasons.push('No nearby hospital found');
  } else {
    reasons.push('Hospital nearby');
  }

  if (!hasPoliceNearby) {
    score += 15;
    reasons.push('No nearby police help found');
  } else {
    reasons.push('Police help nearby');
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

  if (covertMode) {
    score += 25;
    reasons.push('Covert Mode activated by user');
  }

  if (savedContacts.length === 0) {
    score += 10;
    reasons.push('No emergency contacts saved');
  }

  const finalScore = Math.max(0, Math.min(score, 100));

  setRiskScore(finalScore);

  if (finalScore >= 70) {
    setRiskLevel('HIGH');
  } else if (finalScore >= 35 && !hasSafetyNearby) {
    setRiskLevel('MODERATE');
  } else {
    setRiskLevel('LOW');
  }

  setRiskReasons(reasons);
};

  const updateThemeBySunset = (lat: number, lon: number) => {
    const times = SunCalc.getTimes(new Date(), lat, lon);
    const now = new Date();
    setIsNight(true);
  };

  const locationWatcher = useRef<Location.LocationSubscription | null>(null);

const getLocationAndPlaces = async () => {
  try {
    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      setMessage('Location permission denied');
      return;
    }

    let loc = await Location.getLastKnownPositionAsync();

    if (!loc) {
      loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
    }

    // Initial setup
    setLocation(loc);
    setMessage('ROADSoS ready');

    updateThemeBySunset(
      loc.coords.latitude,
      loc.coords.longitude
    );

    fetchNearbyPlaces(
      loc.coords.latitude,
      loc.coords.longitude
    );

    // Remove old watcher if exists
    if (locationWatcher.current) {
      locationWatcher.current.remove();
    }

    // Start LIVE tracking
    locationWatcher.current =
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 10,
        },
        (newLoc) => {
          setLocation(newLoc);

          updateThemeBySunset(
            newLoc.coords.latitude,
            newLoc.coords.longitude
          );

          // Refresh nearby places
          fetchNearbyPlaces(
            newLoc.coords.latitude,
            newLoc.coords.longitude
          );
        }
      );
  } catch (error) {
    console.error('Location tracking failed', error);

    setMessage(
      'Turn on device location/GPS and retry'
    );

    setPlacesLoading(false);
  }
};
const fetchNearbyPlaces = async (lat: number, lon: number) => {
  try {
    setPlacesLoading(true);

    

    const response = await axios.get(`${BASE_URL}/nearby`, {
      params: {
        lat,
        lon,
        radius: 2500,
      },
      timeout: 15000,
    });

    

    const nearbyPlaces = Array.isArray(response.data?.places)
      ? response.data.places.slice(0, 25)
      : [];

    setPlaces(nearbyPlaces);
  } catch (error: any) {
   console.log("NEARBY ERROR FULL:", error);
    setPlaces([]);
  } finally {
    setPlacesLoading(false);
  }
}; const getLocalBotReply = (text: string) => {
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
      console.error('CHAT ERROR:', error?.message);
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
    } catch(error) {
      console.error('Vehicle profile load failed',error);
    }
  };
const shareLiveLocation = async () => {
  if (!location) return;

  await Share.share({
    message: `ROADSoS Live Location:\nhttps://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`,
  });
};

const emergencyEscalation = async () => {
  setEscalationActive(true);
  setProtectedJourney(true);
  setCovertMode(true);
  setJourneyControlsVisible(false);

  Alert.alert(
    'Escalation Active',
    'ROADSoS has increased monitoring, enabled live safety mode, and prepared emergency standby.'
  );
  sendSafetyEvent({
  type: "RISK_DETECTED",
  reason: "MANUAL_TRIGGER",
});
}
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
    } catch(error) {
      console.error('Driving license load failed',error);
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
    } catch (error){
      console.error('Medical vault load failed',error);
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
  
const activateCovertMode = async () => {
  setPanel('calculator');
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
      console.error('ASSISTANCE ERROR:', error?.message);
      Alert.alert(
        'Request Failed',
        error?.response?.data?.detail || error?.message || 'Unable to connect to emergency assistance services. Please check your internet connection and try again.'
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
${savedContacts.join('\n')}`
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
    sendSafetyEvent({
  type: "SOS_TRIGGERED",
  reason: "ACCIDENT_DETECTED",
});
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
      ghostMode={covertMode}
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
if (panel === 'tools') {
  const toolGroups = [
    {
      title: 'Emergency',
      items: [
        { label: 'Police Connect', action: () => setPanel('police') },
        { label: 'Emergency Contacts', action: () => setPanel('contacts') },
        { label: 'Risk Diagnostics', action: () => setPanel('risk') },
      ],
    },
    {
      title: 'Safety',
      items: [
        { label: 'Safety Hub', action: () => setPanel('safety') },
        { label: 'Medical Vault', action: () => setPanel('vault') },
        { label: 'Bystander ARMY', action: () => setPanel('hero') },
      ],
    },
    {
      title: 'Vehicle',
      items: [
        { label: 'Vehicle Profile', action: () => setPanel('vehicle') },
        { label: 'Driving License', action: () => setPanel('license') },
        { label: 'Insurance', action: () => setPanel('insurance') },
      ],
    },
    {
      title: 'Services',
      items: [
        { label: 'Roadside Assistance', action: () => setPanel('assist') },
        { label: 'Fleet Safety', action: () => setPanel('fleet') },
        { label: 'Calculator SafeTrigger', action: () => setPanel('calculator') },
      ],
    },
  ];

  return (
    <View>
      <Text style={{ color: 'white', fontSize: 24, fontWeight: '900' }}>
        ROADSoS Tools
      </Text>

      <Text style={{ color: '#94A3B8', marginTop: 4 }}>
        Advanced safety modules and emergency services.
      </Text>

      {toolGroups.map((group) => (
        <View key={group.title} style={{ marginTop: 18 }}>
          <Text
            style={{
              color: '#60A5FA',
              fontSize: 12,
              fontWeight: '900',
              letterSpacing: 1,
              marginBottom: 10,
            }}
          >
            {group.title.toUpperCase()}
          </Text>

          {group.items.map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.action}
              activeOpacity={0.86}
              style={{
                padding: 15,
                borderRadius: 18,
                backgroundColor: 'rgba(15,23,42,0.9)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.08)',
                marginBottom: 10,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontSize: 14, fontWeight: '800' }}>
                {item.label}
              </Text>

              <Text style={{ color: '#64748B', fontSize: 18 }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}
    return null;
  };
  const twoFingerDoubleTapGesture = Gesture.Tap()
  .numberOfTaps(2)
  .minPointers(2)
  .runOnJS(true)
  .onEnd(() => {
    setMapFocusMode((prev) => !prev);
  });
  const SlideAction = ({
  label,
  knobText,
  knobColor,
  trackColor,
  onComplete,
}: {
  label: string;
  knobText: string;
  knobColor: string;
  trackColor: string;
  onComplete: () => void;
}) => {
  const slideX = useRef(new RNAnimated.Value(0)).current;
  const maxSlide = 230;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,

      onPanResponderMove: (_, gesture) => {
        if (gesture.dx >= 0 && gesture.dx <= maxSlide) {
          slideX.setValue(gesture.dx);
        }
      },

      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > maxSlide * 0.7) {
          RNAnimated.timing(slideX, {
            toValue: maxSlide,
            duration: 150,
            useNativeDriver: false,
          }).start(() => {
            onComplete();
            slideX.setValue(0);
          });
        } else {
          RNAnimated.spring(slideX, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View
      style={{
        width: '100%',
        height: 60,
        borderRadius: 999,
        backgroundColor: trackColor,
        marginTop: 14,
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <Text
        style={{
          color: 'white',
          fontWeight: '900',
          fontSize: 15,
          textAlign: 'center',
        }}
      >
        Slide to {label}
      </Text>

      <RNAnimated.View
        {...panResponder.panHandlers}
        style={{
          position: 'absolute',
          left: 7,
          transform: [{ translateX: slideX }],
          width: 48,
          height: 48,
          borderRadius: 999,
          backgroundColor: knobColor,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white', fontWeight: '900' }}>{knobText}</Text>
      </RNAnimated.View>
    </View>
  );
};
const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const calculateRouteRisk = (destination: {
  latitude: number;
  longitude: number;
}) => {
  let score = 0;

  const nearbyHospitals = places.filter(
    (place) => place.type === "hospital"
  ).length;

  const nearbyPolice = places.filter(
    (place) => place.type === "police"
  ).length;

  if (isNight) score += 25;

  if (nearbyHospitals === 0) score += 25;
  if (nearbyPolice === 0) score += 25;

  if (savedContacts.length === 0) score += 15;

  const finalScore = Math.min(score, 100);

  setRouteRiskScore(finalScore);

  if (finalScore >= 60) {
    setRouteRiskLabel("ELEVATED");
    setRiskLevel("HIGH");
  } else if (finalScore >= 30) {
    setRouteRiskLabel("WATCH");
    setRiskLevel("MODERATE");
  } else {
    setRouteRiskLabel("SECURE");
    setRiskLevel("LOW");
  }
};
const startProtectedJourneyTo = async (destination: {
  latitude: number;
  longitude: number;
}) => {
  if (!location) {
    Alert.alert("Location unavailable", "Please enable GPS first.");
    return;
  }

  setJourneyDestination(destination);
  calculateRouteRisk(destination);
  setCovertMode(false);
  setEscalationActive(false);
  setTripAlertVisible(false);
  setJourneyControlsVisible(false);

  try {
    const route = await getRoadRoute(
      {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
      destination,
      GOOGLE_MAPS_API_KEY
    );

    if (!route) {
      throw new Error("No route returned");
    }

    setRouteCoordinates(route.coordinates || []);
    setRouteSteps(route.steps || []);
    setRouteSummary(`${route.distanceText} · ${route.durationText}`);

    setProtectedJourney(true);
    setjourneyCheckTime(900);

    sendSafetyEvent({
      type: "START_JOURNEY",
    });

    setMessage("Protected route locked");
  } catch (error) {
    console.error("ROAD ROUTE FETCH FAILED:", error);
  }
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
const mapOverlayColor = accidentDetected
  ? 'rgba(220,38,38,0.18)'
  : escalationActive
  ? 'rgba(245,158,11,0.10)'
  : protectedJourney
  ? 'rgba(34,197,94,0.05)'
  : 'transparent';
 return (

  <GestureDetector gesture={twoFingerDoubleTapGesture}>
  <View style={{ flex: 1 }}>
  
    <MapSection
      location={location}
      places={places}
      isNight={isNight}
      routeRiskScore={routeRiskScore}
routeRiskLabel={routeRiskLabel}
      theme={theme}
      journeyDestination={journeyDestination}
      protectedJourney={protectedJourney}
escalationActive={escalationActive}
      accidentDetected={accidentDetected}
      
      lifeMessages={lifeMessages}
      routeCoordinates={routeCoordinates}
onRouteDeviationDetected={() => {
  
  sendSafetyEvent({
    type: "RISK_DETECTED",
    reason: "ROUTE_DEVIATION",
  });
}}
      lifeIndex={lifeIndex}
      darkMapStyle={isNight ? nightMapStyle : dayMapStyle}
      onStartJourneyTo={startProtectedJourneyTo}
      onStartJourney={() => {
  if (!journeyDestination) {
    Alert.alert(
      "Destination needed",
      "Tap a destination on the map first."
    );
    return;
  }

  startProtectedJourneyTo(journeyDestination);
}}
      onSelectDestination={(coordinate) => {
  setJourneyDestination(coordinate);
  setRouteCoordinates([]);
}}
      mapFocusMode={mapFocusMode}
      riskLevel={riskLevel}
      onToggleFocus={() => setMapFocusMode((prev) => !prev)}
    />
  <Animated.View
  pointerEvents="none"
  entering={FadeIn.duration(450)}
  exiting={FadeOut.duration(450)}
  style={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: mapOverlayColor,
    zIndex: 2,
  }}
/>
    <View
  style={{
    position: 'absolute',
    top: 58,
    left: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(2,6,23,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    zIndex: 9999,
    elevation: 99,
  }}
>
</View>

    {!mapFocusMode && (
      <Animated.View
      pointerEvents="auto"
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
        }}
      >
         

        <View
          style={{
            position: 'absolute',
            bottom: 110,
            alignSelf: 'center',
            backgroundColor: 'rgba(2,6,23,0.55)',
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 999,
          }}
        >
          
        </View>
      
        <TouchableOpacity
    onPress={() => setMapFocusMode(true)}
    activeOpacity={0.85}
    style={{
      position: 'absolute',
      top: 58,
      right: 18,
      backgroundColor: 'rgba(2,6,23,0.78)',
      borderWidth: 1,
      borderColor: 'rgba(125,211,252,0.4)',
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 999,
      zIndex: 5000,
      elevation: 20,
    }}
  >
    
  </TouchableOpacity>
  <Text style={{ color: '#E0F2FE', fontWeight: '900' }}>
  Focus
</Text>

{/*
        <RiskShield
          riskScore={riskScore}
          riskLevel={riskLevel}
          theme={theme}
          ghostMode={covertMode}
          onOpenRisk={() => setPanel('risk')}
        />*/}
{/*}        
<RoadsosStatusChip
  state={safetyState}
  riskLevel={riskLevel}
  isNight={isNight}
/>

<AIIntelligenceStrip
  state={safetyState}
  riskScore={riskScore}
  riskLevel={riskLevel}
  onPress={() => setPanel('risk')}
/>

<CommandCapsule
  state={safetyState}
  onStartJourney={activateCovertMode}
  onOpenTools={() => setPanel('tools')}
  onOpenAI={() => setPanel('chatbot')}
  onEscalate={emergencyEscalation}
  onSOS={handleSOS}
/>
*/}

  <RoadsosStatusChipInline />

        <SOSPanel
  vehicleNumber={vehicleNumber}
  protectedJourney={protectedJourney}
  escalationActive={escalationActive}
  journeyCheckTime={journeyCheckTime}
  covertMode={covertMode}
  onStartJourney={() => {
    if (protectedJourney) {
      setJourneyControlsVisible(true);
      return;
    }

    if (!journeyDestination) {
      Alert.alert(
        "Destination needed",
        "Tap a hospital, police station, or map point first."
      );
      return;
    }

    startProtectedJourneyTo(journeyDestination);
  }}
  onActivateCovertMode={() => {
    setCovertMode(true);
    setProtectedJourney(true);
    sendSafetyEvent({ type: "ENTER_COVERT" });
    setjourneyCheckTime(300);
    setTripAlertVisible(false);
    setTripAlertCountdown(30);
  }}
  onDeactivateCovertMode={() => {
    setCovertMode(false);
    setjourneyCheckTime(900);
    setTripAlertVisible(false);
    setTripAlertCountdown(30);
  }}
  onOpenVehicle={() => setPanel("vehicle")}
  onOpenContacts={() => setPanel("contacts")}
  onSOS={handleSOS}
  onCall112={() => Linking.openURL("tel:112")}
  onOpenTools={() => setPanel("tools")}
  onOpenAI={() => setPanel("chatbot")}
/>
{journeyControlsVisible && (
  <View
    style={{
      position: 'absolute',
      left: 24,
      right: 24,
      bottom: 170,
      padding: 18,
      borderRadius: 26,
      backgroundColor: 'rgba(2,6,23,0.96)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.14)',
      zIndex: 8000,
      elevation: 80,
    }}
  >
    <Text
  style={{
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.4,
  }}
>
  Protected Journey
</Text>

<Text
  style={{
    color: '#94A3B8',
    marginTop: 5,
    fontSize: 12,
    fontWeight: '700',
  }}
>
  Monitoring route, safety checks and escalation readiness.
</Text>

<View
  style={{
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 16,
    overflow: 'hidden',
  }}
>
  <View
    style={{
      width: '78%',
      height: '100%',
      backgroundColor: '#22C55E',
      borderRadius: 999,
    }}
  />
</View>

<TouchableOpacity
 onPress={shareLiveLocation}
  activeOpacity={0.86}
  style={{
    marginTop: 18,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(37,99,235,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.22)',
  }}
>
  <Text
    style={{
      color: '#DBEAFE',
      fontSize: 14,
      fontWeight: '900',
    }}
  >
    Share Live Location
  </Text>
</TouchableOpacity>

<TouchableOpacity
onPress={emergencyEscalation}
  activeOpacity={0.86}
  style={{
    marginTop: 10,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(245,158,11,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.18)',
  }}
>
  <Text
    style={{
      color: '#FCD34D',
      fontSize: 14,
      fontWeight: '900',
    }}
  >
    Emergency Escalation
  </Text>
</TouchableOpacity>

<TouchableOpacity
  onPress={stopProtectedJourney}
  activeOpacity={0.86}
  style={{
    marginTop: 10,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(220,38,38,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.22)',
  }}
>
  <Text
    style={{
      color: '#FCA5A5',
      fontSize: 14,
      fontWeight: '900',
    }}
  >
    Stop Protected Journey
  </Text>
</TouchableOpacity>

    </View>
)}
        <PanelModal
          visible={Boolean(panel)}
          onClose={() => setPanel(null)}
          panelTheme={panelTheme}
        >
          {renderPanelContent()}
        </PanelModal>

        {accidentDetected && (
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              elevation: 9999,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(2,6,23,0.45)',
            }}
          >
            <BlurView
              intensity={85}
              tint="dark"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />

            <View
              style={{
                width: '88%',
                borderRadius: 36,
                padding: 28,
                alignItems: 'center',
                backgroundColor: 'rgba(15,23,42,0.72)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.18)',
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontSize: 28,
                  fontWeight: '900',
                  textAlign: 'center',
                  lineHeight: 34,
                }}
              >
                It looks like you’ve been in a crash.
              </Text>

              <Text
                style={{
                  color: '#CBD5E1',
                  marginTop: 10,
                  fontSize: 14,
                  textAlign: 'center',
                }}
              >
                ROADSoS will trigger emergency SOS if you don’t respond.
              </Text>

              <Text
                style={{
                  color: '#FCA5A5',
                  marginTop: 18,
                  fontSize: 18,
                  fontWeight: '900',
                }}
              >
                Sending SOS in {countdown}s
              </Text>

              <SlideAction
                label="Emergency Call"
                knobText="SOS"
                knobColor="#EF4444"
                trackColor="rgba(220,38,38,0.45)"
                onComplete={handleSOS}
              />

              <SlideAction
                label="I am safe"
                knobText="✓"
                knobColor="#22C55E"
                trackColor="rgba(148,163,184,0.28)"
                onComplete={cancelAccidentAlert}
              />

              <TouchableOpacity
                onPress={cancelAccidentAlert}
                activeOpacity={0.8}
                style={{
                  marginTop: 22,
                  width: 58,
                  height: 58,
                  borderRadius: 999,
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: 'white', fontSize: 30, fontWeight: '300' }}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>
           
          </Animated.View>
    
        )}

        {flashlightActive && (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setFlashlightActive(false)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(2,6,23,0.96)',
              zIndex: 2000,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 999,
                backgroundColor: '#FACC15',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#FACC15',
                shadowOpacity: 0.9,
                shadowRadius: 30,
                elevation: 20,
              }}
            >
              <Text style={{ fontSize: 42 }}>🔦</Text>
            </View>

            <Text style={{ color: 'white', fontSize: 26, fontWeight: '900', marginTop: 28 }}>
              Flashlight ON
            </Text>

            <Text style={{ color: '#CBD5E1', marginTop: 8, fontSize: 15 }}>
              Tap anywhere to turn off
            </Text>
          </TouchableOpacity>
        )}

        {fakeCallActive && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#020617',
              zIndex: 2100,
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 90,
              paddingBottom: 70,
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#94A3B8', fontSize: 16 }}>Incoming call</Text>
              <Text style={{ color: 'white', fontSize: 34, fontWeight: '900', marginTop: 10 }}>
                Mom
              </Text>
              <Text style={{ color: '#CBD5E1', fontSize: 15, marginTop: 6 }}>
                Mobile
              </Text>
            </View>

            <View
              style={{
                width: 118,
                height: 118,
                borderRadius: 59,
                backgroundColor: '#1E293B',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 48 }}>👤</Text>
            </View>

            <View style={{ flexDirection: 'row', width: '75%', justifyContent: 'space-between' }}>
              <TouchableOpacity
                onPress={() => setFakeCallActive(false)}
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 38,
                  backgroundColor: '#DC2626',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: 'white', fontSize: 26 }}>✕</Text>
                <Text style={{ color: 'white', fontSize: 10, fontWeight: '900' }}>Decline</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setFakeCallActive(false);
                  Alert.alert('Fake Call Active', 'Pretend you are speaking and move to a safer place.');
                }}
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 38,
                  backgroundColor: '#16A34A',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: 'white', fontSize: 25 }}>☎</Text>
                <Text style={{ color: 'white', fontSize: 10, fontWeight: '900' }}>Answer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {voiceSOSActive && (
          <View
            style={{
              position: 'absolute',
              top: 190,
              left: 24,
              right: 24,
              backgroundColor: 'rgba(15,23,42,0.96)',
              borderRadius: 28,
              padding: 24,
              zIndex: 1900,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 38 }}>🎙️</Text>
            <Text style={{ color: 'white', fontSize: 22, fontWeight: '900', marginTop: 8 }}>
              Listening for SOS...
            </Text>
            <Text style={{ color: '#CBD5E1', marginTop: 8, textAlign: 'center' }}>
              Demo: detecting emergency keyword
            </Text>
          </View>
        )}

        {heroAlert && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setHeroAlert(false)}
            style={{
              position: 'absolute',
              top: 335,
              left: 16,
              right: 16,
              backgroundColor: '#7C2D12',
              borderRadius: 24,
              padding: 16,
              zIndex: 1200,
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '900' }}>
              Nearby Alert
            </Text>
            <Text style={{ color: '#FED7AA', marginTop: 6 }}>
              Someone 0.8 km away may need help. Open Hero Mode/Bystander ARMY for details.
            </Text>
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
              Protected Journey Check 🛡️
            </Text>
            <Text style={{ color: '#FCA5A5', marginTop: 10, fontWeight: '900' }}>
  Escalating in {tripAlertCountdown}s
</Text>

            <Text style={{ color: '#FEE2E2', textAlign: 'center', marginTop: 10, lineHeight: 22 }}>
              ROADSoS is verifying your protected journey status.
            </Text>

            <TouchableOpacity
              onPress={() => {
  setTripAlertVisible(false);
  setTripAlertCountdown(30);
  setjourneyCheckTime(covertMode ? 300 : 900);
  setProtectedJourney(true);
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

      
      </Animated.View>
    )}

    {mapFocusMode && (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={() => setMapFocusMode(false)}
    style={{
      position: 'absolute',
      top: 58,
      right: 18,
      backgroundColor: 'rgba(2,6,23,0.82)',
      borderWidth: 1,
      borderColor: 'rgba(125,211,252,0.35)',
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 999,
      zIndex: 99999,
      elevation: 99999,
    }}
  >
    <Text style={{ color: '#7DD3FC', fontSize: 12, fontWeight: '900' }}>
      SHOW HUD
    </Text>
  </TouchableOpacity>
)}
  </View>
  </GestureDetector>
);
}
