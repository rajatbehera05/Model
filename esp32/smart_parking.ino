/*
 * ==============================================================================
 * Project: Smart Parking System (3-Slot Prototype)
 * Phase: Phase 1 - Hardware Bench Test
 * Target Board: ESP32 DevKit v1 (NodeMCU-32S)
 * Framework: Arduino C++
 *
 * Description:
 * Bench test firmware to independently verify hardware functionality:
 *  - 3x Active-LOW IR Obstacle Sensors (P1: GPIO 13, P2: GPIO 12, P3: GPIO 14)
 *  - 1x SG90 Micro Servo Motor Gate (Signal: GPIO 18)
 *  - 1x Overall Status LED (Anode: GPIO 2 through 220 ohm resistor)
 *
 * Features:
 *  - 300ms software debounce for optical sensor stability
 *  - Real-time calculation of Available and Occupied slots
 *  - Status LED: ON if >= 1 slot available, OFF if lot is full (0 available)
 *  - Servo Gate startup verification (0 deg -> 90 deg -> 0 deg)
 *  - Interactive Serial commands ('o' = open gate, 'c' = close gate, 's' = status)
 * ==============================================================================
 */

#include <ESP32Servo.h>

// -----------------------------------------------------------------------------
// Pin Configuration (Strictly matched to PRD)
// -----------------------------------------------------------------------------
const int PIN_IR_P1  = 13;   // IR Sensor 1 (Slot P1)
const int PIN_IR_P2  = 12;   // IR Sensor 2 (Slot P2)
const int PIN_IR_P3  = 14;   // IR Sensor 3 (Slot P3)
const int PIN_SERVO  = 18;   // SG90 Servo PWM Signal Pin
const int PIN_LED    = 2;    // Overall Lot Status LED (via 220 ohm resistor)

// -----------------------------------------------------------------------------
// Constants & Configuration
// -----------------------------------------------------------------------------
const int TOTAL_SLOTS = 3;
const unsigned long DEBOUNCE_DELAY_MS = 300;   // 300ms debounce as per PRD
const unsigned long TELEMETRY_INTERVAL_MS = 1000; // Periodic print every 1 second

const int GATE_CLOSED_ANGLE = 0;   // Barrier horizontal (closed)
const int GATE_OPEN_ANGLE   = 90;  // Barrier vertical (open)

// -----------------------------------------------------------------------------
// Global Objects & State Variables
// -----------------------------------------------------------------------------
Servo gateServo;

// Debounce state tracking for each slot
struct SlotSensor {
  int pin;
  const char* name;
  bool isOccupied;           // Debounced stable state (true = car present)
  bool lastRawReading;       // Previous raw reading from digitalRead
  unsigned long lastChangeTime; // Timestamp of raw state transition
};

SlotSensor slots[TOTAL_SLOTS] = {
  { PIN_IR_P1, "P1", false, true, 0 },
  { PIN_IR_P2, "P2", false, true, 0 },
  { PIN_IR_P3, "P3", false, true, 0 }
};

int occupiedCount = 0;
int availableCount = 3;
unsigned long lastTelemetryTime = 0;

// -----------------------------------------------------------------------------
// Function Prototypes
// -----------------------------------------------------------------------------
void readSensorsWithDebounce();
void updateParkingStatus();
void setGateAngle(int angle);
void testServoSequence();
void printTelemetry();
void handleSerialCommands();

