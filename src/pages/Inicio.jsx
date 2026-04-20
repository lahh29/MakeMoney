import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconClipboardCheck,
  IconCircleCheck,
  IconAlertCircle,
  IconClockHour4,
  IconChevronRight,
} from '@tabler/icons-react';
import { Box } from '../components/ui/Box';
import { Skeleton } from '../components/ui/Skeleton';
import { getCompromisos } from '../lib/compromisos';
import { useAuth } from '../hooks/useAuth';
import { useHeaderActions } from '../hooks/useHeaderActions';

const ESTADO_CONFIG = {
  en_curso:   { label: 'En Curso',    color: 'var(--apple-blue)',    bg: 'var(--apple-blue-bg)',   Icon: IconClockHour4   },
  completado: { label: 'Completado',  color: 'var(--color-success)', bg: 'var(--color-success-bg)',   Icon: IconCircleCheck  },
  atrasado:   { label: 'Atrasado',    color: 'var(--color-danger)',  bg: 'var(--color-danger-bg)', Icon: IconAlertCircle  },
};

const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden:  { opacity: 0, y: 14, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1,   transition: { type: 'spring', stiffness: 360, damping: 28 } },
};

function StatCard({ label, value, color, bg, Icon, onClick }) {
  return (
    <motion.div
      variants={fadeUp}
      className="card"
      onClick={onClick}
      whileHover={onClick ? { scale: 1.03, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      transition={{ type: 'spring', stiffness: 360, damping: 28 }}
      style={{
        padding: '20px 24px',
        display: 'flex', alignItems: 'center', gap: '16px',
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: 'var(--radius-lg)',
        flex: '1 1 160px', minWidth: 0,
      }}
    >
      <div style={{
        width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
        background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={22} color={color} strokeWidth={1.8} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-text)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
          {label}
        </div>
        <div style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.1 }}>
          {value}
        </div>
      </div>
    </motion.div>
  );
}

function ProgressBar({ value, max }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const estado = pct >= 100 ? 'completado' : 'en_curso';
  const color = ESTADO_CONFIG[estado].color;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-text)' }}>
          {value} / {max}
        </span>
        <span style={{ fontSize: 'var(--fs-sm)', color, fontFamily: 'var(--font-text)', fontWeight: 600 }}>
          {pct}%
        </span>
      </div>
      <div style={{ height: '5px', background: 'var(--border-divider)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: 'var(--radius-pill)' }}
        />
      </div>
    </div>
  );
}

function EstadoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.en_curso;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '2px 10px', borderRadius: 'var(--radius-pill)',
      background: cfg.bg, color: cfg.color,
      fontSize: 'var(--fs-xs)', fontFamily: 'var(--font-text)', fontWeight: 600,
      flexShrink: 0,
    }}>
      <cfg.Icon size={11} strokeWidth={2.2} />
      {cfg.label}
    </span>
  );
}

function SkeletonStatCard() {
  return (
    <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 160px', minWidth: 0 }}>
      <Skeleton width="44px" height="44px" radius="var(--radius-md)" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Skeleton width="50px" height="10px" />
        <Skeleton width="36px" height="26px" />
      </div>
    </div>
  );
}

