import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconUser, IconPalette, IconShield,
  IconChevronRight, IconSun, IconMoon, IconLock, IconLogout,
  IconEye, IconEyeOff, IconBolt, IconRefresh, IconCamera,
  IconUsers, IconUserPlus, IconCheck,
  IconSearch, IconPencil,
} from '@tabler/icons-react';
import { createEmpleado, searchEmpleados, updateEmpleadoTurnoGrupo } from '../lib/empleados';
import { TURNOS, GRUPOS } from '../lib/catalogo';
import { useHeaderActions } from '../hooks/useHeaderActions';
import { Box } from '../components/ui/Box';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../components/ui/Notification';
import {
  useAppearance,
  ACCENTS, FONT_FAMILIES, FONT_SIZES,
  RADIUS_PRESETS, DENSITIES, BACKGROUNDS,
} from '../hooks/useAppearance';

const SECTIONS = [
  { id: 'perfil',     label: 'Perfil',      icon: IconUser          },
  { id: 'apariencia', label: 'Apariencia',  icon: IconPalette       },
  { id: 'empleados',  label: 'Empleados',   icon: IconUsers          },
  { id: 'seguridad',  label: 'Seguridad',   icon: IconShield         },
];

// ─── Appearance sub-components ────────────────────────────────────────────────
function ColorSwatch({ color, name, active, onClick }) {
  return (
    <button
      title={name}
      onClick={onClick}
      style={{
        width: '28px', height: '28px', borderRadius: '50%',
        background: color, cursor: 'pointer',
        outline: active ? `3px solid ${color}` : '3px solid transparent',
        outlineOffset: '2px', border: '2px solid var(--bg-card)',
        transition: 'transform 0.12s ease, outline 0.12s ease',
        transform: active ? 'scale(1.2)' : 'scale(1)',
        minHeight: 'unset', minWidth: 'unset', padding: 0, flexShrink: 0,
      }}
    />
  );
}

function PillSelector({ options, activeIdx, onSelect }) {
  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      {options.map((opt, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          style={{
            padding: '5px 14px', borderRadius: 'var(--radius-pill)',
            border: '1.5px solid',
            borderColor: activeIdx === i ? 'var(--apple-blue)' : 'var(--border-divider)',
            background: activeIdx === i ? 'var(--bg-surface)' : 'var(--bg-input)',
            color: activeIdx === i ? 'var(--apple-blue)' : 'var(--text-secondary)',
            fontSize: 'var(--fs-md)', fontFamily: 'var(--font-text)',
            fontWeight: activeIdx === i ? 600 : 400,
            cursor: 'pointer', transition: 'all 0.15s ease',
            minHeight: 'unset', minWidth: 'unset', whiteSpace: 'nowrap',
          }}
        >
          {typeof opt === 'string' ? opt : opt.name}
        </button>
      ))}
    </div>
  );
}

function BgCard({ bg, active, onClick }) {
  return (
    <button
      onClick={onClick}
      title={bg.name}
      style={{
        border: '2px solid',
        borderColor: active ? 'var(--apple-blue)' : 'var(--border-divider)',
        borderRadius: 'var(--radius-md)', padding: '8px',
        background: 'var(--bg-input)', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
        transition: 'border-color 0.15s ease',
        minHeight: 'unset', minWidth: 'unset',
      }}
    >
      <div style={{
        width: '52px', height: '34px', borderRadius: '4px',
        background: 'var(--bg-page)',
        border: '1px solid var(--border-divider)', overflow: 'hidden',
        ...bg.preview,
      }} />
      <span style={{
        fontSize: 'var(--fs-xs)',
        color: active ? 'var(--apple-blue)' : 'var(--text-tertiary)',
        fontWeight: active ? 600 : 400, whiteSpace: 'nowrap',
      }}>
        {bg.name}
      </span>
    </button>
  );
}

