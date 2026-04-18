import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconSearch, IconX } from '@tabler/icons-react';

const spring = { type: 'spring', stiffness: 400, damping: 28 };

export function SearchBar({
  placeholder = 'Buscar...',
  onSearch,
  onClear,
  suggestions = [],
  className = '',
  id = 'search-bar',
}) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  const showSuggestions = isFocused && query.length > 0 && suggestions.length > 0;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setActiveSuggestion(-1);
    onSearch?.(val);
  };

  const handleClear = () => {
    setQuery('');
    setActiveSuggestion(-1);
    onClear?.();
    onSearch?.('');
    inputRef.current?.focus();
  };

  const handleSelectSuggestion = (sug) => {
    const val = sug.label || sug;
    setQuery(val);
    setIsFocused(false);
    onSearch?.(val);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && activeSuggestion >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[activeSuggestion]);
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={`search-bar-wrapper${className ? ` ${className}` : ''}`}
      role="combobox"
      aria-expanded={showSuggestions}
      aria-haspopup="listbox"
      aria-owns={`${id}-listbox`}
    >
      {/* Campo principal */}
      <motion.div
        className={`search-bar${isFocused ? ' search-bar--focused' : ''}${showSuggestions ? ' search-bar--open' : ''}`}
      >
        <motion.span
          className="search-bar__icon"
          aria-hidden="true"
        >
          <IconSearch size={16} />
        </motion.span>

        <input
          ref={inputRef}
          id={id}
          type="text"
          role="searchbox"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={placeholder}
          aria-autocomplete="list"
          aria-controls={`${id}-listbox`}
          aria-activedescendant={activeSuggestion >= 0 ? `${id}-option-${activeSuggestion}` : undefined}
          autoComplete="off"
          className="search-bar__input"
        />

        <AnimatePresence>
          {query && (
            <motion.button
              key="clear"
              className="search-bar__clear"
              onClick={handleClear}
              aria-label="Limpiar búsqueda"
              title="Limpiar"
              type="button"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              whileHover={{ scale: 1.15, rotate: 90 }}
              whileTap={{ scale: 0.85 }}
              transition={spring}
            >
              <IconX size={11} />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Sugerencias */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.ul
            id={`${id}-listbox`}
            role="listbox"
            aria-label="Sugerencias de búsqueda"
            className="search-bar__suggestions"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ type: 'tween', duration: 0.15 }}
          >
            {suggestions.map((sug, i) => {
              const label = sug.label || sug;
              const isActive = i === activeSuggestion;
              return (
                <li
                  key={i}
                  id={`${id}-option-${i}`}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => handleSelectSuggestion(sug)}
                  onMouseEnter={() => setActiveSuggestion(i)}
                  className={`search-bar__suggestion-item${isActive ? ' search-bar__suggestion-item--active' : ''}`}
                >
                  <IconSearch size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} aria-hidden="true" />
                  <span>{label}</span>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
