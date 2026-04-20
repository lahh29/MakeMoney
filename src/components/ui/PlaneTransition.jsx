import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Apple Aperture Transition.
 * Black overlay opens via radial clip-path (camera lens).
 * Logo + greeting breathe in center, then aperture closes/opens to reveal app.
 *
 * Phases:
 *   idle    → no render
 *   cover   → overlay fades in (clip 0% → 150%)
 *   reveal  → text breathes (scale + opacity)
 *   open    → aperture clip-path collapses (150% → 0%) revealing app
 */
export function PlaneTransition({ isActive, direction = 'login', onComplete }) {
  const [phase, setPhase] = useState('idle');

  const stableOnComplete = useCallback(() => {
    if (onComplete) onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (!isActive) {
      setPhase('idle');
      return;
    }

    setPhase('cover');
    const t1 = setTimeout(() => setPhase('reveal'), 350);
    const t2 = setTimeout(() => setPhase('open'),   1500);
    const t3 = setTimeout(() => {
      setPhase('idle');
      stableOnComplete();
    }, 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isActive, stableOnComplete]);

  const greeting = direction === 'logout' ? 'Hasta luego' : 'Bienvenido';

  // Apple easings
  const EASE_OUT_EXPO = [0.22, 1, 0.36, 1];
  const EASE_IN_OUT   = [0.65, 0, 0.35, 1];

  return (
    <AnimatePresence>
      {phase !== 'idle' && (
        <motion.div
          className="aperture-overlay"
          initial={{ clipPath: 'circle(0% at 50% 50%)' }}
          animate={{
            clipPath:
              phase === 'open'
                ? 'circle(0% at 50% 50%)'
                : 'circle(150% at 50% 50%)',
          }}
          exit={{ opacity: 0 }}
          transition={{
            clipPath: {
              duration: phase === 'open' ? 0.9 : 0.55,
              ease: phase === 'open' ? EASE_IN_OUT : EASE_OUT_EXPO,
            },
            opacity: { duration: 0.3 },
          }}
        >
          <AnimatePresence>
            {phase === 'reveal' && (
              <motion.div
                key="content"
                className="aperture-content"
                initial={{ opacity: 0, scale: 0.96, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.02, y: -4 }}
                transition={{
                  duration: 0.7,
                  ease: EASE_OUT_EXPO,
                }}
              >
                <motion.div
                  className="aperture-logo"
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{
                    duration: 1.4,
                    ease: 'easeInOut',
                  }}
                >
                  V
                </motion.div>
                <p className="aperture-greeting">{greeting}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

