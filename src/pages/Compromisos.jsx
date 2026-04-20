import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconPlus, IconClipboardCheck, IconClockHour4,
  IconCircleCheck, IconAlertCircle, IconSearch,
  IconUser, IconLoader2,
} from '@tabler/icons-react';
import { Box } from '../components/ui/Box';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { useNotification } from '../components/ui/Notification';
import { getCompromisos, createCompromiso } from '../lib/compromisos';
import { getEmpleado, getGrupos } from '../lib/empleados';
import { useHeaderActions } from '../hooks/useHeaderActions';

// ─── Constants ───────────────────────────────────────────────────────────────

const ESTADO_CONFIG = {
  en_curso:   { label: 'En Curso',   color: 'var(--apple-blue)',    bg: 'var(--apple-blue-bg)',   Icon: IconClockHour4   },
  completado: { label: 'Completado', color: 'var(--color-success)', bg: 'var(--color-success-bg)',   Icon: IconCircleCheck  },
  atrasado:   { label: 'Atrasado',   color: 'var(--color-danger)',  bg: 'var(--color-danger-bg)', Icon: IconAlertCircle  },
};

const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 14, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1,   transition: { type: 'spring', stiffness: 360, damping: 28 } },
  exit:    { opacity: 0, scale: 0.94, transition: { duration: 0.15 } },
};

const FRECUENCIAS = [
  { value: 'diaria',   label: 'Diaria'   },
  { value: 'semanal',  label: 'Semanal'  },
  { value: 'mensual',  label: 'Mensual'  },
];

const FILTERS = [
  { value: 'todos',      label: 'Todos'      },
  { value: 'en_curso',   label: 'En Curso'   },
  { value: 'completado', label: 'Completados' },
  { value: 'atrasado',   label: 'Atrasados'  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function EstadoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.en_curso;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '3px 10px', borderRadius: 'var(--radius-pill)',
      background: cfg.bg, color: cfg.color,
      fontSize: 'var(--fs-xs)', fontFamily: 'var(--font-text)', fontWeight: 600,
      flexShrink: 0,
    }}>
      <cfg.Icon size={11} strokeWidth={2.2} />
      {cfg.label}
    </span>
  );
}

function ProgressBar({ value, max, estado }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const color = ESTADO_CONFIG[estado]?.color ?? 'var(--apple-blue)';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-text)' }}>
          {value} / {max} cumplimientos
        </span>
        <span style={{ fontSize: 'var(--fs-xs)', color, fontFamily: 'var(--font-text)', fontWeight: 600 }}>
          {pct}%
        </span>
      </div>
      <div style={{ height: '4px', background: 'var(--border-divider)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: 'var(--radius-pill)' }}
        />
      </div>
    </div>
  );
}

