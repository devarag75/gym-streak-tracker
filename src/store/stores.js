import { create } from 'zustand';
import * as db from '../db/database';
import { getToday, calculateStreak } from '../utils/helpers';

export const useWorkoutStore = create((set, get) => ({
  workouts: [],
  loading: false,

  loadWorkouts: async () => {
    set({ loading: true });
    const workouts = await db.getAllWorkouts();
    set({ workouts: workouts.sort((a, b) => b.date.localeCompare(a.date)), loading: false });
  },

  addWorkout: async (workout) => {
    const id = await db.addWorkout(workout);
    const saved = await db.getWorkoutById(id);
    set((s) => ({ workouts: [saved, ...s.workouts].sort((a, b) => b.date.localeCompare(a.date)) }));
    return saved;
  },

  updateWorkout: async (workout) => {
    await db.updateWorkout(workout);
    set((s) => ({
      workouts: s.workouts.map((w) => (w.id === workout.id ? workout : w)),
    }));
  },

  deleteWorkout: async (id) => {
    await db.deleteWorkout(id);
    set((s) => ({ workouts: s.workouts.filter((w) => w.id !== id) }));
  },

  getTodayWorkout: () => {
    const today = getToday();
    return get().workouts.find((w) => w.date === today);
  },

  getStreak: () => {
    const dates = get().workouts.map((w) => w.date);
    return calculateStreak(dates);
  },

  getLastWorkout: () => {
    const sorted = [...get().workouts].sort((a, b) => b.date.localeCompare(a.date));
    return sorted[0] || null;
  },

  getWorkoutsByDateRange: (startDate, endDate) => {
    return get().workouts.filter((w) => w.date >= startDate && w.date <= endDate);
  },
}));

export const useWeightStore = create((set, get) => ({
  weights: [],
  loading: false,

  loadWeights: async () => {
    set({ loading: true });
    const weights = await db.getAllWeights();
    set({ weights: weights.sort((a, b) => b.date.localeCompare(a.date)), loading: false });
  },

  addWeight: async (entry) => {
    await db.addWeight(entry);
    await get().loadWeights();
  },

  updateWeight: async (entry) => {
    await db.updateWeight(entry);
    set((s) => ({
      weights: s.weights.map((w) => (w.id === entry.id ? entry : w)),
    }));
  },

  deleteWeight: async (id) => {
    await db.deleteWeight(id);
    set((s) => ({ weights: s.weights.filter((w) => w.id !== id) }));
  },

  getLatestWeight: () => {
    const sorted = [...get().weights].sort((a, b) => b.date.localeCompare(a.date));
    return sorted[0] || null;
  },
}));

export const useTemplateStore = create((set, get) => ({
  templates: [],
  loading: false,

  loadTemplates: async () => {
    set({ loading: true });
    const templates = await db.getAllTemplates();
    set({ templates, loading: false });
  },

  addTemplate: async (template) => {
    await db.addTemplate(template);
    await get().loadTemplates();
  },

  updateTemplate: async (template) => {
    await db.updateTemplate(template);
    set((s) => ({
      templates: s.templates.map((t) => (t.id === template.id ? template : t)),
    }));
  },

  deleteTemplate: async (id) => {
    await db.deleteTemplate(id);
    set((s) => ({ templates: s.templates.filter((t) => t.id !== id) }));
  },
}));

export const useFriendStore = create((set, get) => ({
  friends: [],
  loading: false,

  loadFriends: async () => {
    set({ loading: true });
    const friends = await db.getAllFriends();
    set({ friends, loading: false });
  },

  addFriend: async (friend) => {
    await db.addFriend(friend);
    await get().loadFriends();
  },

  updateFriend: async (friend) => {
    await db.updateFriend(friend);
    set((s) => ({
      friends: s.friends.map((f) => (f.id === friend.id ? friend : f)),
    }));
  },

  deleteFriend: async (id) => {
    await db.deleteFriend(id);
    set((s) => ({ friends: s.friends.filter((f) => f.id !== id) }));
  },
}));