// -----------------------------------------------------------------------------
// Arduino Setup Function
// -----------------------------------------------------------------------------
void setup() {
  // Initialize USB Serial Monitor
  Serial.begin(115200);
  delay(500);

  Serial.println();
  Serial.println("=================================================");
  Serial.println("   IoT Smart Parking System - Bench Test (Phase 1)");
  Serial.println("=================================================");
  Serial.println("[INFO] Booting ESP32 Controller...");

  // 1. Configure IR sensor pins with internal pull-up
  // Active-LOW sensors: Output is LOW when car is detected, HIGH when empty
  for (int i = 0; i < TOTAL_SLOTS; i++) {
    pinMode(slots[i].pin, INPUT_PULLUP);
    bool initialRaw = digitalRead(slots[i].pin);
    slots[i].lastRawReading = initialRaw;
    slots[i].isOccupied = (initialRaw == LOW); // LOW = obstacle detected
  }
  Serial.println("[OK] IR Sensor Pins configured (GPIO 13, 12, 14 as INPUT_PULLUP)");

  // 2. Configure overall status LED pin
  pinMode(PIN_LED, OUTPUT);
  digitalWrite(PIN_LED, LOW);
  Serial.println("[OK] Status LED Pin configured (GPIO 2 as OUTPUT)");

  // 3. Configure SG90 Servo
  // Allow allocation of all timers for ESP32Servo library
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);
  gateServo.setPeriodHertz(50); // Standard 50Hz servo PWM
  gateServo.attach(PIN_SERVO, 500, 2400); // Standard SG90 micro-servo pulse width

  Serial.println("[OK] SG90 Servo attached on GPIO 18");
  Serial.println("[INFO] Running Servo self-test sequence...");
  testServoSequence();

  // 4. Initial status calculation
  updateParkingStatus();

  Serial.println("-------------------------------------------------");
  Serial.println("System Ready! You can type commands in Serial:");
  Serial.println("  'o' -> Open entrance gate (90 deg for 3s)");
  Serial.println("  'c' -> Close entrance gate (0 deg)");
  Serial.println("  's' -> Print instant status");
  Serial.println("-------------------------------------------------");
}

// -----------------------------------------------------------------------------
// Arduino Main Loop
// -----------------------------------------------------------------------------
void loop() {
  // 1. Continuously sample and debounce IR sensors
  readSensorsWithDebounce();

  // 2. Check for manual commands entered via Serial Monitor
  handleSerialCommands();

  // 3. Output periodic status telemetry every 1 second
  unsigned long currentMillis = millis();
  if (currentMillis - lastTelemetryTime >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryTime = currentMillis;
    printTelemetry();
  }

  // Small delay to yield to ESP32 system tasks
  delay(10);
}

// -----------------------------------------------------------------------------
// Read and Debounce Active-LOW IR Sensors
// -----------------------------------------------------------------------------
void readSensorsWithDebounce() {
  unsigned long now = millis();
  bool stateChangedAny = false;

  for (int i = 0; i < TOTAL_SLOTS; i++) {
    // Read raw hardware state: LOW = Obstacle, HIGH = Free
    bool rawState = digitalRead(slots[i].pin);

    // If raw reading changed since last cycle, reset debounce timer
    if (rawState != slots[i].lastRawReading) {
      slots[i].lastChangeTime = now;
      slots[i].lastRawReading = rawState;
    }

    // If raw reading has been stable for longer than DEBOUNCE_DELAY_MS
    if ((now - slots[i].lastChangeTime) > DEBOUNCE_DELAY_MS) {
      bool newOccupiedState = (rawState == LOW);

      // If stable debounced state differs from registered state, update it
      if (newOccupiedState != slots[i].isOccupied) {
        slots[i].isOccupied = newOccupiedState;
        stateChangedAny = true;

        Serial.print("[EVENT] Slot ");
        Serial.print(slots[i].name);
        if (slots[i].isOccupied) {
          Serial.println(" -> OCCUPIED (Car Detected)");
        } else {
          Serial.println(" -> AVAILABLE (Car Departed)");
        }
      }
    }
  }

  // If any slot changed state, immediately update lot counts and LED
  if (stateChangedAny) {
    updateParkingStatus();
    printTelemetry();
  }
}

