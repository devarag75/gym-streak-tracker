import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

export default function AutocompleteInput({
  value,
  onChange,
  options,
  onAddNew,
  placeholder,
  className = '',
  inputClassName = 'text-sm font-semibold',
  icon: Icon
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(value.toLowerCase())
  );

  const exactMatch = options.find(o => o.toLowerCase() === value.toLowerCase());
  const showAddOption = value.trim().length > 0 && !exactMatch;

  return (
    <div className={`relative flex-1 ${className}`} ref={wrapperRef}>
      <div className="flex items-center bg-transparent w-full">
        {Icon && <Icon size={14} className="text-neon-blue mr-2" />}
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsFocused(true);
            setIsOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
          className={`flex-1 bg-transparent focus:outline-none placeholder:text-text-muted w-full ${inputClassName}`}
          placeholder={placeholder}
        />
      </div>

      <AnimatePresence>
        {isOpen && (filteredOptions.length > 0 || showAddOption) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 right-0 mt-2 bg-bg-card border border-border rounded-xl shadow-xl overflow-hidden"
          >
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-bg-input hover:text-neon-blue transition-colors border-b border-border/50 last:border-0"
                >
                  {option}
                </button>
              ))}
              
              {showAddOption && (
                <button
                  onClick={() => {
                    onAddNew(value.trim());
                    onChange(value.trim());
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-neon-green hover:bg-neon-green/10 transition-colors border-t border-border"
                >
                  <Plus size={14} />
                  <span>Add "{value.trim()}"</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
