import { useState, useEffect, useRef } from 'react';
import { fetchEnvironmentData } from '../api/parkingApi';
import { ENVIRONMENT_CONFIG } from '../config/environmentConfig';

/**
 * Custom hook to monitor environmental data.
 * Polls backend GET /api/environment every 3.8 seconds.
 * Seamlessly falls back to local smooth simulation if backend is offline.
 * 
 * Hardware-ready: switches automatically if source is not 'simulation'.
 */
export function useEnvironment() {
  const [data, setData] = useState({
    temperature: ENVIRONMENT_CONFIG.SIMULATION.TEMP_DEFAULT,
    humidity: ENVIRONMENT_CONFIG.SIMULATION.HUMIDITY_DEFAULT,
    unit: 'metric',
    source: 'simulation',
    timestamp: new Date().toISOString(),
    isLive: true
  });

  const lastLocalRef = useRef({
    temperature: ENVIRONMENT_CONFIG.SIMULATION.TEMP_DEFAULT,
    humidity: ENVIRONMENT_CONFIG.SIMULATION.HUMIDITY_DEFAULT
  });

  useEffect(() => {
    let isMounted = true;

    const syncEnvironment = async () => {
      try {
        const response = await fetchEnvironmentData();
        if (isMounted && response && typeof response.temperature === 'number') {
          setData({
            temperature: Number(response.temperature.toFixed(1)),
            humidity: Math.round(response.humidity),
            unit: response.unit || 'metric',
            source: response.source || 'simulation',
            timestamp: response.timestamp || new Date().toISOString(),
            isLive: true
          });
          lastLocalRef.current = {
            temperature: response.temperature,
            humidity: response.humidity
          };
          return;
        }
      } catch (err) {
        // Backend unavailable or error: graceful client-side gentle drift
      }

      // Smooth client-side fallback simulation within specified boundaries
      if (isMounted) {
        const current = lastLocalRef.current;
        const tempStep = (Math.random() - 0.5) * ENVIRONMENT_CONFIG.SIMULATION.TEMP_STEP_MAX * 2;
        const humStep = (Math.random() - 0.5) * ENVIRONMENT_CONFIG.SIMULATION.HUMIDITY_STEP_MAX * 2;

        let nextTemp = Math.round((current.temperature + tempStep) * 10) / 10;
        if (nextTemp < ENVIRONMENT_CONFIG.SIMULATION.TEMP_MIN) nextTemp = ENVIRONMENT_CONFIG.SIMULATION.TEMP_MIN + 0.2;
        if (nextTemp > ENVIRONMENT_CONFIG.SIMULATION.TEMP_MAX) nextTemp = ENVIRONMENT_CONFIG.SIMULATION.TEMP_MAX - 0.2;

        let nextHum = Math.round(current.humidity + humStep);
        if (nextHum < ENVIRONMENT_CONFIG.SIMULATION.HUMIDITY_MIN) nextHum = ENVIRONMENT_CONFIG.SIMULATION.HUMIDITY_MIN + 1;
        if (nextHum > ENVIRONMENT_CONFIG.SIMULATION.HUMIDITY_MAX) nextHum = ENVIRONMENT_CONFIG.SIMULATION.HUMIDITY_MAX - 1;

        lastLocalRef.current = { temperature: nextTemp, humidity: nextHum };

        setData({
          temperature: nextTemp,
          humidity: nextHum,
          unit: 'metric',
          source: 'simulation',
          timestamp: new Date().toISOString(),
          isLive: false // simulated locally
        });
      }
    };

    // Initial sync
    syncEnvironment();

    // 3.8s periodic interval
    const intervalId = setInterval(syncEnvironment, ENVIRONMENT_CONFIG.UPDATE_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return data;
}
