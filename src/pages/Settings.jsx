import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon, Trash2, Download, Upload, Users, Weight,
  BookTemplate, Moon, Sun, AlertTriangle, Check, ChevronRight,
  Dumbbell, BarChart3, Clock
} from 'lucide-react';
import { exportAllData, importAllData, clearAllData } from '../db/database';
import { useSettingsStore } from '../store/stores';

export default function Settings() {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [notification, setNotification] = useState('');

  const showNotif = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleExport = async () => {
    try {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gym-streak-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showNotif('Data exported successfully!');
    } catch (err) {
      showNotif('Export failed');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      try {
        const file = e.target.files[0];
        if (!file) return;
        const text = await file.text();
        const data = JSON.parse(text);
        if (!data.workouts && !data.weights) {
          showNotif('Invalid backup file');
          return;
        }
        if (window.confirm('This will replace all current data. Continue?')) {
          await importAllData(data);
          showNotif('Data imported! Refresh to see changes.');
          setTimeout(() => window.location.reload(), 1500);
        }
      } catch (err) {
        showNotif('Import failed: Invalid file');
      }
    };
    input.click();
  };

  const handleReset = async () => {
    await clearAllData();
    showNotif('All data cleared! Refreshing...');
    setTimeout(() => window.location.reload(), 1500);
  };

  const { theme, setTheme, restDays, setRestDays } = useSettingsStore();

  const themes = [
    { id: 'default', name: 'Neon Green', color: '#39ff14' },
    { id: 'cyber', name: 'Cyber Blue', color: '#00d4ff' },
    { id: 'synth', name: 'Synth Pink', color: '#ff2d95' },
    { id: 'blaze', name: 'Blaze Orange', color: '#ff6b35' }
  ];

  const menuItems = [
    {
      section: 'Pages',
      items: [
        { icon: Weight, label: 'Weight Tracker', color: '#a855f7', to: '/weight' },
        { icon: BookTemplate, label: 'Templates', color: '#ff6b35', to: '/templates' },
        { icon: Users, label: 'Friends', color: '#00d4ff', to: '/friends' },
      ],
    },
    {
      section: 'Data',
      items: [
        { icon: Download, label: 'Export Data (JSON)', color: '#39ff14', onClick: handleExport },
        { icon: Upload, label: 'Import Data (Backup)', color: '#00d4ff', onClick: handleImport },
      ],
    },
    {
      section: 'Danger Zone',
      items: [
        {
          icon: Trash2,
          label: 'Reset All Data',
          color: '#ff4757',
          danger: true,
          onClick: () => setShowConfirmReset(true),
        },
      ],
    },
  ];

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-text-secondary mt-0.5">Manage your app</p>
      </div>

      {/* Notification */}
      {notification && (
        <motion.div
          className="mb-4 px-4 py-3 rounded-2xl bg-neon-green/10 border border-neon-green/20 text-sm text-neon-green flex items-center gap-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <Check size={16} /> {notification}
        </motion.div>
      )}

      {/* Theme Section */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
          Accent Theme
        </p>
        <div className="flex gap-3">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`relative flex-1 aspect-square rounded-2xl flex flex-col items-center justify-center gap-1.5 border-2 transition-all ${
                theme === t.id ? 'border-border-focus bg-bg-card-hover' : 'border-transparent bg-bg-card hover:bg-bg-card-hover'
              }`}
            >
              <div
                className="w-6 h-6 rounded-full"
                style={{
                  backgroundColor: t.color,
                  boxShadow: theme === t.id ? `0 0 15px ${t.color}80` : 'none',
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Weekly Rest Days Section */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
          Weekly Rest Days
        </p>
        <div className="flex gap-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <button
              key={index}
              onClick={() => {
                const current = restDays || [];
                if (current.includes(index)) {
                  setRestDays(current.filter(d => d !== index));
                } else {
                  setRestDays([...current, index]);
                }
              }}
              className={`flex-1 aspect-square rounded-xl text-sm font-bold border-2 transition-all flex items-center justify-center ${
                (restDays || []).includes(index)
                  ? 'border-neon-blue bg-neon-blue/10 text-neon-blue'
                  : 'border-border bg-bg-card text-text-muted hover:border-border-focus'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-text-muted mt-2">
          Streaks won't be broken if you skip a workout on these days.
        </p>
      </div>

      {/* Menu Sections */}
      <div className="space-y-6">
        {menuItems.map((section) => (
          <div key={section.section}>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              {section.section}
            </p>
            <div className="space-y-1.5">
              {section.items.map((item) => {
                const Wrapper = item.to ? Link : 'button';
                return (
                  <Wrapper
                    key={item.label}
                    to={item.to}
                    onClick={item.onClick}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-bg-card border transition-colors text-left ${
                      item.danger
                        ? 'border-danger/20 hover:border-danger/40'
                        : 'border-border hover:border-border-focus/30'
                    }`}
                  >
                    <div
                      className="flex items-center justify-center w-9 h-9 rounded-xl"
                      style={{ backgroundColor: `${item.color}15` }}
                    >
                      <item.icon size={18} style={{ color: item.color }} />
                    </div>
                    <span className={`flex-1 text-sm font-medium ${item.danger ? 'text-danger' : ''}`}>
                      {item.label}
                    </span>
                    <ChevronRight size={16} className="text-text-muted" />
                  </Wrapper>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Confirm Reset Modal */}
      {showConfirmReset && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-full max-w-sm p-6 rounded-3xl bg-bg-secondary border border-danger/30"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-danger/10 mx-auto mb-4">
              <AlertTriangle size={24} className="text-danger" />
            </div>
            <h3 className="text-lg font-bold text-center mb-2">Reset All Data?</h3>
            <p className="text-sm text-text-secondary text-center mb-6">
              This will permanently delete all workouts, weights, templates, and friends. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 py-3 rounded-xl bg-bg-card border border-border text-sm font-medium text-text-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-xl bg-danger text-white text-sm font-bold"
              >
                Delete Everything
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* App Info */}
      <div className="mt-8 text-center">
        <p className="text-xs text-text-muted">Gym Streak Tracker v1.0</p>
        <p className="text-[10px] text-text-muted mt-0.5">Offline-First PWA • Built with ❤️</p>
      </div>
    </div>
  );
}
