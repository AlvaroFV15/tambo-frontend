import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import apiService from '../services/api'; // Asegúrate que la ruta sea correcta
import ProductCard from '../components/product/ProductCard';
import Cart from '../components/cart/Cart';
import './Menu.css';

export default function Menu() {
  const { state, setProductos, setCategorias, addToCart, setNotification } = useApp();
  const { productos, categorias } = state;
  
  const [selectedCategory, setSelectedCategory] = useState(null); // null = "Todos"
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("🔄 Iniciando carga de datos...");
        
        const [resCategorias, resProductos] = await Promise.all([
          apiService.getCategorias(),
          apiService.getProductos(),
        ]);

        // --- CORRECCIÓN PRINCIPAL AQUÍ ---
        // Verificamos si llegó un Array directo O si llegó un objeto con .data
        const listaCategorias = Array.isArray(resCategorias) 
             ? resCategorias 
             : (resCategorias.data || []);

        const listaProductos = Array.isArray(resProductos) 
             ? resProductos 
             : (resProductos.data || []);

        console.log("✅ Categorías procesadas:", listaCategorias.length);
        console.log("✅ Productos procesados:", listaProductos.length);

        // Guardamos en el Contexto Global
        setCategorias(listaCategorias);
        setProductos(listaProductos);

        // Seleccionamos la primera categoría por defecto (opcional)
        if (listaCategorias.length > 0) {
           // Si quieres que empiece en "Todos", comenta la siguiente línea
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

  // Lógica de filtrado
  const filteredProducts = selectedCategory
    ? productos.filter(p => p.categoria_id === selectedCategory)
    : productos;

  const handleAddToCart = (producto) => {
    addToCart(producto);
    // Verificamos si setNotification existe antes de usarlo
    if (setNotification) {
        setNotification({ type: 'success', message: `${producto.nombre} añadido` });
    } else {
        alert(`${producto.nombre} añadido al carrito`);
    }
  };

  if (loading) {
    return (
      <div className="menu-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando la mejor comida...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-container">
      {showCart && (
        <Cart onClose={() => setShowCart(false)} />
      )}

      <div className="menu-header">
        <h1>Nuestro Menú</h1>
        <p>Elige tus platos favoritos</p>
      </div>

      {/* Filtro de Categorías */}
      <div className="categories-filter">
        <h3>Categorías</h3>
        <div className="categories-list">
          {/* Botón para ver TODOS */}
          <button
            className={`category-btn ${selectedCategory === null ? 'active' : ''}`}
            onClick={() => setSelectedCategory(null)}
          >
            Todos
          </button>

          {categorias.map(categoria => (
            <button
              key={categoria.id}
              className={`category-btn ${selectedCategory === categoria.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(categoria.id)}
            >
              {categoria.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Rejilla de Productos */}
      <div className="products-section">
        {filteredProducts.length === 0 ? (
             <p style={{textAlign: 'center', color: '#888'}}>No hay productos en esta categoría.</p>
        ) : (
            <div className="products-grid">
            {filteredProducts.map(producto => (
                <ProductCard
                key={producto.id}
                producto={producto}
                onAddToCart={handleAddToCart}
                />
            ))}
            </div>
        )}
      </div>

      {/* Botón Flotante del Carrito */}
      <button className="floating-cart" onClick={() => setShowCart(true)}>
        🛒 Ver Carrito ({state.carrito ? state.carrito.length : 0})
      </button>
    </div>
  );
}