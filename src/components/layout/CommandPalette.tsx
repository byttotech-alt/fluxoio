import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { getMenuItemsForSegments } from '@/lib/constants';
import { Search, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './CommandPalette.css';

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const menuItems = useMemo(() => {
    if (!profile?.segments?.length) return [];
    return getMenuItemsForSegments(profile.segments as any);
  }, [profile?.segments]);

  const filtered = useMemo(() => {
    if (!query.trim()) return menuItems.slice(0, 8);
    const q = query.toLowerCase();
    return menuItems.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.group.toLowerCase().includes(q)
    );
  }, [query, menuItems]);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      navigate(filtered[selectedIndex].path);
      setCommandPaletteOpen(false);
    } else if (e.key === 'Escape') {
      setCommandPaletteOpen(false);
    }
  }

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          <motion.div className="cmd-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setCommandPaletteOpen(false)}
          />
          <motion.div className="cmd-palette"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
          >
            <div className="cmd-search">
              <Search size={18} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar módulo, página..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button onClick={() => setCommandPaletteOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="cmd-results">
              {filtered.length === 0 ? (
                <div className="cmd-empty">Nenhum resultado encontrado</div>
              ) : (
                filtered.map((item, idx) => (
                  <button
                    key={item.id}
                    className={`cmd-item ${idx === selectedIndex ? 'selected' : ''}`}
                    onClick={() => { navigate(item.path); setCommandPaletteOpen(false); }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <item.icon size={18} />
                    <div className="cmd-item-info">
                      <span className="cmd-item-label">{item.label}</span>
                      <span className="cmd-item-group">{item.group}</span>
                    </div>
                    <ArrowRight size={14} className="cmd-item-arrow" />
                  </button>
                ))
              )}
            </div>

            <div className="cmd-footer">
              <span><kbd>↑↓</kbd> navegar</span>
              <span><kbd>Enter</kbd> abrir</span>
              <span><kbd>Esc</kbd> fechar</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
