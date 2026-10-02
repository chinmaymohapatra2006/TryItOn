import { getCostumeMetadata } from '../config/costumeMetadata.js';

/**
 * CostumeFitter
 * Reusable system that calculates and applies proportional fitting transforms
 * from avatar body parameters onto 3D costume assets.
 */
export class CostumeFitter {
  /**
   * Step 1 & 2: Calculate body dimensions and scale ratios
   */
  static calculateBodyDimensions(userMeasurements = {}, metadata = {}) {
    const base = metadata?.baseDimensions || {
      height: 170,
      shoulderWidth: 40,
      chest: 90,
      waist: 70,
      hip: 95,
      armLength: 60,
      legLength: 80,
    };
    const m = { ...base, ...(userMeasurements || {}) };
    const ease = metadata?.fabricEase || {
      chest: 1.025,
      waist: 1.03,
      hip: 1.025,
      shoulders: 1.02,
      arms: 1.018,
    };

    const heightRatio = (m.height || base.height) / (base.height || 170);
    const shoulderRatio = ((m.shoulderWidth || base.shoulderWidth) / (base.shoulderWidth || 40)) * (ease.shoulders || 1.02);
    const chestRatio = ((m.chest || base.chest) / (base.chest || 90)) * (ease.chest || 1.025);
    const waistRatio = ((m.waist || base.waist) / (base.waist || 70)) * (ease.waist || 1.03);
    const hipRatio = ((m.hip || base.hip) / (base.hip || 95)) * (ease.hip || 1.025);
    const armRatio = (((m.armLength || base.armLength) / (base.armLength || 60)) * (ease.arms || 1.018));
    const legRatio = (m.legLength || base.legLength) / (base.legLength || 80);

    return {
      heightRatio: isNaN(heightRatio) ? 1 : heightRatio,
      shoulderRatio: isNaN(shoulderRatio) ? 1 : shoulderRatio,
      chestRatio: isNaN(chestRatio) ? 1 : chestRatio,
      waistRatio: isNaN(waistRatio) ? 1 : waistRatio,
      hipRatio: isNaN(hipRatio) ? 1 : hipRatio,
      armRatio: isNaN(armRatio) ? 1 : armRatio,
      legRatio: isNaN(legRatio) ? 1 : legRatio,
      profile: this.classifyBodyProfile(m, base),
    };
  }

  /**
   * Classify body profile based on torso & height ratios
   */
  static classifyBodyProfile(userMeasurements = {}, base = {}) {
    const chest = userMeasurements.chest || base.chest || 90;
    const waist = userMeasurements.waist || base.waist || 70;
    const hip = userMeasurements.hip || base.hip || 95;
    const bChest = base.chest || 90;
    const bWaist = base.waist || 70;
    const bHip = base.hip || 95;

    const averageRatio = (
      (chest / bChest) +
      (waist / bWaist) +
      (hip / bHip)
    ) / 3;

    if (averageRatio < 0.92) return 'Small / Slim';
    if (averageRatio > 1.08) return 'Larger / Plus';
    return 'Average / Standard';
  }

  /**
   * Step 3, 4 & 5: Compute scale, offsets, and rotations for each skeletal attachment bone
   */
  static calculateBoneTransforms(dimensions, metadata = {}, poseState = {}) {
    const offsets = metadata?.offsets || {};

    const transforms = {
      // Hips: Controls lower torso, hip girth, and overall vertical height
      'mixamorig:hips': {
        scale: [dimensions.hipRatio, dimensions.heightRatio, dimensions.hipRatio],
        offset: offsets.hipOffset || [0, 0, 0],
      },
      // Waist: Lower and mid spine girth
      'mixamorig:spine': {
        scale: [dimensions.waistRatio, 1, dimensions.waistRatio],
        offset: offsets.waistOffset || [0, 0, 0],
      },
      'mixamorig:spine1': {
        scale: [dimensions.waistRatio, 1, dimensions.waistRatio],
        offset: offsets.waistOffset || [0, 0, 0],
      },
      // Chest: Upper torso girth & bust allowance
      'mixamorig:spine2': {
        scale: [dimensions.chestRatio, 1, dimensions.chestRatio],
        offset: offsets.chestOffset || [0, 0, 0],
      },
      // Neck
      'mixamorig:neck': {
        scale: [1, 1, 1],
        offset: [0, 0, 0],
      },
      // Shoulders: Clavicle width span
      'mixamorig:leftshoulder': {
        scale: [dimensions.shoulderRatio, 1, dimensions.shoulderRatio],
        offset: offsets.shoulderOffset || [0, 0, 0],
      },
      'mixamorig:rightshoulder': {
        scale: [dimensions.shoulderRatio, 1, dimensions.shoulderRatio],
        offset: offsets.shoulderOffset || [0, 0, 0],
      },
      // Left Arm
      'mixamorig:leftarm': {
        scale: [1, dimensions.armRatio, 1],
        rotation: [poseState.leftArmX || 0, 0, poseState.leftArmZ || 0],
      },
      // Right Arm
      'mixamorig:rightarm': {
        scale: [1, dimensions.armRatio, 1],
        rotation: [poseState.rightArmX || 0, 0, poseState.rightArmZ || 0],
      },
      // Forearms
      'mixamorig:leftforearm': {
        scale: [1, dimensions.armRatio, 1],
        rotation: [0, 0, poseState.leftForeArmZ || 0],
      },
      'mixamorig:rightforearm': {
        scale: [1, dimensions.armRatio, 1],
        rotation: [0, 0, poseState.rightForeArmZ || 0],
      },
    };

    return transforms;
  }

  /**
   * Step 6 & 7: Align costume and attach to avatar skeleton
   */
  static fitCostumeToAvatar(costumeScene, userMeasurements, metadata, poseState = {}) {
    if (!costumeScene) return null;

    const dimensions = this.calculateBodyDimensions(userMeasurements, metadata);
    const boneTransforms = this.calculateBoneTransforms(dimensions, metadata, poseState);

    // Dynamic anti-clipping depth bias scaling based on body profile
    // Larger bodies with high tension receive slightly deeper polygon offsets to prevent mesh interpenetration
    const baseOffsetFactor = metadata?.polygonOffset?.factor || -2.0;
    const dynamicOffsetFactor = dimensions.profile === 'Larger / Plus' 
      ? baseOffsetFactor * 1.35 
      : dimensions.profile === 'Small / Slim' 
      ? baseOffsetFactor * 0.9 
      : baseOffsetFactor;

    costumeScene.traverse((object) => {
      // Configure mesh materials for clean rendering and anti-clipping
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;

        if (object.material) {
          object.material.polygonOffset = true;
          object.material.polygonOffsetFactor = dynamicOffsetFactor;
          object.material.polygonOffsetUnits = dynamicOffsetFactor;
          object.material.needsUpdate = true;
        }
      }

      // Synchronize attachment bones
      if (object.isBone) {
        const boneName = object.name.toLowerCase();
        const transform = boneTransforms[boneName];

        if (transform) {
          if (transform.scale) {
            object.scale.set(...transform.scale);
          }
          if (transform.rotation) {
            object.rotation.set(...transform.rotation);
          }
          if (transform.offset && (transform.offset[0] !== 0 || transform.offset[1] !== 0 || transform.offset[2] !== 0)) {
            object.position.x += transform.offset[0];
            object.position.y += transform.offset[1];
            object.position.z += transform.offset[2];
          }
        }
      }
    });

    return {
      fitted: true,
      dimensions,
      profile: dimensions.profile,
      appliedTransformsCount: Object.keys(boneTransforms).length,
    };
  }
}

export default CostumeFitter;
