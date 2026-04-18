import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconPlus, IconFileTypePdf, IconFileTypeXls,
  IconPencil, IconTrash, IconArrowUp, IconArrowDown, IconArrowsUpDown,
  IconChevronLeft, IconChevronRight,
} from '@tabler/icons-react';
import { Box } from '../components/ui/Box';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { SearchBar } from '../components/ui/SearchBar';
import { Select } from '../components/ui/Select';
import { useNotification } from '../components/ui/Notification';
import { CATALOG } from '../lib/catalogo';

const STOCK_THRESHOLD = 5;

// Catalog helpers (computed once at module level)
const catalogData = Object.entries(CATALOG).flatMap(([category, items]) =>
  items.map(item => {
    const name  = Object.keys(item)[0];
    const meta  = item[name];
    return { name, price: meta.price, unit: meta.unit ?? 'pieza', sku: meta.sku ?? '', category, minStock: meta.minStock };
  })
);
const catalogOptions    = catalogData.map(p => ({ value: p.name, label: `${p.name}${p.sku ? ' — ' + p.sku : ''}` }));
const catalogMap        = Object.fromEntries(catalogData.map(p => [p.name, p]));
const catalogCategories = ['Todos', ...Object.keys(CATALOG)];

const COLUMNS = [
  { header: 'SKU',           accessor: 'sku'       },
  { header: 'Nombre',        accessor: 'nombre'    },
  { header: 'Categoría',     accessor: 'categoria' },
  { header: 'Precio',        accessor: 'precio'    },
  { header: 'Piezas',        accessor: 'piezas'    },
  { header: 'Unidad',        accessor: 'unit'      },
  { header: 'Fecha surtido', accessor: 'fecha'     },
];

const EMPTY_FORM = { nombre: '', categoria: '', precio: '', piezas: '', fecha: '', sku: '', unit: '' };

