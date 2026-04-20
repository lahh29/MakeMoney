import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconArrowLeft, IconClockHour4, IconCircleCheck, IconAlertCircle,
  IconPlus, IconNote, IconCamera, IconTrash,
} from '@tabler/icons-react';
import { Box } from '../components/ui/Box';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useNotification } from '../components/ui/Notification';
import {
  getCompromiso, getRegistros, addRegistro,
  getEvidencias, addEvidencia, deleteCompromiso,
} from '../lib/compromisos';
import { useAuth } from '../hooks/useAuth';import { useHeaderActions } from '../hooks/useHeaderActions';
// ─── Constants ───────────────────────────────────────────────────────────────

const ESTADO_CONFIG = {
  en_curso:   { label: 'En Curso',   color: 'var(--apple-blue)',    bg: 'var(--apple-blue-bg)',   Icon: IconClockHour4  },
  completado: { label: 'Completado', color: 'var(--color-success)', bg: 'var(--color-success-bg)',   Icon: IconCircleCheck },
  atrasado:   { label: 'Atrasado',   color: 'var(--color-danger)',  bg: 'var(--color-danger-bg)', Icon: IconAlertCircle },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function EstadoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.en_curso;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '4px 12px', borderRadius: 'var(--radius-pill)',
      background: cfg.bg, color: cfg.color,
      fontSize: 'var(--fs-body)', fontFamily: 'var(--font-text)', fontWeight: 600,
    }}>
      <cfg.Icon size={13} strokeWidth={2.2} />
      {cfg.label}
    </span>
  );
}

function BigProgress({ value, max, estado }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const color = ESTADO_CONFIG[estado]?.color ?? 'var(--apple-blue)';
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
      {/* Circular SVG */}
      <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--border-divider)" strokeWidth="8" />
          <motion.circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ transformOrigin: '50% 50%', transform: 'rotate(-90deg)' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column',
        }}>
          <span style={{ fontSize: '22px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{pct}%</span>
        </div>
      </div>

      {/* Stats text */}
      <div>
        <div style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>
          {value} <span style={{ fontSize: 'var(--fs-body)', color: 'var(--text-tertiary)', fontWeight: 400 }}>/ {max}</span>
        </div>
        <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-text)', marginTop: '4px' }}>
          cumplimientos registrados
        </div>
      </div>
    </div>
  );
}

function RegistroItem({ registro }) {
  const date = new Date(registro.fecha + 'T00:00:00');
  const formatted = date.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex', gap: '12px', alignItems: 'flex-start',
        padding: '12px 0',
        borderBottom: '1px solid var(--border-divider)',
      }}
    >
      <div style={{
        width: '28px', height: '28px', borderRadius: 'var(--radius-circle)',
        background: 'var(--color-success-bg-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginTop: '1px',
      }}>
        <IconCircleCheck size={16} color="var(--color-success)" strokeWidth={2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-text)', textTransform: 'capitalize' }}>
          {formatted}
        </div>
        {registro.nota && (
          <p style={{ fontSize: 'var(--fs-body)', color: 'var(--text-primary)', fontFamily: 'var(--font-text)', margin: '4px 0 0', lineHeight: 1.4 }}>
            {registro.nota}
          </p>
        )}
      </div>
    </motion.div>
  );
}

function EvidenciaItem({ ev }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card"
      style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}
    >
      <div style={{
        width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
        background: 'var(--apple-blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {ev.tipo === 'foto'
          ? <IconCamera size={16} color="var(--apple-blue)" />
          : <IconNote size={16} color="var(--apple-blue)" />
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-text)', textTransform: 'capitalize', marginBottom: '2px' }}>{ev.tipo}</div>
        {ev.contenido && <p style={{ fontSize: 'var(--fs-body)', color: 'var(--text-primary)', fontFamily: 'var(--font-text)', margin: 0, lineHeight: 1.4 }}>{ev.contenido}</p>}
        {ev.url && <a href={ev.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 'var(--fs-sm)', color: 'var(--apple-blue)', fontFamily: 'var(--font-text)' }}>Ver archivo</a>}
      </div>
    </motion.div>
  );
}

// ─── Add Registro Modal ───────────────────────────────────────────────────────