// -----------------------------------------------------------------------------
// Calculate Counts and Update LED Indicator
// -----------------------------------------------------------------------------
void updateParkingStatus() {
  int currentOccupied = 0;
  for (int i = 0; i < TOTAL_SLOTS; i++) {
    if (slots[i].isOccupied) {
      currentOccupied++;
    }
  }

  occupiedCount = currentOccupied;
  availableCount = TOTAL_SLOTS - occupiedCount;

  // PRD Requirement:
  // - At least one slot available (availableCount >= 1): LED ON
  // - All slots occupied (availableCount == 0): LED OFF
  if (availableCount > 0) {
    digitalWrite(PIN_LED, HIGH); // LED ON
  } else {
    digitalWrite(PIN_LED, LOW);  // LED OFF (Parking Full)
  }
}

// -----------------------------------------------------------------------------
// Servo Gate Control Function
// -----------------------------------------------------------------------------
void setGateAngle(int angle) {
  gateServo.write(angle);
}

// -----------------------------------------------------------------------------
// Servo Self-Test Sequence (0 deg -> 90 deg -> 0 deg)
// -----------------------------------------------------------------------------
void testServoSequence() {
  Serial.println("  -> Setting Gate to CLOSED (0 deg)...");
  setGateAngle(GATE_CLOSED_ANGLE);
  delay(800);

  Serial.println("  -> Opening Gate to 90 deg...");
  setGateAngle(GATE_OPEN_ANGLE);
  delay(1200);

  Serial.println("  -> Closing Gate back to 0 deg...");
  setGateAngle(GATE_CLOSED_ANGLE);
  delay(800);

  Serial.println("[OK] Servo self-test completed.");
}

// -----------------------------------------------------------------------------
// Print Clean Status Table to Serial Monitor
// -----------------------------------------------------------------------------
void printTelemetry() {
  int availabilityPct = (availableCount * 100) / TOTAL_SLOTS;

  Serial.println();
  Serial.println("+------+------------+------------------+");
  Serial.println("| Slot | Hardware   | Status           |");
  Serial.println("+------+------------+------------------+");
  for (int i = 0; i < TOTAL_SLOTS; i++) {
    Serial.print("|  ");
    Serial.print(slots[i].name);
    Serial.print("  | GPIO ");
    Serial.print(slots[i].pin);
    if (slots[i].isOccupied) {
      Serial.println("    | [!] OCCUPIED     |");
    } else {
      Serial.println("    | [o] AVAILABLE    |");
    }
  }
  Serial.println("+------+------------+------------------+");
  Serial.print("Total: ");
  Serial.print(TOTAL_SLOTS);
  Serial.print(" | Occupied: ");
  Serial.print(occupiedCount);
  Serial.print(" | Available: ");
  Serial.print(availableCount);
  Serial.print(" | Capacity: ");
  Serial.print(availabilityPct);
  Serial.println("%");

  Serial.print("Entrance LED: ");
  Serial.print((availableCount > 0) ? "ON (Spaces Open)" : "OFF (PARKING FULL)");
  Serial.println();
}

// -----------------------------------------------------------------------------
// Serial Input Command Handler for Manual Testing
// -----------------------------------------------------------------------------
void handleSerialCommands() {
  if (Serial.available() > 0) {
    char cmd = Serial.read();

    // Ignore newline or carriage return characters
    if (cmd == '\r' || cmd == '\n') return;

    switch (cmd) {
      case 'o':
      case 'O':
        Serial.println("\n[CMD] Manual Open requested! Raising gate to 90 deg...");
        setGateAngle(GATE_OPEN_ANGLE);
        delay(3000); // Hold open for 3 seconds as defined in PRD
        Serial.println("[CMD] Auto-closing gate back to 0 deg...");
        setGateAngle(GATE_CLOSED_ANGLE);
        break;

      case 'c':
      case 'C':
        Serial.println("\n[CMD] Manual Close requested! Locking gate at 0 deg...");
        setGateAngle(GATE_CLOSED_ANGLE);
        break;

      case 's':
      case 'S':
        printTelemetry();
        break;

      default:
        Serial.print("\n[?] Unknown command: '");
        Serial.print(cmd);
        Serial.println("'. Use 'o' (open), 'c' (close), or 's' (status).");
        break;
    }
  }
}
