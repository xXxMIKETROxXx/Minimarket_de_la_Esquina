export const STORAGE_KEYS = {
  products: 'minimarket.productos',
  categories: 'minimarket.categorias',
  users: 'minimarket.usuarios',
  cart: 'minimarket.carrito',
  session: 'minimarket.sesion',
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

const OLD_PRODUCT_IMAGES = {
  leche: ['leche.svg', 'leche.jpg'],
  pan: ['pan.svg', 'pan.jpg'],
  bebida: ['bebida.svg', 'bebida.jpg'],
  galletas: ['galletas.svg', 'galletas.jpg'],
  arroz: ['arroz.svg', 'arroz.jpg'],
  fideos: ['fideos.svg', 'fideos.jpg'],
  snacks: ['snacks.svg', 'snacks.jpg'],
  limpieza: ['limpieza.svg', 'detergente.jpg'],
};

function updateOldProductImages(products) {
  return products.map((product) => {
    const oldImage = OLD_PRODUCT_IMAGES[product.id];
    if (oldImage && product.imagen === oldImage[0]) {
      return { ...product, imagen: oldImage[1] };
    }
    return product;
  });
}

export const INITIAL_CATEGORIES = ['Abarrotes', 'Bebidas', 'Galletas', 'Lácteos', 'Limpieza', 'Panadería', 'Snacks'];
export const REGIONES = {
  metropolitana: { nombre: 'Región Metropolitana', comunas: ['Santiago', 'Maipú', 'Providencia'] },
  valparaiso: { nombre: 'Región de Valparaíso', comunas: ['Valparaíso', 'Viña del Mar', 'Quilpué'] },
  ohiggins: { nombre: "Región de O'Higgins", comunas: ['Rancagua', 'Machalí', 'San Fernando'] },
};

const ADMIN_USER = { run: '190110222', nombre: 'Administrador', apellidos: 'La Esquina', correo: 'admin@duoc.cl', password: 'admin1', tipo: 'Administrador', region: 'metropolitana', comuna: 'Santiago', direccion: 'Calle Principal 1' };

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

function readLegacy(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored === null ? fallback : JSON.parse(stored);
  } catch {
    return fallback;
  }
}

export function getProducts() {
  const stored = read(STORAGE_KEYS.products, null);
  if (Array.isArray(stored)) {
    const products = updateOldProductImages(stored);
    if (products.some((product, index) => product !== stored[index])) {
      return write(STORAGE_KEYS.products, products);
    }
    return stored;
  }
  const legacy = readLegacy('productos', INITIAL_PRODUCTS);
  const products = Array.isArray(legacy) ? legacy : INITIAL_PRODUCTS;
  return write(STORAGE_KEYS.products, updateOldProductImages(products));
}
export function saveProducts(value) { return write(STORAGE_KEYS.products, value); }
export function getCategories() {
  const stored = read(STORAGE_KEYS.categories, null);
  if (Array.isArray(stored)) return stored;
  const legacyCategories = [...new Set(readLegacy('productos', INITIAL_PRODUCTS).map((product) => product.categoria).filter(Boolean))];
  return write(STORAGE_KEYS.categories, legacyCategories.length ? legacyCategories : INITIAL_CATEGORIES);
}
export function saveCategories(value) { return write(STORAGE_KEYS.categories, value); }
export function getUsers() {
  const stored = read(STORAGE_KEYS.users, null);
  const legacy = readLegacy('usuarios', []);
  const source = Array.isArray(stored) ? stored : (Array.isArray(legacy) ? legacy : []);
  const users = source.map((user) => {
    const communes = REGIONES[user.region]?.comunas || [];
    const comuna = communes.find((name) => name.toLowerCase().replaceAll(' ', '-') === String(user.comuna || '').toLowerCase());
    return comuna && comuna !== user.comuna ? { ...user, comuna } : user;
  });
  if (!users.some((user) => user.correo === ADMIN_USER.correo)) users.push(ADMIN_USER);
  if (Array.isArray(stored) && users.length === stored.length && users.every((user, index) => user === stored[index])) return stored;
  return write(STORAGE_KEYS.users, users);
}
export function saveUsers(value) { return write(STORAGE_KEYS.users, value); }
export function getCart() { return read(STORAGE_KEYS.cart, []); }
export function saveCart(value) { return write(STORAGE_KEYS.cart, value); }
export function getSession() {
  const stored = read(STORAGE_KEYS.session, null);
  if (stored) {
    const communes = REGIONES[stored.region]?.comunas || [];
    const comuna = communes.find((name) => name.toLowerCase().replaceAll(' ', '-') === String(stored.comuna || '').toLowerCase());
    return comuna && comuna !== stored.comuna ? write(STORAGE_KEYS.session, { ...stored, comuna }) : stored;
  }
  const legacy = readLegacy('usuarioActivo', null);
  if (!legacy) return null;
  const communes = REGIONES[legacy.region]?.comunas || [];
  const comuna = communes.find((name) => name.toLowerCase().replaceAll(' ', '-') === String(legacy.comuna || '').toLowerCase());
  const migrated = write(STORAGE_KEYS.session, comuna ? { ...legacy, comuna } : legacy);
  localStorage.removeItem('usuarioActivo');
  return migrated;
}
export function setSession(value) { return write(STORAGE_KEYS.session, value); }
export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.session);
  localStorage.removeItem('usuarioActivo');
}
export function getOrders() { return read(STORAGE_KEYS.orders, []); }
export function getOrder(id) { return getOrders().find((order) => order.id === id) || null; }
export function addOrder(order) { return write(STORAGE_KEYS.orders, [...getOrders(), order]); }

