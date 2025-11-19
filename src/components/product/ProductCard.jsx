import React, { useState } from 'react';
import './ProductCard.css';

// Patrón: Componente presentacional puro
export default function ProductCard({ producto, onAddToCart }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="product-card">
      <div className="product-image">
        <img
          src={producto.imagen_url || `/placeholder.svg?key=food-${producto.id}`}
          alt={producto.nombre}
          loading="lazy"
        />
        <div className="product-overlay">
          <button
            className="details-btn"
            onClick={() => setShowDetails(true)}
          >
            Ver Detalles
          </button>
        </div>
      </div>

      <div className="product-info">
        <h3>{producto.nombre}</h3>
        <p className="description">{producto.descripcion}</p>

        <div className="product-footer">
          <span className="price">S/. {parseFloat(producto.precio).toFixed(2)}</span>
          <button
            className="add-btn"
            onClick={() => onAddToCart(producto)}
          >
            Añadir
          </button>
        </div>
      </div>

      {showDetails && (
        <ProductModal
          producto={producto}
          onClose={() => setShowDetails(false)}
          onAddToCart={onAddToCart}
        />
      )}
    </div>
  );
}

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
              onClose();
            }}
          >
            Agregar al Carrito
          </button>
        </div>
      </div>
    </div>
  );
}
