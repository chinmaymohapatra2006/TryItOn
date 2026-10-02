import TryOnService from '../services/tryon.service.js';

export const getCostumes = async (req, res, next) => {
  try {
    const costumes = TryOnService.getCostumes();

    return res.status(200).json({
      status: 'success',
      count: costumes.length,
      data: costumes
    });
  } catch (error) {
    next(error);
  }
};

export const getCostumeById = async (req, res, next) => {
  try {
    const costume = TryOnService.getCostumeById(req.params.id);

    if (!costume) {
      return res.status(404).json({
        status: 'fail',
        message: 'Costume not found.'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: costume
    });
  } catch (error) {
    next(error);
  }
};

export const getMyTryOns = async (req, res, next) => {
  try {
    const tryons = TryOnService.getTryOnsByUser(req.user.id);

    return res.status(200).json({
      status: 'success',
      count: tryons.length,
      data: tryons
    });
  } catch (error) {
    next(error);
  }
};

export const getTryOnById = async (req, res, next) => {
  try {
    const tryon = TryOnService.getTryOnById(req.params.id);

    if (!tryon) {
      return res.status(404).json({
        status: 'fail',
        message: 'Try-on result not found.'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: tryon
    });
  } catch (error) {
    next(error);
  }
};

export const getMySessions = async (req, res, next) => {
  try {
    const sessions = TryOnService.getSessionsByUser(req.user.id);

    return res.status(200).json({
      status: 'success',
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
};
