import React, { createContext, useContext, useState } from 'react';

const CostumeContext = createContext();

export const defaultCostume = {
  id: 'casual-shirt',
  name: 'Casual Silk Shirt',
  category: 'Tops',
  modelUrl: '/costumes/shirt-female.glb',
  visible: true,
  color: '#6366f1',
  wireframe: false,
};

export const CostumeProvider = ({ children }) => {
  const [costume, setCostume] = useState(defaultCostume);

  const toggleVisibility = () => {
    setCostume((prev) => ({ ...prev, visible: !prev.visible }));
  };

  const updateCostume = (updates) => {
    setCostume((prev) => ({ ...prev, ...updates }));
  };

  const resetCostume = () => {
    setCostume(defaultCostume);
  };

  return (
    <CostumeContext.Provider value={{ costume, toggleVisibility, updateCostume, resetCostume }}>
      {children}
    </CostumeContext.Provider>
  );
};

export const useCostume = () => {
  const context = useContext(CostumeContext);
  if (!context) {
    throw new Error('useCostume must be used within a CostumeProvider');
  }
  return context;
};

export default CostumeContext;
