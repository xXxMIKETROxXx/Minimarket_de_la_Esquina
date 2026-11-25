import {
  INITIAL_PRODUCTS,
  STORAGE_KEYS,
  addToCart,
  cartSummary,
  clearSession,
  completePurchase,
  createProduct,
  deleteProduct,
  getCart,
  getOrders,
  getProducts,
  getSession,
  getUsers,
  saveCart,
  saveProducts,
  setCartQuantity,
  updateProduct,
  validateProduct,
} from '../data/tiendaData.js';

const sampleProduct = {
  codigo: 'PRD-TEST', id: 'producto-prueba', nombre: 'Producto de prueba', descripcion: 'Registro de prueba',
  precio: 500, stock: 6, critico: 1, categoria: 'Abarrotes', imagen: 'arroz.jpg', oferta: false,
};

describe('Fuente de datos del minimarket', () => {
  beforeEach(() => localStorage.clear());

  it('valida campos requeridos y rechaza precios negativos o stock decimal', () => {
    expect(validateProduct(sampleProduct)).toBeTrue();
    expect(validateProduct({ ...sampleProduct, precio: -1 })).toBeFalse();
    expect(validateProduct({ ...sampleProduct, stock: 1.5 })).toBeFalse();
    expect(validateProduct({ ...sampleProduct, precio: '' })).toBeFalse();
    expect(validateProduct({ ...sampleProduct, categoria: '' })).toBeFalse();
  });

  it('asigna las ocho imágenes JPG y migra los nombres SVG anteriores', () => {
    const expectedImages = ['leche.jpg', 'pan.jpg', 'bebida.jpg', 'galletas.jpg', 'arroz.jpg', 'fideos.jpg', 'snacks.jpg', 'detergente.jpg'];
    expect(INITIAL_PRODUCTS.map((product) => product.imagen)).toEqual(expectedImages);

    localStorage.setItem('productos', JSON.stringify([{ ...INITIAL_PRODUCTS[0], imagen: 'leche.svg' }]));
    expect(getProducts()[0].imagen).toBe('leche.jpg');
  });

  it('crea, edita y elimina productos de localStorage', () => {
    createProduct(sampleProduct);
    expect(getProducts().find((item) => item.id === sampleProduct.id).nombre).toBe('Producto de prueba');
    updateProduct(sampleProduct.id, { precio: 750 });
    expect(getProducts().find((item) => item.id === sampleProduct.id).precio).toBe(750);
    deleteProduct(sampleProduct.id);
    expect(getProducts().some((item) => item.id === sampleProduct.id)).toBeFalse();
  });

  it('persiste cantidades, subtotales y total del carrito', () => {
    const first = addToCart([], 'leche');
    const increased = addToCart(first, 'leche', 2);
    saveCart(increased);
    expect(getCart()[0].quantity).toBe(3);
    expect(cartSummary(getCart()).lines[0].subtotal).toBe(3570);
    expect(cartSummary(getCart()).total).toBe(3570);
    expect(setCartQuantity(getCart(), 'leche', 0)).toEqual([]);
  });

  it('no permite agregar más unidades que el stock', () => {
    expect(() => addToCart([], 'leche', INITIAL_PRODUCTS[0].stock + 1)).toThrowError();
  });

  it('registra una compra exitosa, descuenta stock y vacía el carrito', () => {
    saveCart(addToCart([], 'leche', 2));
    const before = getProducts().find((item) => item.id === 'leche').stock;
    const order = completePurchase({ nombre: 'Ana', apellidos: 'Pérez', correo: 'ana@gmail.com' }, 'success');
    expect(order.estado).toContain('Pagada');
    expect(getOrders().some((item) => item.id === order.id)).toBeTrue();
    expect(getProducts().find((item) => item.id === 'leche').stock).toBe(before - 2);
    expect(getCart()).toEqual([]);
  });

  it('conserva el carrito cuando se simula un pago rechazado', () => {
    saveCart(addToCart([], 'pan', 1));
    const order = completePurchase({ nombre: 'Ana', apellidos: 'Pérez' }, 'error');
    expect(order.estado).toContain('rechazado');
    expect(getCart().length).toBe(1);
    expect(localStorage.getItem(STORAGE_KEYS.orders)).not.toBeNull();
  });

  it('importa productos y usuarios guardados con las claves de la versión anterior', () => {
    localStorage.setItem('productos', JSON.stringify([{ ...INITIAL_PRODUCTS[0], nombre: 'Producto anterior' }]));
    localStorage.setItem('usuarios', JSON.stringify([{ run: '190110222', nombre: 'Administrador', apellidos: 'La Esquina', correo: 'admin@duoc.cl', password: 'admin1', tipo: 'Administrador', region: 'metropolitana', comuna: 'santiago', direccion: 'Calle Principal 1' }]));
    expect(getProducts()[0].nombre).toBe('Producto anterior');
    expect(getUsers()[0].comuna).toBe('Santiago');
    expect(localStorage.getItem(STORAGE_KEYS.products)).not.toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.users)).not.toBeNull();
  });

  it('migra la sesión anterior y la elimina definitivamente al cerrar sesión', () => {
    localStorage.setItem('usuarioActivo', JSON.stringify({ correo: 'cliente@gmail.com', tipo: 'Cliente' }));
    expect(getSession().correo).toBe('cliente@gmail.com');
    clearSession();
    expect(getSession()).toBeNull();
    expect(localStorage.getItem('usuarioActivo')).toBeNull();
  });
});