function CompromisoCard({ compromiso, onClick }) {
  const { descripcion, frecuencia, duracion_dias, completados, meta_total, estado, fecha_fin, revisor_nombre, empleado_nombre, empleado_grupo, numero_empleado } = compromiso;
  return (
    <motion.div
      className="card"
      onClick={onClick}
      whileHover={{ scale: 1.015, y: -1 }}
      whileTap={{ scale: 0.98 }}
      style={{
        padding: '20px', cursor: 'pointer',
        borderRadius: 'var(--radius-lg)',
        display: 'flex', flexDirection: 'column', gap: '14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
        <p style={{
          fontSize: 'var(--fs-body)', fontFamily: 'var(--font-text)', fontWeight: 500,
          color: 'var(--text-primary)', margin: 0, lineHeight: 1.4, flex: 1,
        }}>
          {descripcion}
        </p>
        <EstadoBadge estado={estado} />
      </div>

      {/* Empleado */}
      {empleado_nombre && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <IconUser size={13} color="var(--text-tertiary)" strokeWidth={1.8} />
          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', fontFamily: 'var(--font-text)', fontWeight: 500 }}>
            {empleado_nombre}
          </span>
          {numero_empleado && (
            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-text)' }}>
              #{numero_empleado}
            </span>
          )}
          {empleado_grupo && (
            <span style={{
              marginLeft: '4px', padding: '1px 8px', borderRadius: 'var(--radius-pill)',
              background: 'var(--apple-blue-bg)', color: 'var(--apple-blue)',
              fontSize: 'var(--fs-xs)', fontFamily: 'var(--font-text)', fontWeight: 600,
            }}>
              Gr. {empleado_grupo}
            </span>
          )}
        </div>
      )}

      <ProgressBar value={completados} max={meta_total} estado={estado} />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-text)', textTransform: 'capitalize' }}>
          {frecuencia} · {duracion_dias} días
        </span>
        {fecha_fin && (
          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-text)' }}>
            Fin: {new Date(fecha_fin + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
          </span>
        )}
        {revisor_nombre && (
          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-text)' }}>
            Revisor: {revisor_nombre}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─── Create Modal Form ────────────────────────────────────────────────────────

const EMPTY_FORM = {
  numero_empleado: '',
  empleado_nombre: '',
  empleado_puesto: '',
  empleado_departamento: '',
  empleado_turno: '',
  empleado_grupo: '',
  descripcion: '',
  duracion_dias: '30',
  frecuencia: 'diaria',
  meta_total: '30',
  revisor_nombre: '',
  fecha_inicio: new Date().toISOString().split('T')[0],
};

function EmpleadoInfoCard({ empleado }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '8px 12px', borderRadius: 'var(--radius-pill)',
      background: 'var(--apple-blue-bg)',
      border: '1px solid var(--apple-blue-border)',
      alignSelf: 'flex-start',
    }}>
      <IconCircleCheck size={14} color="var(--apple-blue)" strokeWidth={2.2} />
      <span style={{
        fontSize: 'var(--fs-sm)', fontFamily: 'var(--font-text)',
        fontWeight: 500, color: 'var(--apple-blue)',
      }}>
        {empleado.nombre}
      </span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', borderRadius: 'var(--radius-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
        <Skeleton width="65%" height="16px" />
        <Skeleton width="70px" height="22px" radius="var(--radius-pill)" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Skeleton width="14px" height="14px" radius="50%" />
        <Skeleton width="130px" height="11px" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Skeleton width="110px" height="10px" />
          <Skeleton width="28px" height="10px" />
        </div>
        <Skeleton width="100%" height="4px" radius="var(--radius-pill)" />
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <Skeleton width="80px" height="10px" />
        <Skeleton width="55px" height="10px" />
      </div>
    </div>
  );
}

function NuevoCompromisoModal({ isOpen, onClose, onCreated }) {
  const notify = useNotification();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [lookupState, setLookupState] = useState('idle'); // idle | loading | found | notfound
  const lookupTimer = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setForm(EMPTY_FORM);
      setLookupState('idle');
    }
  }, [isOpen]);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: typeof e === 'string' ? e : e.target.value }));

  const handleNumeroChange = (e) => {
    const val = e.target.value;
    setForm(prev => ({
      ...prev,
      numero_empleado: val,
      // Clear auto-filled on change
      empleado_nombre: '',
      empleado_puesto: '',
      empleado_departamento: '',
      empleado_turno: '',
      empleado_grupo: '',
    }));
    setLookupState('idle');
    clearTimeout(lookupTimer.current);
    if (val.trim().length >= 2) {
      lookupTimer.current = setTimeout(async () => {
        setLookupState('loading');
        try {
          const emp = await getEmpleado(val.trim());
          if (emp) {
            setForm(prev => ({
              ...prev,
              empleado_nombre:       emp.nombre,
              empleado_puesto:       emp.puesto,
              empleado_departamento: emp.departamento,
              empleado_turno:        emp.turno,
              empleado_grupo:        emp.grupo,
            }));
            setLookupState('found');
          } else {
            setLookupState('notfound');
          }
        } catch (err) {
          setLookupState('idle');
        }
      }, 500);
    }
  };

  const handleAccept = async () => {
    if (!form.numero_empleado.trim()) {
      notify.error('Ingresa el número de empleado.');
      return;
    }
    if (lookupState !== 'found') {
      notify.error('Empleado no encontrado. Verifica el número.');
      return;
    }
    if (!form.descripcion.trim()) {
      notify.error('El compromiso no puede estar vacío.');
      return;
    }
    if (Number(form.meta_total) < 1) {
      notify.error('La meta debe ser mayor a 0.');
      return;
    }
    setSaving(true);
    try {
      const nuevo = await createCompromiso(form);
      notify.success('Compromiso creado.');
      onCreated(nuevo);
      onClose();
    } catch (e) {
      notify.error(e.message ?? 'Error al crear compromiso.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onAccept={handleAccept}
      title="Nuevo Compromiso"
      acceptLabel={saving ? 'Guardando…' : 'Crear'}
      cancelLabel="Cancelar"
    >
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>

        {/* Número empleado */}
        <div className="form-group">
          <label className="form-label">Número de empleado</label>
          <div style={{ position: 'relative' }}>
            <input
              className="form-input"
              placeholder="Ej: 00123"
              value={form.numero_empleado}
              onChange={handleNumeroChange}
              autoFocus
              style={{ paddingRight: '36px' }}
            />
            {lookupState === 'loading' && (
              <IconLoader2
                size={16}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-tertiary)', animation: 'spin 0.8s linear infinite',
                }}
              />
            )}
            {lookupState === 'found' && (
              <IconCircleCheck size={16} color="var(--color-success)"
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
            )}
            {lookupState === 'notfound' && (
              <IconAlertCircle size={16} color="var(--color-danger)"
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
            )}
          </div>
          {lookupState === 'notfound' && (
            <p style={{ margin: '4px 0 0', fontSize: 'var(--fs-xs)', color: 'var(--color-danger)', fontFamily: 'var(--font-text)' }}>
              Empleado no encontrado
            </p>
          )}
        </div>

        {/* Datos auto-rellenos */}
        {lookupState === 'found' && (
          <EmpleadoInfoCard empleado={{
            nombre: form.empleado_nombre,
            puesto: form.empleado_puesto,
            departamento: form.empleado_departamento,
            turno: form.empleado_turno,
            grupo: form.empleado_grupo,
          }} />
        )}

        {/* Descripción */}
        <div className="form-group">
          <label className="form-label">Compromiso</label>
          <textarea
            className="form-input"
            rows={3}
            placeholder='Ej: "Realizar ronda de 5 minutos diarios con mi equipo"'
            value={form.descripcion}
            onChange={set('descripcion')}
            style={{ resize: 'vertical', minHeight: '72px', fontFamily: 'var(--font-text)', fontSize: 'var(--fs-body)' }}
          />
        </div>

        {/* Fechas lado a lado */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Input
            label="Inicio"
            id="fecha_inicio"
            type="date"
            value={form.fecha_inicio}
            onChange={set('fecha_inicio')}
          />
          <Input
            label="Duración (días)"
            id="duracion_dias"
            type="number"
            min="1"
            max="365"
            value={form.duracion_dias}
            onChange={set('duracion_dias')}
          />
        </div>

        {/* Frecuencia + Meta lado a lado */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Select
            label="Frecuencia"
            id="frecuencia"
            options={FRECUENCIAS}
            value={form.frecuencia}
            onChange={set('frecuencia')}
          />
          <Input
            label="Meta total"
            id="meta_total"
            type="number"
            min="1"
            max="1000"
            value={form.meta_total}
            onChange={set('meta_total')}
          />
        </div>
      </div>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function Compromisos() {
  const navigate = useNavigate();
  const setHeaderActions = useHeaderActions();
  const [compromisos, setCompromisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos');
  const [search, setSearch] = useState('');
  const [grupoFilter, setGrupoFilter] = useState('todos');
  const [grupos, setGrupos] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCompromisos();
      setCompromisos(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    getGrupos().then(g => setGrupos(g)).catch(() => {});
  }, []);

  useEffect(() => {
    setHeaderActions(
      <motion.button
        onClick={() => setShowModal(true)}
        title="Nuevo compromiso"
        aria-label="Nuevo compromiso"
        whileHover={{ scale: 1.1, boxShadow: '0 4px 14px var(--apple-blue-glow)' }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 420, damping: 22 }}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'var(--apple-blue)', color: 'var(--text-on-accent)',
          border: 'none', cursor: 'pointer',
          minHeight: 'unset', minWidth: 'unset',
        }}
      >
        <IconPlus size={16} strokeWidth={2.5} />
      </motion.button>
    );
    return () => setHeaderActions(null);
  }, [setHeaderActions]);

  const visible = useMemo(() => compromisos.filter(c => {
    const matchFilter = filter === 'todos' || c.estado === filter;
    const matchSearch = !search
      || c.descripcion.toLowerCase().includes(search.toLowerCase())
      || (c.empleado_nombre ?? '').toLowerCase().includes(search.toLowerCase())
      || (c.numero_empleado ?? '').includes(search);
    const matchGrupo = grupoFilter === 'todos' || c.empleado_grupo === grupoFilter;
    return matchFilter && matchSearch && matchGrupo;
  }), [compromisos, filter, search, grupoFilter]);

  return (
    <Box style={{ padding: '24px', maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: 'var(--fs-lg)', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>
          Compromisos
        </h1>
        <p style={{ fontSize: 'var(--fs-body)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-text)', margin: 0 }}>
          {compromisos.length} compromiso{compromisos.length !== 1 ? 's' : ''} registrado{compromisos.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Search + Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <IconSearch size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
          <input
            className="form-input"
            placeholder="Buscar por compromiso, nombre o núm. empleado…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '34px', fontSize: 'var(--fs-body)', width: '100%', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                padding: '5px 14px', borderRadius: 'var(--radius-pill)',
                border: '1.5px solid',
                borderColor: filter === f.value ? 'var(--apple-blue)' : 'var(--border-divider)',
                background: filter === f.value ? 'var(--apple-blue-bg)' : 'var(--bg-input)',
                color: filter === f.value ? 'var(--apple-blue)' : 'var(--text-secondary)',
                fontSize: 'var(--fs-sm)', fontFamily: 'var(--font-text)', fontWeight: filter === f.value ? 600 : 400,
                cursor: 'pointer', transition: 'all 0.15s ease',
                minHeight: 'unset', minWidth: 'unset', whiteSpace: 'nowrap',
              }}
            >
              {f.label}
            </button>
          ))}
          {grupos.length > 0 && (
            <Select
              value={grupoFilter}
              onChange={e => setGrupoFilter(e.target.value)}
              style={{ marginLeft: 'auto', fontSize: 'var(--fs-sm)', padding: '5px 10px', minWidth: '110px' }}
            >
              <option value="todos">Grupo: Todos</option>
              {grupos.map(g => (
                <option key={g} value={g}>Grupo {g}</option>
              ))}
            </Select>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
          {[0,1,2,3,4,5].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <IconClipboardCheck size={40} color="var(--text-tertiary)" style={{ marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-text)', fontSize: 'var(--fs-body)', margin: 0 }}>
            {search || filter !== 'todos' || grupoFilter !== 'todos' ? 'Sin resultados para este filtro.' : 'Aún no hay compromisos. Crea el primero.'}
          </p>
          {!search && filter === 'todos' && grupoFilter === 'todos' && (
            <Button variant="primary" onClick={() => setShowModal(true)} style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <IconPlus size={16} /> Nuevo compromiso
            </Button>
          )}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`${filter}-${grupoFilter}-${search}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}
          >
            {visible.map(c => (
              <motion.div key={c.id} variants={cardVariants} exit={cardVariants.exit}>
                <CompromisoCard
                  compromiso={c}
                  onClick={() => navigate(`/compromisos/${c.id}`)}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      <NuevoCompromisoModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreated={nuevo => setCompromisos(prev => [nuevo, ...prev])}
      />

      {/* FAB — siempre visible al terminar carga */}
      <AnimatePresence>
        {!loading && (
          <motion.button
            onClick={() => setShowModal(true)}
            title="Nuevo compromiso"
            aria-label="Nuevo compromiso"
            initial={{ opacity: 0, scale: 0.4, y: 16 }}
            animate={{ opacity: 1, scale: 1,   y: 0  }}
            exit={{    opacity: 0, scale: 0.4,  y: 16 }}
            whileHover={{ scale: 1.12, boxShadow: '0 6px 22px var(--apple-blue-glow-hover)' }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            style={{
              position: 'fixed', bottom: '28px', right: '28px',
              width: '52px', height: '52px', borderRadius: '50%',
              background: 'var(--apple-blue)', color: 'var(--text-on-accent)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px var(--apple-blue-glow)',
              zIndex: 300,
            }}
          >
            <motion.div
              animate={{ rotate: showModal ? 45 : 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            >
              <IconPlus size={22} />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
    </Box>
  );
}
