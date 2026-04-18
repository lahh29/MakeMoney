import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconPlus, IconFileTypePdf, IconFileTypeXls } from '@tabler/icons-react';
import { Box } from '../components/ui/Box';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Table } from '../components/ui/Table';
import { SearchBar } from '../components/ui/SearchBar';

const COLUMNS = [
  { header: 'Nombre', accessor: 'nombre' },
  { header: 'Piezas', accessor: 'piezas' },
  { header: 'Fecha surtido', accessor: 'fecha' },
];

const EMPTY_FORM = { nombre: '', piezas: '', fecha: '' };

export function Productos({ setHeaderActions }) {
  const [productos, setProductos] = useState([]);
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'Nombre requerido';
    if (!form.piezas || isNaN(form.piezas) || Number(form.piezas) < 0)
      e.piezas = 'Ingresa cantidad válida';
    return e;
  };

  const handleOpen = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setErrors({});
  };

  const handleAccept = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setProductos(prev => [
      ...prev,
      { nombre: form.nombre.trim(), piezas: Number(form.piezas), fecha: form.fecha || '—' },
    ]);
    handleClose();
  };

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  useEffect(() => {
    setHeaderActions?.(null);
    return () => setHeaderActions?.(null);
  }, []);

  return (
    <Box style={{ padding: '24px', maxWidth: '100%' }}>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {/* Búsqueda */}
        <div style={{ flex: '1 1 200px', maxWidth: '320px' }}>
          <SearchBar
            placeholder="Buscar producto..."
            onSearch={setQuery}
            onClear={() => setQuery('')}
          />
        </div>
        {/* Acciones */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <motion.button
            className="toolbar-icon-btn"
            title="Exportar PDF"
            aria-label="Exportar PDF"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{ color: '#e53935' }}
          >
            <IconFileTypePdf size={18} />
          </motion.button>
          <motion.button
            className="toolbar-icon-btn"
            title="Exportar Excel"
            aria-label="Exportar Excel"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{ color: '#2e7d32' }}
          >
            <IconFileTypeXls size={18} />
          </motion.button>
          <Button variant="primary" icon={IconPlus} animationType="add" onClick={handleOpen} aria-label="Agregar producto" title="Agregar producto" />
        </div>
      </div>

      {/* Table card */}
      <motion.div
        layout
        style={{
          background: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border-divider)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}
      >
        <AnimatePresence mode="popLayout">
          {(() => {
            const filtered = productos.filter(p =>
              p.nombre.toLowerCase().includes(query.toLowerCase())
            );
            if (filtered.length === 0) return (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ padding: '56px 24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '15px' }}
              >
                {productos.length === 0 ? 'Sin productos registrados' : 'Sin resultados para la búsqueda'}
              </motion.div>
            );
            return (
              <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Table columns={COLUMNS} data={filtered} />
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </motion.div>

      {/* Modal registro */}
      <Modal
        isOpen={showModal}
        onClose={handleClose}
        onAccept={handleAccept}
        title="Nuevo producto"
        acceptLabel="Guardar"
        cancelLabel="Cancelar"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Fila 1 — Nombre completo */}
          <div>
            <Input
              id="prod-nombre"
              label="Nombre del producto"
              placeholder="Ej. Cable USB-C"
              value={form.nombre}
              onChange={handleChange('nombre')}
              autoComplete="off"
              aria-required="true"
            />
            {errors.nombre && (
              <span style={{ fontSize: '12px', color: '#ff3b30', marginTop: '4px', display: 'block' }}>
                {errors.nombre}
              </span>
            )}
          </div>

          {/* Fila 2 — Piezas + Fecha */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'start' }}>
            <div style={{ minWidth: 0 }}>
              <Input
                id="prod-piezas"
                label="Piezas"
                type="number"
                min="0"
                value={form.piezas}
                onChange={handleChange('piezas')}
                aria-required="true"
              />
              {errors.piezas && (
                <span style={{ fontSize: '12px', color: '#ff3b30', marginTop: '4px', display: 'block' }}>
                  {errors.piezas}
                </span>
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <Input
                id="prod-fecha"
                label="Fecha surtido"
                type="date"
                value={form.fecha}
                onChange={handleChange('fecha')}
              />
            </div>
          </div>

        </div>
      </Modal>
    </Box>
  );
}
