import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, ChevronDown, ChevronRight, Save, Copy, BookTemplate,
  Dumbbell, X, Check, RotateCcw
} from 'lucide-react';
import { useWorkoutStore, useTemplateStore } from '../store/stores';
import { getToday, generateId } from '../utils/helpers';

function SetRow({ set, setIndex, onUpdate, onDelete }) {
  return (
    <motion.div
      className="flex items-center gap-2 py-1.5"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ duration: 0.2 }}
    >
      <span className="text-xs text-text-muted w-6 text-center font-mono">{setIndex + 1}</span>
      <div className="flex-1 flex gap-2">
        <div className="flex-1">
          <input
            type="number"
            value={set.reps}
            onChange={(e) => onUpdate({ ...set, reps: Number(e.target.value) || 0 })}
            className="w-full px-3 py-2 rounded-xl bg-bg-input border border-border text-center text-sm font-medium focus:border-neon-green focus:outline-none transition-colors"
            placeholder="Reps"
            min="0"
          />
        </div>
        <div className="flex-1">
          <input
            type="number"
            value={set.weight}
            onChange={(e) => onUpdate({ ...set, weight: Number(e.target.value) || 0 })}
            className="w-full px-3 py-2 rounded-xl bg-bg-input border border-border text-center text-sm font-medium focus:border-neon-blue focus:outline-none transition-colors"
            placeholder="Weight"
            min="0"
            step="0.5"
          />
        </div>
      </div>
      <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors">
        <X size={14} />
      </button>
    </motion.div>
  );
}

