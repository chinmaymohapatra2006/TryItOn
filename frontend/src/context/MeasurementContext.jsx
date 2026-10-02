import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Standard Body Profiles for Verification and Testing
 */
export const BODY_PRESETS = {
  small: {
    key: 'small',
    label: 'Small Body (Petite/Slim)',
    height: 155, // cm
    shoulderWidth: 35, // cm
    chest: 78, // cm
    waist: 58, // cm
    hip: 82, // cm
    armLength: 52, // cm
    legLength: 72, // cm
  },
  average: {
    key: 'average',
    label: 'Average Body (Standard)',
    height: 170,
    shoulderWidth: 40,
    chest: 90,
    waist: 70,
    hip: 95,
    armLength: 60,
    legLength: 80,
  },
  large: {
    key: 'large',
    label: 'Larger Body (Athletic/Curvy)',
    height: 180,
    shoulderWidth: 46,
    chest: 108,
    waist: 88,
    hip: 114,
    armLength: 66,
    legLength: 86,
  }
};

export const defaultMeasurements = BODY_PRESETS.average;

const MeasurementContext = createContext();

export const MeasurementProvider = ({ children }) => {
  const [activePreset, setActivePreset] = useState('average');
  const [measurements, setMeasurements] = useState(() => {
    try {
      const saved = sessionStorage.getItem('tryiton_measurements');
      return saved ? JSON.parse(saved) : defaultMeasurements;
    } catch {
      return defaultMeasurements;
    }
  });

  useEffect(() => {
    sessionStorage.setItem('tryiton_measurements', JSON.stringify(measurements));
  }, [measurements]);

  const updateMeasurements = (newMeasurements) => {
    setMeasurements((prev) => ({ ...prev, ...newMeasurements }));
    setActivePreset('custom');
  };

  const applyBodyPreset = (presetKey) => {
    if (BODY_PRESETS[presetKey]) {
      setMeasurements(BODY_PRESETS[presetKey]);
      setActivePreset(presetKey);
    }
  };

  const resetMeasurements = () => {
    setMeasurements(defaultMeasurements);
    setActivePreset('average');
  };

  return (
    <MeasurementContext.Provider value={{ 
      measurements, 
      activePreset,
      updateMeasurements, 
      applyBodyPreset, 
      resetMeasurements,
      presets: BODY_PRESETS 
    }}>
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

export default MeasurementContext;
