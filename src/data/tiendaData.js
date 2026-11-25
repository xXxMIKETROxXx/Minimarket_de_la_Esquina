export const API_URL = 'http://localhost:3000/api/v1';

export const STORAGE_KEYS = {
  products: 'minimarket.productos',
  categories: 'minimarket.categorias',
  users: 'minimarket.usuarios',
  cart: 'minimarket.carrito',
  session: 'minimarket.sesion',
  token: 'minimarket.token',
  orders: 'minimarket.ordenes',
};

export const INITIAL_PRODUCTS = [
  { codigo: 'PRD-001', id: 'leche', nombre: 'Leche entera 1 litro', descripcion: 'Leche entera para el consumo diario.', precio: 1190, stock: 25, critico: 5, categoria: 'Lácteos', imagen: 'leche.jpg', oferta: false },
  { codigo: 'PRD-002', id: 'pan', nombre: 'Pan fresco', descripcion: 'Pan fresco para acompañar tus comidas.', precio: 1500, stock: 18, critico: 4, categoria: 'Panadería', imagen: 'pan.jpg', oferta: false },
  { codigo: 'PRD-003', id: 'bebida', nombre: 'Bebida gaseosa 1.5 litros', descripcion: 'Bebida para compartir en familia.', precio: 2190, stock: 12, critico: 3, categoria: 'Bebidas', imagen: 'bebida.jpg', oferta: true },
  { codigo: 'PRD-004', id: 'galletas', nombre: 'Galletas de chocolate', descripcion: 'Galletas dulces para cualquier momento.', precio: 890, stock: 20, critico: 5, categoria: 'Galletas', imagen: 'galletas.jpg', oferta: false },
  { codigo: 'PRD-005', id: 'arroz', nombre: 'Arroz grano largo 1 kg', descripcion: 'Arroz grano largo para preparar tus comidas.', precio: 1590, stock: 32, critico: 8, categoria: 'Abarrotes', imagen: 'arroz.jpg', oferta: true },
  { codigo: 'PRD-006', id: 'fideos', nombre: 'Fideos spaghetti 400 g', descripcion: 'Fideos para una comida rápida y rica.', precio: 790, stock: 24, critico: 6, categoria: 'Abarrotes', imagen: 'fideos.jpg', oferta: false },
  { codigo: 'PRD-007', id: 'snacks', nombre: 'Snack de papas', descripcion: 'Snack salado para compartir.', precio: 990, stock: 15, critico: 4, categoria: 'Snacks', imagen: 'snacks.jpg', oferta: true },
  { codigo: 'PRD-008', id: 'limpieza', nombre: 'Detergente líquido 1 litro', descripcion: 'Detergente para la limpieza del hogar.', precio: 2490, stock: 10, critico: 3, categoria: 'Limpieza', imagen: 'detergente.jpg', oferta: false },
];

export const INITIAL_CATEGORIES = ['Abarrotes', 'Bebidas', 'Galletas', 'Lácteos', 'Limpieza', 'Panadería', 'Snacks'];

export const REGIONES = {
  metropolitana: { nombre: 'Región Metropolitana', comunas: ['Santiago', 'Maipú', 'Providencia'] },
  valparaiso: { nombre: 'Región de Valparaíso', comunas: ['Valparaíso', 'Viña del Mar', 'Quilpué'] },
  ohiggins: { nombre: "Región de O'Higgins", comunas: ['Rancagua', 'Machalí', 'San Fernando'] },
};

function read(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored === null ? fallback : JSON.parse(stored);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
}

// ==========================================
// GESTIÓN DE TOKEN JWT Y PETICIONES HTTP
// ==========================================
export function getToken() {
  return localStorage.getItem(STORAGE_KEYS.token) || '';
}

export function setToken(token) {
  if (token) localStorage.setItem(STORAGE_KEYS.token, token);
  else localStorage.removeItem(STORAGE_KEYS.token);
}

