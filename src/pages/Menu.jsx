import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import apiService from '../services/api';
import ProductCard from '../components/product/ProductCard';
import Cart from '../components/cart/Cart';
import './Menu.css';

export default function Menu() {
  const { state, setProductos, setCategorias, addToCart, setNotification } = useApp();
  const { productos, categorias } = state;
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- NUEVO ESTADO PARA EL MODAL ---
  // Aquí guardamos el producto que se está viendo actualmente
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("🔄 Iniciando carga de datos...");
        const [resCategorias, resProductos] = await Promise.all([
          apiService.getCategorias(),
          apiService.getProductos(),
        ]);

        const listaCategorias = Array.isArray(resCategorias) ? resCategorias : (resCategorias.data || []);
        const listaProductos = Array.isArray(resProductos) ? resProductos : (resProductos.data || []);

        setCategorias(listaCategorias);
        setProductos(listaProductos);

        if (listaCategorias.length > 0) {
           setSelectedCategory(listaCategorias[0].id); 
        }
      } catch (error) {
        console.error('[Menu Load Error]', error);
        if(setNotification) setNotification({ type: 'error', message: 'Error al cargar menú' });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [setProductos, setCategorias, setNotification]);

  const filteredProducts = selectedCategory
    ? productos.filter(p => p.categoria_id === selectedCategory)
    : productos;

  const handleAddToCart = (producto) => {
    addToCart(producto);
    if (setNotification) {
        setNotification({ type: 'success', message: `${producto.nombre} añadido` });
    } else {
        alert(`${producto.nombre} añadido al carrito`);
    }
    // Opcional: Cerrar el modal al añadir
    // setSelectedProduct(null); 
  };

  if (loading) {
    return <div className="menu-container"><div className="loading"><div className="spinner"></div><p>Cargando...</p></div></div>;
  }

  return (
    <div className="menu-container">
      {/* Carrito Lateral */}
      {showCart && <Cart onClose={() => setShowCart(false)} />}

      {/* --- AQUÍ ESTÁ LA SOLUCIÓN --- */}
      {/* El Modal vive aquí afuera, por encima de las tarjetas */}
      {selectedProduct && (
        <ProductModal 
          producto={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onAddToCart={handleAddToCart} 
        />
      )}

      <div className="menu-header">
        <h1>Nuestro Menú</h1>
        <p>Elige tus platos favoritos</p>
      </div>

      <div className="categories-filter">
        <h3>Categorías</h3>
        <div className="categories-list">
          <button className={`category-btn ${selectedCategory === null ? 'active' : ''}`} onClick={() => setSelectedCategory(null)}>Todos</button>
          {categorias.map(categoria => (
            <button key={categoria.id} className={`category-btn ${selectedCategory === categoria.id ? 'active' : ''}`} onClick={() => setSelectedCategory(categoria.id)}>
              {categoria.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className="products-section">
        {filteredProducts.length === 0 ? (
             <p style={{textAlign: 'center', color: '#888'}}>No hay productos aquí.</p>
        ) : (
            <div className="products-grid">
            {filteredProducts.map(producto => (
                <ProductCard
                  key={producto.id}
                  producto={producto}
                  onAddToCart={handleAddToCart}
                  // Pasamos la función para abrir el modal
                  onViewDetails={setSelectedProduct} 
                />
            ))}
            </div>
        )}
      </div>

      <button className="floating-cart" onClick={() => setShowCart(true)}>
        🛒 Ver Carrito ({state.carrito ? state.carrito.length : 0})
      </button>
    </div>
  );
}

// --- COMPONENTE MODAL (Definido aquí mismo para facilitar) ---
function ProductModal({ producto, onClose, onAddToCart }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-image">
          <img src={producto.imagen_url || "/placeholder.svg"} alt={producto.nombre} />
        </div>

        <div className="modal-info">
          <h2>{producto.nombre}</h2>
          <p className="modal-description">{producto.descripcion}</p>

          <div className="modal-price">
            <span>Precio:</span>
            <strong>S/. {parseFloat(producto.precio).toFixed(2)}</strong>
          </div>

          <button
            className="modal-add-btn"
            onClick={() => {
              onAddToCart(producto);
              // onClose(); // Descomentar si quieres que se cierre al agregar
            }}
          >
            Agregar al Carrito
          </button>
        </div>
      </div>
    </div>
  );
}