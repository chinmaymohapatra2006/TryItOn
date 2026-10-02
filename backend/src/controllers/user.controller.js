import UserRepository from '../models/user.repository.js';
import { generateToken } from '../middleware/jwtAuth.js';

// --- AUTHENTICATION ---
export const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide name, email, and password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password must be at least 6 characters long.'
      });
    }

    const user = await UserRepository.createUser({ email, password, name });
    const token = generateToken(user);

    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully.',
      token,
      data: { user }
    });
  } catch (error) {
    if (error.message.includes('already exists')) {
      return res.status(409).json({ status: 'fail', message: error.message });
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password.'
      });
    }

    const user = await UserRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await UserRepository.verifyPassword(user, password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user);
    const { password_hash: _, ...safeUser } = user;

    return res.status(200).json({
      status: 'success',
      message: 'Login successful.',
      token,
      data: { user: safeUser }
    });
  } catch (error) {
    next(error);
  }
};

// --- PROFILE & USER DATA ---
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [measurements, avatar, looks] = await Promise.all([
      UserRepository.getMeasurements(userId),
      UserRepository.getAvatar(userId),
      UserRepository.getSavedLooks(userId)
    ]);

    return res.status(200).json({
      status: 'success',
      data: {
        user: req.user,
        measurements,
        avatar,
        savedLooks: looks
      }
    });
  } catch (error) {
    next(error);
  }
};

// --- MEASUREMENTS ---
export const saveMeasurements = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const saved = await UserRepository.saveMeasurements(userId, req.body);
    return res.status(200).json({
      status: 'success',
      message: 'Body measurements saved successfully.',
      data: saved
    });
  } catch (error) {
    next(error);
  }
};

export const getMeasurements = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const measurements = await UserRepository.getMeasurements(userId);
    return res.status(200).json({
      status: 'success',
      data: measurements
    });
  } catch (error) {
    next(error);
  }
};

// --- AVATARS ---
export const saveAvatar = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const saved = await UserRepository.saveAvatar(userId, req.body);
    return res.status(200).json({
      status: 'success',
      message: 'Avatar configuration saved successfully.',
      data: saved
    });
  } catch (error) {
    next(error);
  }
};

export const getAvatar = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const avatar = await UserRepository.getAvatar(userId);
    return res.status(200).json({
      status: 'success',
      data: avatar
    });
  } catch (error) {
    next(error);
  }
};

// --- SAVED LOOKS ---
export const saveLook = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { costumeId, lookName, colorway, customParameters } = req.body;

    if (!costumeId) {
      return res.status(400).json({
        status: 'fail',
        message: 'costumeId is required to save a look.'
      });
    }

    const saved = await UserRepository.saveLook(userId, {
      costumeId,
      lookName,
      colorway,
      customParameters
    });

    return res.status(201).json({
      status: 'success',
      message: 'Look saved to wardrobe collection.',
      data: saved
    });
  } catch (error) {
    next(error);
  }
};

export const getSavedLooks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const looks = await UserRepository.getSavedLooks(userId);
    return res.status(200).json({
      status: 'success',
      count: looks.length,
      data: looks
    });
  } catch (error) {
    next(error);
  }
};

export const getLookById = async (req, res, next) => {
  try {
    const look = await UserRepository.getLookById(req.params.id);
    if (!look) {
      return res.status(404).json({
        status: 'fail',
        message: 'Look not found.'
      });
    }
    return res.status(200).json({
      status: 'success',
      data: look
    });
  } catch (error) {
    next(error);
  }
};
