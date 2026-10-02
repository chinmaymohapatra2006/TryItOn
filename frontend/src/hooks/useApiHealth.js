import { useState, useEffect, useCallback } from 'react';
import { fetchHealthStatus } from '../services/api.js';

export const useApiHealth = (autoPoll = false, pollInterval = 10000) => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latency, setLatency] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const checkHealth = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await fetchHealthStatus();
    setLatency(result.latency);
    setLastChecked(new Date().toLocaleTimeString());

    if (result.success) {
      setHealthData(result.data);
      setError(null);
    } else {
      setError(result.error);
      setHealthData(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkHealth();

    if (!autoPoll) return;

    const timer = setInterval(() => {
      checkHealth();
    }, pollInterval);

    return () => clearInterval(timer);
  }, [checkHealth, autoPoll, pollInterval]);

  return {
    healthData,
    loading,
    error,
    latency,
    lastChecked,
    refresh: checkHealth,
  };
};
