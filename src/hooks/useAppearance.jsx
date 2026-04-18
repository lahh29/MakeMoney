import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { MotionConfig } from 'framer-motion';
import { useAuth } from './useAuth';
import { fetchUserSettings, saveAppearance as saveAppearanceRemote } from '../lib/settings';

// ─── Constants ────────────────────────────────────────────────────────────────

const THEME_KEY = 'postsell-theme';

export const ACCENTS = [
  { name: 'Azul',    c: '#0071e3', l: '#0066cc' },
  { name: 'Índigo',  c: '#5856d6', l: '#4845b8' },
  { name: 'Violeta', c: '#bf5af2', l: '#af4be2' },
  { name: 'Rosa',    c: '#ff2d92', l: '#e0267f' },
  { name: 'Rojo',    c: '#ff3b30', l: '#e02d24' },
  { name: 'Naranja', c: '#ff9500', l: '#e08500' },
  { name: 'Verde',   c: '#34c759', l: '#28a848' },
  { name: 'Cian',    c: '#32ade6', l: '#229bd4' },
];

export const FONT_FAMILIES = [
  { name: 'Sistema', d: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', t: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', g: null },
  { name: 'SF Pro',  d: "'SF Pro Display','Helvetica Neue',Arial,sans-serif",     t: "'SF Pro Text','Helvetica Neue',Arial,sans-serif",         g: null },
  { name: 'Inter',   d: "'Inter',sans-serif",   t: "'Inter',sans-serif",   g: 'Inter'   },
  { name: 'Roboto',  d: "'Roboto',sans-serif",  t: "'Roboto',sans-serif",  g: 'Roboto'  },
  { name: 'Poppins', d: "'Poppins',sans-serif", t: "'Poppins',sans-serif", g: 'Poppins' },
];

export const FONT_SIZES = [
  { name: 'Pequeño', cls: 'text-sm',  base: '15px', xs: '10px', sm: '11px', md: '12px', body: '13px', nav: '14px', lg: '15px' },
  { name: 'Normal',  cls: 'text-md',  base: '17px', xs: '11px', sm: '12px', md: '13px', body: '14px', nav: '15px', lg: '17px' },
  { name: 'Grande',  cls: 'text-lg',  base: '19px', xs: '12px', sm: '13px', md: '14px', body: '15px', nav: '16px', lg: '19px' },
];

export const RADIUS_PRESETS = [
  { name: 'Cuadrado',   sm: '3px',  md: '5px',  lg: '6px'  },
  { name: 'Normal',     sm: '8px',  md: '11px', lg: '12px' },
  { name: 'Redondeado', sm: '14px', md: '18px', lg: '22px' },
];

export const DENSITIES = [
  { name: 'Compacto',  cls: 'density-compact',  desc: 'Más elementos en pantalla'  },
  { name: 'Normal',    cls: 'density-normal',   desc: 'Espaciado balanceado'        },
  { name: 'Espacioso', cls: 'density-spacious', desc: 'Mayor separación visual'     },
];

export const BACKGROUNDS = [
  { name: 'Sólido',     cls: '',        preview: {} },
  { name: 'Puntos',     cls: 'bg-dots', preview: { backgroundImage: 'radial-gradient(circle,rgba(0,0,0,.18) 1.5px,transparent 1.5px)', backgroundSize: '8px 8px' } },
  { name: 'Cuadrícula', cls: 'bg-grid', preview: { backgroundImage: 'linear-gradient(rgba(0,0,0,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.1) 1px,transparent 1px)', backgroundSize: '8px 8px' } },
  { name: 'Degradado',  cls: 'bg-grad', preview: { background: 'linear-gradient(135deg,#deeaff,#f5e8ff)' } },
];

// ─── DOM apply helpers ────────────────────────────────────────────────────────

const root = () => document.documentElement;
const ls   = (k, def) => { const v = localStorage.getItem('ps_' + k); return v !== null ? +v : def; };

function applyAccent(i) {
  const a = ACCENTS[i];
  if (!a) return;
  root().style.setProperty('--apple-blue', a.c);
  root().style.setProperty('--link-color', a.l);
  root().style.setProperty('--focus-ring', a.c);
}

