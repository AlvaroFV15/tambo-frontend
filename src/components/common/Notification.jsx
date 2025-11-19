import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './Notification.css';

// Componente Notification: Patrón Observer para notificaciones
export default function Notification() {
  const { state } = useApp();
  const { notification } = state;

  if (!notification) return null;

  const { type = 'info', message } = notification;

  return (
    <div className={`notification notification-${type}`}>
      {message}
    </div>
  );
}
