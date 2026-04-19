import { openDB } from 'idb';

const DB_NAME = 'GymStreakTracker';
const DB_VERSION = 1;

let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('workouts')) {
          const workoutStore = db.createObjectStore('workouts', { keyPath: 'id', autoIncrement: true });
          workoutStore.createIndex('date', 'date');
        }
        if (!db.objectStoreNames.contains('weights')) {
          const weightStore = db.createObjectStore('weights', { keyPath: 'id', autoIncrement: true });
          weightStore.createIndex('date', 'date');
        }
        if (!db.objectStoreNames.contains('templates')) {
          db.createObjectStore('templates', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('friends')) {
          db.createObjectStore('friends', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

// Workouts
export async function addWorkout(workout) {
  const db = await getDB();
  const id = await db.add('workouts', {
    ...workout,
    createdAt: new Date().toISOString(),
  });
  return id;
}

export async function getAllWorkouts() {
  const db = await getDB();
  return db.getAll('workouts');
}

export async function getWorkoutsByDate(date) {
  const db = await getDB();
  const index = db.transaction('workouts').store.index('date');
  return index.getAll(date);
}

export async function getWorkoutById(id) {
  const db = await getDB();
  return db.get('workouts', id);
}

export async function updateWorkout(workout) {
  const db = await getDB();
  return db.put('workouts', workout);
}

export async function deleteWorkout(id) {
  const db = await getDB();
  return db.delete('workouts', id);
}

// Weights
export async function addWeight(entry) {
  const db = await getDB();
  return db.add('weights', {
    ...entry,
    createdAt: new Date().toISOString(),
  });
}

export async function getAllWeights() {
  const db = await getDB();
  return db.getAll('weights');
}

export async function updateWeight(entry) {
  const db = await getDB();
  return db.put('weights', entry);
}

export async function deleteWeight(id) {
  const db = await getDB();
  return db.delete('weights', id);
}

// Templates
export async function addTemplate(template) {
  const db = await getDB();
  return db.add('templates', {
    ...template,
    createdAt: new Date().toISOString(),
  });
}

export async function getAllTemplates() {
  const db = await getDB();
  return db.getAll('templates');
}

export async function getTemplateById(id) {
  const db = await getDB();
  return db.get('templates', id);
}

export async function updateTemplate(template) {
  const db = await getDB();
  return db.put('templates', template);
}

export async function deleteTemplate(id) {
  const db = await getDB();
  return db.delete('templates', id);
}

// Friends
export async function addFriend(friend) {
  const db = await getDB();
  return db.add('friends', {
    ...friend,
    createdAt: new Date().toISOString(),
  });
}

export async function getAllFriends() {
  const db = await getDB();
  return db.getAll('friends');
}

export async function updateFriend(friend) {
  const db = await getDB();
  return db.put('friends', friend);
}

export async function deleteFriend(id) {
  const db = await getDB();
  return db.delete('friends', id);
}

// Settings
export async function getSetting(key) {
  const db = await getDB();
  const result = await db.get('settings', key);
  return result?.value;
}

export async function setSetting(key, value) {
  const db = await getDB();
  return db.put('settings', { key, value });
}

// Bulk operations for export/import
export async function exportAllData() {
  const db = await getDB();
  const workouts = await db.getAll('workouts');
  const weights = await db.getAll('weights');
  const templates = await db.getAll('templates');
  const friends = await db.getAll('friends');
  const settings = await db.getAll('settings');
  return { workouts, weights, templates, friends, settings, exportDate: new Date().toISOString() };
}

export async function importAllData(data) {
  const db = await getDB();
  const tx = db.transaction(['workouts', 'weights', 'templates', 'friends', 'settings'], 'readwrite');

  // Clear existing data
  await tx.objectStore('workouts').clear();
  await tx.objectStore('weights').clear();
  await tx.objectStore('templates').clear();
  await tx.objectStore('friends').clear();
  await tx.objectStore('settings').clear();

  // Import new data
  for (const workout of (data.workouts || [])) {
    await tx.objectStore('workouts').add(workout);
  }
  for (const weight of (data.weights || [])) {
    await tx.objectStore('weights').add(weight);
  }
  for (const template of (data.templates || [])) {
    await tx.objectStore('templates').add(template);
  }
  for (const friend of (data.friends || [])) {
    await tx.objectStore('friends').add(friend);
  }
  for (const setting of (data.settings || [])) {
    await tx.objectStore('settings').put(setting);
  }

  await tx.done;
}

export async function clearAllData() {
  const db = await getDB();
  const tx = db.transaction(['workouts', 'weights', 'templates', 'friends', 'settings'], 'readwrite');
  await tx.objectStore('workouts').clear();
  await tx.objectStore('weights').clear();
  await tx.objectStore('templates').clear();
  await tx.objectStore('friends').clear();
  await tx.objectStore('settings').clear();
  await tx.done;
}