export function createProduct(product) {
  if (!validateProduct(product)) throw new Error('Los datos del producto no son válidos.');
  if (getProducts().some((item) => item.codigo === product.codigo || item.id === product.id)) throw new Error('El código o identificador ya existe.');
  saveProducts([...getProducts(), product]);
  return product;
}

export function updateProduct(id, changes) {
  const products = getProducts();
  const index = products.findIndex((product) => product.id === id);
  if (index < 0) throw new Error('No se encontró el producto.');
  if (products.some((product, position) => position !== index && (product.codigo === changes.codigo || product.id === changes.id))) throw new Error('El código o identificador ya existe.');
  const updated = { ...products[index], ...changes };
  if (!validateProduct(updated)) throw new Error('Los datos del producto no son válidos.');
  products[index] = updated;
  saveProducts(products);
  return products[index];
}

export function deleteProduct(id) { saveProducts(getProducts().filter((product) => product.id !== id)); }
export function createCategory(name) {
  const categories = getCategories();
  if (!name.trim() || categories.includes(name.trim())) throw new Error('La categoría ya existe o no es válida.');
  saveCategories([...categories, name.trim()]);
}
export function updateCategory(previous, next) {
  const name = next.trim();
  if (!name || (previous !== name && getCategories().includes(name))) throw new Error('El nombre de categoría no es válido.');
  saveCategories(getCategories().map((category) => category === previous ? name : category));
  saveProducts(getProducts().map((product) => product.categoria === previous ? { ...product, categoria: name } : product));
}
export function deleteCategory(name) {
  if (getProducts().some((product) => product.categoria === name)) throw new Error('No se puede eliminar una categoría que contiene productos.');
  saveCategories(getCategories().filter((category) => category !== name));
}

export function createUser(user) {
  if (!validateUser(user)) throw new Error('Los datos del usuario no son válidos.');
  const users = getUsers();
  if (users.some((item) => item.run === user.run || item.correo === user.correo)) throw new Error('El RUN o correo ya están registrados.');
  saveUsers([...users, user]);
  return user;
}
export function updateUser(run, changes) {
  const users = getUsers();
  const index = users.findIndex((user) => user.run === run);
  if (index < 0) throw new Error('No se encontró el usuario.');
  if (users.some((user, position) => position !== index && (user.run === changes.run || user.correo === changes.correo))) throw new Error('El RUN o correo ya están registrados.');
  const updated = { ...users[index], ...changes };
  if (!validateUser(updated)) throw new Error('Los datos del usuario no son válidos.');
  users[index] = updated;
  saveUsers(users);
  return users[index];
}
export function deleteUser(run) {
  if (run === ADMIN_USER.run) throw new Error('No se puede eliminar la cuenta administradora inicial.');
  saveUsers(getUsers().filter((user) => user.run !== run));
}

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

export function completePurchase(details, outcome = 'success') {
  const cart = getCart();
  const summary = cartSummary(cart);
  if (!summary.lines.length) throw new Error('El carrito está vacío.');
  if (outcome !== 'success' && outcome !== 'error') throw new Error('El resultado de simulación no es válido.');
  if (summary.lines.some((line) => line.cantidad > getProducts().find((product) => product.id === line.id)?.stock)) throw new Error('El stock cambió. Ajusta las cantidades del carrito e inténtalo nuevamente.');
  const order = {
    id: `ORD-${Date.now()}`,
    fecha: new Date().toISOString(),
    estado: outcome === 'success' ? 'Pagada (simulación)' : 'Pago rechazado (simulación)',
    cliente: details,
    productos: summary.lines,
    total: summary.total,
  };
  addOrder(order);
  if (outcome === 'success') {
    saveProducts(getProducts().map((product) => {
      const purchased = summary.lines.find((line) => line.id === product.id);
      return purchased ? { ...product, stock: product.stock - purchased.cantidad } : product;
    }));
    saveCart([]);
  }
  return order;
}