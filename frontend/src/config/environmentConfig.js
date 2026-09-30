/**
 * Configuration & Threshold Constants for Environmental Monitoring (DHT11 / DHT22 Ready)
 * 
 * Thresholds can be altered here without affecting UI component implementation.
 */

export const ENVIRONMENT_CONFIG = {
  // Update frequency (between 3 - 5 seconds per PRD requirements)
  UPDATE_INTERVAL_MS: 3800,

  // Simulation drift bounds
  SIMULATION: {
    TEMP_MIN: 25.0,
    TEMP_MAX: 31.0,
    TEMP_DEFAULT: 27.4,
    HUMIDITY_MIN: 50,
    HUMIDITY_MAX: 70,
    HUMIDITY_DEFAULT: 61,
    TEMP_STEP_MAX: 0.3,
    HUMIDITY_STEP_MAX: 1.0,
  },

  // Gauge / Visual Indicator Range Scale
  SCALES: {
    TEMPERATURE: {
      MIN: 10,
      MAX: 42,
      UNIT: '°C',
      NORMAL_RANGE: '18°C – 30°C'
    },
    HUMIDITY: {
      MIN: 0,
      MAX: 100,
      UNIT: '%',
      COMFORTABLE_RANGE: '40% – 70%'
    }
  },

  // Temperature Thresholds & Status Definitions
  TEMPERATURE_THRESHOLDS: [
    {
      condition: (temp) => temp < 18,
      status: 'Cool',
      badgeClass: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
      indicatorColor: '#3B82F6',
      description: 'Below standard indoor operating range'
    },
    {
      condition: (temp) => temp >= 18 && temp <= 30,
      status: 'Normal',
      badgeClass: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
      indicatorColor: '#10B981',
      description: 'Optimal ambient temperature for parking facility'
    },
    {
      condition: (temp) => temp > 30,
      status: 'Warm',
      badgeClass: 'bg-[#FFF7ED] text-[#EA580C] border-[#FFEDD5]',
      indicatorColor: '#F97316',
      description: 'Elevated ambient temperature detected'
    }
  ],

  // Humidity Thresholds & Status Definitions
  HUMIDITY_THRESHOLDS: [
    {
      condition: (hum) => hum < 40,
      status: 'Dry',
      badgeClass: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
      indicatorColor: '#F59E0B',
      description: 'Low air moisture level'
    },
    {
      condition: (hum) => hum >= 40 && hum <= 70,
      status: 'Comfortable',
      badgeClass: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
      indicatorColor: '#10B981',
      description: 'Ideal indoor relative humidity'
    },
    {
      condition: (hum) => hum > 70,
      status: 'Humid',
      badgeClass: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
      indicatorColor: '#3B82F6',
      description: 'High moisture level detected'
    }
  ]
};

/**
 * Returns the status object for a given temperature value.
 * @param {number} temp - Current temperature in Celsius
 */
export function getTemperatureStatus(temp) {
  const match = ENVIRONMENT_CONFIG.TEMPERATURE_THRESHOLDS.find(t => t.condition(temp));
  return match || {
    status: 'Normal',
    badgeClass: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
    indicatorColor: '#10B981',
    description: 'Optimal ambient temperature'
  };
}

/**
 * Returns the status object for a given relative humidity percentage.
 * @param {number} humidity - Current humidity in percentage (0 - 100)
 */
export function getHumidityStatus(humidity) {
  const match = ENVIRONMENT_CONFIG.HUMIDITY_THRESHOLDS.find(h => h.condition(humidity));
  return match || {
    status: 'Comfortable',
    badgeClass: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
    indicatorColor: '#10B981',
    description: 'Ideal relative humidity'
  };
}
