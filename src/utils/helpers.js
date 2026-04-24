export function getToday() {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateShort(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function getDaysBetween(date1, date2) {
  const d1 = new Date(date1 + 'T00:00:00');
  const d2 = new Date(date2 + 'T00:00:00');
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

export function getLastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

export function calculateStreak(workouts, weeklyRestDays = []) {
  if (!workouts || workouts.length === 0) return { current: 0, longest: 0 };

  const todayStr = getToday();

  // Get all dates where user exercised (excluding manual rest days)
  const exerciseDates = [...new Set(workouts.filter(w => !w.isRestDay).map(w => w.date))].sort();

  // Manual rest day dates
  const manualRestDates = [...new Set(workouts.filter(w => w.isRestDay).map(w => w.date))];

  // Helper to check if a date is a rest day
  const isRestDate = (dateStr) => {
    if (manualRestDates.includes(dateStr)) return true;
    const d = new Date(dateStr + 'T00:00:00');
    return weeklyRestDays.includes(d.getDay());
  };

  if (exerciseDates.length === 0) {
    return { current: 0, longest: 0 };
  }

  const earliestExerciseDate = new Date(exerciseDates[0] + 'T00:00:00');

  // Current streak
  let currentStreak = 0;
  let dateToCheck = new Date(todayStr + 'T00:00:00');

  while (dateToCheck >= earliestExerciseDate) {
    const dateStr = dateToCheck.toISOString().split('T')[0];
    const didExercise = exerciseDates.includes(dateStr);
    const isRest = isRestDate(dateStr);

    if (didExercise) {
      currentStreak++;
    } else if (!isRest) {
      // If it's not a rest day and no exercise
      if (dateStr !== todayStr) {
        // Break the streak if it's not today.
        break;
      }
    }

    dateToCheck.setDate(dateToCheck.getDate() - 1);
  }

  // Longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  let iterDate = new Date(earliestExerciseDate);
  const end = new Date(todayStr + 'T00:00:00');

  while (iterDate <= end) {
    const dateStr = iterDate.toISOString().split('T')[0];
    const didExercise = exerciseDates.includes(dateStr);
    const isRest = isRestDate(dateStr);

    if (didExercise) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else if (!isRest) {
      if (dateStr !== todayStr) {
        tempStreak = 0;
      }
    }

    iterDate.setDate(iterDate.getDate() + 1);
  }

  return { current: currentStreak, longest: longestStreak };
}

export function getStreakBadges(streak) {
  const badges = [
    { days: 3, label: '3 Day Fire', icon: '🔥', color: '#ff6b35' },
    { days: 7, label: 'Week Warrior', icon: '⚡', color: '#ffd700' },
    { days: 14, label: '2 Week Beast', icon: '💪', color: '#00d4ff' },
    { days: 30, label: 'Monthly Monster', icon: '🏆', color: '#39ff14' },
    { days: 60, label: '60 Day Legend', icon: '👑', color: '#a855f7' },
    { days: 100, label: 'Century Club', icon: '💎', color: '#ff2d95' },
    { days: 365, label: 'Year of Iron', icon: '🌟', color: '#ffd700' },
  ];
  return badges.filter(b => streak >= b.days);
}

export const motivationalMessages = [
  "Every rep counts. Let's crush it! 💪",
  "Your only competition is yesterday's you.",
  "Discipline beats motivation every time. 🔥",
  "The iron never lies. Get after it!",
  "Champions are made when no one is watching.",
  "Pain is temporary. Pride is forever. 🏆",
  "One more set. One step closer.",
  "Consistency is the key to greatness.",
  "Today's effort is tomorrow's strength.",
  "You didn't come this far to only come this far.",
  "Rise and grind. No excuses. ⚡",
  "Sweat now, shine later. 💎",
];

export function getRandomMotivation() {
  return motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