async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Error en el servidor (${response.status})`);
  }
  return data;
}

// ==========================================
// LECTURA LOCAL EN CACHÉ (SÍNCRONA)
// ==========================================
export function getProducts() { return read(STORAGE_KEYS.products, INITIAL_PRODUCTS); }
export function saveProducts(value) { return write(STORAGE_KEYS.products, value); }
export function getCategories() { return read(STORAGE_KEYS.categories, INITIAL_CATEGORIES); }
export function saveCategories(value) { return write(STORAGE_KEYS.categories, value); }
export function getUsers() { return read(STORAGE_KEYS.users, []); }
export function saveUsers(value) { return write(STORAGE_KEYS.users, value); }
export function getCart() { return read(STORAGE_KEYS.cart, []); }
export function saveCart(value) { return write(STORAGE_KEYS.cart, value); }
export function getSession() { return read(STORAGE_KEYS.session, null); }
export function setSession(value) { return write(STORAGE_KEYS.session, value); }
export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.session);
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem('usuarioActivo');
}
export function getOrders() { return read(STORAGE_KEYS.orders, []); }
export function getOrder(id) { return getOrders().find((order) => order.id === id) || null; }
export function addOrder(order) { return write(STORAGE_KEYS.orders, [order, ...getOrders()]); }

// ==========================================
// SINCRONIZACIÓN CON EL BACKEND (API REST)
// ==========================================
export async function syncAllFromApi() {
  try {
    const [productos, categorias] = await Promise.all([
      apiRequest('/productos'),
      apiRequest('/categorias'),
    ]);
    saveProducts(productos);
    saveCategories(categorias);

    const session = getSession();
    const token = getToken();
    if (session && token) {
      if (session.tipo === 'Administrador') {
        const [usuarios, boletas] = await Promise.all([
          apiRequest('/usuarios'),
          apiRequest('/boletas'),
        ]);
        saveUsers(usuarios);
        write(STORAGE_KEYS.orders, boletas);
      } else if (session.tipo === 'Vendedor') {
        const boletas = await apiRequest('/boletas');
        write(STORAGE_KEYS.orders, boletas);
      }
    }
  } catch (err) {
    console.warn('No se pudo sincronizar completamente con la API:', err.message);
  }
}

// ==========================================
// AUTENTICACIÓN REAL CON TOKEN JWT
// ==========================================
export async function loginApi(correo, password) {
  const result = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ correo, password }),
  });
  setToken(result.token);
  setSession(result.usuario);
  await syncAllFromApi();
  return result.usuario;
}

export async function registerApi(user) {
  if (!validateUser(user)) throw new Error('Los datos del usuario no son válidos.');
  return await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(user),
  });
}

// ==========================================
// OPERACIONES CRUD CONECTADAS A SQLITE
// ==========================================
export async function createProduct(product) {
  if (!validateProduct(product)) throw new Error('Los datos del producto no son válidos.');
  const created = await apiRequest('/productos', {
    method: 'POST',
    body: JSON.stringify(product),
  });
  saveProducts([...getProducts(), created]);
  return created;
}

export async function updateProduct(id, changes) {
  const current = getProducts().find((p) => p.id === id || p.codigo === id);
  if (!current) throw new Error('No se encontró el producto.');
  const merged = { ...current, ...changes };
  if (!validateProduct(merged)) throw new Error('Los datos del producto no son válidos.');

  const updated = await apiRequest(`/productos/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(changes),
  });
  saveProducts(getProducts().map((p) => (p.codigo === updated.codigo ? updated : p)));
  return updated;
}

export async function deleteProduct(id) {
  await apiRequest(`/productos/${encodeURIComponent(id)}`, { method: 'DELETE' });
  saveProducts(getProducts().filter((p) => p.id !== id && p.codigo !== id));
}

export async function createCategory(name) {
  if (!name.trim()) throw new Error('El nombre de la categoría no es válido.');
  const created = await apiRequest('/categorias', {
    method: 'POST',
    body: JSON.stringify({ nombre: name.trim() }),
  });
  saveCategories([...getCategories(), created.nombre]);
}

export async function updateCategory(previous, next) {
  const name = next.trim();
  if (!name || (previous !== name && getCategories().includes(name))) {
    throw new Error('El nombre de categoría no es válido.');
  }
  await createCategory(name);
  const affected = getProducts().filter((p) => p.categoria === previous);
  for (const prod of affected) {
    await updateProduct(prod.id, { categoria: name });
  }
  await deleteCategory(previous);
}

export async function deleteCategory(name) {
  await apiRequest(`/categorias/${encodeURIComponent(name)}`, { method: 'DELETE' });
  saveCategories(getCategories().filter((c) => c !== name));
}

export async function createUser(user) {
  if (!validateUser(user)) throw new Error('Los datos del usuario no son válidos.');
  const created = await apiRequest('/usuarios', {
    method: 'POST',
    body: JSON.stringify(user),
  });
  saveUsers([...getUsers(), created]);
  return created;
}

