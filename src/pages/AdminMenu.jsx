import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import Swal from 'sweetalert2';

export default function AdminMenu() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editandoId, setEditandoId] = useState(null);
  
  // Estado del formulario
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    imagen_url: '',
    categoria_id: 1, // Por defecto entrada
    disponible: true
  });

  const navigate = useNavigate();

  // 1. Cargar datos iniciales
  const cargarDatos = async () => {
    try {
      setLoading(true);
      // Obtenemos productos
      const prodRes = await apiService.getProductos();
      setProductos(Array.isArray(prodRes) ? prodRes : prodRes.data);

      // Obtenemos categorías para el select
      const catRes = await apiService.getCategorias();
      setCategorias(Array.isArray(catRes) ? catRes : catRes.data);
      
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) navigate('/admin/login');
    cargarDatos();
  }, [navigate]);

  // 2. Manejo de Inputs
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  // 3. Enviar Formulario (Crear o Editar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      Swal.fire({ title: 'Guardando...', didOpen: () => Swal.showLoading() });
      
      if (editandoId) {
        await apiService.actualizarProducto(editandoId, form);
        Swal.fire('Éxito', 'Plato actualizado correctamente', 'success');
      } else {
        await apiService.crearProducto(form);
        Swal.fire('Éxito', 'Plato creado correctamente', 'success');
      }

      // Limpiar y recargar
      setForm({ nombre: '', descripcion: '', precio: '', imagen_url: '', categoria_id: 1, disponible: true });
      setEditandoId(null);
      cargarDatos();

    } catch (error) {
      Swal.fire('Error', error.message || 'No se pudo guardar', 'error');
    }
  };

  // 4. Cargar datos en el formulario para editar
  const handleEdit = (p) => {
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion || '',
      precio: p.precio,
      imagen_url: p.imagen_url || '',
      categoria_id: p.categoria_id,
      disponible: p.disponible
    });
    setEditandoId(p.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 5. Eliminar
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Se eliminará este plato del menú permanentemente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar'
    });

    if (result.isConfirmed) {
      try {
        await apiService.eliminarProducto(id);
        Swal.fire('Eliminado', 'El plato ha sido eliminado.', 'success');
        cargarDatos();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar.', 'error');
      }
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>🍳 Gestión del Menú</h1>
        <button onClick={() => navigate('/admin/dashboard')} style={{ padding: '10px', cursor: 'pointer' }}>⬅ Volver a Pedidos</button>
      </div>

      {/* --- FORMULARIO --- */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h3 style={{ marginTop: 0, color: editandoId ? '#ffc107' : '#28a745' }}>
            {editandoId ? '✏️ Editar Plato' : '➕ Agregar Nuevo Plato'}
        </h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            {/* Nombre */}
            <input 
                type="text" name="nombre" placeholder="Nombre del plato" required 
                value={form.nombre} onChange={handleChange}
                style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            
            {/* Precio */}
            <input 
                type="number" name="precio" placeholder="Precio (S/)" required step="0.01" 
                value={form.precio} onChange={handleChange}
                style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            />

            {/* Categoría */}
            <select name="categoria_id" value={form.categoria_id} onChange={handleChange} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                {categorias.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
            </select>

            {/* Imagen URL */}
            <input 
                type="text" name="imagen_url" placeholder="URL de la imagen (http...)" 
                value={form.imagen_url} onChange={handleChange}
                style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            />

            {/* Descripción (ocupa 2 columnas) */}
            <textarea 
                name="descripcion" placeholder="Descripción de ingredientes..." rows="2"
                value={form.descripcion} onChange={handleChange}
                style={{ gridColumn: 'span 2', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            ></textarea>

            {/* Botones */}
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: editandoId ? '#ffc107' : '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {editandoId ? 'Guardar Cambios' : 'Crear Plato'}
                </button>
                
                {editandoId && (
                    <button type="button" onClick={() => { setEditandoId(null); setForm({ nombre: '', descripcion: '', precio: '', imagen_url: '', categoria_id: 1, disponible: true }); }} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '4px', cursor: 'pointer' }}>
                        Cancelar
                    </button>
                )}
            </div>
        </form>
      </div>

      {/* --- LISTA DE PLATOS --- */}
      {loading ? <p>Cargando menú...</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {productos.map(p => (
                <div key={p.id} style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden', background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                    <div style={{ height: '150px', background: '#ddd' }}>
                        {p.imagen_url ? (
                            <img src={p.imagen_url} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888' }}>Sin imagen</div>
                        )}
                    </div>
                    <div style={{ padding: '15px' }}>
                        <h4 style={{ margin: '0 0 5px' }}>{p.nombre}</h4>
                        <p style={{ color: '#777', fontSize: '12px', margin: '0 0 10px' }}>{p.categorias?.nombre}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', color: '#d4a373', fontSize: '18px' }}>S/ {parseFloat(p.precio).toFixed(2)}</span>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <button onClick={() => handleEdit(p)} style={{ background: '#ffc107', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer' }}>✏️</button>
                                <button onClick={() => handleDelete(p.id)} style={{ background: '#dc3545', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', color: 'white' }}>🗑️</button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
          </div>
      )}
    </div>
  );
}