import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { pool } from '../config/db.js';

// Development in-memory fallback stores
const userStore = new Map();
const measurementStore = new Map(); // key: userId
const avatarStore = new Map(); // key: userId
const costumeStore = new Map(); // key: costumeId
const savedLookStore = new Map(); // key: lookId

// Seed initial costumes into costume store
const initialCostumes = [
  { id: 'kurta-female', name: 'Embroidered Silk Kurta', category: 'Traditional', model_url: '/costumes/kurta-female.glb' },
  { id: 'sherwani-female', name: 'Royal Brocade Sherwani', category: 'Traditional', model_url: '/costumes/sherwani-female.glb' },
  { id: 'shirt-female', name: 'Classic Silk Shirt', category: 'Casual', model_url: '/costumes/shirt-female.glb' },
  { id: 'tshirt-female', name: 'Crewneck Fitted Tee', category: 'Casual', model_url: '/costumes/tshirt-female.glb' },
  { id: 'jacket-female', name: 'Tailored Tuxedo Blazer', category: 'Formal', model_url: '/costumes/jacket-female.glb' },
];
initialCostumes.forEach(c => costumeStore.set(c.id, { ...c, created_at: new Date().toISOString() }));

export const UserRepository = {
  // --- USERS ---
  async createUser({ email, password, name }) {
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new Error('User already exists with this email address.');
    }

    // Hash password with bcrypt (Salt rounds = 10) - NEVER STORE PLAINTEXT!
    const password_hash = await bcrypt.hash(password, 10);
    const id = `user_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const user = {
      id,
      email: email.toLowerCase().trim(),
      password_hash,
      name: name.trim(),
      created_at: now,
      updated_at: now
    };

    userStore.set(user.id, user);

    try {
      const client = await pool.connect();
      await client.query(
        `INSERT INTO users (id, email, password_hash, name, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6);`,
        [user.id, user.email, user.password_hash, user.name, user.created_at, user.updated_at]
      );
      client.release();
    } catch {}

    const { password_hash: _, ...safeUser } = user;
    return safeUser;
  },

  async findByEmail(email) {
    const normalized = email.toLowerCase().trim();
    for (const u of userStore.values()) {
      if (u.email === normalized) return u;
    }
    return null;
  },

  async findById(id) {
    const u = userStore.get(id);
    if (!u) return null;
    const { password_hash: _, ...safeUser } = u;
    return safeUser;
  },

  async verifyPassword(user, plainPassword) {
    return await bcrypt.compare(plainPassword, user.password_hash);
  },

  // --- MEASUREMENTS ---
  async saveMeasurements(userId, data) {
    const id = `meas_${userId}`;
    const now = new Date().toISOString();
    const record = {
      id,
      user_id: userId,
      height: parseFloat(data.height) || 170,
      shoulder_width: parseFloat(data.shoulderWidth || data.shoulder_width) || 40,
      chest: parseFloat(data.chest) || 90,
      waist: parseFloat(data.waist) || 70,
      hip: parseFloat(data.hip) || 95,
      arm_length: parseFloat(data.armLength || data.arm_length) || 60,
      leg_length: parseFloat(data.legLength || data.leg_length) || 80,
      unit: data.unit || 'cm',
      created_at: now,
      updated_at: now
    };

    measurementStore.set(userId, record);

    try {
      const client = await pool.connect();
      await client.query(
        `INSERT INTO measurements (id, user_id, height, shoulder_width, chest, waist, hip, arm_length, leg_length, unit, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO UPDATE SET height=$3, shoulder_width=$4, chest=$5, waist=$6, hip=$7, arm_length=$8, leg_length=$9, updated_at=$12;`,
        [record.id, record.user_id, record.height, record.shoulder_width, record.chest, record.waist, record.hip, record.arm_length, record.leg_length, record.unit, record.created_at, record.updated_at]
      );
      client.release();
    } catch {}

    return record;
  },

  async getMeasurements(userId) {
    return measurementStore.get(userId) || null;
  },

  // --- AVATARS ---
  async saveAvatar(userId, data) {
    const id = `avatar_${userId}`;
    const now = new Date().toISOString();
    const record = {
      id,
      user_id: userId,
      model_gender: data.modelGender || data.model_gender || 'female',
      model_url: data.modelUrl || data.model_url || '/models/female.glb',
      pose_preset: data.posePreset || data.pose_preset || 't-pose',
      pose_data: data.poseData || data.pose_data || {},
      created_at: now,
      updated_at: now
    };

    avatarStore.set(userId, record);

    try {
      const client = await pool.connect();
      await client.query(
        `INSERT INTO avatars (id, user_id, model_gender, model_url, pose_preset, pose_data, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET model_gender=$3, model_url=$4, pose_preset=$5, pose_data=$6, updated_at=$8;`,
        [record.id, record.user_id, record.model_gender, record.model_url, record.pose_preset, JSON.stringify(record.pose_data), record.created_at, record.updated_at]
      );
      client.release();
    } catch {}

    return record;
  },

  async getAvatar(userId) {
    return avatarStore.get(userId) || null;
  },

  // --- SAVED LOOKS ---
  async saveLook(userId, { costumeId, lookName, colorway, customParameters = {} }) {
    const id = `look_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const record = {
      id,
      user_id: userId,
      costume_id: costumeId,
      look_name: lookName || 'My Custom Outfit',
      colorway: colorway || '#6366f1',
      custom_parameters: customParameters,
      created_at: now,
      updated_at: now
    };

    savedLookStore.set(id, record);

    try {
      const client = await pool.connect();
      await client.query(
        `INSERT INTO saved_looks (id, user_id, costume_id, look_name, colorway, custom_parameters, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
        [record.id, record.user_id, record.costume_id, record.look_name, record.colorway, JSON.stringify(record.custom_parameters), record.created_at, record.updated_at]
      );
      client.release();
    } catch {}

    return record;
  },

  async getSavedLooks(userId) {
    const list = [];
    for (const l of savedLookStore.values()) {
      if (l.user_id === userId) {
        list.push(l);
      }
    }
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async getLookById(lookId) {
    return savedLookStore.get(lookId) || null;
  }
};

export default UserRepository;
