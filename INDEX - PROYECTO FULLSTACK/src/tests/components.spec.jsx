import React from 'react';
import { Route, Routes } from 'react-router-dom';
import App from '../App.jsx';
import { Home, ProductFilters, PurchaseResult } from '../pages/PublicPages.jsx';
import { ProductCard, ProductGrid } from '../components/Layout.jsx';
import { LoginForm, ContactForm } from '../components/Forms.jsx';
import { AdminProductDetail, AdminProductForm } from '../pages/AdminPages.jsx';
import { completePurchase, createProduct, getCart, getProducts, saveCart, addToCart } from '../data/tiendaData.js';
import { changeInput, mount, submit, unmount } from './testHelpers.jsx';

describe('Componentes React de la tienda', () => {
  beforeEach(() => {
    localStorage.clear();
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterEach(() => unmount());

  it('renderiza la página de inicio con identidad y accesos del minimarket', () => {
    const host = mount(<Home />, { router: true, store: true });
    expect(host.textContent).toContain('Lo esencial');
    expect(host.textContent).toContain('Productos destacados');
    expect(host.querySelector('img[alt="Ilustración de Minimarket La Esquina"]')).not.toBeNull();
  });

  it('renderiza lista y propiedades recibidas por props en tarjetas de producto', () => {
    const product = { id: 'arroz', nombre: 'Arroz grano largo 1 kg', categoria: 'Abarrotes', precio: 1590, stock: 5, imagen: 'arroz.jpg', oferta: true };
    const host = mount(<ProductGrid products={[product]} onAdd={() => {}} />, { router: true });
    expect(host.textContent).toContain('Arroz grano largo 1 kg');
    expect(host.textContent).toContain('Abarrotes');
    expect(host.textContent).toContain('Oferta');
    expect(host.querySelector('img').getAttribute('src')).toBe('/img/arroz.jpg');
  });

  it('muestra en ProductCard el nombre, precio y categoría recibidos por props', () => {
    const product = { id: 'pan', nombre: 'Pan fresco', categoria: 'Panadería', precio: 1500, stock: 5, imagen: 'pan.jpg' };
    const host = mount(<ProductCard product={product} onAdd={() => {}} />, { router: true });
    expect(host.textContent).toContain('Pan fresco');
    expect(host.textContent).toContain('$1.500');
    expect(host.textContent).toContain('Panadería');
  });

  it('filtra resultados por texto sin perder el dato original del producto', () => {
    const products = [
      { id: 'leche', nombre: 'Leche entera', categoria: 'Lácteos', precio: 1190, stock: 2, imagen: 'leche.svg' },
      { id: 'arroz', nombre: 'Arroz largo', categoria: 'Abarrotes', precio: 1590, stock: 2, imagen: 'arroz.svg' },
    ];
    const host = mount(<ProductFilters products={products} />, { router: true, store: true });
    changeInput(host.querySelector('#product-search'), 'leche');
    expect(host.textContent).toContain('Leche entera');
    expect(host.textContent).not.toContain('Arroz largo');
  });

  it('muestra errores de validación visibles en el inicio de sesión', () => {
    const host = mount(<LoginForm onLogin={() => false} />);
    changeInput(host.querySelector('#login-email'), 'correo-no-permitido@example.org');
    changeInput(host.querySelector('#login-password'), 'x');
    submit(host.querySelector('form'));
    expect(host.querySelector('[role="alert"]').textContent).toContain('correo permitido');
  });

  it('actualiza el estado de formulario y confirma un contacto válido', () => {
    const host = mount(<ContactForm />);
    changeInput(host.querySelector('#contact-name'), 'María');
    expect(host.querySelector('#contact-name').value).toBe('María');
    changeInput(host.querySelector('#contact-email'), 'maria@gmail.com');
    changeInput(host.querySelector('#contact-subject'), 'Consulta');
    changeInput(host.querySelector('#contact-message'), '¿Tienen arroz?');
    submit(host.querySelector('form'));
    expect(host.querySelector('[role="status"]').textContent).toContain('Mensaje recibido');
  });

  it('impide guardar un producto inválido y muestra el mensaje junto al formulario', () => {
    const host = mount(<Routes><Route path="/admin/productos/nuevo" element={<AdminProductForm />} /></Routes>, { router: true, store: true, route: '/admin/productos/nuevo' });
    submit(host.querySelector('form'));
    expect(host.querySelector('[role="alert"]').textContent).toContain('Completa los datos');
    expect(getProducts().some((product) => product.id === '')).toBeFalse();
  });

  it('muestra la ficha de detalle de un producto en administración', () => {
    const host = mount(
      <Routes>
        <Route path="/admin/productos/:id" element={<AdminProductDetail />} />
      </Routes>,
      { router: true, store: true, route: '/admin/productos/leche' },
    );
    expect(host.textContent).toContain('Leche entera 1 litro');
    expect(host.textContent).toContain('Stock crítico');
    expect(host.querySelector('a[href="/admin/productos/leche/editar"]')).not.toBeNull();
    expect(host.querySelector('img').getAttribute('src')).toBe('/img/leche.jpg');
  });

  it('muestra el resultado de una orden creada mediante checkout simulado', () => {
    saveCart(addToCart([], 'pan'));
    const order = completePurchase({ nombre: 'Luis', apellidos: 'Díaz', correo: 'luis@gmail.com' }, 'success');
    const host = mount(
      <Routes>
        <Route path="/compra/:result/:id" element={<PurchaseResult />} />
      </Routes>,
      { router: true, store: true, route: `/compra/success/${order.id}` },
    );
    expect(host.textContent).toContain('Pedido confirmado');
    expect(host.textContent).toContain(order.id);
    expect(host.textContent).toContain('Pagada (simulación)');
    expect(getCart()).toEqual([]);
  });

  it('muestra el error de pago simulado y deja unidades disponibles para reintentar', () => {
    saveCart(addToCart([], 'pan'));
    const order = completePurchase({ nombre: 'Luis', apellidos: 'Díaz', correo: 'luis@gmail.com' }, 'error');
    const host = mount(
      <Routes>
        <Route path="/compra/:result/:id" element={<PurchaseResult />} />
      </Routes>,
      { router: true, store: true, route: `/compra/error/${order.id}` },
    );
    expect(host.textContent).toContain('No se pudo completar el pago');
    expect(host.textContent).toContain('Intentar nuevamente');
    expect(getCart().length).toBe(1);
  });

  it('el carrito impide guardar un producto con identificador duplicado', () => {
    const product = { codigo: 'PRD-TEST', id: 'leche', nombre: 'Duplicado', precio: 1, stock: 1, critico: 0, categoria: 'Abarrotes' };
    expect(() => createProduct(product)).toThrowError();
    expect(getProducts().filter((item) => item.id === 'leche').length).toBe(1);
  });

  it('redirige al login a un cliente que intenta entrar directamente al panel', () => {
    localStorage.setItem('minimarket.sesion', JSON.stringify({ run: '123456785', nombre: 'Cliente', tipo: 'Cliente' }));
    const host = mount(<App />, { router: true, route: '/admin' });
    expect(host.textContent).toContain('Iniciar sesión');
    expect(host.textContent).not.toContain('Panel principal');
  });
});