export function Productos({ setHeaderActions }) {
  const [productos,      setProductos]      = useState([]);
  const [query,          setQuery]          = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [sortConfig,     setSortConfig]     = useState({ key: null, dir: 'asc' });
  const [showModal,      setShowModal]      = useState(false);
  const [form,           setForm]           = useState(EMPTY_FORM);
  const [errors,         setErrors]         = useState({});
  const [editIndex,      setEditIndex]      = useState(null);
  const scrollRef  = useRef(null);
  const chipsRef   = useRef(null);
  const [atEnd,        setAtEnd]        = useState(false);
  const [chipsAtStart, setChipsAtStart] = useState(true);
  const [chipsAtEnd,   setChipsAtEnd]   = useState(false);
  const notify = useNotification();

  const handleTableScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  const handleChipsScroll = useCallback(() => {
    const el = chipsRef.current;
    if (!el) return;
    setChipsAtStart(el.scrollLeft <= 4);
    setChipsAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  const scrollChips = (dir) => {
    chipsRef.current?.scrollBy({ left: dir * 180, behavior: 'smooth' });
  };

  // --- Validation ---
  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'Nombre requerido';
    if (!form.piezas || isNaN(form.piezas) || Number(form.piezas) < 0)
      e.piezas = 'Ingresa cantidad válida';
    return e;
  };

  // --- Modal handlers ---
  const handleOpen = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setEditIndex(null);
    setShowModal(true);
  };

  const handleEdit = (realIndex) => {
    setForm({ ...productos[realIndex] });
    setErrors({});
    setEditIndex(realIndex);
    setShowModal(true);
  };

  const handleDelete = (realIndex) => {
    const nombre = productos[realIndex]?.nombre ?? 'el producto';
    notify.deleteConfirm(
      `¿Eliminar “${nombre}”? Esta acción no se puede deshacer.`,
      () => setProductos(prev => prev.filter((_, i) => i !== realIndex))
    );
  };

  const handleClose = () => {
    setShowModal(false);
    setErrors({});
    setEditIndex(null);
  };

  const handleAccept = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const entry = {
      sku:       form.sku,
      nombre:    form.nombre.trim(),
      categoria: form.categoria,
      precio:    form.precio,
      piezas:    Number(form.piezas),
      unit:      form.unit || 'pieza',
      fecha:     form.fecha || '—',
    };
    if (editIndex !== null) {
      setProductos(prev => prev.map((p, i) => i === editIndex ? entry : p));
      notify.success(`“${entry.nombre}” actualizado correctamente.`);
    } else {
      setProductos(prev => [...prev, entry]);
      notify.success(`“${entry.nombre}” registrado correctamente.`);
    }
    handleClose();
  };

  // --- Field handlers ---
  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSelectChange = (field) => (val) => {
    if (field === 'nombre') {
      const found = catalogMap[val];
      setForm(prev => ({
        ...prev,
        nombre:    val,
        precio:    found ? found.price    : prev.precio,
        categoria: found ? found.category : prev.categoria,
        sku:       found ? found.sku      : prev.sku,
        unit:      found ? found.unit     : prev.unit,
      }));
    } else {
      setForm(prev => ({ ...prev, [field]: val }));
    }
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  // --- Sort ---
  const handleSort = (accessor) => {
    setSortConfig(prev =>
      prev.key === accessor
        ? { key: accessor, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key: accessor, dir: 'asc' }
    );
  };

  // --- Filtered + sorted data ---
  const displayData = useMemo(() => {
    let list = productos.filter(p => {
      const matchQuery = p.nombre.toLowerCase().includes(query.toLowerCase());
      const matchCat   = categoryFilter === 'Todos' || p.categoria === categoryFilter;
      return matchQuery && matchCat;
    });
    if (sortConfig.key) {
      list = [...list].sort((a, b) => {
        const av = a[sortConfig.key];
        const bv = b[sortConfig.key];
        const cmp = typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv));
        return sortConfig.dir === 'asc' ? cmp : -cmp;
      });
    }
    return list;
  }, [productos, query, categoryFilter, sortConfig]);

  // Map display rows back to real indices for edit/delete
  const displayWithIndex = useMemo(
    () => displayData.map(row => ({ ...row, _realIndex: productos.indexOf(row) })),
    [displayData, productos]
  );

  useEffect(() => {
    setHeaderActions?.(null);
    return () => setHeaderActions?.(null);
  }, []);

  useEffect(() => {
    const el = chipsRef.current;
    if (!el) return;
    setChipsAtEnd(el.scrollWidth <= el.clientWidth);
  }, []);

  // --- Sort icon helper ---
  const SortIcon = ({ accessor }) => {
    if (sortConfig.key !== accessor)
      return <IconArrowsUpDown size={13} style={{ color: 'var(--text-tertiary)', opacity: 0.5 }} />;
    return sortConfig.dir === 'asc'
      ? <IconArrowUp   size={13} style={{ color: 'var(--apple-blue)' }} />
      : <IconArrowDown size={13} style={{ color: 'var(--apple-blue)' }} />;
  };

  return (
    <Box style={{ padding: 'clamp(16px, 3vw, 24px)', maxWidth: '100%' }}>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px', maxWidth: '320px' }}>
          <SearchBar
            placeholder="Buscar producto..."
            onSearch={setQuery}
            onClear={() => setQuery('')}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <motion.button
            className="toolbar-icon-btn"
            title="Exportar PDF"
            aria-label="Exportar PDF"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{ color: 'var(--color-pdf)' }}
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
            style={{ color: 'var(--color-xls)' }}
          >
            <IconFileTypeXls size={18} />
          </motion.button>
          <Button variant="primary" icon={IconPlus} animationType="add" onClick={handleOpen} aria-label="Agregar producto" title="Agregar producto" />
        </div>
      </div>

      {/* Category chips — scroll horizontal, no wrap */}
      <div className="chips-scroll-row-wrap">
        {!chipsAtStart && (
          <button className="chips-arrow chips-arrow--left" onClick={() => scrollChips(-1)} aria-label="Categorías anteriores">
            <IconChevronLeft size={14} />
          </button>
        )}
        <div className="chips-scroll-row" ref={chipsRef} onScroll={handleChipsScroll}>
          {catalogCategories.map(cat => (
            <button
              key={cat}
              className={`chip${categoryFilter === cat ? ' chip--active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        {!chipsAtEnd && (
          <button className="chips-arrow chips-arrow--right" onClick={() => scrollChips(1)} aria-label="Más categorías">
            <IconChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Table card */}
      <motion.div
        layout
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-divider)',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
        }}
      >
        <AnimatePresence mode="popLayout">
          {displayData.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ padding: '56px 24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--fs-lg)' }}
            >
              {productos.length === 0 ? 'Sin productos registrados' : 'Sin resultados para la búsqueda'}
            </motion.div>
          ) : (
            <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`table-scroll-container${atEnd ? ' at-end' : ''}`}>
              <div ref={scrollRef} onScroll={handleTableScroll} style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--fs-body)' }} role="table" aria-label="Tabla de productos">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-divider)' }}>
                    {COLUMNS.map(col => (
                      <th
                        key={col.accessor}
                        scope="col"
                        onClick={() => handleSort(col.accessor)}
                        className={`sortable-th${col.accessor === 'nombre' ? ' sticky-col sticky-col--head' : ''}`}
                        style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {col.header}
                          <SortIcon accessor={col.accessor} />
                        </span>
                      </th>
                    ))}
                    <th scope="col" style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayWithIndex.map((row, i) => {
                    const lowStock = row.piezas < STOCK_THRESHOLD;
                    return (
                      <tr
                        key={i}
                        className={lowStock ? 'row-low-stock' : ''}
                        style={{ borderBottom: '1px solid var(--border-divider)', transition: 'background-color 0.2s' }}
                      >
                        <td style={{ padding: 'var(--density-cell-v) var(--density-cell-h)', color: 'var(--text-tertiary)', fontSize: 'var(--fs-md)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{row.sku}</td>
                        <td style={{ padding: 'var(--density-cell-v) var(--density-cell-h)' }} className="sticky-col">{row.nombre}</td>
                        <td style={{ padding: 'var(--density-cell-v) var(--density-cell-h)' }}>
                          <span className="chip chip--category">{row.categoria}</span>
                        </td>
                        <td style={{ padding: 'var(--density-cell-v) var(--density-cell-h)', fontVariantNumeric: 'tabular-nums' }}>{row.precio}</td>
                        <td style={{ padding: 'var(--density-cell-v) var(--density-cell-h)' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            {row.piezas}
                            {lowStock && <span className="badge-low-stock">Stock bajo</span>}
                          </span>
                        </td>
                        <td style={{ padding: 'var(--density-cell-v) var(--density-cell-h)', color: 'var(--text-tertiary)', fontSize: 'var(--fs-md)' }}>{row.unit}</td>
                        <td style={{ padding: 'var(--density-cell-v) var(--density-cell-h)' }}>{row.fecha}</td>
                        <td style={{ padding: 'var(--density-cell-v) var(--density-cell-h)' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <motion.button
                              className="toolbar-icon-btn"
                              title="Editar"
                              aria-label="Editar producto"
                              onClick={() => handleEdit(row._realIndex)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                              style={{ width: '30px', height: '30px', color: 'var(--apple-blue)' }}
                            >
                              <IconPencil size={15} />
                            </motion.button>
                            <motion.button
                              className="toolbar-icon-btn"
                              title="Eliminar"
                              aria-label="Eliminar producto"
                              onClick={() => handleDelete(row._realIndex)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                              style={{ width: '30px', height: '30px', color: 'var(--color-danger)' }}
                            >
                              <IconTrash size={15} />
                            </motion.button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Modal registro / edición */}
      <Modal
        isOpen={showModal}
        onClose={handleClose}
        onAccept={handleAccept}
        title={editIndex !== null ? 'Editar producto' : 'Nuevo producto'}
        acceptLabel="Guardar"
        cancelLabel="Cancelar"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Nombre del producto (catálogo) */}
          <div>
            <Select
              id="prod-nombre"
              label="Nombre del producto"
              placeholder="Seleccionar producto..."
              options={catalogOptions}
              value={form.nombre}
              onChange={handleSelectChange('nombre')}
              aria-required="true"
            />
            {errors.nombre && (
              <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-danger)', marginTop: '4px', display: 'block' }}>
                {errors.nombre}
              </span>
            )}
          </div>

          {/* Categoría + Precio + SKU + Unidad (autofilled, readonly) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', alignItems: 'start' }}>
            <Input
              id="prod-categoria"
              label="Categoría"
              value={form.categoria}
              onChange={handleChange('categoria')}
              readOnly
              placeholder="—"
            />
            <Input
              id="prod-precio"
              label="Precio"
              value={form.precio}
              onChange={handleChange('precio')}
              readOnly
              placeholder="—"
            />
          </div>

          {/* SKU + Unidad */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', alignItems: 'start' }}>
            <Input
              id="prod-sku"
              label="SKU"
              value={form.sku}
              onChange={handleChange('sku')}
              readOnly
              placeholder="—"
            />
            <Input
              id="prod-unit"
              label="Unidad"
              value={form.unit}
              onChange={handleChange('unit')}
              readOnly
              placeholder="—"
            />
          </div>

          {/* Piezas + Fecha */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', alignItems: 'start' }}>
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
                <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-danger)', marginTop: '4px', display: 'block' }}>
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
