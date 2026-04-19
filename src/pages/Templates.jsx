import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookTemplate, Plus, Trash2, Edit3, Dumbbell, Play, X } from 'lucide-react';
import { useTemplateStore } from '../store/stores';
import { generateId } from '../utils/helpers';

export default function Templates() {
  const { templates, loadTemplates, addTemplate, deleteTemplate } = useTemplateStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await addTemplate({
      name: newName.trim(),
      bodyParts: [
        {
          name: '',
          exercises: [
            { name: '', sets: [{ reps: 12, weight: 0 }] },
          ],
        },
      ],
    });
    setNewName('');
    setShowCreate(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this template?')) {
      await deleteTemplate(id);
    }
  };

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="text-sm text-text-secondary mt-0.5">Quick-start workout plans</p>
        </div>
        <motion.button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-bg-card border border-border text-sm text-text-secondary hover:text-neon-green hover:border-neon-green/30 transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={16} /> New
        </motion.button>
      </div>

      {/* Create Template */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            className="mb-6 p-4 rounded-2xl bg-bg-card border border-neon-green/30"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="text-xs font-semibold text-text-secondary mb-3">Create Template</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl bg-bg-input border border-border text-sm focus:border-neon-green focus:outline-none"
                placeholder="Template name (e.g., Push Day)"
                autoFocus
              />
              <button
                onClick={handleCreate}
                className="px-4 py-2.5 rounded-xl bg-neon-green text-bg-primary text-sm font-bold"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="px-3 py-2.5 rounded-xl bg-bg-input text-text-muted"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template List */}
      <div className="space-y-3">
        <AnimatePresence>
          {templates.map((template) => (
            <motion.div
              key={template.id}
              className="p-4 rounded-2xl bg-bg-card border border-border"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-neon-purple/10">
                  <BookTemplate size={18} className="text-neon-purple" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{template.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {(template.bodyParts || []).length} body parts ·{' '}
                    {(template.bodyParts || []).reduce((a, bp) => a + (bp.exercises || []).length, 0)} exercises
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    to={`/workout?template=${template.id}`}
                    className="p-2 rounded-xl bg-neon-green/10 text-neon-green hover:bg-neon-green/20 transition-colors"
                  >
                    <Play size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-2 rounded-xl hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Preview */}
              {(template.bodyParts || []).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(template.bodyParts || []).map((bp, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-bg-input text-text-muted"
                    >
                      {bp.name || 'Unnamed'}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {templates.length === 0 && !showCreate && (
        <motion.div className="text-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <BookTemplate size={48} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary">No templates yet</p>
          <p className="text-sm text-text-muted mt-1">Create templates for quick workout starts</p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-block mt-4 px-6 py-2 rounded-xl bg-neon-green text-bg-primary text-sm font-bold"
          >
            <span className="flex items-center gap-1.5"><Plus size={14} /> Create Template</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
