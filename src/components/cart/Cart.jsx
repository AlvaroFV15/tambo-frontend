import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './Cart.css';

// Patrón: Componente container que maneja lógica de carrito
export default function Cart({ onClose }) {
  const navigate = useNavigate();
  const { state, removeFromCart, updateCartItem } = useApp();
  const { carrito, usuario } = state;
  const [loading, setLoading] = useState(false);

  const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  const handleCheckout = () => {
    if (!usuario) {
      navigate('/registro');
      return;
    }
    navigate('/pago', { state: { carrito, total } });
  };

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-modal" onClick={e => e.stopPropagation()}>
        <div className="cart-header">
          <h2>Tu Carrito</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {carrito.length === 0 ? (
          <div className="empty-cart">
            <p>Tu carrito está vacío</p>
            <button
              className="continue-shopping"
              onClick={onClose}
            >
              Continuar Comprando
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {carrito.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateCartItem}
                  onRemove={removeFromCart}
                />
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>S/. {total.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <strong>S/. {total.toFixed(2)}</strong>
              </div>
            </div>

            <button
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Ir a Pagar'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function CartItem({ item, onUpdateQuantity, onRemove }) {
  return (
    <div className="cart-item">
      <img src={item.imagen_url || "/placeholder.svg"} alt={item.nombre} />

      <div className="item-details">
        <h4>{item.nombre}</h4>
        <p className="item-price">S/. {parseFloat(item.precio).toFixed(2)}</p>
      </div>

      <div className="item-quantity">
        <button onClick={() => onUpdateQuantity(item.id, item.cantidad - 1)}>-</button>
        <span>{item.cantidad}</span>
        <button onClick={() => onUpdateQuantity(item.id, item.cantidad + 1)}>+</button>
      </div>

      <div className="item-total">
        <p>S/. {(item.precio * item.cantidad).toFixed(2)}</p>
      </div>

      <button
        className="remove-btn"
        onClick={() => onRemove(item.id)}
        title="Eliminar"
      >
        🗑️
      </button>
    </div>
  );
}