function applyFont(i) {
  const f = FONT_FAMILIES[i];
  if (!f) return;
  root().style.setProperty('--font-display', f.d);
  root().style.setProperty('--font-text', f.t);
  if (f.g) {
    const id = 'ps-gf-' + f.g;
    if (!document.getElementById(id)) {
      const lk = document.createElement('link');
      lk.id = id; lk.rel = 'stylesheet';
      lk.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(f.g)}:wght@400;500;600;700&display=swap`;
      document.head.appendChild(lk);
    }
  }
}

function applyFontSize(i) {
  const s = FONT_SIZES[i];
  if (!s) return;
  FONT_SIZES.forEach(f => root().classList.remove(f.cls));
  root().classList.add(s.cls);
  root().style.setProperty('--font-size-base', s.base);
  root().style.setProperty('--fs-xs', s.xs);
  root().style.setProperty('--fs-sm', s.sm);
  root().style.setProperty('--fs-md', s.md);
  root().style.setProperty('--fs-body', s.body);
  root().style.setProperty('--fs-nav', s.nav);
  root().style.setProperty('--fs-lg', s.lg);
}

function applyRadius(i) {
  const r = RADIUS_PRESETS[i];
  if (!r) return;
  root().style.setProperty('--radius-sm', r.sm);
  root().style.setProperty('--radius-md', r.md);
  root().style.setProperty('--radius-lg', r.lg);
}

function applyDensity(i) {
  DENSITIES.forEach(d => root().classList.remove(d.cls));
  if (DENSITIES[i]) root().classList.add(DENSITIES[i].cls);
}

function applyBg(i) {
  BACKGROUNDS.forEach(b => { if (b.cls) root().classList.remove(b.cls); });
  if (BACKGROUNDS[i]?.cls) root().classList.add(BACKGROUNDS[i].cls);
}

function applyDark(dark) {
  root().classList.toggle('dark-theme', dark);
  localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AppearanceContext = createContext(null);

export function useAppearance() {
  const ctx = useContext(AppearanceContext);
  if (!ctx) throw new Error('useAppearance must be inside AppearanceProvider');
  return ctx;
}

export function AppearanceProvider({ children }) {
  const { user } = useAuth();

  const [isDark,      setIsDark]      = useState(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved ? saved === 'dark' : false;
  });
  const [accentIdx,   setAccentIdx]   = useState(() => ls('accent', 0));
  const [fontFamIdx,  setFontFamIdx]  = useState(() => ls('fontFam', 1));
  const [fontSizeIdx, setFontSizeIdx] = useState(() => ls('fontSize', 1));
  const [radiusIdx,   setRadiusIdx]   = useState(() => ls('radius', 1));
  const [densityIdx,  setDensityIdx]  = useState(() => ls('density', 1));
  const [bgIdx,       setBgIdx]       = useState(() => ls('bg', 0));
  const [reduceAnim,  setReduceAnim]  = useState(() => localStorage.getItem('ps_reduceAnim') === 'true');

  // Refs for debounced Supabase save
  const saveTimerRef = useRef(null);
  const stateRef     = useRef({});

  // Keep ref in sync for debounced saves
  useEffect(() => {
    stateRef.current = { isDark, accentIdx, fontFamIdx, fontSizeIdx, radiusIdx, densityIdx, bgIdx, reduceAnim };
  });

  // Schedule debounced save to Supabase
  const scheduleSave = useCallback(() => {
    if (!user?.id) return;
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const s = stateRef.current;
      saveAppearanceRemote(user.id, {
        theme: s.isDark ? 'dark' : 'light',
        accent: s.accentIdx,
        fontFam: s.fontFamIdx,
        fontSize: s.fontSizeIdx,
        radius: s.radiusIdx,
        density: s.densityIdx,
        bg: s.bgIdx,
        reduceAnim: s.reduceAnim,
      });
    }, 800);
  }, [user?.id]);

  // Apply all from localStorage on mount (instant paint)
  useEffect(() => {
    applyDark(isDark);
    applyAccent(accentIdx);
    applyFont(fontFamIdx);
    applyFontSize(fontSizeIdx);
    applyRadius(radiusIdx);
    applyDensity(densityIdx);
    applyBg(bgIdx);
    root().classList.toggle('reduce-motion', reduceAnim);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch from Supabase when user authenticates → override localStorage
  useEffect(() => {
    if (!user?.id) return;
    fetchUserSettings(user.id).then(data => {
      if (!data?.appearance) return;
      const a = data.appearance;
      if (a.theme !== undefined)      { const d = a.theme === 'dark'; setIsDark(d); applyDark(d); localStorage.setItem(THEME_KEY, a.theme); }
      if (a.accent !== undefined)     { setAccentIdx(a.accent);   applyAccent(a.accent);   localStorage.setItem('ps_accent', a.accent); }
      if (a.fontFam !== undefined)    { setFontFamIdx(a.fontFam); applyFont(a.fontFam);     localStorage.setItem('ps_fontFam', a.fontFam); }
      if (a.fontSize !== undefined)   { setFontSizeIdx(a.fontSize); applyFontSize(a.fontSize); localStorage.setItem('ps_fontSize', a.fontSize); }
      if (a.radius !== undefined)     { setRadiusIdx(a.radius);   applyRadius(a.radius);   localStorage.setItem('ps_radius', a.radius); }
      if (a.density !== undefined)    { setDensityIdx(a.density); applyDensity(a.density); localStorage.setItem('ps_density', a.density); }
      if (a.bg !== undefined)         { setBgIdx(a.bg);           applyBg(a.bg);           localStorage.setItem('ps_bg', a.bg); }
      if (a.reduceAnim !== undefined) { setReduceAnim(a.reduceAnim); root().classList.toggle('reduce-motion', a.reduceAnim); localStorage.setItem('ps_reduceAnim', a.reduceAnim); }
    });
  }, [user?.id]);

  const toggleDark = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      applyDark(next);
      return next;
    });
    scheduleSave();
  }, [scheduleSave]);

  const setAccent = useCallback((i) => {
    setAccentIdx(i);   applyAccent(i);   localStorage.setItem('ps_accent', i);
    scheduleSave();
  }, [scheduleSave]);

  const setFont = useCallback((i) => {
    setFontFamIdx(i);  applyFont(i);     localStorage.setItem('ps_fontFam', i);
    scheduleSave();
  }, [scheduleSave]);

  const setFontSize = useCallback((i) => {
    setFontSizeIdx(i); applyFontSize(i); localStorage.setItem('ps_fontSize', i);
    scheduleSave();
  }, [scheduleSave]);

  const setRadius = useCallback((i) => {
    setRadiusIdx(i);   applyRadius(i);   localStorage.setItem('ps_radius', i);
    scheduleSave();
  }, [scheduleSave]);

  const setDensity = useCallback((i) => {
    setDensityIdx(i);  applyDensity(i);  localStorage.setItem('ps_density', i);
    scheduleSave();
  }, [scheduleSave]);

  const setBg = useCallback((i) => {
    setBgIdx(i);       applyBg(i);       localStorage.setItem('ps_bg', i);
    scheduleSave();
  }, [scheduleSave]);

  const toggleReduceAnim = useCallback(() => {
    setReduceAnim(prev => {
      const next = !prev;
      root().classList.toggle('reduce-motion', next);
      localStorage.setItem('ps_reduceAnim', next);
      return next;
    });
    scheduleSave();
  }, [scheduleSave]);

  const resetAll = useCallback(() => {
    ['accent','fontFam','fontSize','radius','density','bg','reduceAnim'].forEach(k => localStorage.removeItem('ps_' + k));
    root().removeAttribute('style');
    DENSITIES.forEach(d => root().classList.remove(d.cls));
    BACKGROUNDS.forEach(b => { if (b.cls) root().classList.remove(b.cls); });
    FONT_SIZES.forEach(f => root().classList.remove(f.cls));
    root().classList.remove('reduce-motion');
    applyDark(isDark);
    setAccentIdx(0); setFontFamIdx(1); setFontSizeIdx(1);
    setRadiusIdx(1); setDensityIdx(1); setBgIdx(0); setReduceAnim(false);
    scheduleSave();
  }, [isDark, scheduleSave]);

  const value = {
    isDark, toggleDark,
    accentIdx, setAccent,
    fontFamIdx, setFont,
    fontSizeIdx, setFontSize,
    radiusIdx, setRadius,
    densityIdx, setDensity,
    bgIdx, setBg,
    reduceAnim, toggleReduceAnim,
    resetAll,
  };

  return (
    <AppearanceContext.Provider value={value}>
      <MotionConfig reducedMotion={reduceAnim ? 'always' : 'never'}>
        {children}
      </MotionConfig>
    </AppearanceContext.Provider>
  );
}
