/**
 * Costume Fitting Metadata Dictionary
 * Specifies base anthropometric dimensions, bone attachments, ease allowances, and offsets.
 */
export const COSTUME_METADATA = {
  'shirt-female': {
    id: 'shirt-female',
    name: 'Casual Silk Shirt',
    category: 'tops',
    modelUrl: '/costumes/shirt-female.glb',
    baseDimensions: {
      height: 170, // cm
      shoulderWidth: 40, // cm
      chest: 90, // cm
      waist: 70, // cm
      hip: 95, // cm
      armLength: 60, // cm
      legLength: 80, // cm
    },
    // Scale applied to costume root
    scale: [1, 1, 1],
    // Joint associations for skeleton-based attachment
    attachmentBones: [
      'mixamorig:Hips',
      'mixamorig:Spine',
      'mixamorig:Spine1',
      'mixamorig:Spine2',
      'mixamorig:Neck',
      'mixamorig:LeftShoulder',
      'mixamorig:RightShoulder',
      'mixamorig:LeftArm',
      'mixamorig:RightArm',
      'mixamorig:LeftForeArm',
      'mixamorig:RightForeArm'
    ],
    // Fabric ease coefficients (prevents clipping between cloth and skin across body shapes)
    fabricEase: {
      chest: 1.028,    // +2.8% clearance over chest
      waist: 1.035,    // +3.5% clearance over waist
      hip: 1.030,      // +3.0% clearance over hips
      shoulders: 1.020,// +2.0% clearance over shoulders
      arms: 1.018      // +1.8% clearance along arms
    },
    // Fine-tuned positional offsets for critical anatomical regions
    offsets: {
      shoulderOffset: [0, 0.002, 0],
      chestOffset: [0, 0, 0.004],
      waistOffset: [0, 0, 0.003],
      hipOffset: [0, -0.002, 0]
    },
    length: 0.65,
    polygonOffset: {
      factor: -2.0,
      units: -2.0
    }
  }
};

export const getCostumeMetadata = (id = 'shirt-female') => {
  return COSTUME_METADATA[id] || COSTUME_METADATA['shirt-female'];
};

export default COSTUME_METADATA;
