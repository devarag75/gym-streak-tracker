import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy, Dumbbell, Weight, TrendingUp, ChevronRight, Zap, Star, Moon } from 'lucide-react';
import { useWorkoutStore, useWeightStore, useSettingsStore } from '../store/stores';
import { getToday, getRandomMotivation, getStreakBadges, getLastNDays, formatDateShort, calculateStreak } from '../utils/helpers';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

function StreakCounter({ count, label, icon: Icon, color }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center p-4 rounded-2xl bg-bg-card border border-border"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon size={20} style={{ color }} />
        <span className="text-xs text-text-secondary font-medium">{label}</span>
      </div>
      <motion.span
        className="text-3xl font-bold"
        style={{ color }}
        key={count}
        initial={{ scale: 1.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {count}
      </motion.span>
      <span className="text-[10px] text-text-muted mt-0.5">days</span>
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, unit, color, to }) {
  const Wrapper = to ? Link : 'div';
  return (
    <Wrapper to={to} className="block">
      <motion.div
        className="flex items-center gap-3 p-3.5 rounded-2xl bg-bg-card border border-border hover:border-border-focus/30 transition-colors"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        <div className="flex-1">
          <p className="text-xs text-text-secondary">{label}</p>
          <p className="text-lg font-bold">
            {value}
            {unit && <span className="text-xs text-text-muted ml-1">{unit}</span>}
          </p>
        </div>
        {to && <ChevronRight size={16} className="text-text-muted" />}
      </motion.div>
    </Wrapper>
  );
}

export default function Dashboard() {
  const { workouts, loadWorkouts } = useWorkoutStore();
  const { weights, loadWeights } = useWeightStore();
  const { restDays } = useSettingsStore();
  const [motivation, setMotivation] = useState('');

  useEffect(() => {
    loadWorkouts();
    loadWeights();
    setMotivation(getRandomMotivation());
  }, []);

  const streak = useMemo(() => calculateStreak(workouts.map((w) => w.date)), [workouts]);
  const todayWorkout = useMemo(() => {
    const today = getToday();
    return workouts.find((w) => w.date === today);
  }, [workouts]);
  const latestWeight = useMemo(() => {
    const sorted = [...weights].sort((a, b) => b.date.localeCompare(a.date));
    return sorted[0] || null;
  }, [weights]);
  const badges = useMemo(() => getStreakBadges(streak.current), [streak.current]);

  // Mini chart data for last 7 days
  const last7Days = useMemo(() => getLastNDays(7), []);
  const chartData = useMemo(() => {
    return last7Days.map((day) => {
      const dayDate = new Date(day);
      const dayWorkouts = workouts.filter((w) => w.date === day);
      const totalSets = dayWorkouts.reduce((acc, w) => {
        return acc + (w.bodyParts || []).reduce((a, bp) => {
          return a + (bp.exercises || []).reduce((b, ex) => b + (ex.sets || []).length, 0);
        }, 0);
      }, 0);
      const isRest = dayWorkouts.some(w => w.isRestDay) || restDays?.includes(dayDate.getDay());
      return { day: formatDateShort(day), sets: totalSets, hasWorkout: dayWorkouts.some(w => !w.isRestDay), isRest };
    });
  }, [workouts, last7Days, restDays]);

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gym Streak</h1>
          <p className="text-sm text-text-secondary mt-0.5">Track. Push. Conquer.</p>
        </div>
        <motion.div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
            todayWorkout && !todayWorkout.isRestDay
              ? 'bg-neon-green/10 border-neon-green/30'
              : (todayWorkout?.isRestDay || restDays?.includes(new Date().getDay()))
              ? 'bg-neon-blue/10 border-neon-blue/30'
              : 'bg-bg-card border-border'
          }`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          {todayWorkout && !todayWorkout.isRestDay ? (
            <>
              <Zap size={14} className="text-neon-green" />
              <span className="text-xs font-medium text-neon-green">Done Today</span>
            </>
          ) : todayWorkout?.isRestDay || restDays?.includes(new Date().getDay()) ? (
            <>
              <Moon size={14} className="text-neon-blue" />
              <span className="text-xs font-medium text-neon-blue">Rest Day</span>
            </>
          ) : (
            <>
              <Zap size={14} className="text-text-muted" />
              <span className="text-xs font-medium text-text-secondary">Not Yet</span>
            </>
          )}
        </motion.div>
      </div>

      {/* Motivation */}
      <motion.div
        className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-bg-card to-bg-card-hover border border-border"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <p className="text-sm text-text-secondary italic">"{motivation}"</p>
      </motion.div>

      {/* Streak Section */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="relative">
          <StreakCounter count={streak.current} label="Current Streak" icon={Flame} color="#ff6b35" />
          {streak.current > 0 && (
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-neon-orange"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ boxShadow: '0 0 8px rgba(255,107,53,0.5)' }}
            />
          )}
        </div>
        <StreakCounter count={streak.longest} label="Longest Streak" icon={Trophy} color="#ffd700" />
      </div>

      {/* Badges */}
      <AnimatePresence>
        {badges.length > 0 && (
          <motion.div
            className="mb-6 flex flex-wrap gap-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            {badges.map((badge, i) => (
              <motion.div
                key={badge.days}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-card border border-border"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <span className="text-sm">{badge.icon}</span>
                <span className="text-xs font-medium" style={{ color: badge.color }}>
                  {badge.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Stats */}
      <div className="space-y-2.5 mb-6">
        <StatCard
          icon={Dumbbell}
          label="Total Workouts"
          value={workouts.length}
          color="#00d4ff"
          to="/history"
        />
        <StatCard
          icon={Weight}
          label="Latest Weight"
          value={latestWeight ? latestWeight.weight : '—'}
          unit={latestWeight ? 'kg' : ''}
          color="#a855f7"
          to="/weight"
        />
      </div>

      {/* Mini Activity Chart */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-3">Last 7 Days Activity</h3>
        <div className="p-4 rounded-2xl bg-bg-card border border-border">
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#39ff14" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#39ff14" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#555577' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: '12px', fontSize: '12px' }}
                  labelStyle={{ color: '#8888aa' }}
                />
                <Area type="monotone" dataKey="sets" stroke="#39ff14" fill="url(#gradGreen)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Day dots */}
          <div className="flex justify-between mt-2 px-1">
            {chartData.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    d.hasWorkout ? 'bg-neon-green' : d.isRest ? 'bg-neon-blue' : 'bg-border'
                  }`}
                  style={d.hasWorkout ? { boxShadow: '0 0 6px rgba(57,255,20,0.4)' } : d.isRest ? { boxShadow: '0 0 6px rgba(0,212,255,0.4)' } : {}}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Start Workout CTA */}
      <Link to="/workout">
        <motion.button
          className="w-full py-4 rounded-2xl font-bold text-lg text-bg-primary bg-gradient-to-r from-neon-green to-neon-blue hover:opacity-90 transition-opacity glow-green cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {todayWorkout && !todayWorkout.isRestDay ? '+ Add Another Workout' : '🏋️ Start Workout'}
        </motion.button>
      </Link>
    </div>
  );
}
