/**
 * Data-driven Costume Catalog & Fitting Metadata
 * Supports categories: Traditional, Casual, Formal
 */

export const COSTUME_CATEGORIES = ['All', 'Traditional', 'Casual', 'Formal'];

export const COSTUME_CATALOG = [
  // --- Traditional ---
  {
    id: 'kurta-female',
    name: 'Embroidered Silk Kurta',
    category: 'Traditional',
    modelUrl: '/costumes/kurta-female.glb',
    description: 'Elegant knee-length traditional tunic with decorative mandarin collar.',
    badge: 'Trending',
    defaultColor: '#d97706',
    availableColors: ['#d97706', '#b45309', '#047857', '#9333ea', '#be123c'],
    baseDimensions: { height: 170, shoulderWidth: 40, chest: 90, waist: 70, hip: 95, armLength: 60, legLength: 80 },
    scale: [1, 1, 1],
    attachmentBones: [
      'mixamorig:Hips', 'mixamorig:Spine', 'mixamorig:Spine1', 'mixamorig:Spine2',
      'mixamorig:Neck', 'mixamorig:LeftShoulder', 'mixamorig:RightShoulder',
      'mixamorig:LeftArm', 'mixamorig:RightArm', 'mixamorig:LeftForeArm', 'mixamorig:RightForeArm'
    ],
    fabricEase: { chest: 1.032, waist: 1.042, hip: 1.040, shoulders: 1.022, arms: 1.020 },
    offsets: { shoulderOffset: [0, 0.002, 0], chestOffset: [0, 0, 0.004], waistOffset: [0, 0, 0.003], hipOffset: [0, -0.002, 0] },
    polygonOffset: { factor: -2.2, units: -2.2 }
  },
  {
    id: 'sherwani-female',
    name: 'Royal Brocade Sherwani',
    category: 'Traditional',
    modelUrl: '/costumes/sherwani-female.glb',
    description: 'Regal structured ceremonial coat with handcrafted lapel detailing.',
    badge: 'Festive',
    defaultColor: '#b91c1c',
    availableColors: ['#b91c1c', '#7f1d1d', '#4338ca', '#0f766e', '#1e293b'],
    baseDimensions: { height: 170, shoulderWidth: 40, chest: 90, waist: 70, hip: 95, armLength: 60, legLength: 80 },
    scale: [1, 1, 1],
    attachmentBones: [
      'mixamorig:Hips', 'mixamorig:Spine', 'mixamorig:Spine1', 'mixamorig:Spine2',
      'mixamorig:Neck', 'mixamorig:LeftShoulder', 'mixamorig:RightShoulder',
      'mixamorig:LeftArm', 'mixamorig:RightArm', 'mixamorig:LeftForeArm', 'mixamorig:RightForeArm'
    ],
    fabricEase: { chest: 1.038, waist: 1.045, hip: 1.045, shoulders: 1.025, arms: 1.022 },
    offsets: { shoulderOffset: [0, 0.003, 0], chestOffset: [0, 0, 0.005], waistOffset: [0, 0, 0.004], hipOffset: [0, -0.003, 0] },
    polygonOffset: { factor: -2.4, units: -2.4 }
  },

  // --- Casual ---
  {
    id: 'shirt-female',
    name: 'Classic Silk Shirt',
    category: 'Casual',
    modelUrl: '/costumes/shirt-female.glb',
    description: 'Versatile button-down collared blouse with tailored shoulder seam.',
    badge: 'Essential',
    defaultColor: '#6366f1',
    availableColors: ['#6366f1', '#a855f7', '#f43f5e', '#10b981', '#475569', '#f8fafc'],
    baseDimensions: { height: 170, shoulderWidth: 40, chest: 90, waist: 70, hip: 95, armLength: 60, legLength: 80 },
    scale: [1, 1, 1],
    attachmentBones: [
      'mixamorig:Hips', 'mixamorig:Spine', 'mixamorig:Spine1', 'mixamorig:Spine2',
      'mixamorig:Neck', 'mixamorig:LeftShoulder', 'mixamorig:RightShoulder',
      'mixamorig:LeftArm', 'mixamorig:RightArm', 'mixamorig:LeftForeArm', 'mixamorig:RightForeArm'
    ],
    fabricEase: { chest: 1.028, waist: 1.035, hip: 1.030, shoulders: 1.020, arms: 1.018 },
    offsets: { shoulderOffset: [0, 0.002, 0], chestOffset: [0, 0, 0.004], waistOffset: [0, 0, 0.003], hipOffset: [0, -0.002, 0] },
    polygonOffset: { factor: -2.0, units: -2.0 }
  },
  {
    id: 'tshirt-female',
    name: 'Crewneck Fitted Tee',
    category: 'Casual',
    modelUrl: '/costumes/tshirt-female.glb',
    description: 'Minimalist athletic stretch cotton tee for casual everyday wear.',
    badge: 'Popular',
    defaultColor: '#0284c7',
    availableColors: ['#0284c7', '#0d9488', '#ea580c', '#e11d48', '#334155'],
    baseDimensions: { height: 170, shoulderWidth: 40, chest: 90, waist: 70, hip: 95, armLength: 60, legLength: 80 },
    scale: [1, 1, 1],
    attachmentBones: [
      'mixamorig:Hips', 'mixamorig:Spine', 'mixamorig:Spine1', 'mixamorig:Spine2',
      'mixamorig:Neck', 'mixamorig:LeftShoulder', 'mixamorig:RightShoulder',
      'mixamorig:LeftArm', 'mixamorig:RightArm'
    ],
    fabricEase: { chest: 1.020, waist: 1.024, hip: 1.022, shoulders: 1.015, arms: 1.014 },
    offsets: { shoulderOffset: [0, 0.001, 0], chestOffset: [0, 0, 0.002], waistOffset: [0, 0, 0.002], hipOffset: [0, 0, 0] },
    polygonOffset: { factor: -1.8, units: -1.8 }
  },

  // --- Formal ---
  {
    id: 'jacket-female',
    name: 'Tailored Tuxedo Blazer',
    category: 'Formal',
    modelUrl: '/costumes/jacket-female.glb',
    description: 'Structured evening blazer with sharp notched lapel and satin trim.',
    badge: 'Premium',
    defaultColor: '#1e293b',
    availableColors: ['#1e293b', '#0f172a', '#475569', '#3b82f6', '#831843'],
    baseDimensions: { height: 170, shoulderWidth: 40, chest: 90, waist: 70, hip: 95, armLength: 60, legLength: 80 },
    scale: [1, 1, 1],
    attachmentBones: [
      'mixamorig:Hips', 'mixamorig:Spine', 'mixamorig:Spine1', 'mixamorig:Spine2',
      'mixamorig:Neck', 'mixamorig:LeftShoulder', 'mixamorig:RightShoulder',
      'mixamorig:LeftArm', 'mixamorig:RightArm', 'mixamorig:LeftForeArm', 'mixamorig:RightForeArm'
    ],
    fabricEase: { chest: 1.040, waist: 1.046, hip: 1.042, shoulders: 1.028, arms: 1.024 },
    offsets: { shoulderOffset: [0, 0.003, 0], chestOffset: [0, 0, 0.006], waistOffset: [0, 0, 0.004], hipOffset: [0, -0.002, 0] },
    polygonOffset: { factor: -2.5, units: -2.5 }
  }
];

export const COSTUME_METADATA = COSTUME_CATALOG.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

export const getCostumeMetadata = (id = 'shirt-female') => {
  const safeId = (typeof id === 'string' && id.trim()) ? id.trim() : 'shirt-female';
  if (COSTUME_METADATA[safeId]) return COSTUME_METADATA[safeId];
  // Support aliases like 'shirt', 'kurta', 'tshirt', 'jacket', 'sherwani'
  const aliasMatch = COSTUME_CATALOG.find(c => 
    c.id.startsWith(safeId) || safeId.startsWith(c.id.split('-')[0])
  );
  if (aliasMatch) return aliasMatch;
  return COSTUME_CATALOG[0];
};

export default COSTUME_CATALOG;