function AddRegistroModal({ isOpen, onClose, onAdded, compromisoId }) {
  const notify = useNotification();
  const [nota, setNota] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) { setNota(''); setFecha(new Date().toISOString().split('T')[0]); }
  }, [isOpen]);

  const handleAccept = async () => {
    setSaving(true);
    try {
      const reg = await addRegistro({ compromiso_id: compromisoId, nota, fecha });
      notify.success('Cumplimiento registrado.');
      onAdded(reg);
      onClose();
    } catch (e) {
      notify.error(e.message ?? 'Error al registrar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onAccept={handleAccept}
      title="Registrar cumplimiento"
      acceptLabel={saving ? 'Guardando…' : 'Registrar'}
      cancelLabel="Cancelar"
    >
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="form-group">
          <label className="form-label">Fecha</label>
          <input className="form-input" type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Nota / Evidencia (opcional)</label>
          <textarea
            className="form-input"
            rows={3}
            placeholder="Descripción de lo realizado, observaciones…"
            value={nota}
            onChange={e => setNota(e.target.value)}
            style={{ resize: 'vertical', minHeight: '72px', fontFamily: 'var(--font-text)', fontSize: 'var(--fs-body)' }}
          />
        </div>
      </div>
    </Modal>
  );
}

// ─── Add Evidencia Modal ─────────────────────────────────────────────────────

function AddEvidenciaModal({ isOpen, onClose, onAdded, compromisoId }) {
  const notify = useNotification();
  const [tipo, setTipo] = useState('nota');
  const [contenido, setContenido] = useState('');
  const [url, setUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) { setTipo('nota'); setContenido(''); setUrl(''); }
  }, [isOpen]);

  const handleAccept = async () => {
    if (!contenido.trim() && !url.trim()) {
      notify.error('Agrega un texto o URL.');
      return;
    }
    setSaving(true);
    try {
      const ev = await addEvidencia({ compromiso_id: compromisoId, tipo, contenido, url });
      notify.success('Evidencia agregada.');
      onAdded(ev);
      onClose();
    } catch (e) {
      notify.error(e.message ?? 'Error al agregar evidencia.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onAccept={handleAccept}
      title="Agregar evidencia"
      acceptLabel={saving ? 'Guardando…' : 'Agregar'}
      cancelLabel="Cancelar"
    >
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['nota', 'foto'].map(t => (
            <button
              key={t}
              onClick={() => setTipo(t)}
              style={{
                padding: '6px 16px', borderRadius: 'var(--radius-pill)',
                border: '1.5px solid',
                borderColor: tipo === t ? 'var(--apple-blue)' : 'var(--border-divider)',
                background: tipo === t ? 'var(--apple-blue-bg)' : 'var(--bg-input)',
                color: tipo === t ? 'var(--apple-blue)' : 'var(--text-secondary)',
                fontSize: 'var(--fs-sm)', fontFamily: 'var(--font-text)', fontWeight: tipo === t ? 600 : 400,
                cursor: 'pointer', textTransform: 'capitalize',
                minHeight: 'unset', minWidth: 'unset',
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="form-group">
          <label className="form-label">{tipo === 'nota' ? 'Descripción' : 'Descripción de la foto'}</label>
          <textarea
            className="form-input"
            rows={3}
            placeholder="Descripción…"
            value={contenido}
            onChange={e => setContenido(e.target.value)}
            style={{ resize: 'vertical', minHeight: '64px', fontFamily: 'var(--font-text)', fontSize: 'var(--fs-body)' }}
          />
        </div>
        {tipo === 'foto' && (
          <div className="form-group">
            <label className="form-label">URL de la imagen (opcional)</label>
            <input
              className="form-input"
              type="url"
              placeholder="https://…"
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({ isOpen, onClose, onConfirm, saving }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onAccept={onConfirm}
      title="Eliminar compromiso"
      acceptLabel={saving ? 'Eliminando…' : 'Eliminar'}
      cancelLabel="Cancelar"
    >
      <div style={{ padding: '20px' }}>
        <p style={{ fontSize: 'var(--fs-body)', color: 'var(--text-primary)', fontFamily: 'var(--font-text)', margin: 0 }}>
          Esta acción eliminará el compromiso y todos sus registros. No se puede deshacer.
        </p>
      </div>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function DetalleCompromiso({ setHeaderActions }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const notify = useNotification();

  const [compromiso, setCompromiso] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [evidencias, setEvidencias] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showRegistroModal, setShowRegistroModal] = useState(false);
  const [showEvidenciaModal, setShowEvidenciaModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [comp, regs, evs] = await Promise.all([
        getCompromiso(id),
        getRegistros(id),
        getEvidencias(id),
      ]);
      setCompromiso(comp);
      setRegistros(regs);
      setEvidencias(evs);
    } catch (e) {
      console.error(e);
      notify.error('No se pudo cargar el compromiso.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    setHeaderActions(null);
    return () => setHeaderActions(null);
  }, [setHeaderActions]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCompromiso(id);
      notify.success('Compromiso eliminado.');
      navigate('/compromisos');
    } catch (e) {
      notify.error(e.message ?? 'Error al eliminar.');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const isOwner = compromiso?.responsable_id === user?.id;

  if (loading) return (
    <Box style={{ padding: '32px 24px' }}>
      <p style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-text)', fontSize: 'var(--fs-body)' }}>Cargando…</p>
    </Box>
  );

  if (!compromiso) return (
    <Box style={{ padding: '32px 24px' }}>
      <p style={{ color: 'var(--color-danger)', fontFamily: 'var(--font-text)', fontSize: 'var(--fs-body)' }}>Compromiso no encontrado.</p>
      <Button variant="secondary" onClick={() => navigate('/compromisos')} style={{ marginTop: '12px' }}>Volver</Button>
    </Box>
  );

  const fechaFin = compromiso.fecha_fin ? new Date(compromiso.fecha_fin + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : null;
  const fechaInicio = new Date(compromiso.fecha_inicio + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Box style={{ padding: '24px', maxWidth: '760px' }}>
      {/* Back */}
      <button
        onClick={() => navigate('/compromisos')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--apple-blue)', fontFamily: 'var(--font-text)', fontSize: 'var(--fs-body)',
          padding: '0 0 20px', marginLeft: '-2px',
        }}
      >
        <IconArrowLeft size={16} /> Compromisos
      </button>

      {/* Header card */}
      <div className="card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <EstadoBadge estado={compromiso.estado} />
          {isOwner && (
            <button
              onClick={() => setShowDeleteModal(true)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '4px',
                fontFamily: 'var(--font-text)', fontSize: 'var(--fs-sm)', padding: 0,
              }}
            >
              <IconTrash size={14} /> Eliminar
            </button>
          )}
        </div>

        <h1 style={{ fontSize: 'var(--fs-lg)', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px', lineHeight: 1.3 }}>
          {compromiso.descripcion}
        </h1>

        {/* Meta info */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-text)', marginBottom: '2px' }}>Frecuencia</div>
            <div style={{ fontSize: 'var(--fs-body)', color: 'var(--text-primary)', fontFamily: 'var(--font-text)', textTransform: 'capitalize', fontWeight: 500 }}>{compromiso.frecuencia}</div>
          </div>
          <div>
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-text)', marginBottom: '2px' }}>Inicio</div>
            <div style={{ fontSize: 'var(--fs-body)', color: 'var(--text-primary)', fontFamily: 'var(--font-text)', fontWeight: 500 }}>{fechaInicio}</div>
          </div>
          {fechaFin && (
            <div>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-text)', marginBottom: '2px' }}>Fin</div>
              <div style={{ fontSize: 'var(--fs-body)', color: 'var(--text-primary)', fontFamily: 'var(--font-text)', fontWeight: 500 }}>{fechaFin}</div>
            </div>
          )}
          {compromiso.revisor_nombre && (
            <div>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-text)', marginBottom: '2px' }}>Revisor</div>
              <div style={{ fontSize: 'var(--fs-body)', color: 'var(--text-primary)', fontFamily: 'var(--font-text)', fontWeight: 500 }}>{compromiso.revisor_nombre}</div>
            </div>
          )}
        </div>

        {/* Progress */}
        <BigProgress value={compromiso.completados} max={compromiso.meta_total} estado={compromiso.estado} />
      </div>

      {/* Actions */}
      {isOwner && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            onClick={() => setShowRegistroModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: 'var(--fs-body)' }}
          >
            <IconPlus size={16} /> Registrar cumplimiento
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowEvidenciaModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: 'var(--fs-body)' }}
          >
            <IconNote size={16} /> Agregar evidencia
          </Button>
        </div>
      )}

      {/* Registros */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: 'var(--fs-nav)', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 12px' }}>
          Historial de registros
        </h2>
        {registros.length === 0 ? (
          <p style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-text)', fontSize: 'var(--fs-body)' }}>
            Sin registros aún. Empieza registrando el primer cumplimiento.
          </p>
        ) : (
          <div>
            <AnimatePresence initial={false}>
              {registros.map(r => <RegistroItem key={r.id} registro={r} />)}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Evidencias */}
      <section>
        <h2 style={{ fontSize: 'var(--fs-nav)', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 12px' }}>
          Evidencias
        </h2>
        {evidencias.length === 0 ? (
          <p style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-text)', fontSize: 'var(--fs-body)' }}>
            Sin evidencias. Agrega fotos o notas de conversaciones.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <AnimatePresence initial={false}>
              {evidencias.map(ev => <EvidenciaItem key={ev.id} ev={ev} />)}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Modals */}
      <AddRegistroModal
        isOpen={showRegistroModal}
        onClose={() => setShowRegistroModal(false)}
        compromisoId={id}
        onAdded={(reg) => {
          setRegistros(prev => [reg, ...prev]);
          setCompromiso(prev => ({
            ...prev,
            completados: prev.completados + 1,
          }));
        }}
      />
      <AddEvidenciaModal
        isOpen={showEvidenciaModal}
        onClose={() => setShowEvidenciaModal(false)}
        compromisoId={id}
        onAdded={(ev) => setEvidencias(prev => [ev, ...prev])}
      />
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        saving={deleting}
      />
    </Box>
  );
}
