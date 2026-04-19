import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Dumbbell, Calendar, Target, Award } from 'lucide-react';
import { useWorkoutStore } from '../store/stores';
import { getLastNDays, formatDateShort } from '../utils/helpers';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid
} from 'recharts';

const COLORS = ['#39ff14', '#00d4ff', '#a855f7', '#ff6b35', '#ff2d95', '#ffd700', '#00ff88', '#ff4757'];

export default function Analytics() {
  const { workouts, loadWorkouts } = useWorkoutStore();

  useEffect(() => {
    loadWorkouts();
  }, []);

  // Weekly consistency (last 4 weeks)
  const weeklyData = useMemo(() => {
    const weeks = [];
    for (let w = 3; w >= 0; w--) {
      const start = new Date();
      start.setDate(start.getDate() - (w + 1) * 7);
      const end = new Date();
      end.setDate(end.getDate() - w * 7);
      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];
      const count = workouts.filter((wk) => wk.date >= startStr && wk.date < endStr).length;
      weeks.push({
        week: `W${4 - w}`,
        workouts: count,
      });
    }
    return weeks;
  }, [workouts]);

  // Most trained body parts
  const bodyPartData = useMemo(() => {
    const counts = {};
    workouts.forEach((w) => {
      (w.bodyParts || []).forEach((bp) => {
        if (bp.name) {
          counts[bp.name] = (counts[bp.name] || 0) + 1;
        }
      });
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [workouts]);

  // Total stats
  const stats = useMemo(() => {
    let totalSets = 0;
    let totalReps = 0;
    let totalWeight = 0;
    let totalExercises = 0;
    workouts.forEach((w) => {
      (w.bodyParts || []).forEach((bp) => {
        (bp.exercises || []).forEach((ex) => {
          totalExercises++;
          (ex.sets || []).forEach((s) => {
            totalSets++;
            totalReps += s.reps || 0;
            totalWeight += (s.reps || 0) * (s.weight || 0);
          });
        });
      });
    });
    return {
      totalWorkouts: workouts.length,
      totalSets,
      totalReps,
      totalVolume: totalWeight,
      totalExercises,
      avgSetsPerWorkout: workouts.length ? Math.round(totalSets / workouts.length) : 0,
    };
  }, [workouts]);

  // Daily activity last 30 days
  const dailyActivity = useMemo(() => {
    const last30 = getLastNDays(30);
    return last30.map((day) => {
      const dayWorkouts = workouts.filter((w) => w.date === day);
      const sets = dayWorkouts.reduce((acc, w) => {
        return acc + (w.bodyParts || []).reduce((a, bp) => {
          return a + (bp.exercises || []).reduce((b, ex) => b + (ex.sets || []).length, 0);
        }, 0);
      }, 0);
      return { day: formatDateShort(day), sets };
    });
  }, [workouts]);

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-text-secondary mt-0.5">Your fitness journey in numbers</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: 'Workouts', value: stats.totalWorkouts, icon: Dumbbell, color: '#39ff14' },
          { label: 'Total Sets', value: stats.totalSets, icon: Target, color: '#00d4ff' },
          { label: 'Total Reps', value: stats.totalReps.toLocaleString(), icon: TrendingUp, color: '#a855f7' },
          { label: 'Volume (kg)', value: stats.totalVolume.toLocaleString(), icon: Award, color: '#ffd700' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className="p-4 rounded-2xl bg-bg-card border border-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={16} style={{ color: stat.color }} />
              <span className="text-xs text-text-secondary">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Weekly Consistency */}
      <motion.div
        className="mb-6 p-4 rounded-2xl bg-bg-card border border-border"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-xs font-semibold text-text-secondary mb-3 flex items-center gap-1.5">
          <Calendar size={14} className="text-neon-blue" />
          Weekly Consistency
        </p>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#555577' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#555577' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: '12px', fontSize: '12px' }}
              />
              <Bar dataKey="workouts" fill="#00d4ff" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Most Trained Body Parts */}
      {bodyPartData.length > 0 && (
        <motion.div
          className="mb-6 p-4 rounded-2xl bg-bg-card border border-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs font-semibold text-text-secondary mb-3 flex items-center gap-1.5">
            <Dumbbell size={14} className="text-neon-green" />
            Most Trained Body Parts
          </p>
          <div className="flex items-center gap-4">
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bodyPartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={55}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {bodyPartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: '12px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5">
              {bodyPartData.map((bp, i) => (
                <div key={bp.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-xs text-text-secondary flex-1">{bp.name}</span>
                  <span className="text-xs font-mono text-text-muted">{bp.value}×</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* 30 Day Activity */}
      <motion.div
        className="mb-6 p-4 rounded-2xl bg-bg-card border border-border"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-xs font-semibold text-text-secondary mb-3 flex items-center gap-1.5">
          <BarChart3 size={14} className="text-neon-orange" />
          30 Day Activity
        </p>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 8, fill: '#555577' }}
                axisLine={false}
                tickLine={false}
                interval={4}
              />
              <YAxis tick={{ fontSize: 10, fill: '#555577' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: '12px', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="sets" stroke="#ff6b35" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {workouts.length === 0 && (
        <motion.div className="text-center py-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <BarChart3 size={48} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary">No data yet</p>
          <p className="text-sm text-text-muted mt-1">Complete workouts to see analytics</p>
        </motion.div>
      )}
    </div>
  );
}
