import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';
import './ProductosTab.css';

// Patrón: Formulario dinámico para CRUD de productos
export default function ProductosTab() {
  const { state, setProductos, setCategorias, setNotification } = useApp();
  const { productos, categorias } = state;
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria_id: '',
    imagen_url: '',
    disponible: true,
  });

  useEffect(() => {
    if (categorias.length === 0) {
      loadData();
    }
  }, []);

  const loadData = async () => {
    try {
      const [categoriasData, productosData] = await Promise.all([
        apiService.getCategorias(),
        apiService.getProductos(),
      ]);

      if (categoriasData.success) {
        setCategorias(categoriasData.data);
      }
      if (productosData.success) {
        setProductos(productosData.data);
      }
    } catch (error) {
      console.error('[Load Data Error]', error);
      setNotification({ type: 'error', message: 'Error al cargar datos' });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.nombre || !formData.precio || !formData.categoria_id) {
        setNotification({ type: 'error', message: 'Completa los campos requeridos' });
        setLoading(false);
        return;
      }

      let response;
      if (editingId) {
        // Actualizar
        response = await apiService.actualizarProducto(editingId, formData);
      } else {
        // Crear
        response = await apiService.crearProducto(formData);
      }

      if (response.success) {
        setNotification({
          type: 'success',
          message: editingId ? 'Producto actualizado' : 'Producto creado',
        });
        setFormData({
          nombre: '',
          descripcion: '',
          precio: '',
          categoria_id: '',
          imagen_url: '',
          disponible: true,
        });
        setEditingId(null);
        setShowForm(false);
        await loadData();
      }
    } catch (error) {
      console.error('[Submit Error]', error);
      setNotification({ type: 'error', message: 'Error al guardar producto' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (producto) => {
    setFormData(producto);
    setEditingId(producto.id);
    setShowForm(true);
  };

  const handleDelete = async (productoId) => {
    if (!window.confirm('¿Eliminar este producto?')) return;

    setLoading(true);
    try {
      const response = await apiService.eliminarProducto(productoId);
      if (response.success) {
        setNotification({ type: 'success', message: 'Producto eliminado' });
        await loadData();
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Error al eliminar' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="productos-tab">
      <div className="productos-header">
        <h2>Gestión de Productos</h2>
        <button
          className="add-btn"
          onClick={() => {
            setFormData({
              nombre: '',
              descripcion: '',
              precio: '',
              categoria_id: '',
              imagen_url: '',
              disponible: true,
            });
            setEditingId(null);
            setShowForm(!showForm);
          }}
        >
          + Añadir Producto
        </button>
      </div>

      {showForm && (
        <div className="producto-form">
          <h3>{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Nombre del plato"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Categoría *</label>
                <select
                  name="categoria_id"
                  value={formData.categoria_id}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Selecciona categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Precio *</label>
                <input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Descripción del plato"
                rows="3"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>URL de Imagen</label>
              <input
                type="url"
                name="imagen_url"
                value={formData.imagen_url}
                onChange={handleChange}
                placeholder="https://ejemplo.com/imagen.jpg"
                disabled={loading}
              />
            </div>

            <div className="form-checkbox">
              <input
                type="checkbox"
                id="disponible"
                name="disponible"
                checked={formData.disponible}
                onChange={handleChange}
                disabled={loading}
              />
              <label htmlFor="disponible">Disponible</label>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowForm(false)}
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="productos-grid">
        {productos.length === 0 ? (
          <p>No hay productos</p>
        ) : (
          productos.map(producto => (
            <div key={producto.id} className="producto-item">
              {producto.imagen_url && (
                <img src={producto.imagen_url || "/placeholder.svg"} alt={producto.nombre} />
              )}
              <div className="producto-info">
                <h4>{producto.nombre}</h4>
                <p className="categoria">
                  {categorias.find(c => c.id === producto.categoria_id)?.nombre}
                </p>
                <p className="precio">S/. {parseFloat(producto.precio).toFixed(2)}</p>
                <span className={`stock ${producto.disponible ? 'available' : 'unavailable'}`}>
                  {producto.disponible ? 'Disponible' : 'No disponible'}
                </span>
              </div>

              <div className="producto-actions">
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(producto)}
                  disabled={loading}
                >
                  Editar
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(producto.id)}
                  disabled={loading}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
