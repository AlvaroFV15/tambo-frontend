import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';

// Context para estado global de la aplicación
const AppContext = createContext();

const initialState = {
  usuario: null,
  isAuthenticated: false,
  carrito: [],
  pedidos: [],
  admin: null,
  isAdminAuthenticated: false,
  productos: [],
  categorias: [],
  loading: false,
  error: null,
  notification: null,
};

// Reducer para manejar acciones del estado
function appReducer(state, action) {
  switch (action.type) {
    // Autenticación de usuarios
    case 'SET_USUARIO':
      return { ...state, usuario: action.payload, isAuthenticated: true };
    case 'LOGOUT_USUARIO':
      return { ...state, usuario: null, isAuthenticated: false, carrito: [] };

    // Autenticación de admin
    case 'SET_ADMIN':
      return { ...state, admin: action.payload, isAdminAuthenticated: true };
    case 'LOGOUT_ADMIN':
      return { ...state, admin: null, isAdminAuthenticated: false };

    // Carrito
    case 'ADD_TO_CART':
      return {
        ...state,
        carrito: [...state.carrito, action.payload],
      };
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        carrito: state.carrito.filter(item => item.id !== action.payload),
      };
    case 'UPDATE_CART_ITEM':
      return {
        ...state,
        carrito: state.carrito.map(item =>
          item.id === action.payload.id
            ? { ...item, cantidad: action.payload.cantidad }
            : item
        ),
      };
    case 'CLEAR_CART':
      return { ...state, carrito: [] };

    // Productos y categorías
    case 'SET_PRODUCTOS':
      return { ...state, productos: action.payload };
    case 'SET_CATEGORIAS':
      return { ...state, categorias: action.payload };

    // Pedidos
    case 'SET_PEDIDOS':
      return { ...state, pedidos: action.payload };
    case 'ADD_PEDIDO':
      return { ...state, pedidos: [...state.pedidos, action.payload] };
    case 'UPDATE_PEDIDO':
      return {
        ...state,
        pedidos: state.pedidos.map(p =>
          p.id === action.payload.id ? action.payload : p
        ),
      };

    // Estados generales
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_NOTIFICATION':
      return { ...state, notification: action.payload };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Acciones para usuarios
  const setUsuario = useCallback((usuario) => {
    dispatch({ type: 'SET_USUARIO', payload: usuario });
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }, []);

  const logoutUsuario = useCallback(() => {
    dispatch({ type: 'LOGOUT_USUARIO' });
    localStorage.removeItem('usuario');
  }, []);

  // Acciones para admin
  const setAdmin = useCallback((admin, token) => {
    dispatch({ type: 'SET_ADMIN', payload: admin });
    localStorage.setItem('adminToken', token);
  }, []);

  const logoutAdmin = useCallback(() => {
    dispatch({ type: 'LOGOUT_ADMIN' });
    localStorage.removeItem('adminToken');
  }, []);

  // Acciones para carrito
  const addToCart = useCallback((producto) => {
    const item = state.carrito.find(p => p.id === producto.id);
    if (item) {
      dispatch({ type: 'UPDATE_CART_ITEM', payload: { id: producto.id, cantidad: item.cantidad + 1 } });
    } else {
      dispatch({ type: 'ADD_TO_CART', payload: { ...producto, cantidad: 1 } });
    }
  }, [state.carrito]);

  const removeFromCart = useCallback((productoId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productoId });
  }, []);

  const updateCartItem = useCallback((productoId, cantidad) => {
    if (cantidad <= 0) {
      removeFromCart(productoId);
    } else {
      dispatch({ type: 'UPDATE_CART_ITEM', payload: { id: productoId, cantidad } });
    }
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  // Acciones para productos
  const setProductos = useCallback((productos) => {
    dispatch({ type: 'SET_PRODUCTOS', payload: productos });
  }, []);

  const setCategorias = useCallback((categorias) => {
    dispatch({ type: 'SET_CATEGORIAS', payload: categorias });
  }, []);

  // Acciones para pedidos
  const setPedidos = useCallback((pedidos) => {
    dispatch({ type: 'SET_PEDIDOS', payload: pedidos });
  }, []);

  const addPedido = useCallback((pedido) => {
    dispatch({ type: 'ADD_PEDIDO', payload: pedido });
  }, []);

  const updatePedido = useCallback((pedido) => {
    dispatch({ type: 'UPDATE_PEDIDO', payload: pedido });
  }, []);

  // Acciones generales
  const setLoading = useCallback((loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const setNotification = useCallback((notification) => {
    dispatch({ type: 'SET_NOTIFICATION', payload: notification });
    setTimeout(() => {
      dispatch({ type: 'SET_NOTIFICATION', payload: null });
    }, 3000);
  }, []);

  // Restaurar estado desde localStorage al cargar
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    const tokenAdmin = localStorage.getItem('adminToken');
    if (usuarioGuardado) {
      dispatch({ type: 'SET_USUARIO', payload: JSON.parse(usuarioGuardado) });
    }
    if (tokenAdmin) {
      dispatch({ type: 'SET_ADMIN', payload: { token: tokenAdmin } });
    }
  }, []);

  const value = {
    state,
    setUsuario,
    logoutUsuario,
    setAdmin,
    logoutAdmin,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    setProductos,
    setCategorias,
    setPedidos,
    addPedido,
    updatePedido,
    setLoading,
    setError,
    setNotification,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de AppProvider');
  }
  return context;
}
