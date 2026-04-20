import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconSend } from '@tabler/icons-react';

/**
 * Plane Transition (Login / Logout).
 * Airplane flies across screen leaving a dot trail, then a circle wipes
 * the viewport using --apple-blue to cover/reveal the app.
 */
export function PlaneTransition({ isActive, onComplete }) {
  const [phase, setPhase] = useState('idle');

  const stableOnComplete = useCallback(() => {
    if (onComplete) onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (!isActive) {
      setPhase('idle');
      return;
    }

    setPhase('flying');

    const coverTimer = setTimeout(() => setPhase('covered'), 1000);
    const doneTimer = setTimeout(() => {
      setPhase('idle');
      stableOnComplete();
    }, 2200);

    return () => {
      clearTimeout(coverTimer);
      clearTimeout(doneTimer);
    };
  }, [isActive, stableOnComplete]);

  return (
    <AnimatePresence>
      {phase !== 'idle' && (
        <motion.div
          className="plane-transition-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Trail dots */}
          <div className="plane-trail">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="plane-trail-dot"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 0.5, 0],
                  scale: [0, 1, 0.2],
                }}
                transition={{
                  duration: 1,
                  delay: 0.06 * i + 0.3,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>

          {/* Airplane */}
          <motion.div
            className="plane-icon"
            initial={{ x: -300, y: 200, rotate: -20, scale: 0.5, opacity: 0 }}
            animate={{
              x: [null, 0, 300],
              y: [null, -20, -250],
              rotate: [null, -10, -18],
              scale: [null, 1.3, 0.4],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.6,
              ease: [0.25, 0.1, 0.25, 1],
              times: [0, 0.45, 1],
            }}
          >
            <IconSend size={56} strokeWidth={1.5} />
          </motion.div>

          {/* Circle wipe */}
          <motion.div
            className="plane-circle-wipe"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: phase === 'covered' ? 40 : 0,
              opacity: phase === 'covered' ? 1 : 0,
            }}
            exit={{ opacity: 0 }}
            transition={{
              scale: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: 0.3 },
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
