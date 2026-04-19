import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Trash2, Edit3, Trophy, Flame, Crown, Check, X, UserPlus } from 'lucide-react';
import { useFriendStore } from '../store/stores';

export default function Friends() {
  const { friends, loadFriends, addFriend, updateFriend, deleteFriend } = useFriendStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newStreak, setNewStreak] = useState('');
  const [newLongest, setNewLongest] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    loadFriends();
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addFriend({
      name: newName.trim(),
      currentStreak: Number(newStreak) || 0,
      longestStreak: Number(newLongest) || 0,
    });
    setNewName('');
    setNewStreak('');
    setNewLongest('');
    setShowAdd(false);
  };

  const handleUpdate = async (friend) => {
    await updateFriend({
      ...friend,
      name: editData.name || friend.name,
      currentStreak: Number(editData.currentStreak) ?? friend.currentStreak,
      longestStreak: Number(editData.longestStreak) ?? friend.longestStreak,
    });
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this friend?')) {
      await deleteFriend(id);
    }
  };

  const leaderboard = [...friends].sort((a, b) => b.currentStreak - a.currentStreak);

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Friends</h1>
          <p className="text-sm text-text-secondary mt-0.5">Local leaderboard</p>
        </div>
        <motion.button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-bg-card border border-border text-sm text-text-secondary hover:text-neon-green hover:border-neon-green/30 transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          <UserPlus size={16} /> Add
        </motion.button>
      </div>

      {/* Add Friend */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            className="mb-6 p-4 rounded-2xl bg-bg-card border border-neon-green/30"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="text-xs font-semibold text-text-secondary mb-3">Add Friend</p>
            <div className="space-y-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-bg-input border border-border text-sm focus:border-neon-green focus:outline-none"
                placeholder="Name"
                autoFocus
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newStreak}
                  onChange={(e) => setNewStreak(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-bg-input border border-border text-sm focus:border-neon-green focus:outline-none"
                  placeholder="Current Streak"
                  min="0"
                />
                <input
                  type="number"
                  value={newLongest}
                  onChange={(e) => setNewLongest(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-bg-input border border-border text-sm focus:border-neon-green focus:outline-none"
                  placeholder="Longest Streak"
                  min="0"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  className="flex-1 py-2.5 rounded-xl bg-neon-green text-bg-primary text-sm font-bold"
                >
                  Add Friend
                </button>
                <button
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2.5 rounded-xl bg-bg-input text-text-muted text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-text-secondary mb-3 flex items-center gap-1.5">
            <Trophy size={14} className="text-neon-yellow" />
            Streak Leaderboard
          </p>
          <div className="space-y-2">
            <AnimatePresence>
              {leaderboard.map((friend, rank) => (
                <motion.div
                  key={friend.id}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-colors ${
                    rank === 0
                      ? 'bg-neon-yellow/5 border-neon-yellow/20'
                      : rank === 1
                      ? 'bg-text-muted/5 border-text-muted/20'
                      : rank === 2
                      ? 'bg-neon-orange/5 border-neon-orange/20'
                      : 'bg-bg-card border-border'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: rank * 0.05 }}
                >
                  {/* Rank */}
                  <div className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold"
                    style={{
                      backgroundColor: rank === 0 ? '#ffd70020' : rank === 1 ? '#8888aa15' : rank === 2 ? '#ff6b3520' : '#1a1a2e',
                      color: rank === 0 ? '#ffd700' : rank === 1 ? '#8888aa' : rank === 2 ? '#ff6b35' : '#555577'
                    }}
                  >
                    {rank === 0 ? <Crown size={16} /> : `#${rank + 1}`}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    {editingId === friend.id ? (
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={editData.name ?? friend.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="w-full px-2 py-1 rounded-lg bg-bg-input border border-border text-sm focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={editData.currentStreak ?? friend.currentStreak}
                            onChange={(e) => setEditData({ ...editData, currentStreak: e.target.value })}
                            className="flex-1 px-2 py-1 rounded-lg bg-bg-input border border-border text-xs focus:outline-none"
                            placeholder="Current"
                          />
                          <input
                            type="number"
                            value={editData.longestStreak ?? friend.longestStreak}
                            onChange={(e) => setEditData({ ...editData, longestStreak: e.target.value })}
                            className="flex-1 px-2 py-1 rounded-lg bg-bg-input border border-border text-xs focus:outline-none"
                            placeholder="Longest"
                          />
                          <button onClick={() => handleUpdate(friend)} className="text-neon-green"><Check size={16} /></button>
                          <button onClick={() => setEditingId(null)} className="text-text-muted"><X size={16} /></button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-semibold">{friend.name}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1 text-xs text-neon-orange">
                            <Flame size={10} /> {friend.currentStreak} days
                          </span>
                          <span className="flex items-center gap-1 text-xs text-text-muted">
                            <Trophy size={10} /> Best: {friend.longestStreak}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {editingId !== friend.id && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditingId(friend.id); setEditData({ name: friend.name, currentStreak: friend.currentStreak, longestStreak: friend.longestStreak }); }}
                        className="p-1.5 rounded-lg hover:bg-bg-card-hover text-text-muted hover:text-neon-blue transition-colors"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(friend.id)}
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
        </div>
      )}

      {friends.length === 0 && !showAdd && (
        <motion.div className="text-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Users size={48} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary">No friends added yet</p>
          <p className="text-sm text-text-muted mt-1">Add friends to compare streaks</p>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-block mt-4 px-6 py-2 rounded-xl bg-neon-green text-bg-primary text-sm font-bold"
          >
            <span className="flex items-center gap-1.5"><UserPlus size={14} /> Add Friend</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