// Toggle Switch Component
function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      style={{
        width: '44px', height: '26px',
        borderRadius: '13px',
        background: checked ? 'var(--apple-blue)' : 'var(--toggle-off)',
        position: 'relative', cursor: 'pointer', flexShrink: 0,
        transition: 'background 0.2s ease',
      }}
    >
      <motion.div
        animate={{ x: checked ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          position: 'absolute', top: '3px',
          width: '20px', height: '20px', borderRadius: 'var(--radius-circle)',
          background: 'var(--text-light)', boxShadow: 'var(--shadow-toggle)',
        }}
      />
    </div>
  );
}

// Grupo settings (tarjeta con título)
function SettingsGroup({ title, children }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      {title && (
        <p style={{
          fontSize: 'var(--fs-sm)', fontWeight: 600, letterSpacing: '0.06em',
          textTransform: 'uppercase', color: 'var(--text-tertiary)',
          marginBottom: '8px', paddingLeft: '4px',
        }}>
          {title}
        </p>
      )}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-divider)', boxShadow: 'var(--shadow-card)',
        overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  );
}

// Settigns Row (fila individual con ícono, texto y control opcional)
function SettingsRow({ icon: Icon, label, description, control, onClick, danger = false, last = false }) {
  const clickable = !!onClick;
  return (
    <motion.div
      onClick={onClick}
      whileHover={clickable ? { backgroundColor: 'var(--bg-surface)' } : undefined}
      transition={{ duration: 0.12 }}
      style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: 'var(--density-row-v) var(--density-row-h)', minHeight: '50px',
        borderBottom: last ? 'none' : '1px solid var(--border-divider)',
        cursor: clickable ? 'pointer' : 'default',
      }}
    >
      {Icon && (
        <div style={{
          width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
          background: danger ? 'var(--color-danger-bg)' : 'var(--apple-blue-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={16} style={{ color: danger ? 'var(--color-danger)' : 'var(--apple-blue)' }} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 'var(--fs-body)', fontWeight: 500,
          color: danger ? 'var(--color-danger)' : 'var(--text-primary)',
          margin: 0, lineHeight: 1.3,
        }}>
          {label}
        </p>
        {description && (
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-tertiary)', margin: '2px 0 0', lineHeight: 1.4 }}>
            {description}
          </p>
        )}
      </div>
      {control && <div style={{ flexShrink: 0 }}>{control}</div>}
      {clickable && !control && (
        <IconChevronRight size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
      )}
    </motion.div>
  );
}

