import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_DIR = path.resolve(__dirname, '../../database');

const readJson = (fileName) => {
  const filePath = path.join(DATABASE_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Database file not found: ${fileName}`);
  }

  const data = fs.readFileSync(filePath, 'utf-8');

  return JSON.parse(data);
};

export const TryOnService = {
  getCostumes() {
    return readJson('costumes.json');
  },

  getCostumeById(costumeId) {
    const costumes = readJson('costumes.json');

    return costumes.find(
      (costume) => costume.id === costumeId
    ) || null;
  },

  getTryOnsByUser(userId) {
    const tryons = readJson('tryons.json');

    return tryons.filter(
      (tryon) => tryon.userId === userId
    );
  },

  getTryOnById(tryOnId) {
    const tryons = readJson('tryons.json');

    return tryons.find(
      (tryon) => tryon.id === tryOnId
    ) || null;
  },

  getSessionsByUser(userId) {
    const sessions = readJson('sessions.json');

    return sessions.filter(
      (session) => session.userId === userId
    );
  }
};

export default TryOnService;
