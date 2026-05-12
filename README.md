# ROADSoS 🚨
### AI-Powered Road Safety & Emergency Response Platform

> Built for the **IIT Madras COERS Road Safety Hackathon 2026**

ROADSoS is a mobile-first emergency response app that helps accident victims, bystanders, and daily commuters get faster help during road emergencies. It combines AI risk analysis, real-time location, emergency SOS, and offline-capable safety tools into a single platform.

---

## 📱 Screenshots

> App running on Android — Day Mode & Night Mode

| Home Screen | Map View | AI Chatbot | SOS Panel |
|---|---|---|---|
| AI Risk Shield, SOS buttons, Ghost Mode | Live Google Maps with nearby hospitals & police | ROADSoS AI emergency assistant | One-tap SOS to all contacts |

---

## 🚀 Key Features

### 🆘 Emergency SOS
- One-tap SOS SMS to all saved emergency contacts
- WhatsApp emergency message with live location link
- Call 112 directly from the app
- Auto-accident detection via accelerometer — sends SOS after 10-second countdown

### 🗺️ Live Map & Nearby Services
- Google Maps with real-time user location
- Nearby hospitals, police stations, trauma centres fetched automatically
- Night/Day map mode based on sunset time (SunCalc)
- Color-coded markers: 🟢 Hospitals | 🔵 Police | 🟡 Others

### 🤖 AI Risk Shield
- Predictive danger score (0–100) based on: time of day, speed, nearby services, movement anomaly, ghost mode
- LOW / MODERATE / HIGH risk levels with reasons
- Adaptive trip safety check-ins based on risk level

### 🧠 ROADSoS AI Chatbot
- Local offline emergency response bot
- Covers: accident, bleeding, unconscious, fracture, burn, breakdown, unsafe situations
- Backend AI fallback via FastAPI + Claude/GPT integration
- Step-by-step first-aid guidance

### 👻 Ghost Mode
- Covert safety mode — app disguises as normal screen
- Silently shares location with emergency contacts
- Hidden calculator PIN trigger (Safe Calc) for secret SOS

### 🚗 Roadside Assistance
- Tow truck, mechanic, fuel help, EV charging — opens Google Maps search
- Sends location-aware assistance request to backend

### 🏥 Medical Vault
- Blood type, allergies, medications, medical conditions
- Stored locally (AsyncStorage) — never uploaded
- Attached to every SOS message automatically

### 🪪 Driving License
- Link license locally for emergency identity
- Verify via DigiLocker or Parivahan
- Attached to SOS and police help messages

### 🚓 Police Connect
- Share police SOS with location
- SMS all contacts with police alert
- Call 112 directly

### 🛡️ Bystander ARMY
- Join as a community first responder
- Receive nearby emergency alerts
- Hero mode with live alert notifications

### 🧮 Safe Calc (Covert SOS)
- Disguised as a calculator
- Secret PIN `112=` triggers silent SOS
- Designed for unsafe situations where you can't openly call for help

### ✈️ Trip Safety Mode
- Start/End trip tracking
- Periodic safety check-ins (frequency based on risk level)
- HIGH risk → mandatory check-in every 60 seconds

### 🚛 Fleet Safety & Insurance Partners
- Fleet integration request form
- Insurance partner links: ACKO, HDFC ERGO, ICICI Lombard, Digit

---

## 🏗️ Tech Stack

### Frontend
| Tech | Usage |
|---|---|
| React Native + Expo | Mobile app framework |
| Expo Router | File-based navigation |
| TypeScript | Type safety |
| react-native-maps | Google Maps integration |
| expo-location | GPS and location permissions |
| expo-blur | Glass-morphism UI effects |
| react-native-reanimated | Smooth animations |
| expo-sensors (Accelerometer) | Accident detection |
| AsyncStorage | Local offline data storage |
| axios | API calls |
| SunCalc | Sunrise/sunset detection for night mode |

### Backend
| Tech | Usage |
|---|---|
| Python + FastAPI | REST API server |
| Render | Cloud hosting |
| OpenStreetMap / Overpass API | Nearby places (hospitals, police) |
| AI Integration | Emergency chatbot responses |