//  Sección: Perfil
function SectionPerfil({ user, updateProfile }) {
  const notify  = useNotification();
  const stored  = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Administrador';
  const [nombre,  setNombre]  = useState(stored);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);
  const email = user?.email ?? 'Name';

  const avatarUrl = user?.user_metadata?.avatar_url;

  const handleSave = async () => {
    if (!nombre.trim()) return;
    setLoading(true);
    try {
      await updateProfile({ full_name: nombre.trim() });
      notify.success('Perfil actualizado correctamente.');
    } catch (err) {
      notify.error(err.message ?? 'Error al guardar perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      notify.error('Solo se permiten imágenes JPG, PNG o WebP.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      notify.error('La imagen no debe superar 2 MB.');
      return;
    }

    setUploadingPhoto(true);
    try {
      const ext = file.name.split('.').pop();
      const objectPath = `${user.id}.${ext}`;

      // Direct REST upload — bypass SDK getSession deadlock
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const storageKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
      const token = JSON.parse(localStorage.getItem(storageKey))?.access_token;

      if (!token) throw new Error('Sesión expirada. Vuelve a iniciar sesión.');

      const uploadRes = await fetch(
        `${supabaseUrl}/storage/v1/object/avatars/${objectPath}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'apikey': anonKey,
            'Content-Type': file.type,
            'x-upsert': 'true',
          },
          body: file,
        }
      );

      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        throw new Error(err.message || err.error || `Error ${uploadRes.status}`);
      }

      const publicUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${objectPath}`;
      const url = `${publicUrl}?t=${Date.now()}`;
      await updateProfile({ avatar_url: url });
      notify.success('Foto de perfil actualizada.');
    } catch (err) {
      notify.error(err.message ?? 'Error al subir foto.');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const initial = nombre.trim().charAt(0).toUpperCase() || '?';

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div
          onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
          style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: avatarUrl ? 'none' : 'linear-gradient(135deg, var(--apple-blue), var(--apple-blue-light))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-on-accent)', fontSize: '24px', fontWeight: 700,
            boxShadow: 'var(--shadow-blue)', flexShrink: 0,
            position: 'relative', cursor: 'pointer', overflow: 'hidden',
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
            />
          ) : (
            initial
          )}
          {/* Hover overlay */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'var(--bg-overlay)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            opacity: uploadingPhoto ? 1 : 0,
            transition: 'opacity 0.15s ease',
          }}
            className="avatar-overlay"
          >
            <IconCamera size={20} color="var(--text-on-accent)" />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            style={{ display: 'none' }}
          />
        </div>
        <div>
          <p style={{ fontSize: 'var(--fs-lg)', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{nombre || ''}</p>
          <p style={{ fontSize: 'var(--fs-md)', color: 'var(--text-tertiary)', margin: '3px 0 0' }}>{email}</p>
          <button
            onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--apple-blue)', fontSize: 'var(--fs-sm)',
              fontWeight: 500, padding: 0, marginTop: '4px',
              minHeight: 'unset', minWidth: 'unset',
            }}
          >
            {uploadingPhoto ? 'Subiendo…' : 'Cambiar foto'}
          </button>
        </div>
      </div>
      <SettingsGroup title="Información personal">
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Input
            label="Nombre completo"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Tu nombre"
          />
          <Input label="Correo electrónico" value={email} readOnly disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
        </div>
        <div style={{ padding: '0 16px 16px', display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" onClick={handleSave} loading={loading}>
            Guardar cambios
          </Button>
        </div>
      </SettingsGroup>
    </>
  );
}

//  Sección: Apariencia
function SectionApariencia() {
  const {
    isDark, toggleDark,
    accentIdx, setAccent,
    fontFamIdx, setFont,
    fontSizeIdx, setFontSize,
    radiusIdx, setRadius,
    densityIdx, setDensity,
    bgIdx, setBg,
    reduceAnim, toggleReduceAnim,
    resetAll,
  } = useAppearance();

  return (
    <>
      <SettingsGroup title="Tema">
        <SettingsRow
          icon={isDark ? IconMoon : IconSun}
          label="Modo oscuro"
          description="Cambia entre tema claro y oscuro"
          control={<Toggle checked={isDark} onChange={toggleDark} />}
          last
        />
      </SettingsGroup>

      <SettingsGroup title="Color de acento">
        <div style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            {ACCENTS.map((a, i) => (
              <ColorSwatch key={i} color={a.c} name={a.name} active={accentIdx === i} onClick={() => setAccent(i)} />
            ))}
          </div>
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-tertiary)', marginTop: '10px' }}>
            {ACCENTS[accentIdx].name}
          </p>
        </div>
      </SettingsGroup>

      <SettingsGroup title="Tipografía">
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-tertiary)', marginBottom: '8px', fontWeight: 500 }}>Familia de fuente</p>
            <PillSelector options={FONT_FAMILIES} activeIdx={fontFamIdx} onSelect={setFont} />
          </div>
          <div>
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-tertiary)', marginBottom: '8px', fontWeight: 500 }}>Tamaño de texto</p>
            <PillSelector options={FONT_SIZES} activeIdx={fontSizeIdx} onSelect={setFontSize} />
          </div>
        </div>
      </SettingsGroup>

      <SettingsGroup title="Estilo de bordes">
        <div style={{ padding: '14px 16px' }}>
          <PillSelector options={RADIUS_PRESETS} activeIdx={radiusIdx} onSelect={setRadius} />
        </div>
      </SettingsGroup>

      <SettingsGroup title="Densidad de interfaz">
        <div style={{ padding: '14px 16px' }}>
          <PillSelector options={DENSITIES} activeIdx={densityIdx} onSelect={setDensity} />
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-tertiary)', marginTop: '8px' }}>
            {DENSITIES[densityIdx].desc}
          </p>
        </div>
      </SettingsGroup>

      <SettingsGroup title="Fondo de página">
        <div style={{ padding: '14px 16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {BACKGROUNDS.map((bg, i) => (
            <BgCard key={i} bg={bg} active={bgIdx === i} onClick={() => setBg(i)} />
          ))}
        </div>
      </SettingsGroup>

      <SettingsGroup title="Accesibilidad">
        <SettingsRow
          icon={IconBolt}
          label="Reducir animaciones"
          description="Minimiza efectos de movimiento y transiciones"
          control={<Toggle checked={reduceAnim} onChange={toggleReduceAnim} />}
          last
        />
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRow
          icon={IconRefresh}
          label="Restablecer apariencia"
          description="Vuelve a los valores predeterminados"
          onClick={resetAll}
          danger
          last
        />
      </SettingsGroup>
    </>
  );
}

