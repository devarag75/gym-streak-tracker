import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, ChevronRight, Copy, Trash2, Dumbbell, Clock } from 'lucide-react';
import { useWorkoutStore } from '../store/stores';
import { formatDate } from '../utils/helpers';

function WorkoutCard({ workout, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const totalSets = useMemo(() => {
    return (workout.bodyParts || []).reduce((a, bp) =>
      a + (bp.exercises || []).reduce((b, ex) => b + (ex.sets || []).length, 0), 0
    );
  }, [workout]);

  const totalExercises = useMemo(() => {
    return (workout.bodyParts || []).reduce((a, bp) => a + (bp.exercises || []).length, 0);
  }, [workout]);

  return (
    <motion.div
      className="rounded-2xl bg-bg-card border border-border overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      layout
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-neon-green/10">
          <Dumbbell size={18} className="text-neon-green" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">
            {(workout.bodyParts || []).map((bp) => bp.name).filter(Boolean).join(', ') || 'Workout'}
          </p>
          <p className="text-xs text-text-muted mt-0.5">
            {formatDate(workout.date)} · {totalExercises} exercises · {totalSets} sets
          </p>
        </div>
        <div className="flex items-center gap-1">
          {expanded ? <ChevronDown size={16} className="text-text-muted" /> : <ChevronRight size={16} className="text-text-muted" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-2.5">
              {(workout.bodyParts || []).map((bp, bpi) => (
                <div key={bpi} className="rounded-xl bg-bg-card-hover/50 p-3">
                  <p className="text-sm font-semibold text-neon-green mb-2">{bp.name || 'Unnamed'}</p>
                  {(bp.exercises || []).map((ex, exi) => (
                    <div key={exi} className="mb-2 last:mb-0">
                      <p className="text-xs font-medium text-text-secondary mb-1 flex items-center gap-1.5">
                        <Dumbbell size={10} className="text-neon-blue" />
                        {ex.name || 'Unnamed'}
                      </p>
                      <div className="flex flex-wrap gap-1.5 ml-4">
                        {(ex.sets || []).map((s, si) => (
                          <span key={si} className="text-[10px] px-2 py-0.5 rounded-md bg-bg-input text-text-muted font-mono">
                            {s.reps}×{s.weight}kg
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              <div className="flex gap-2 pt-1">
                <Link
                  to={`/workout?duplicate=${workout.id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-bg-input text-xs font-medium text-text-secondary hover:text-neon-blue transition-colors"
                >
                  <Copy size={12} /> Duplicate
                </Link>
                <button
                  onClick={() => onDelete(workout.id)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-bg-input text-xs font-medium text-text-secondary hover:text-danger transition-colors"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function History() {
  const { workouts, loadWorkouts, deleteWorkout } = useWorkoutStore();

  useEffect(() => {
    loadWorkouts();
  }, []);

  const grouped = useMemo(() => {
    const groups = {};
    workouts.forEach((w) => {
      const month = w.date.substring(0, 7);
      if (!groups[month]) groups[month] = [];
      groups[month].push(w);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [workouts]);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this workout?')) {
      await deleteWorkout(id);
    }
  };

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">History</h1>
          <p className="text-sm text-text-secondary mt-0.5">{workouts.length} workouts logged</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-card border border-border">
          <Calendar size={14} className="text-neon-blue" />
          <span className="text-xs font-medium text-text-secondary">All Time</span>
        </div>
      </div>

      {workouts.length === 0 ? (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Clock size={48} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary">No workouts yet</p>
          <p className="text-sm text-text-muted mt-1">Start your first workout to see history</p>
          <Link
            to="/workout"
            className="inline-block mt-4 px-6 py-2 rounded-xl bg-neon-green text-bg-primary text-sm font-bold"
          >
            Start Workout
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([month, monthWorkouts]) => (
            <div key={month}>
              <h3 className="text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">
                {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="space-y-2">
                <AnimatePresence>
                  {monthWorkouts.map((w) => (
                    <WorkoutCard key={w.id} workout={w} onDelete={handleDelete} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
