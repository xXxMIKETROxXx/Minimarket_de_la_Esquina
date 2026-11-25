import { createContext, useContext, useEffect, useState } from 'react';
import * as data from '../data/tiendaData.js';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [products, setProducts] = useState(data.getProducts);
  const [categories, setCategories] = useState(data.getCategories);
  const [users, setUsers] = useState(data.getUsers);
  const [orders, setOrders] = useState(data.getOrders);
  const [cart, setCart] = useState(data.getCart);
  const [session, setSession] = useState(data.getSession);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const refresh = () => {
    setProducts(data.getProducts());
    setCategories(data.getCategories());
    setUsers(data.getUsers());
    setOrders(data.getOrders());
    setCart(data.getCart());
    setSession(data.getSession());
  };

  const run = (action) => {
    try {
      const result = action();
      refresh();
      return result;
    } catch (error) {
      setNotice(error.message);
      return null;
    }
  };

  const add = (productId, quantity = 1) => run(() => {
    data.saveCart(data.addToCart(data.getCart(), productId, quantity));
    setNotice('Producto agregado al carrito.');
    return true;
  });

  const changeQuantity = (productId, quantity) => run(() => data.saveCart(data.setCartQuantity(data.getCart(), productId, quantity)));
  const remove = (productId) => run(() => data.saveCart(data.getCart().filter((item) => item.productId !== productId)));
  const emptyCart = () => run(() => data.saveCart([]));

  const register = (user) => run(() => data.createUser(user));
  const login = (correo, password) => {
    const user = data.getUsers().find((item) => item.correo.toLowerCase() === correo.toLowerCase() && item.password === password);
    if (!user) {
      setNotice('Correo o contraseña incorrectos.');
      return false;
    }
    data.setSession(user);
    refresh();
    return true;
  };
  const logout = () => run(() => data.clearSession());

  const checkout = (details, outcome) => run(() => data.completePurchase(details, outcome));

  return (
    <StoreContext.Provider value={{ products, categories, users, orders, cart, session, notice, setNotice, refresh, run, add, changeQuantity, remove, emptyCart, register, login, logout, checkout }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore debe utilizarse dentro de StoreProvider.');
  return context;
}