function ExerciseCard({ exercise, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(true);

  const addSet = () => {
    const lastSet = exercise.sets[exercise.sets.length - 1];
    onUpdate({
      ...exercise,
      sets: [...exercise.sets, { id: generateId(), reps: lastSet?.reps || 12, weight: lastSet?.weight || 0 }],
    });
  };

  const updateSet = (setIndex, updatedSet) => {
    const newSets = [...exercise.sets];
    newSets[setIndex] = updatedSet;
    onUpdate({ ...exercise, sets: newSets });
  };

  const deleteSet = (setIndex) => {
    onUpdate({ ...exercise, sets: exercise.sets.filter((_, i) => i !== setIndex) });
  };

  const updateName = (name) => {
    onUpdate({ ...exercise, name });
  };

  return (
    <motion.div
      className="rounded-xl bg-bg-card-hover/50 border border-border/50 overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      {/* Exercise Header */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button onClick={() => setExpanded(!expanded)} className="p-0.5 text-text-muted">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <Dumbbell size={14} className="text-neon-blue" />
        <input
          type="text"
          value={exercise.name}
          onChange={(e) => updateName(e.target.value)}
          className="flex-1 bg-transparent text-sm font-semibold focus:outline-none placeholder:text-text-muted"
          placeholder="Exercise name"
        />
        <span className="text-[10px] text-text-muted px-1.5 py-0.5 rounded-md bg-bg-card">
          {exercise.sets.length} sets
        </span>
        <button onClick={onDelete} className="p-1 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors">
          <Trash2 size={14} />
        </button>
      </div>

      {/* Sets */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-2">
              {/* Header row */}
              <div className="flex items-center gap-2 pb-1 mb-1 border-b border-border/30">
                <span className="text-[10px] text-text-muted w-6 text-center">SET</span>
                <div className="flex-1 flex gap-2">
                  <span className="flex-1 text-[10px] text-text-muted text-center">REPS</span>
                  <span className="flex-1 text-[10px] text-text-muted text-center">KG</span>
                </div>
                <span className="w-8" />
              </div>

              <AnimatePresence>
                {exercise.sets.map((set, i) => (
                  <SetRow
                    key={set.id}
                    set={set}
                    setIndex={i}
                    onUpdate={(s) => updateSet(i, s)}
                    onDelete={() => deleteSet(i)}
                  />
                ))}
              </AnimatePresence>

              <button
                onClick={addSet}
                className="w-full mt-1.5 py-1.5 rounded-lg border border-dashed border-border text-xs text-text-muted hover:text-neon-green hover:border-neon-green/30 transition-colors flex items-center justify-center gap-1"
              >
                <Plus size={12} /> Add Set
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function BodyPartSection({ bodyPart, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(true);

  const addExercise = () => {
    onUpdate({
      ...bodyPart,
      exercises: [
        ...bodyPart.exercises,
        { id: generateId(), name: '', sets: [{ id: generateId(), reps: 12, weight: 0 }] },
      ],
    });
  };

  const updateExercise = (exIndex, updatedExercise) => {
    const newExercises = [...bodyPart.exercises];
    newExercises[exIndex] = updatedExercise;
    onUpdate({ ...bodyPart, exercises: newExercises });
  };

  const deleteExercise = (exIndex) => {
    onUpdate({ ...bodyPart, exercises: bodyPart.exercises.filter((_, i) => i !== exIndex) });
  };

  return (
    <motion.div
      className="rounded-2xl bg-bg-card border border-border overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
    >
      {/* Body Part Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-bg-card to-bg-card-hover">
        <button onClick={() => setExpanded(!expanded)} className="p-0.5 text-text-muted">
          {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>
        <div className="w-2 h-2 rounded-full bg-neon-green" style={{ boxShadow: '0 0 6px rgba(57,255,20,0.4)' }} />
        <input
          type="text"
          value={bodyPart.name}
          onChange={(e) => onUpdate({ ...bodyPart, name: e.target.value })}
          className="flex-1 bg-transparent font-bold text-base focus:outline-none placeholder:text-text-muted"
          placeholder="Body Part (e.g., Chest)"
        />
        <span className="text-[10px] text-text-muted px-2 py-0.5 rounded-full bg-bg-input">
          {bodyPart.exercises.length} exercises
        </span>
        <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors">
          <Trash2 size={16} />
        </button>
      </div>

      {/* Exercises */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-2.5">
              <AnimatePresence>
                {bodyPart.exercises.map((exercise, i) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onUpdate={(ex) => updateExercise(i, ex)}
                    onDelete={() => deleteExercise(i)}
                  />
                ))}
              </AnimatePresence>

              <button
                onClick={addExercise}
                className="w-full py-2 rounded-xl border border-dashed border-border text-xs font-medium text-text-muted hover:text-neon-blue hover:border-neon-blue/30 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus size={14} /> Add Exercise
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function WorkoutLogger() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addWorkout, getLastWorkout, workouts } = useWorkoutStore();
  const { templates, loadTemplates, addTemplate } = useTemplateStore();
  const [bodyParts, setBodyParts] = useState([]);
  const [date, setDate] = useState(getToday());
  const [saving, setSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);

  useEffect(() => {
    loadTemplates();
    const duplicateId = searchParams.get('duplicate');
    const templateId = searchParams.get('template');
    if (duplicateId) {
      const workout = workouts.find((w) => w.id === Number(duplicateId));
      if (workout) {
        setBodyParts(JSON.parse(JSON.stringify(workout.bodyParts || [])).map(bp => ({
          ...bp, id: generateId(),
          exercises: bp.exercises.map(ex => ({
            ...ex, id: generateId(),
            sets: ex.sets.map(s => ({ ...s, id: generateId() }))
          }))
        })));
      }
    } else if (templateId) {
      const tmpl = templates.find((t) => t.id === Number(templateId));
      if (tmpl) {
        setBodyParts(JSON.parse(JSON.stringify(tmpl.bodyParts || [])).map(bp => ({
          ...bp, id: generateId(),
          exercises: bp.exercises.map(ex => ({
            ...ex, id: generateId(),
            sets: ex.sets.map(s => ({ ...s, id: generateId() }))
          }))
        })));
      }
    }
  }, []);

  const addBodyPart = () => {
    setBodyParts([
      ...bodyParts,
      {
        id: generateId(),
        name: '',
        exercises: [
          { id: generateId(), name: '', sets: [{ id: generateId(), reps: 12, weight: 0 }] },
        ],
      },
    ]);
  };

  const updateBodyPart = (index, updated) => {
    const newParts = [...bodyParts];
    newParts[index] = updated;
    setBodyParts(newParts);
  };

  const deleteBodyPart = (index) => {
    setBodyParts(bodyParts.filter((_, i) => i !== index));
  };

  const loadLastWorkout = useCallback(() => {
    const last = getLastWorkout();
    if (last?.bodyParts) {
      setBodyParts(JSON.parse(JSON.stringify(last.bodyParts)).map(bp => ({
        ...bp, id: generateId(),
        exercises: bp.exercises.map(ex => ({
          ...ex, id: generateId(),
          sets: ex.sets.map(s => ({ ...s, id: generateId() }))
        }))
      })));
    }
  }, [getLastWorkout]);

  const saveWorkout = async () => {
    if (bodyParts.length === 0) return;
    setSaving(true);
    try {
      // Clean up: remove id fields for storage
      const cleanParts = bodyParts.map((bp) => ({
        name: bp.name || 'Unnamed',
        exercises: bp.exercises.map((ex) => ({
          name: ex.name || 'Unnamed',
          sets: ex.sets.map((s) => ({ reps: s.reps || 0, weight: s.weight || 0 })),
        })),
      }));
      await addWorkout({ date, bodyParts: cleanParts });
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const saveAsTemplate = async () => {
    if (!templateName.trim() || bodyParts.length === 0) return;
    const cleanParts = bodyParts.map((bp) => ({
      name: bp.name || 'Unnamed',
      exercises: bp.exercises.map((ex) => ({
        name: ex.name || 'Unnamed',
        sets: ex.sets.map((s) => ({ reps: s.reps || 0, weight: s.weight || 0 })),
      })),
    }));
    await addTemplate({ name: templateName, bodyParts: cleanParts });
    setShowSaveTemplate(false);
    setTemplateName('');
  };

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Log Workout</h1>
          <p className="text-sm text-text-secondary mt-0.5">Build your session</p>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-bg-card border border-border text-sm text-text-secondary focus:border-neon-green focus:outline-none"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <button
          onClick={loadLastWorkout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-bg-card border border-border text-xs font-medium text-text-secondary hover:text-neon-blue hover:border-neon-blue/30 transition-colors whitespace-nowrap"
        >
          <RotateCcw size={12} /> Last Workout
        </button>
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-bg-card border border-border text-xs font-medium text-text-secondary hover:text-neon-purple hover:border-neon-purple/30 transition-colors whitespace-nowrap"
        >
          <BookTemplate size={12} /> Templates
        </button>
        {bodyParts.length > 0 && (
          <button
            onClick={() => setShowSaveTemplate(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-bg-card border border-border text-xs font-medium text-text-secondary hover:text-neon-orange hover:border-neon-orange/30 transition-colors whitespace-nowrap"
          >
            <Save size={12} /> Save Template
          </button>
        )}
      </div>

      {/* Template Picker */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            className="mb-4 p-3 rounded-2xl bg-bg-card border border-border space-y-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="text-xs font-semibold text-text-secondary">Pick a template:</p>
            {templates.length === 0 ? (
              <p className="text-xs text-text-muted">No templates saved yet</p>
            ) : (
              templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    navigate(`/workout?template=${t.id}`);
                    window.location.reload();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-input hover:bg-bg-card-hover text-left text-sm transition-colors"
                >
                  <BookTemplate size={14} className="text-neon-purple" />
                  <span>{t.name}</span>
                  <span className="text-[10px] text-text-muted ml-auto">{t.bodyParts?.length || 0} parts</span>
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Template Modal */}
      <AnimatePresence>
        {showSaveTemplate && (
          <motion.div
            className="mb-4 p-3 rounded-2xl bg-bg-card border border-neon-orange/30 space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-xs font-semibold text-text-secondary">Template Name:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-bg-input border border-border text-sm focus:border-neon-orange focus:outline-none"
                placeholder="e.g., Push Day"
                autoFocus
              />
              <button
                onClick={saveAsTemplate}
                className="px-4 py-2 rounded-xl bg-neon-orange text-bg-primary text-sm font-bold"
              >
                Save
              </button>
              <button
                onClick={() => setShowSaveTemplate(false)}
                className="px-3 py-2 rounded-xl bg-bg-input text-text-muted text-sm"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Body Parts */}
      <div className="space-y-3 mb-6">
        <AnimatePresence>
          {bodyParts.map((bp, i) => (
            <BodyPartSection
              key={bp.id}
              bodyPart={bp}
              onUpdate={(updated) => updateBodyPart(i, updated)}
              onDelete={() => deleteBodyPart(i)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Add Body Part */}
      <motion.button
        onClick={addBodyPart}
        className="w-full py-3 mb-4 rounded-2xl border-2 border-dashed border-border text-sm font-medium text-text-muted hover:text-neon-green hover:border-neon-green/30 transition-colors flex items-center justify-center gap-2"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <Plus size={18} /> Add Body Part
      </motion.button>

      {/* Save Workout */}
      {bodyParts.length > 0 && (
        <motion.button
          onClick={saveWorkout}
          disabled={saving}
          className="w-full py-4 rounded-2xl font-bold text-lg text-bg-primary bg-gradient-to-r from-neon-green to-neon-blue hover:opacity-90 transition-opacity glow-green disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {saving ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
              <RotateCcw size={20} />
            </motion.div>
          ) : (
            <>
              <Check size={20} /> Save Workout
            </>
          )}
        </motion.button>
      )}
    </div>
  );
}
