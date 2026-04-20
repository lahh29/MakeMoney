import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconUser, IconBuildingStore, IconPalette, IconShield,
  IconChevronRight, IconSun, IconMoon, IconLock, IconLogout,
  IconEye, IconEyeOff, IconBolt, IconRefresh, IconCamera,
} from '@tabler/icons-react';
import { Box } from '../components/ui/Box';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../components/ui/Notification';
import { fetchUserSettings, saveEmpresa as saveEmpresaRemote } from '../lib/settings';
import {
  useAppearance,
  ACCENTS, FONT_FAMILIES, FONT_SIZES,
  RADIUS_PRESETS, DENSITIES, BACKGROUNDS,
} from '../hooks/useAppearance';

const SECTIONS = [
  { id: 'perfil',     label: 'Perfil',      icon: IconUser          },
  { id: 'apariencia', label: 'Apariencia',  icon: IconPalette       },
  { id: 'empresa',    label: 'Empresa',     icon: IconBuildingStore  },
  { id: 'seguridad',  label: 'Seguridad',   icon: IconShield         },
];

const EMPRESA_KEY = 'postsell-empresa';

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
          background: '#ffffff', boxShadow: 'var(--shadow-toggle)',
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
            color: '#fff', fontSize: '24px', fontWeight: 700,
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
            background: 'rgba(0,0,0,0.4)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            opacity: uploadingPhoto ? 1 : 0,
            transition: 'opacity 0.15s ease',
          }}
            className="avatar-overlay"
          >
            <IconCamera size={20} color="#fff" />
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

// Sección: Empresa
function SectionEmpresa() {
  const { user } = useAuth();
  const notify = useNotification();
  const [form, setForm] = useState({ nombre: '', rfc: '', direccion: '' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  // Load from Supabase on mount, fallback to localStorage
  useEffect(() => {
    if (!user?.id) { setFetching(false); return; }
    fetchUserSettings(user.id).then(data => {
      if (data?.empresa) {
        setForm(data.empresa);
        localStorage.setItem(EMPRESA_KEY, JSON.stringify(data.empresa));
      } else {
        try {
          const raw = localStorage.getItem(EMPRESA_KEY);
          if (raw) setForm(JSON.parse(raw));
        } catch { /* ignore */ }
      }
    }).catch(() => {
      try {
        const raw = localStorage.getItem(EMPRESA_KEY);
        if (raw) setForm(JSON.parse(raw));
      } catch { /* ignore */ }
    }).finally(() => setFetching(false));
  }, [user?.id]);

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem(EMPRESA_KEY, JSON.stringify(form));
      if (user?.id) {
        const ok = await saveEmpresaRemote(user.id, form);
        if (!ok) throw new Error('Error al guardar en servidor.');
      }
      notify.success('Datos de empresa guardados.');
    } catch (err) {
      notify.error(err.message ?? 'No se pudo guardar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsGroup title="Datos del negocio">
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Input label="Nombre de la empresa" value={form.nombre} onChange={set('nombre')} placeholder="Vertx Systems" />
        <Input label="RFC" value={form.rfc} onChange={set('rfc')} placeholder="ABC123456XXX" />
        <Input label="Dirección" value={form.direccion} onChange={set('direccion')} placeholder="Calle, Ciudad" />
      </div>
      <div style={{ padding: '0 16px 16px', display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="primary" onClick={handleSave} loading={loading} disabled={fetching}>
          Guardar cambios
        </Button>
      </div>
    </SettingsGroup>
  );
}

//  Sección: Seguridad
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

// Contenido de cada sección
function SectionContent({ id, user, updateProfile, updatePassword, onSignOut }) {
  switch (id) {
    case 'perfil':     return <SectionPerfil user={user} updateProfile={updateProfile} />;
    case 'apariencia': return <SectionApariencia />;
    case 'empresa':    return <SectionEmpresa />;
    case 'seguridad':  return <SectionSeguridad onSignOut={onSignOut} updatePassword={updatePassword} />;
    default:           return null;
  }
}

// Página de configuración
export function Configuracion({ setHeaderActions }) {
  const { user, signOut, updateProfile, updatePassword } = useAuth();
  const [active,   setActive]   = useState('perfil');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 641);

  useEffect(() => {
    setHeaderActions?.(null);
    return () => setHeaderActions?.(null);
  }, []);

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
