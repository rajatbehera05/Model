/*
 * ==============================================================================
 * Project: Smart Parking System - Physical Hardware Integration
 * Target Board: ESP32 Dev Module (NodeMCU-32S)
 * Framework: Arduino C++
 *
 * Hardware Pin Mapping (Strictly matched to prototype specification):
 *  - IR Sensor 1 (Entrance/Gate): GPIO 13 (Active-LOW: LOW = vehicle, HIGH = clear)
 *  - IR Sensor 2 (Physical Slot P1): GPIO 12 (Active-LOW: LOW = vehicle, HIGH = clear)
 *  - IR Sensor 3 (Physical Slot P2): GPIO 14 (Active-LOW: LOW = vehicle, HIGH = clear)
 *  - SG90 Micro Servo (Gate Barrier): GPIO 18 (PWM: 0 deg = Closed, 90 deg = Open)
 *  - Slot P3: Virtual/software slot (managed by backend)
 *  - Status LED: OMITTED (No LED used)
 *
 * Required Libraries (Install via Arduino Library Manager):
 *  - ESP32Servo by Kevin Harrington
 *  - ArduinoJson by Benoit Blanchon (v6 or v7)
 * Built-in ESP32 core libraries:
 *  - WiFi.h
 *  - HTTPClient.h
 *  - WiFiClientSecure.h
 * ==============================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ESP32Servo.h>
#include <ArduinoJson.h>

// -----------------------------------------------------------------------------
// USER CONFIGURATION: Wi-Fi & Backend Endpoint
// -----------------------------------------------------------------------------
const char* WIFI_SSID     = "YOUR_WIFI_SSID";         // Enter your 2.4 GHz Wi-Fi SSID
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";     // Enter your Wi-Fi Password

// Target Backend URL (Deployed Cloud Render Backend):
const char* BACKEND_URL = "https://model-1-fpn2.onrender.com/api/parking/sync-sensors";

// -----------------------------------------------------------------------------
// Hardware Pin Definitions
// -----------------------------------------------------------------------------
const int PIN_IR_ENTRANCE = 13; // IR1: Entrance / Barrier Gate
const int PIN_IR_P1       = 12; // IR2: Physical Slot P1
const int PIN_IR_P2       = 14; // IR3: Physical Slot P2
const int PIN_SERVO       = 18; // SG90 Servo PWM

// -----------------------------------------------------------------------------
// Operational Constants
// -----------------------------------------------------------------------------
const unsigned long DEBOUNCE_DELAY_MS   = 300;   // 300ms software debounce
const unsigned long HEARTBEAT_INTERVAL_MS = 2500; // 2.5s watchdog heartbeat sync
const int GATE_CLOSED_ANGLE             = 0;     // Barrier horizontal (closed)
const int GATE_OPEN_ANGLE               = 90;    // Barrier vertical (open)

// -----------------------------------------------------------------------------
// Debounce Tracking Structure
// -----------------------------------------------------------------------------
struct DebouncedSensor {
  const int pin;
  const char* name;
  bool isDetected;              // Debounced stable state (true = car present)
  bool lastRawReading;          // Previous raw digitalRead() reading
  unsigned long lastChangeTime; // Timestamp of raw state transition
};

DebouncedSensor sensorEntrance = { PIN_IR_ENTRANCE, "Entrance (IR1)", false, true, 0 };
DebouncedSensor sensorP1       = { PIN_IR_P1,       "Slot P1 (IR2)",   false, true, 0 };
DebouncedSensor sensorP2       = { PIN_IR_P2,       "Slot P2 (IR3)",   false, true, 0 };

// Servo and timing state
Servo gateServo;
int currentGateAngle = GATE_CLOSED_ANGLE;
unsigned long lastHeartbeatTime = 0;

// -----------------------------------------------------------------------------
// Function Declarations
// -----------------------------------------------------------------------------
void connectToWiFi();
bool updateDebouncedSensor(DebouncedSensor &sensor, unsigned long now);
void syncWithBackend();
void setGateAngle(int targetAngle);

// -----------------------------------------------------------------------------
// Arduino setup()
// -----------------------------------------------------------------------------
void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println();
  Serial.println("=================================================");
  Serial.println("   IoT Smart Parking System - ESP32 Controller   ");
  Serial.println("=================================================");

  // 1. Configure active-LOW IR sensors with internal pull-ups
  pinMode(sensorEntrance.pin, INPUT_PULLUP);
  pinMode(sensorP1.pin,       INPUT_PULLUP);
  pinMode(sensorP2.pin,       INPUT_PULLUP);

  // Read initial states (Active-LOW: LOW = Obstacle Detected)
  sensorEntrance.lastRawReading = digitalRead(sensorEntrance.pin);
  sensorEntrance.isDetected     = (sensorEntrance.lastRawReading == LOW);

  sensorP1.lastRawReading       = digitalRead(sensorP1.pin);
  sensorP1.isDetected           = (sensorP1.lastRawReading == LOW);

  sensorP2.lastRawReading       = digitalRead(sensorP2.pin);
  sensorP2.isDetected           = (sensorP2.lastRawReading == LOW);

  Serial.println("[OK] IR Sensors configured (GPIO 13 Entrance, GPIO 12 P1, GPIO 14 P2)");

  // 2. Configure SG90 Servo
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);
  gateServo.setPeriodHertz(50);              // Standard 50Hz PWM
  gateServo.attach(PIN_SERVO, 500, 2400);    // Standard SG90 pulse width
  setGateAngle(GATE_CLOSED_ANGLE);
  Serial.println("[OK] SG90 Gate Servo attached on GPIO 18 (Initialized to 0 deg Closed)");

  // 3. Connect to Wi-Fi network
  connectToWiFi();

  // 4. Perform initial state synchronization with backend
  Serial.println("[INFO] Sending initial sensor states to backend...");
  syncWithBackend();
  lastHeartbeatTime = millis();
}

// -----------------------------------------------------------------------------
// Arduino loop()
// -----------------------------------------------------------------------------
void loop() {
  unsigned long now = millis();

  // 1. Check Wi-Fi connection and reconnect if lost
  if (WiFi.status() != WL_CONNECTED) {
    connectToWiFi();
  }

  // 2. Read and debounce all 3 IR sensors (300ms window)
  bool changedEntrance = updateDebouncedSensor(sensorEntrance, now);
  bool changedP1       = updateDebouncedSensor(sensorP1, now);
  bool changedP2       = updateDebouncedSensor(sensorP2, now);

  bool anySensorChanged = changedEntrance || changedP1 || changedP2;

  // 3. Synchronize immediately upon any sensor state change
  if (anySensorChanged) {
    Serial.println("[EVENT] Sensor state change detected -> Triggering instant sync.");
    syncWithBackend();
    lastHeartbeatTime = now;
  }
  // 4. Or send periodic watchdog heartbeat every 2.5 seconds
  else if (now - lastHeartbeatTime >= HEARTBEAT_INTERVAL_MS) {
    lastHeartbeatTime = now;
    syncWithBackend();
  }

  delay(15); // Small yield to ESP32 system tasks
}

// -----------------------------------------------------------------------------
// Debounce Helper for Active-LOW Sensors
// -----------------------------------------------------------------------------
bool updateDebouncedSensor(DebouncedSensor &sensor, unsigned long now) {
  bool rawState = digitalRead(sensor.pin); // LOW = Detected, HIGH = Clear

  // Reset timer on raw bounce
  if (rawState != sensor.lastRawReading) {
    sensor.lastChangeTime = now;
    sensor.lastRawReading = rawState;
  }

  // Check if state remained stable for >= DEBOUNCE_DELAY_MS
  if ((now - sensor.lastChangeTime) >= DEBOUNCE_DELAY_MS) {
    bool stableDetected = (rawState == LOW);

    if (stableDetected != sensor.isDetected) {
      sensor.isDetected = stableDetected;
      Serial.print("[SENSOR] ");
      Serial.print(sensor.name);
      Serial.print(" transitioned to: ");
      Serial.println(sensor.isDetected ? "DETECTED (LOW)" : "CLEAR (HIGH)");
      return true; // State changed
    }
  }

  return false;
}

// -----------------------------------------------------------------------------
// Wi-Fi Connection Manager
// -----------------------------------------------------------------------------
void connectToWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.print("[WIFI] Connecting to SSID: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long startAttempt = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < 10000) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("[WIFI] Connected! IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("[WIFI] Connection pending / retrying in background...");
  }
}

// -----------------------------------------------------------------------------
// Synchronize Sensor State with Backend API
// -----------------------------------------------------------------------------
void syncWithBackend() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WARN] Wi-Fi offline - skipping backend sync.");
    return;
  }

  // Construct JSON request payload
#if ARDUINOJSON_VERSION_MAJOR >= 7
  JsonDocument doc;
#else
  StaticJsonDocument<384> doc;
#endif

  doc["source"]   = "hardware";
  doc["entrance"] = sensorEntrance.isDetected;
  doc["p1"]       = sensorP1.isDetected;
  doc["p2"]       = sensorP2.isDetected;

  String requestBody;
  serializeJson(doc, requestBody);

  HTTPClient http;
  WiFiClientSecure secureClient;
  WiFiClient plainClient;
  bool isHttps = String(BACKEND_URL).startsWith("https://");

  if (isHttps) {
    secureClient.setInsecure(); // Bypass CA verification for development & cloud endpoints
    http.begin(secureClient, BACKEND_URL);
  } else {
    http.begin(plainClient, BACKEND_URL);
  }

  http.addHeader("Content-Type", "application/json");
  http.setTimeout(4000); // 4-second timeout

  int httpCode = http.POST(requestBody);

  if (httpCode > 0) {
    if (httpCode == HTTP_CODE_OK) {
      String responseBody = http.getString();

#if ARDUINOJSON_VERSION_MAJOR >= 7
      JsonDocument responseDoc;
#else
      StaticJsonDocument<512> responseDoc;
#endif
      DeserializationError error = deserializeJson(responseDoc, responseBody);

      if (!error) {
        // Parse commanded gate state from backend response
        const char* gateCmd = responseDoc["command"]["gateState"] | "Closed";

        if (strcmp(gateCmd, "Open") == 0) {
          setGateAngle(GATE_OPEN_ANGLE);
        } else {
          setGateAngle(GATE_CLOSED_ANGLE);
        }

        int avail = responseDoc["metrics"]["available"] | -1;
        Serial.printf("[SYNC OK] Gate: %s | Available: %d/3\n", gateCmd, avail);
      } else {
        Serial.println("[ERR] JSON response parsing failed.");
      }
    } else {
      Serial.printf("[WARN] Backend responded with HTTP code: %d\n", httpCode);
    }
  } else {
    Serial.printf("[ERR] HTTP POST failed: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}

// -----------------------------------------------------------------------------
// SG90 Servo Actuator Control (Smooth Transition)
// -----------------------------------------------------------------------------
void setGateAngle(int targetAngle) {
  if (currentGateAngle == targetAngle) return;

  Serial.printf("[SERVO] Moving Gate from %d deg to %d deg...\n", currentGateAngle, targetAngle);

  // Smooth movement in small steps to protect micro-servo gears
  int step = (targetAngle > currentGateAngle) ? 3 : -3;
  while (currentGateAngle != targetAngle) {
    currentGateAngle += step;
    if ((step > 0 && currentGateAngle > targetAngle) ||
        (step < 0 && currentGateAngle < targetAngle)) {
      currentGateAngle = targetAngle;
    }
    gateServo.write(currentGateAngle);
    delay(15);
  }

  Serial.printf("[SERVO] Gate position reached: %d deg\n", currentGateAngle);
}
