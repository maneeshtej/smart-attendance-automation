Scalable Node Mesh App for Seamless Attendance Automation

A BLE-powered smart attendance system built using React Native, TypeScript, Kotlin, Swift, and Supabase for seamless offline-first classroom attendance automation.

<p align="center"> <img src="https://img.shields.io/badge/React%20Native-Mobile-blue?style=for-the-badge&logo=react" /> <img src="https://img.shields.io/badge/TypeScript-Strict-blue?style=for-the-badge&logo=typescript" /> <img src="https://img.shields.io/badge/BLE-Bluetooth%20Low%20Energy-purple?style=for-the-badge" /> <img src="https://img.shields.io/badge/Supabase-Backend-green?style=for-the-badge&logo=supabase" /> <img src="https://img.shields.io/badge/Offline%20First-Enabled-orange?style=for-the-badge" /> </p>
Overview

Traditional attendance systems are slow, infrastructure-dependent, and vulnerable to proxy attendance.

This project introduces a decentralized BLE-based attendance framework where:

Student devices broadcast encrypted BLE identifiers
Teacher devices scan nearby students
Attendance is verified locally using proximity detection
Sessions are stored offline and synced later to the cloud

The system works even without internet connectivity and eliminates the need for RFID hardware, Wi-Fi dependency, or manual roll calls.

Features
BLE-Based Attendance Automation
Real-time BLE advertisement & scanning
RSSI-based proximity validation
Teacher acknowledgment broadcasts
Offline-First Architecture
Local attendance persistence
Manual cloud synchronization
Works without internet
Cross-Platform Support
Android support using Kotlin BLE modules
iOS support using Swift BLE modules
Secure Attendance Validation
Biometric / lock-screen verification
Checksum validation
Secure authentication using Supabase
Modern Mobile Stack
React Native + TypeScript
Zustand persistence
SQLite local caching
Supabase backend integration
Tech Stack
Layer Technologies
Frontend React Native, TypeScript
Android Native Kotlin
iOS Native Swift
Backend Supabase
Database PostgreSQL, SQLite
State Management Zustand
Version Control Git & GitHub
Project Structure
.
├── **tests**
│ └── App.test.tsx
│
├── android/ # Android native project
├── ios/ # iOS native project
│
├── migrations/ # Supabase SQL migrations
│ ├── 001_init.sql
│ ├── 001.init_index.sql
│ └── 002_init_rls.sql
│
├── patches/ # Patched dependencies
│ └── react-native-ble-peripheral+2.0.1.patch
│
├── src
│ ├── ble/ # BLE communication layer
│ ├── components/ # Shared UI components
│ ├── hooks/ # Custom hooks
│ ├── lib/ # Utilities
│ ├── navigation/ # Navigation setup
│ ├── screens/ # App screens
│ ├── services/ # API & sync services
│ ├── theme/ # App theming
│ └── types/ # Type definitions
│
├── App.tsx
├── app.json
├── package.json
└── README.md
BLE Communication Flow
Student Device

Student device continuously broadcasts:

AB:<studentID>:Z

After receiving acknowledgment:

AC:<studentIDs>:<subjectID>:Z

Attendance is marked locally.

Teacher Device

Teacher app:

Scans nearby BLE advertisements
Aggregates student IDs
Verifies RSSI proximity
Broadcasts ACK packets
Stores attendance locally
Syncs to Supabase later
System Architecture
┌──────────────────────┐
│ Supabase │
│ Auth • DB • Storage │
└─────────┬────────────┘
│ HTTPS / REST
│
┌────────▼─────────┐
│ Teacher Device │
│ React Native App │
│ Kotlin BLE Layer │
└────────┬─────────┘
│ BLE
│
┌────────▼─────────┐
│ Student Device │
│ React Native App │
│ Native BLE Layer │
└──────────────────┘

Attendance operates fully offline during sessions and synchronizes later when connectivity becomes available.

Installation
Clone Repository
git clone <repository-url>
cd <project-folder>
Install Dependencies
npm install
Android Setup
npm run android
iOS Setup
cd ios
pod install
cd ..
npm run ios
Database Setup

Run the migration files inside:

migrations/

Migration files:

001_init.sql
001.init_index.sql
002_init_rls.sql
Testing & Validation

The system was tested on:

Samsung S23
OnePlus 11
Vivo V23e 5G
Realme 13 Pro 5G
macOS BLE Emulator

Testing confirmed:

Stable BLE communication
Reliable attendance verification
Cross-device interoperability
Offline synchronization stability
Performance Metrics
Metric Result
Detection Latency ~0.8s – 1.2s
Reliable BLE Range ~10m
Packet Loss < 5%
Battery Consumption < 3% / 10 min
Sync Success Rate 100%

Security Features
Biometric authentication
Screen-lock verification
RSSI-based filtering
Checksum verification
Secure cloud synchronization
Offline local persistence
Future Scope
BLE Mesh multi-hop communication
AI-assisted routing optimization
Automated synchronization
Analytics dashboards
Enterprise-level scalability
Authors
Kappala Varshini Sekhar
Lekkala Tej Sai Maneesh

Department of Computer Science and Engineering
Nitte Meenakshi Institute of Technology, Bengaluru

Research & Publication

The project research paper titled:

“Scalable Node Mesh App for Seamless Attendance Automation”

was presented at:

ICDSA’26 — Springer Nature Conference
License

This project was developed as part of a Bachelor of Engineering final year academic project under VTU.
