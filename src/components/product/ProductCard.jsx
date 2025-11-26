import React from 'react';
import './ProductCard.css';

// Recibimos una nueva prop: "onViewDetails"
export default function ProductCard({ producto, onAddToCart, onViewDetails }) {
  return (
    <div className="product-card">
      <div className="product-image">
        <img
          src={producto.imagen_url || `/placeholder.svg?key=food-${producto.id}`}
          alt={producto.nombre}
          loading="lazy"
        />
        <div className="product-overlay">
          {/* Al hacer clic, avisamos al padre (Menu) que muestre el modal */}
          <button
            className="details-btn"
            onClick={() => onViewDetails(producto)}
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
    </div>
  );
}