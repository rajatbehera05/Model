# 🚗 IoT Smart Parking System (3-Slot Prototype)

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.19-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-v18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-v5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![ESP32](https://img.shields.io/badge/ESP32-NodeMCU--32S-E7352C?style=for-the-badge&logo=espressif&logoColor=white)](https://www.espressif.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)

An end-to-end, full-stack **IoT Smart Parking System** prototype designed for urban traffic decongestion, smart campus parking, and modern facility management.

The system synchronizes physical micro-controller hardware (**ESP32**, **optical IR obstacle sensors**, **SG90 servo barrier gate**, and an **LED capacity beacon**) with a high-performance **Node.js/Express** backend and an interactive **React 18 + Three.js** web dashboard in real time (< 1s latency).

---

## 📑 Table of Contents

- [Key Highlights](#-key-highlights)
- [System Architecture](#-system-architecture)
- [Hardware Setup & Pin Configuration](#-hardware-setup--pin-configuration)
- [Software Architecture & Tech Stack](#-software-architecture--tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Quick Start Guide](#-quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [Option A: One-Click Launch (Recommended)](#option-a-one-click-launch-recommended)
  - [Option B: Manual Setup](#option-b-manual-setup)
- [Hardware Simulator (No ESP32 Required)](#-hardware-simulator-no-esp32-required)
- [ESP32 Firmware Flashing](#-esp32-firmware-flashing)
- [REST API Reference](#-rest-api-reference)
- [License](#-license)

---

## 🌟 Key Highlights

* **Real-Time 3-Slot Physical Telemetry:** Discrete optical detection of slots `P1`, `P2`, and `P3` using Active-LOW Infrared (IR) obstacle sensors with calibrated 300ms software debounce.
* **Deterministic Slot Assignment Engine:** One-click algorithm that automatically prioritizes and allocates the lowest-indexed available slot (`P1` $\rightarrow$ `P2` $\rightarrow$ `P3`).
* **Direct Reservation & Conflict Guard:** Allows drivers to hold bays remotely with automated HTTP 409 conflict protection against race conditions.
* **Physical Sensor Verification Bridge:** Seamlessly advances slot state from `Reserved` to `Occupied` upon optical vehicle arrival.
* **Automated Entrance Barrier Gate:** Micro-servo arm (SG90) swings open to 90° for valid entries with 3-second auto-close; prevents unauthorized entry when the facility is at 100% capacity.
* **Central Capacity Beacon:** Binary physical LED indicator (ON = $\ge 1$ slots vacant, OFF = lot full).
* **ESP32 Watchdog & Connectivity Monitor:** Backend heartbeat monitor with 5-second watchdog timer, alerting users instantaneously if hardware connectivity drops.
* **Built-in CLI Hardware Simulator:** Full mock environment for end-to-end testing without physical micro-controllers or breadboards.

---

## 📐 System Architecture

```
+------------------------------------------------------------------------------------+
|                                 PHYSICAL LAYER                                     |
|                                                                                    |
|   +----------------+   +----------------+   +----------------+                     |
|   | IR Sensor 1    |   | IR Sensor 2    |   | IR Sensor 3    |                     |
|   | (Slot P1)      |   | (Slot P2)      |   | (Slot P3)      |                     |
|   +-------+--------+   +-------+--------+   +-------+--------+                     |
|           |                    |                    |                              |
|           v (GPIO 13)          v (GPIO 12)          v (GPIO 14)                    |
|       +----------------------------------------------------+                       |
|       |             ESP32 Microcontroller                  |                       |
|       |  - 300ms Software Debounce Filter                  |                       |
|       |  - SG90 Servo PWM Controller (GPIO 18)             |                       |
|       |  - Status LED Controller (GPIO 2)                  |                       |
|       +--------------------------+-------------------------+                       |
|                                  |                                                 |
+----------------------------------|-------------------------------------------------+
                                   | Wi-Fi (HTTP POST / REST)
                                   v
+------------------------------------------------------------------------------------+
|                              APPLICATION LAYER                                     |
|                                                                                    |
|       +----------------------------------------------------+                       |
|       |             Node.js / Express Backend              |                       |
|       |  - Port 5000                                       |                       |
|       |  - In-Memory Parking State Matrix (P1, P2, P3)     |                       |
|       |  - Automatic Slot Allocation & Conflict Engine     |                       |
|       |  - 5-Second Hardware Watchdog Monitoring           |                       |
|       |  - RESTful APIs (`/api/parking/*`)                 |                       |
|       +--------------------------+-------------------------+                       |
|                                  |                                                 |
|                                  | JSON Polling (800ms) / REST                     |
|                                  v                                                 |
|       +----------------------------------------------------+                       |
|       |             React + Vite Web Dashboard             |                       |
|       |  - Port 3000                                       |                       |
|       |  - 3D Realistic Vehicle & Bay Visualization        |                       |
|       |  - Real-time Capacity Metrics & Telemetry Feed     |                       |
|       |  - Interactive Reservation & Barrier Controls      |                       |
|       |  - Hardware Operations & Diagnostics Panel         |                       |
|       +----------------------------------------------------+                       |
+------------------------------------------------------------------------------------+
```

---

## 🔌 Hardware Setup & Pin Configuration

### Bill of Materials (BOM)

| Item | Component | Qty | Specification / Role |
| :---: | :--- | :---: | :--- |
| **1** | ESP32 NodeMCU Development Board | 1 | 30 or 38 pin, 2.4 GHz Wi-Fi controller |
| **2** | IR Obstacle Sensor Modules | 3 | Active-LOW, adjustable potentiometer |
| **3** | SG90 Micro Servo Motor | 1 | 9g servo for entrance barrier (0° closed, 90° open) |
| **4** | 5mm Status LED | 1 | Lot availability indicator (Red or Green) |
| **5** | Resistor | 1 | 220Ω (1/4W) current limiting resistor for LED |
| **6** | Solderless Breadboard & Jumpers | 1 | 830-tie point breadboard + DuPont jumper wires |
| **7** | 5V Power Supply | 1 | 5V 2A USB power bank or adapter |

### Wiring Pinout Table

| Hardware Component | Component Pin | ESP32 Pin | Logic / Note |
| :--- | :--- | :--- | :--- |
| **IR Sensor 1 (P1)** | `OUT` / `DO` | **GPIO 13** | Active-LOW (`LOW` = Vehicle Detected, `HIGH` = Empty) |
| | `VCC` | `VIN` (5V) or `3V3` | Power rail |
| | `GND` | `GND` | Common Ground |
| **IR Sensor 2 (P2)** | `OUT` / `DO` | **GPIO 12** | Active-LOW (`LOW` = Vehicle Detected, `HIGH` = Empty) |
| | `VCC` | `VIN` (5V) or `3V3` | Power rail |
| | `GND` | `GND` | Common Ground |
| **IR Sensor 3 (P3)** | `OUT` / `DO` | **GPIO 14** | Active-LOW (`LOW` = Vehicle Detected, `HIGH` = Empty) |
| | `VCC` | `VIN` (5V) or `3V3` | Power rail |
| | `GND` | `GND` | Common Ground |
| **SG90 Servo Motor** | `PWM` (Orange/Yellow) | **GPIO 18** | 50Hz PWM signal (0° = closed, 90° = open) |
| | `VCC` (Red) | `VIN` (5V) | External 5V rail recommended |
| | `GND` (Brown/Black) | `GND` | Common Ground |
| **Master Status LED** | Anode (+) | **GPIO 2** | Via 220Ω resistor (HIGH = Lot Open, LOW = Lot Full) |
| | Cathode (-) | `GND` | Common Ground |

---

## 💻 Software Architecture & Tech Stack

### Frontend
- **Framework:** React 18+ bootstrapped with Vite
- **Styling:** Tailwind CSS + Custom Dark Theme Glassmorphism
- **Animations:** Framer Motion & GSAP
- **3D Graphics:** Three.js / `@react-three/fiber` & `@react-three/drei`
- **Icons:** Lucide React
- **Sync Model:** 800ms reactive polling for instantaneous status feedback

### Backend
- **Framework:** Node.js 18+ with Express.js
- **Middleware:** `cors`, `express.json()`
- **State Management:** In-memory high-speed state store with license plate records and entry timestamps
- **Watchdog:** Automatic 5-second ESP32 connectivity detection
- **Testing & Tooling:** Automated hardware simulator and endpoint testing suites

### Embedded Firmware
- **Board:** ESP32 DevKit v1 (NodeMCU-32S)
- **Framework:** Arduino C++ / PlatformIO
- **Libraries:** `WiFi.h`, `HTTPClient.h`, `ESP32Servo.h`, `ArduinoJson.h`

---

## 📁 Project Directory Structure

```text
smart-model/
├── SMART_PARKING_PRD.md     # Official Product Requirements Document (PRD)
├── README.md                # Project documentation (this file)
├── package.json             # Root monorepo orchestration scripts
├── run-dev.js               # Cross-platform concurrent runner
├── start.bat                # Windows 1-click startup batch script
│
├── backend/                 # Node.js / Express Server
│   ├── package.json         # Backend dependencies (express, cors)
│   ├── server.js            # Main REST API server & state engine
│   ├── simulator.js         # Hardware CLI simulator (interactive & automated)
│   └── test.js              # API unit & integration test script
│
├── frontend/                # React + Vite Web Dashboard
│   ├── package.json         # Frontend dependencies (React, Three.js, Tailwind)
│   ├── vite.config.js       # Vite configuration
│   ├── tailwind.config.js   # Tailwind design tokens
│   ├── src/
│   │   ├── App.jsx          # App root & navigation orchestrator
│   │   ├── api/             # Backend API client bindings
│   │   │   └── parkingApi.js
│   │   ├── components/      # UI components
│   │   │   ├── AvailabilityAndGate.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── LiveParkingMap.jsx
│   │   │   ├── MetricsSection.jsx
│   │   │   ├── ParkingOverviewPanel.jsx
│   │   │   ├── RealisticSlotCar.jsx
│   │   │   ├── RecentActivityPreview.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── VehicleDetailsModal.jsx
│   │   └── pages/           # Application views
│   │       ├── DashboardView.jsx
│   │       ├── LandingPage.jsx
│   │       ├── OperationsPage.jsx
│   │       └── ParkingPage.jsx
│   └── ...
│
└── esp32/                   # Embedded Firmware
    └── smart_parking.ino    # Arduino sketch for ESP32 with pin debounce & Wi-Fi sync
```

---

## 🚀 Quick Start Guide

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.x or higher)
* [npm](https://www.npmjs.com/) (v9.x or higher)
* Optional: [Arduino IDE 2.x](https://www.arduino.cc/en/software) (for ESP32 hardware flashing)

---

### Option A: One-Click Launch (Recommended)

1. Clone or open the repository root:
   ```bash
   cd "smart model"
   ```

2. Install root and package dependencies:
   ```bash
   npm install
   npm install --prefix backend
   npm install --prefix frontend
   ```

3. Start both Backend and Frontend together:
   ```bash
   npm run dev
   ```
   *Windows users can also double-click **`start.bat`**.*

4. Open your browser:
   * **Frontend Web Dashboard:** [http://localhost:3000](http://localhost:3000)
   * **Backend REST API:** [http://localhost:5000](http://localhost:5000)

---

### Option B: Manual Setup

#### 1. Start Backend Server
```bash
cd backend
npm install
npm run dev
```
*Backend runs on `http://localhost:5000`.*

#### 2. Start Frontend Dev Server
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`.*

---

## 🧪 Hardware Simulator (No ESP32 Required)

You do **not** need physical ESP32 hardware to test the entire system! A built-in simulator accurately mimics the 3 IR sensors and the watchdog heartbeat:

### 1. Run Automated Test Simulation
Simulates random vehicle entries, vacating bays, and capacity limits:
```bash
cd backend
npm run simulate
```

### 2. Interactive CLI Simulator
Take direct control over individual sensors via keyboard:
```bash
cd backend
npm run simulate:cli
```
**Controls:**
* Press `1`, `2`, or `3` to toggle vehicle occupancy for Slot `P1`, `P2`, or `P3`.
* Press `f` to simulate a completely **Full** parking lot.
* Press `e` to **Empty** all bays.
* Press `g` to trigger the barrier gate.
* Press `q` to quit.

---

## ⚡ ESP32 Firmware Flashing

If you are using the real physical hardware:

1. Open **Arduino IDE**.
2. Go to **Tools $\rightarrow$ Board $\rightarrow$ ESP32 Arduino** and select **ESP32 Dev Module** (or NodeMCU-32S).
3. Install required libraries from Library Manager:
   * `ESP32Servo` by Kevin Harrington
   * `ArduinoJson` by Benoit Blanchon (v6 or v7)
4. Open [`esp32/smart_parking.ino`](esp32/smart_parking.ino).
5. Update your Wi-Fi credentials and your computer's local IP address:
   ```cpp
   const char* WIFI_SSID     = "YOUR_WIFI_NAME";
   const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
   const char* SERVER_URL    = "http://192.168.1.X:5000/api/parking/sync-sensors";
   ```
   *(Find your computer's IP using `ipconfig` on Windows or `ifconfig` on Linux/macOS).*
6. Connect the ESP32 via USB and click **Upload**.
7. Open Serial Monitor at **115200 baud** to view live sensor telemetry.

---

## 📡 REST API Reference

Base URL: `http://localhost:5000`

### 1. Get Parking Status
* **Endpoint:** `GET /api/parking/status`
* **Description:** Retrieves real-time state for all slots, capacity metrics, gate state, LED state, ESP32 watchdog health, and activity logs.
* **Sample Response:**
  ```json
  {
    "slots": { "P1": "Occupied", "P2": "Available", "P3": "Available" },
    "metrics": {
      "total": 3,
      "occupied": 1,
      "available": 2,
      "reserved": 0,
      "occupancyRate": 33,
      "availablePercent": 67
    },
    "gate": { "state": "Closed" },
    "led": { "on": true },
    "esp32": { "connected": true, "mode": "Hardware" }
  }
  ```

### 2. Synchronize Sensors (ESP32 / Simulator)
* **Endpoint:** `POST /api/parking/sync-sensors`
* **Body:**
  ```json
  {
    "p1": true,
    "p2": false,
    "p3": false,
    "source": "hardware"
  }
  ```
* **Response:** Returns updated metrics, commanded LED state, and gate position.

### 3. Automatically Assign Optimal Slot
* **Endpoint:** `POST /api/parking/assign`
* **Description:** Selects lowest-index vacant bay (`P1` $\rightarrow$ `P2` $\rightarrow$ `P3`) and reserves it.
* **Response (Success):** `200 OK`
  ```json
  {
    "success": true,
    "assignedSlot": "P2",
    "message": "Slot P2 assigned successfully."
  }
  ```
* **Response (Full):** `409 Conflict`

### 4. Reserve Specific Slot
* **Endpoint:** `POST /api/parking/reserve`
* **Body:** `{ "slotId": "P2" }`
* **Response:** `200 OK` or `409 Conflict` (if slot is occupied/already reserved).

### 5. Trigger Entrance Barrier Gate
* **Endpoint:** `POST /api/parking/gate/trigger`
* **Description:** Raises entrance barrier for 3 seconds if lot has vacancy. Auto-closes after 3 seconds.
* **Response:** `200 OK` or `409 Conflict` (if parking is 100% full).

### 6. Toggle Slot (Demo Helper)
* **Endpoint:** `POST /api/parking/slot/toggle`
* **Body:** `{ "slotId": "P1" }`
* **Description:** Instantly toggles occupancy state for manual UI testing.

### 7. Reset System State
* **Endpoint:** `POST /api/parking/reset`
* **Description:** Clears all reservations, vacates all slots, closes the barrier, and resets logs.

---

## 🛠️ Verification & Test Suite

Execute the backend automated test suite:
```bash
cd backend
npm test
```
This validates:
1. API initial state integrity
2. Automatic deterministic slot assignment
3. Reservation conflict prevention (`409 Conflict`)
4. Sensor state promotion (`Reserved` $\rightarrow$ `Occupied`)
5. Full capacity gate rejection logic
6. Reset routines

---

## 📜 License

This project is licensed under the [ISC License](backend/package.json). Feel free to use, modify, and distribute for academic, demonstration, and commercial prototyping purposes.
