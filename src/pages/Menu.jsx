import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import ProductCard from '../components/product/ProductCard';
import Cart from '../components/cart/Cart';
import './Menu.css';

export default function Menu() {
  const { state, setProductos, setCategorias, addToCart, setNotification } = useApp();
  const { productos, categorias } = state;
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pattern: Cargar datos en paralelo
    const loadData = async () => {
      try {
        const [categoriasData, productosData] = await Promise.all([
          apiService.getCategorias(),
          apiService.getProductos(),
        ]);

        if (categoriasData.success) {
          setCategorias(categoriasData.data);
          setSelectedCategory(categoriasData.data[0]?.id);
        }

        if (productosData.success) {
          setProductos(productosData.data);
        }
      } catch (error) {
        console.error('[Menu Load Error]', error);
        setNotification({ type: 'error', message: 'Error al cargar los productos' });
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
    setNotification({ type: 'success', message: `${producto.nombre} añadido al carrito` });
  };

  if (loading) {
    return (
      <div className="menu-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando menú...</p>
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

      {/* Categories Filter */}
      <div className="categories-filter">
        <h3>Categorías</h3>
        <div className="categories-list">
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

      {/* Products Grid */}
      <div className="products-section">
        <div className="products-grid">
          {filteredProducts.map(producto => (
            <ProductCard
              key={producto.id}
              producto={producto}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </div>

      {/* Floating Cart Button */}
      <button className="floating-cart" onClick={() => setShowCart(true)}>
        Ver Carrito ({state.carrito.length})
      </button>
    </div>
  );
}
