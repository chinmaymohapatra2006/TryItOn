import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Reusable Avatar Parameters
 */
export const defaultMeasurements = {
  height: 170, // cm
  shoulderWidth: 40, // cm
  chest: 90, // cm
  waist: 70, // cm
  hip: 95, // cm
  armLength: 60, // cm
  legLength: 80, // cm
};

const MeasurementContext = createContext();

export const MeasurementProvider = ({ children }) => {
  const [measurements, setMeasurements] = useState(() => {
    const saved = sessionStorage.getItem('tryiton_measurements');
    return saved ? JSON.parse(saved) : defaultMeasurements;
  });

  useEffect(() => {
    sessionStorage.setItem('tryiton_measurements', JSON.stringify(measurements));
  }, [measurements]);

  const updateMeasurements = (newMeasurements) => {
    setMeasurements((prev) => ({ ...prev, ...newMeasurements }));
  };

  const resetMeasurements = () => {
    setMeasurements(defaultMeasurements);
  };

  return (
    <MeasurementContext.Provider value={{ measurements, updateMeasurements, resetMeasurements }}>
      {children}
    </MeasurementContext.Provider>
  );
};

export const useMeasurements = () => {
  const context = useContext(MeasurementContext);
  if (!context) {
    throw new Error('useMeasurements must be used within a MeasurementProvider');
  }
  return context;
};
