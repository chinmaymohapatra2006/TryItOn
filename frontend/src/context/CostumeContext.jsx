import React, { createContext, useContext, useState, useMemo } from 'react';
import { COSTUME_CATALOG, COSTUME_CATEGORIES, getCostumeMetadata } from '../config/costumeMetadata.js';

const CostumeContext = createContext();

export const CostumeProvider = ({ children }) => {
  const [selectedCostumeId, setSelectedCostumeId] = useState('shirt-female');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [colorOverrides, setColorOverrides] = useState({});
  const [visible, setVisible] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [isLoadingCostume, setIsLoadingCostume] = useState(false);
  const [costumeError, setCostumeError] = useState(null);

  // Active costume object with applied colorway overrides
  const activeCostume = useMemo(() => {
    const base = getCostumeMetadata(selectedCostumeId);
    const activeColor = colorOverrides[selectedCostumeId] || base.defaultColor;
    return {
      ...base,
      color: activeColor,
      visible,
      wireframe
    };
  }, [selectedCostumeId, colorOverrides, visible, wireframe]);

  // Filtered catalog by active category
  const filteredCatalog = useMemo(() => {
    if (selectedCategory === 'All') return COSTUME_CATALOG;
    return COSTUME_CATALOG.filter(c => c.category === selectedCategory);
  }, [selectedCategory]);

  const selectCostume = (id) => {
    const resolved = getCostumeMetadata(id)?.id || id;
    if (resolved === selectedCostumeId) return;
    setIsLoadingCostume(true);
    setCostumeError(null);
    setSelectedCostumeId(resolved);
    // Loading state is cleanly resolved when R3F finishes compiling the new mesh
    setTimeout(() => setIsLoadingCostume(false), 250);
  };

  const updateActiveColor = (color) => {
    setColorOverrides(prev => ({
      ...prev,
      [selectedCostumeId]: color
    }));
  };

  const updateCostume = (updates = {}) => {
    if (updates.color !== undefined) {
      updateActiveColor(updates.color);
    }
    if (updates.visible !== undefined) {
      setVisible(updates.visible);
    }
    if (updates.wireframe !== undefined) {
      setWireframe(updates.wireframe);
    }
  };

  const toggleVisibility = () => {
    setVisible(prev => !prev);
  };

  const toggleWireframe = () => {
    setWireframe(prev => !prev);
  };

  const resetCostume = () => {
    setSelectedCostumeId('shirt-female');
    setColorOverrides({});
    setVisible(true);
    setWireframe(false);
    setCostumeError(null);
  };

  return (
    <CostumeContext.Provider value={{
      catalog: COSTUME_CATALOG,
      categories: COSTUME_CATEGORIES,
      filteredCatalog,
      selectedCategory,
      setSelectedCategory,
      selectedCostumeId,
      costume: activeCostume,
      selectCostume,
      updateActiveColor,
      updateCostume,
      toggleVisibility,
      toggleWireframe,
      resetCostume,
      isLoadingCostume,
      costumeError,
      setCostumeError
    }}>
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