function SkeletonListCard() {
  return (
    <div className="card" style={{ padding: '16px 20px', borderRadius: 'var(--radius-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
        <Skeleton width="65%" height="15px" />
        <Skeleton width="68px" height="20px" radius="var(--radius-pill)" />
      </div>
      <Skeleton width="100%" height="5px" radius="var(--radius-pill)" style={{ marginBottom: '8px' }} />
      <div style={{ display: 'flex', gap: '12px' }}>
        <Skeleton width="60px" height="10px" />
        <Skeleton width="40px" height="10px" />
      </div>
    </div>
  );
}

export function Inicio() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const setHeaderActions = useHeaderActions();
  const [compromisos, setCompromisos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setHeaderActions(null); return () => setHeaderActions(null); }, [setHeaderActions]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCompromisos();
      setCompromisos(data ?? []);
    } catch (e) {
      console.error('[Dashboard] Error cargando compromisos:', e);
      setCompromisos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => ({
    total:      compromisos.length,
    en_curso:   compromisos.filter(c => c.estado === 'en_curso').length,
    completado: compromisos.filter(c => c.estado === 'completado').length,
    atrasado:   compromisos.filter(c => c.estado === 'atrasado').length,
  }), [compromisos]);

  const recientes = useMemo(
    () => compromisos.filter(c => c.estado === 'en_curso' || c.estado === 'atrasado').slice(0, 4),
    [compromisos]
  );

  return (
    <Box style={{ padding: '32px 24px', maxWidth: '900px' }}>
      {/* Saludo */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ marginBottom: '32px' }}
      >
        <h1 style={{ fontSize: 'var(--fs-lg)', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          {user?.user_metadata?.nombre ? `Hola, ${user.user_metadata.nombre}` : 'Dashboard'}
        </h1>
        <p style={{ fontSize: 'var(--fs-body)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-text)', margin: '4px 0 0' }}>
          Resumen de compromisos activos
        </p>
      </motion.div>

      {/* Stats */}
      {loading ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '40px' }}>
          {[0,1,2,3].map(i => <SkeletonStatCard key={i} />)}
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '40px' }}
        >
          <StatCard label="Total" value={stats.total} color="var(--text-tertiary)" bg="var(--bg-surface)" Icon={IconClipboardCheck} onClick={() => navigate('/compromisos')} />
          <StatCard label="En Curso" value={stats.en_curso} color={ESTADO_CONFIG.en_curso.color} bg={ESTADO_CONFIG.en_curso.bg} Icon={ESTADO_CONFIG.en_curso.Icon} onClick={() => navigate('/compromisos')} />
          <StatCard label="Completados" value={stats.completado} color={ESTADO_CONFIG.completado.color} bg={ESTADO_CONFIG.completado.bg} Icon={ESTADO_CONFIG.completado.Icon} onClick={() => navigate('/compromisos')} />
          <StatCard label="Atrasados" value={stats.atrasado} color={ESTADO_CONFIG.atrasado.color} bg={ESTADO_CONFIG.atrasado.bg} Icon={ESTADO_CONFIG.atrasado.Icon} onClick={() => navigate('/compromisos')} />
        </motion.div>
      )}

      {/* Compromisos activos */}
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 'var(--fs-nav)', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          Activos
        </h2>
        <button
          onClick={() => navigate('/compromisos')}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--apple-blue)', fontSize: 'var(--fs-body)', fontFamily: 'var(--font-text)',
            minHeight: 'unset', minWidth: 'unset',
          }}
        >
          Ver todos <IconChevronRight size={14} />
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[0,1,2].map(i => <SkeletonListCard key={i} />)}
        </div>
      ) : recientes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card"
          style={{ padding: '32px 24px', textAlign: 'center' }}
        >
          <IconClipboardCheck size={36} color="var(--text-tertiary)" style={{ marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-text)', fontSize: 'var(--fs-body)', margin: 0 }}>
            Sin compromisos activos.{' '}
            <button onClick={() => navigate('/compromisos')} style={{ background: 'none', border: 'none', color: 'var(--apple-blue)', cursor: 'pointer', fontFamily: 'var(--font-text)', fontSize: 'var(--fs-body)', padding: 0, minHeight: 'unset', minWidth: 'unset' }}>Crear uno</button>
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
          >
            {recientes.map(c => (
              <motion.div
                key={c.id}
                variants={fadeUp}
                className="card"
                onClick={() => navigate(`/compromisos/${c.id}`)}
                whileHover={{ scale: 1.01, x: 3 }}
                whileTap={{ scale: 0.99 }}
                style={{ padding: '16px 20px', cursor: 'pointer', borderRadius: 'var(--radius-lg)' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                  <p style={{ fontSize: 'var(--fs-body)', fontFamily: 'var(--font-text)', fontWeight: 500, color: 'var(--text-primary)', margin: 0, flex: 1 }}>
                    {c.descripcion}
                  </p>
                  <EstadoBadge estado={c.estado} />
                </div>
                <ProgressBar value={c.completados} max={c.meta_total} />
                <div style={{ marginTop: '8px', display: 'flex', gap: '16px' }}>
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-text)', textTransform: 'capitalize' }}>
                    {c.frecuencia}
                  </span>
                  {c.empleado_nombre && (
                    <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-text)' }}>
                      {c.empleado_nombre}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </Box>
  );
}