### APIs & Services
| Service | Usage |
|---|---|
| Google Maps SDK for Android | Live map rendering |
| Google Places API | Nearby services |
| EAS Build (Expo) | Cloud APK builds |
| SunCalc | Day/Night detection |

---

## 📁 Folder Structure

```
roadsos/
├── app/
│   ├── (tabs)/
│   │   └── index.tsx          # Main screen — map, SOS, all panels
│   └── _layout.tsx
├── assets/
│   └── images/                # App icons, splash screen
├── backend/                   # FastAPI Python backend
├── components/                # Reusable UI components
├── constants/                 # Theme, colors
├── hooks/                     # Custom React hooks
├── scripts/                   # Utility scripts
├── app.config.js              # Expo config with Google Maps API key
├── eas.json                   # EAS Build configuration
├── package.json
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js 18+
- Expo CLI
- Android Studio (for local builds) or EAS account (for cloud builds)
- Google Cloud account with Maps SDK enabled

### 1. Clone the repository
```bash
git clone https://github.com/singhabhigyan007devil-cpu/roadsos-fullstack.git
cd roadsos-fullstack
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create `.env` file
```bash
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
```
> Never commit `.env` to GitHub.

### 4. Start development server
```bash
npx expo start
```

### 5. Run on Android
```bash
npx expo run:android
```

---

## 🏗️ Building the APK

### Cloud Build (EAS) — recommended
```bash
# Set API key as EAS secret
eas env:create --scope project --name GOOGLE_MAPS_API_KEY --environment production --visibility sensitive

# Build APK
eas build --platform android --profile production
```

### Local Build
```bash
# Set environment variable
$env:GOOGLE_MAPS_API_KEY = "your_key_here"

# Build
npx expo run:android --variant release
```

---

## 🔐 Security

- API keys stored as EAS encrypted secrets — never in source code
- `.env` files excluded from Git tracking via `.gitignore`
- Google Maps API key restricted to Maps SDK, Directions API, Places API only
- Medical Vault and license data stored locally on device only — never uploaded
- Ghost Mode designed for covert emergency use

---

## 🌍 Global Applicability

- Country code selector for emergency contacts (10 countries supported)
- Google Maps works globally
- Emergency number guidance (112 for India, adaptable)
- Offline-capable: local AI chatbot, medical vault, contacts all work without internet

---

## 📊 Evaluation Criteria Coverage

| Criteria | Implementation |
|---|---|
| Nearest Police, Hospitals, Ambulance | ✅ Live map markers via Overpass API |
| Towing, Puncture, Showrooms | ✅ Roadside Assistance panel with Google Maps search |
| Global Applicability | ✅ Country codes, Google Maps, adaptable emergency numbers |
| Offline Functionality | ✅ Local AI bot, AsyncStorage data, offline SOS via SMS |
| Reliability & Data Accuracy | ✅ OpenStreetMap data, real-time GPS |
| Number of Contacts Fetched | ✅ Multiple nearby services fetched automatically |
| Innovation & Additional Features | ✅ Ghost Mode, Safe Calc, Bystander ARMY, AI Risk Shield, Accident Detection |
| Information Integration | ✅ Medical Vault + License + Vehicle + Location in every SOS |
| User Interface & Accessibility | ✅ Day/Night adaptive UI, glassmorphism design |

---

## 🔮 Roadmap

- [ ] Offline maps caching
- [ ] Smartwatch gesture SOS
- [ ] Community hazard reporting
- [ ] Road safety challan calculator with geo-fencing
- [ ] Real-time crash hotspot alerts
- [ ] Multi-language support
- [ ] AdMob integration for sustainability

---

## 👨‍💻 Author

**Abhigyan Singh**
GitHub: [@singhabhigyan007devil-cpu](https://github.com/singhabhigyan007devil-cpu)

---

## 📄 License

This project is licensed under the MIT License.

---

> *"Every second matters. Stay calm. Call help fast."* — ROADSoS