export async function updateUser(run, changes) {
  const current = getUsers().find((u) => u.run === run);
  if (!current) throw new Error('No se encontró el usuario.');
  const merged = { ...current, ...changes };
  if (changes.password && !validatePassword(changes.password)) {
    throw new Error('La contraseña debe tener entre 4 y 10 caracteres.');
  }
  if (!validateRun(merged.run) || !merged.nombre?.trim() || !validateEmail(merged.correo) || !validateEmailDomain(merged.correo)) {
    throw new Error('Los datos del usuario no son válidos.');
  }

  const updated = await apiRequest(`/usuarios/${encodeURIComponent(run)}`, {
    method: 'PUT',
    body: JSON.stringify(changes),
  });
  saveUsers(getUsers().map((u) => (u.run === run ? updated : u)));
  return updated;
}

export async function deleteUser(run) {
  await apiRequest(`/usuarios/${encodeURIComponent(run)}`, { method: 'DELETE' });
  saveUsers(getUsers().filter((u) => u.run !== run));
}

// ==========================================
// VALIDACIONES DE NEGOCIO (FRONTEND)
// ==========================================
export function validateRun(run) {
  if (!/^[0-9]{7,8}[0-9kK]$/.test(run || '')) return false;
  const number = run.slice(0, -1);
  let sum = 0;
  let factor = 2;
  for (let index = number.length - 1; index >= 0; index -= 1) {
    sum += Number(number[index]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const remainder = 11 - (sum % 11);
  const verifier = remainder === 11 ? '0' : remainder === 10 ? 'k' : String(remainder);
  return run.slice(-1).toLowerCase() === verifier;
}
export function validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || ''); }
export function validateEmailDomain(email) { return /@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i.test(email || ''); }
export function validatePassword(password) { return typeof password === 'string' && password.length >= 4 && password.length <= 10; }
export function validateUser(user) {
  return Boolean(validateRun(user.run) && user.nombre?.trim() && user.nombre.length <= 50 && user.apellidos?.trim() && user.apellidos.length <= 100 && validateEmail(user.correo) && validateEmailDomain(user.correo) && validatePassword(user.password) && user.direccion?.trim() && user.direccion.length <= 300 && REGIONES[user.region]?.comunas.includes(user.comuna));
}
export function validateProduct(product) {
  return Boolean(product.codigo && product.codigo.length >= 3 && product.nombre && product.nombre.length <= 100 && (product.descripcion || '').length <= 500 && String(product.precio).trim() !== '' && Number.isFinite(Number(product.precio)) && Number(product.precio) >= 0 && String(product.stock).trim() !== '' && Number.isInteger(Number(product.stock)) && Number(product.stock) >= 0 && String(product.critico).trim() !== '' && Number.isInteger(Number(product.critico)) && Number(product.critico) >= 0 && product.categoria);
}

// ==========================================
// CARRITO Y PROCESO DE COMPRA (BOLETAS API)
// ==========================================
export function addToCart(cart, productId, quantity = 1) {
  const product = getProducts().find((item) => item.id === productId);
  if (!product || !Number.isInteger(quantity) || quantity < 1) throw new Error('Producto o cantidad no válidos.');
  const line = cart.find((item) => item.productId === productId);
  const nextQuantity = (line?.quantity || 0) + quantity;
  if (nextQuantity > product.stock) throw new Error('No hay stock suficiente para esa cantidad.');
  return line ? cart.map((item) => item.productId === productId ? { ...item, quantity: nextQuantity } : item) : [...cart, { productId, quantity }];
}

export function setCartQuantity(cart, productId, quantity) {
  const product = getProducts().find((item) => item.id === productId);
  if (quantity <= 0) return cart.filter((item) => item.productId !== productId);
  if (!product || !Number.isInteger(quantity) || quantity > product.stock) throw new Error('La cantidad supera el stock disponible.');
  return cart.map((item) => item.productId === productId ? { ...item, quantity } : item);
}

export function cartSummary(cart) {
  const lines = cart.map((item) => {
    const product = getProducts().find((entry) => entry.id === item.productId);
    return product ? { ...product, cantidad: item.quantity, subtotal: product.precio * item.quantity } : null;
  }).filter(Boolean);
  return { lines, total: lines.reduce((sum, item) => sum + item.subtotal, 0), count: lines.reduce((sum, item) => sum + item.cantidad, 0) };
}

export async function completePurchase(details, outcome = 'success') {
  const cart = getCart();
  const summary = cartSummary(cart);
  if (!summary.lines.length) throw new Error('El carrito está vacío.');
  if (outcome !== 'success' && outcome !== 'error') throw new Error('El resultado de simulación no es válido.');

  const order = await apiRequest('/boletas', {
    method: 'POST',
    body: JSON.stringify({
      cliente: details,
      items: cart,
      outcome,
    }),
  });

  addOrder(order);
  if (outcome === 'success') {
    saveCart([]);
    await syncAllFromApi();
  }
  return order;
}