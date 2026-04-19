import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Weight, Plus, Trash2, Edit3, Check, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useWeightStore } from '../store/stores';
import { getToday, formatDate } from '../utils/helpers';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function WeightTracker() {
  const { weights, loadWeights, addWeight, updateWeight, deleteWeight } = useWeightStore();
  const [newWeight, setNewWeight] = useState('');
  const [newDate, setNewDate] = useState(getToday());
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    loadWeights();
  }, []);

  const handleAdd = async () => {
    if (!newWeight || isNaN(Number(newWeight))) return;
    await addWeight({ date: newDate, weight: Number(newWeight) });
    setNewWeight('');
    setNewDate(getToday());
  };

  const handleUpdate = async (entry) => {
    if (!editValue || isNaN(Number(editValue))) return;
    await updateWeight({ ...entry, weight: Number(editValue) });
    setEditingId(null);
    setEditValue('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this weight entry?')) {
      await deleteWeight(id);
    }
  };

  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const chartData = sorted.map((w) => ({
    date: w.date.substring(5),
    weight: w.weight,
  }));

  const latestWeight = sorted.length > 0 ? sorted[sorted.length - 1]?.weight : null;
  const previousWeight = sorted.length > 1 ? sorted[sorted.length - 2]?.weight : null;
  const weightDiff = latestWeight && previousWeight ? (latestWeight - previousWeight).toFixed(1) : null;
  const trend = weightDiff > 0 ? 'up' : weightDiff < 0 ? 'down' : 'stable';

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Weight</h1>
          <p className="text-sm text-text-secondary mt-0.5">Track your progress</p>
        </div>
        {latestWeight && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-card border border-border">
            <Weight size={14} className="text-neon-purple" />
            <span className="text-sm font-bold">{latestWeight} kg</span>
            {weightDiff && (
              <span className={`flex items-center text-xs ${trend === 'down' ? 'text-neon-green' : trend === 'up' ? 'text-neon-orange' : 'text-text-muted'}`}>
                {trend === 'up' ? <TrendingUp size={12} /> : trend === 'down' ? <TrendingDown size={12} /> : <Minus size={12} />}
                {Math.abs(weightDiff)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Add Entry */}
      <div className="mb-6 p-4 rounded-2xl bg-bg-card border border-border">
        <p className="text-xs font-semibold text-text-secondary mb-3">Add Entry</p>
        <div className="flex gap-2">
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="flex-1 px-3 py-2.5 rounded-xl bg-bg-input border border-border text-sm focus:border-neon-purple focus:outline-none"
          />
          <div className="relative flex-1">
            <input
              type="number"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-bg-input border border-border text-sm focus:border-neon-purple focus:outline-none pr-8"
              placeholder="Weight"
              step="0.1"
              min="0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">kg</span>
          </div>
          <motion.button
            onClick={handleAdd}
            className="px-4 py-2.5 rounded-xl bg-neon-purple text-bg-primary font-bold text-sm cursor-pointer"
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={18} />
          </motion.button>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="mb-6 p-4 rounded-2xl bg-bg-card border border-border">
          <p className="text-xs font-semibold text-text-secondary mb-3">Weight Trend</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="gradPurple" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#555577' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#555577' }}
                  axisLine={false}
                  tickLine={false}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: '12px', fontSize: '12px' }}
                  labelStyle={{ color: '#8888aa' }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#a855f7"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#a855f7', stroke: '#1a1a2e', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#a855f7' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Entries List */}
      <div>
        <p className="text-xs font-semibold text-text-secondary mb-3">All Entries</p>
        <div className="space-y-2">
          <AnimatePresence>
            {[...weights].sort((a, b) => b.date.localeCompare(a.date)).map((entry) => (
              <motion.div
                key={entry.id}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-bg-card border border-border"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Weight size={16} className="text-neon-purple" />
                <div className="flex-1">
                  <p className="text-xs text-text-muted">{formatDate(entry.date)}</p>
                  {editingId === entry.id ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-20 px-2 py-1 rounded-lg bg-bg-input border border-border text-sm focus:border-neon-purple focus:outline-none"
                        step="0.1"
                        autoFocus
                      />
                      <button onClick={() => handleUpdate(entry)} className="text-neon-green"><Check size={16} /></button>
                      <button onClick={() => setEditingId(null)} className="text-text-muted"><X size={16} /></button>
                    </div>
                  ) : (
                    <p className="text-base font-bold">{entry.weight} <span className="text-xs text-text-muted font-normal">kg</span></p>
                  )}
                </div>
                {editingId !== entry.id && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditingId(entry.id); setEditValue(entry.weight.toString()); }}
                      className="p-1.5 rounded-lg hover:bg-bg-card-hover text-text-muted hover:text-neon-blue transition-colors"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {weights.length === 0 && (
          <motion.div className="text-center py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Weight size={48} className="text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary">No entries yet</p>
            <p className="text-sm text-text-muted mt-1">Add your first weight above</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