// Sección: Seguridad
function SectionSeguridad({ onSignOut, updatePassword }) {
  const notify = useNotification();
  const [showForm,  setShowForm]  = useState(false);
  const [pwd,       setPwd]       = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [loading,   setLoading]   = useState(false);

  const handleChangePassword = async () => {
    if (pwd.length < 6) { notify.error('Contraseña mínimo 6 caracteres.'); return; }
    if (pwd !== confirm) { notify.error('Las contraseñas no coinciden.'); return; }
    setLoading(true);
    try {
      await updatePassword(pwd);
      notify.success('Contraseña actualizada correctamente.');
      setPwd(''); setConfirm(''); setShowForm(false);
    } catch (err) {
      notify.error(err.message ?? 'Error al cambiar contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsGroup title="Cuenta">
      <SettingsRow
        icon={IconLock}
        label="Cambiar contraseña"
        description="Actualiza tus credenciales de acceso"
        onClick={() => setShowForm(p => !p)}
      />

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            style={{ overflow: 'hidden', borderBottom: '1px solid var(--border-divider)' }}
          >
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Nueva contraseña */}
              <div className="form-group">
                <label className="form-label">Nueva contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-input"
                    type={showPwd ? 'text' : 'password'}
                    value={pwd}
                    onChange={e => setPwd(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(p => !p)}
                    style={{
                      position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center',
                    }}
                    aria-label={showPwd ? 'Ocultar' : 'Mostrar'}
                  >
                    {showPwd ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                  </button>
                </div>
              </div>
              {/* Confirmar */}
              <div className="form-group">
                <label className="form-label">Confirmar contraseña</label>
                <input
                  className="form-input"
                  type={showPwd ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repite la contraseña"
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <Button variant="pill" onClick={() => { setShowForm(false); setPwd(''); setConfirm(''); }}>
                  Cancelar
                </Button>
                <Button variant="primary" onClick={handleChangePassword} disabled={loading}>
                  {loading ? 'Guardando…' : 'Actualizar'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SettingsRow
        icon={IconLogout}
        label="Cerrar sesión"
        onClick={() => notify.deleteConfirm('¿Cerrar sesión en este dispositivo?', onSignOut)}
        danger
        last
      />
    </SettingsGroup>
  );
}

// ─── Editor individual de turno/grupo ───────────────────────────────────────
function EmpleadoEditor() {
  const notify         = useNotification();
  const timerRef       = useRef(null);
  const [query,        setQuery]        = useState('');
  const [results,      setResults]      = useState([]);
  const [searching,    setSearching]    = useState(false);
  const [selected,     setSelected]     = useState(null); // empleado object
  const [editForm,     setEditForm]     = useState({ turno: '', grupo: '' });
  const [saving,       setSaving]       = useState(false);

  const handleQuery = (e) => {
    const val = e.target.value;
    setQuery(val);
    setSelected(null);
    setResults([]);
    clearTimeout(timerRef.current);
    if (val.trim().length < 2) return;
    timerRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchEmpleados(val.trim());
        setResults(res);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 400);
  };

  const handleSelect = (emp) => {
    setSelected(emp);
    setEditForm({ turno: emp.turno ?? '', grupo: emp.grupo ?? '' });
    setResults([]);
    setQuery(emp.nombre);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await updateEmpleadoTurnoGrupo(selected.numero_empleado, editForm);
      setSelected(updated);
      notify.success('Empleado actualizado.');
    } catch (e) {
      notify.error(e.message ?? 'Error al actualizar.');
    } finally { setSaving(false); }
  };

  return (
    <SettingsGroup title="Editar empleado">
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          {searching
            ? <IconSearch size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--apple-blue)', animation: 'pulse 1s ease infinite', pointerEvents: 'none' }} />
            : <IconSearch size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
          }
          <input
            className="form-input"
            placeholder="Buscar por nombre o núm. empleado…"
            value={query}
            onChange={handleQuery}
            style={{ paddingLeft: '34px', width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        {/* Results dropdown */}
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              style={{
                background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-divider)', overflow: 'hidden',
                boxShadow: 'var(--shadow-float)',
              }}
            >
              {results.map((emp, i) => (
                <div
                  key={emp.numero_empleado}
                  onClick={() => handleSelect(emp)}
                  style={{
                    padding: '10px 14px', cursor: 'pointer',
                    borderBottom: i < results.length - 1 ? '1px solid var(--border-divider)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: '8px',
                    transition: 'background 0.1s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 'var(--fs-body)', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-text)' }}>{emp.nombre}</p>
                    <p style={{ margin: 0, fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-text)' }}>#{emp.numero_empleado} · {emp.puesto}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-text)', padding: '2px 8px', borderRadius: 'var(--radius-pill)', background: 'var(--bg-surface)', border: '1px solid var(--border-divider)' }}>T{emp.turno}</span>
                    <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--apple-blue)', fontFamily: 'var(--font-text)', padding: '2px 8px', borderRadius: 'var(--radius-pill)', background: 'var(--apple-blue-bg)', border: '1px solid var(--apple-blue-border)' }}>Gr.{emp.grupo}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit form */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-divider)', padding: '14px 16px',
                display: 'flex', flexDirection: 'column', gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconPencil size={14} color="var(--apple-blue)" />
                <p style={{ margin: 0, fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-text)' }}>
                  {selected.nombre} <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>#{selected.numero_empleado}</span>
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Turno</label>
                  <input
                    className="form-input"
                    value={editForm.turno}
                    onChange={e => setEditForm(prev => ({ ...prev, turno: e.target.value }))}
                    placeholder="Ej: Matutino"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Grupo</label>
                  <input
                    className="form-input"
                    value={editForm.grupo}
                    onChange={e => setEditForm(prev => ({ ...prev, grupo: e.target.value }))}
                    placeholder="Ej: A"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <Button variant="pill" onClick={() => { setSelected(null); setQuery(''); }}>Cancelar</Button>
                <Button variant="primary" onClick={handleSave} loading={saving}>Guardar</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SettingsGroup>
  );
}

// ─── Sección: Crear empleado (step form) ─────────────────────────────────────
const CREATE_STEPS = [
  { id: 'identificacion', title: 'Identificación' },
  { id: 'puesto',         title: 'Puesto' },
  { id: 'asignacion',     title: 'Asignación' },
];

const TURNO_LABELS = {
  '1': 'Matutino',
  '2': 'Vespertino',
  '3': 'Nocturno',
  '4': 'Mixto',
};

const TURNO_OPTIONS = TURNOS.map(t => ({
  value: t,
  label: `Turno ${t}${TURNO_LABELS[t] ? ` — ${TURNO_LABELS[t]}` : ''}`,
}));

const GRUPO_OPTIONS = GRUPOS.map(g => ({ value: g, label: `Grupo ${g}` }));

const EMPTY_EMPLEADO = {
  numero_empleado: '',
  nombre: '',
  puesto: '',
  departamento: '',
  turno: '1',
  grupo: 'A',
};

function StepIndicator({ steps, current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {steps.map((s, i) => {
        const isActive = i === current;
        const isDone   = i < current;
        return (
          <React.Fragment key={s.id}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '6px 12px', borderRadius: 'var(--radius-pill)',
              background: isActive ? 'var(--apple-blue)' : isDone ? 'var(--apple-blue-bg)' : 'var(--bg-input)',
              color:      isActive ? 'var(--text-on-accent)' : isDone ? 'var(--apple-blue)' : 'var(--text-tertiary)',
              fontSize: 'var(--fs-sm)', fontFamily: 'var(--font-text)',
              fontWeight: isActive ? 600 : 500,
              transition: 'background 0.2s ease, color 0.2s ease',
              whiteSpace: 'nowrap',
            }}>
              <span style={{
                width: '18px', height: '18px', borderRadius: '50%',
                background: isActive ? 'var(--bg-highlight-soft)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 'var(--fs-xs)', fontWeight: 700,
              }}>
                {isDone ? <IconCheck size={12} /> : i + 1}
              </span>
              <span>{s.title}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, minWidth: '12px', height: '2px',
                background: isDone ? 'var(--apple-blue)' : 'var(--border-divider)',
                borderRadius: '1px', transition: 'background 0.2s ease',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function EmpleadoCreator() {
  const notify = useNotification();
  const [step,   setStep]   = useState(0);
  const [form,   setForm]   = useState(EMPTY_EMPLEADO);
  const [saving, setSaving] = useState(false);

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const validateStep = () => {
    if (step === 0) {
      if (!form.numero_empleado.trim()) return 'Número de empleado requerido.';
      if (!form.nombre.trim())          return 'Nombre requerido.';
    }
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) return notify.error(err);
    setStep(s => Math.min(s + 1, CREATE_STEPS.length - 1));
  };

  const back = () => setStep(s => Math.max(s - 1, 0));

  const reset = () => {
    setForm(EMPTY_EMPLEADO);
    setStep(0);
  };

  const submit = async () => {
    const err = validateStep();
    if (err) return notify.error(err);
    setSaving(true);
    try {
      const created = await createEmpleado(form);
      notify.success(`Empleado ${created.nombre} creado correctamente.`);
      reset();
    } catch (e) {
      notify.error(e.message ?? 'Error al crear empleado.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsGroup title="Crear empleado">
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        <StepIndicator steps={CREATE_STEPS} current={step} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}
          >
            {step === 0 && (
              <>
                <Input
                  label="Número de empleado"
                  value={form.numero_empleado}
                  onChange={e => update('numero_empleado', e.target.value)}
                  placeholder="Ej: 001"
                  autoFocus
                />
                <Input
                  label="Nombre completo"
                  value={form.nombre}
                  onChange={e => update('nombre', e.target.value)}
                  placeholder="Ej: Juan López"
                />
              </>
            )}

            {step === 1 && (
              <>
                <Input
                  label="Puesto"
                  value={form.puesto}
                  onChange={e => update('puesto', e.target.value)}
                  placeholder="Ej: Asesor"
                />
                <Input
                  label="Departamento"
                  value={form.departamento}
                  onChange={e => update('departamento', e.target.value)}
                  placeholder="Ej: Ventas"
                />
              </>
            )}

            {step === 2 && (
              <>
                <Select
                  label="Turno"
                  value={form.turno}
                  onChange={v => update('turno', v)}
                  options={TURNO_OPTIONS}
                />
                <Select
                  label="Grupo"
                  value={form.grupo}
                  onChange={v => update('grupo', v)}
                  options={GRUPO_OPTIONS}
                />
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {step === CREATE_STEPS.length - 1 && (
          <div style={{
            background: 'var(--apple-blue-bg)', borderRadius: 'var(--radius-md)',
            padding: '12px 14px', border: '1px solid var(--apple-blue-border)',
            display: 'flex', flexDirection: 'column', gap: '4px',
          }}>
            <p style={{ margin: 0, fontWeight: 600, color: 'var(--apple-blue)', fontSize: 'var(--fs-body)', fontFamily: 'var(--font-text)' }}>
              Resumen
            </p>
            <p style={{ margin: 0, fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', fontFamily: 'var(--font-text)' }}>
              <strong>#{form.numero_empleado || '—'}</strong> {form.nombre || '—'}
            </p>
            <p style={{ margin: 0, fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-text)' }}>
              {form.puesto || 'Sin puesto'} · {form.departamento || 'Sin departamento'} · T{form.turno} · Gr.{form.grupo}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
          <Button variant="pill" onClick={back} disabled={step === 0 || saving}>
            Atrás
          </Button>
          {step < CREATE_STEPS.length - 1 ? (
            <Button variant="primary" icon={IconChevronRight} onClick={next}>
              Siguiente
            </Button>
          ) : (
            <Button variant="primary" icon={IconUserPlus} onClick={submit} loading={saving}>
              Crear empleado
            </Button>
          )}
        </div>
      </div>
    </SettingsGroup>
  );
}

function SectionEmpleados() {
  return (
    <>
      <EmpleadoEditor />
      <EmpleadoCreator />
    </>
  );
}

// Contenido de cada sección
function SectionContent({ id, user, updateProfile, updatePassword, onSignOut }) {
  switch (id) {
    case 'perfil':     return <SectionPerfil user={user} updateProfile={updateProfile} />;
    case 'apariencia': return <SectionApariencia />;
    case 'empleados':  return <SectionEmpleados />;
    case 'seguridad':  return <SectionSeguridad onSignOut={onSignOut} updatePassword={updatePassword} />;
    default:           return null;
  }
}

// Página de configuración
export function Configuracion() {
  const setHeaderActions = useHeaderActions();
  const { user, signOut, updateProfile, updatePassword } = useAuth();
  const [active,   setActive]   = useState('perfil');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 641);

  useEffect(() => {
    setHeaderActions(null);
    return () => setHeaderActions(null);
  }, [setHeaderActions]);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 641);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const sharedProps = { user, updateProfile, updatePassword, onSignOut: signOut };
  const activeLabel = SECTIONS.find(s => s.id === active)?.label ?? '';

  return (
    <Box style={{ padding: 'clamp(16px, 3vw, 32px)', maxWidth: '860px' }}>
      <div className="settings-layout">

        {/* ── Left nav ─ PC only ── */}
        {!isMobile && (
          <nav className="settings-nav" aria-label="Secciones de configuración">
            <p style={{
              fontSize: 'var(--fs-xs)', fontWeight: 700, letterSpacing: '0.06em',
              textTransform: 'uppercase', color: 'var(--text-tertiary)',
              marginBottom: '10px', paddingLeft: '12px',
            }}>
              Ajustes
            </p>
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <motion.button
                key={id}
                className={`settings-nav-item${active === id ? ' settings-nav-item--active' : ''}`}
                onClick={() => setActive(id)}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              >
                <Icon size={15} />
                {label}
              </motion.button>
            ))}
          </nav>
        )}

        {/* ── Content panel ── */}
        <div style={{ minWidth: 0 }}>
          {isMobile ? (
            SECTIONS.map(({ id, label, icon: Icon }) => (
              <div key={id} style={{ marginBottom: '36px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--apple-blue-bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={15} style={{ color: 'var(--apple-blue)' }} />
                  </div>
                  <h2 style={{
                    fontSize: '20px', fontWeight: 600, fontFamily: 'var(--font-display)',
                    color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.2px',
                  }}>
                    {label}
                  </h2>
                </div>
                <SectionContent id={id} {...sharedProps} />
              </div>
            ))
          ) : (
            <>
              <h2 style={{
                fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-display)',
                color: 'var(--text-primary)', letterSpacing: '-0.3px', marginBottom: '20px',
              }}>
                {activeLabel}
              </h2>
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                >
                  <SectionContent id={active} {...sharedProps} />
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>

      </div>
    </Box>
  );
}
