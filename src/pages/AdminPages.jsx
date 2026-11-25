import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AccountForm } from '../components/Forms.jsx';
import { money, PageTitle } from '../components/Layout.jsx';
import { useStore } from '../components/StoreContext.jsx';
import {
  createCategory,
  createProduct,
  createUser,
  deleteCategory,
  deleteProduct,
  deleteUser,
  updateCategory,
  updateProduct,
  updateUser,
  validateProduct,
} from '../data/tiendaData.js';

export function AdminDashboard() {
  const { products, orders, categories } = useStore();
  const criticalProducts = products.filter((product) => product.stock <= product.critico);
  const stats = [
    ['Productos', products.length, '/admin/productos'],
    ['Categorías', categories.length, '/admin/categorias'],
    ['Órdenes', orders.length, '/admin/ordenes'],
    ['Stock crítico', criticalProducts.length, '/admin/reportes'],
  ];

  return (
    <>
      <PageTitle eyebrow="Administración · Minimarket La Esquina" title="Panel principal">
        <p>Resumen de la información disponible en este navegador.</p>
      </PageTitle>
      <div className="row row-cols-2 row-cols-lg-4 g-3 mb-4">
        {stats.map(([label, count, path]) => (
          <div className="col" key={label}>
            <Link className="stat-tile" to={path}>
              <span>{label}</span>
              <strong>{count}</strong>
            </Link>
          </div>
        ))}
      </div>
      <div className="admin-shortcuts">
        <Link to="/admin/productos/nuevo" className="btn btn-success">Nuevo producto</Link>
        <Link to="/admin/usuarios/nuevo" className="btn btn-outline-success">Crear usuario</Link>
        <Link to="/admin/ordenes" className="btn btn-outline-secondary">Revisar órdenes</Link>
      </div>
      <p className="text-secondary mt-4">
        Los datos son una simulación local. La comprobación de rol no sustituye la seguridad de un servidor.
      </p>
    </>
  );
}

export function AdminProducts() {
  const { products, run } = useStore();
  const criticalProducts = products.filter((product) => product.stock <= product.critico);

  function removeProduct(product) {
    if (window.confirm(`¿Eliminar ${product.nombre}?`)) {
      run(() => deleteProduct(product.id));
    }
  }

  return (
    <>
      <PageTitle eyebrow="Catálogo local" title="Gestión de productos">
        <Link to="/admin/productos/nuevo" className="btn btn-success">Nuevo producto</Link>
      </PageTitle>
      <div className="table-responsive">
        <table className="table table-hover align-middle admin-table">
          <thead>
            <tr>
              <th>Código</th><th>Producto</th><th>Categoría</th><th>Precio</th>
              <th>Stock</th><th>Umbral</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.codigo}</td>
                <td><Link to={`/admin/productos/${product.id}`}>{product.nombre}</Link></td>
                <td>{product.categoria}</td>
                <td>{money(product.precio)}</td>
                <td>{product.stock}</td>
                <td>{product.critico}</td>
                <td>
                  {product.stock <= product.critico
                    ? <span className="badge text-bg-danger">Crítico</span>
                    : <span className="badge text-bg-success">Normal</span>}
                </td>
                <td>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => removeProduct(product)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="h5 mt-4">Reporte de stock crítico</h2>
      <p>{criticalProducts.length} productos requieren revisión.</p>
    </>
  );
}

export function AdminProductDetail() {
  const { id } = useParams();
  const { products } = useStore();
  const product = products.find((item) => item.id === id);

  if (!product) {
    return <><PageTitle title="Producto no encontrado" /><Link to="/admin/productos">Volver a productos</Link></>;
  }

  return (
    <>
      <PageTitle eyebrow={product.codigo} title={product.nombre}>
        <Link className="btn btn-success" to={`/admin/productos/${product.id}/editar`}>Editar producto</Link>
      </PageTitle>
      <section className="detail-layout">
        <div className="detail-image">
          <img src={`/img/${product.imagen}`} alt={product.nombre} />
        </div>
        <div className="detail-copy">
          <p className="eyebrow">{product.categoria}</p>
          <p>{product.descripcion}</p>
          <p><strong>Precio:</strong> {money(product.precio)}</p>
          <p><strong>Stock:</strong> {product.stock} unidades</p>
          <p><strong>Stock crítico:</strong> {product.critico} unidades</p>
          <p><strong>Estado de oferta:</strong> {product.oferta ? 'Sí' : 'No'}</p>
        </div>
      </section>
    </>
  );
}

export function AdminProductForm() {
  const { id } = useParams();
  const { products, categories, run } = useStore();
  const navigate = useNavigate();
  const existing = products.find((product) => product.id === id);
  const [form, setForm] = useState(() => {
    if (existing) return { ...existing };
    return {
      codigo: '', id: '', nombre: '', descripcion: '', precio: '', stock: '',
      critico: '', categoria: categories[0] || '', imagen: 'alimentos.svg', oferta: false,
    };
  });
  const [error, setError] = useState('');

  function updateField(field, value) {
    setForm({ ...form, [field]: value });
  }

  function submit(event) {
    event.preventDefault();
    const product = {
      ...form,
      id: existing ? existing.id : form.codigo.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      precio: Number(form.precio),
      stock: Number(form.stock),
      critico: Number(form.critico),
    };

    if (!validateProduct(product)) {
      setError('Completa los datos y revisa precio, stock, umbral y categoría.');
      return;
    }
    if (!existing && products.some((item) => item.codigo === product.codigo || item.id === product.id)) {
      setError('El código ya está registrado.');
      return;
    }

    const savedProduct = run(() => {
      if (existing) return updateProduct(existing.id, product);
      return createProduct(product);
    });
    if (savedProduct) navigate('/admin/productos');
  }

  return (
    <>
      <PageTitle eyebrow="Administración" title={existing ? 'Editar producto' : 'Nuevo producto'} />
      <form className="form-panel" onSubmit={submit} noValidate>
        {error && <div role="alert" className="alert alert-danger">{error}</div>}

        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label" htmlFor="product-code">Código</label>
            <input id="product-code" className="form-control" value={form.codigo}
              onChange={(event) => updateField('codigo', event.target.value)} required />
          </div>
          <div className="col-md-8">
            <label className="form-label" htmlFor="product-name">Nombre</label>
            <input id="product-name" className="form-control" maxLength="100" value={form.nombre}
              onChange={(event) => updateField('nombre', event.target.value)} required />
          </div>
        </div>

        <label className="form-label mt-3" htmlFor="product-description">Descripción</label>
        <textarea id="product-description" className="form-control mb-3" maxLength="500"
          value={form.descripcion} onChange={(event) => updateField('descripcion', event.target.value)} />

        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label" htmlFor="product-price">Precio (CLP)</label>
            <input id="product-price" className="form-control" type="number" min="0" step="1"
              value={form.precio} onChange={(event) => updateField('precio', event.target.value)} required />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="product-stock">Stock</label>
            <input id="product-stock" className="form-control" type="number" min="0" step="1"
              value={form.stock} onChange={(event) => updateField('stock', event.target.value)} required />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="product-critical">Stock crítico</label>
            <input id="product-critical" className="form-control" type="number" min="0" step="1"
              value={form.critico} onChange={(event) => updateField('critico', event.target.value)} required />
          </div>
        </div>

        <label className="form-label mt-3" htmlFor="product-category">Categoría</label>
        <select id="product-category" className="form-select mb-3" value={form.categoria}
          onChange={(event) => updateField('categoria', event.target.value)} required>
          {categories.map((category) => <option key={category}>{category}</option>)}
        </select>

        <label className="form-label" htmlFor="product-image">Imagen local</label>
        <select id="product-image" className="form-select mb-3" value={form.imagen}
          onChange={(event) => updateField('imagen', event.target.value)}>
          {['alimentos.svg', 'leche.jpg', 'pan.jpg', 'bebida.jpg', 'galletas.jpg',
            'arroz.jpg', 'fideos.jpg', 'snacks.jpg', 'detergente.jpg'].map((image) => (
            <option key={image}>{image}</option>
          ))}
        </select>

        <div className="form-check mb-3">
          <input id="product-offer" className="form-check-input" type="checkbox" checked={Boolean(form.oferta)}
            onChange={(event) => updateField('oferta', event.target.checked)} />
          <label className="form-check-label" htmlFor="product-offer">Mostrar como oferta</label>
        </div>
        <button className="btn btn-success" type="submit">Guardar producto</button>
      </form>
    </>
  );
}

export function AdminCategories() {
  const { categories, products, run } = useStore();
  const [name, setName] = useState('');
  const [editing, setEditing] = useState('');

  function save(event) {
    event.preventDefault();
    const saved = run(() => {
      if (editing) return updateCategory(editing, name);
      return createCategory(name);
    });
    if (saved !== null) {
      setName('');
      setEditing('');
    }
  }

  function edit(category) {
    setEditing(category);
    setName(category);
  }

  return (
    <>
      <PageTitle eyebrow="Organización del catálogo" title="Categorías" />
      <form className="inline-form mb-4" onSubmit={save}>
        <label className="visually-hidden" htmlFor="category-name">Nombre de categoría</label>
        <input id="category-name" className="form-control" value={name}
          onChange={(event) => setName(event.target.value)} placeholder="Nombre de categoría" required />
        <button className="btn btn-success">{editing ? 'Guardar cambios' : 'Crear categoría'}</button>
        {editing && <button className="btn btn-outline-secondary" type="button"
          onClick={() => { setEditing(''); setName(''); }}>Cancelar</button>}
      </form>
      <div className="table-responsive">
        <table className="table align-middle admin-table">
          <thead><tr><th>Categoría</th><th>Productos</th><th>Acciones</th></tr></thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category}>
                <td>{category}</td>
                <td>{products.filter((product) => product.categoria === category).length}</td>
                <td>
                  <button className="btn btn-sm btn-outline-success me-2" onClick={() => edit(category)}>Editar</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => run(() => deleteCategory(category))}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function AdminOrders() {
  const { orders } = useStore();
  return (
    <>
      <PageTitle eyebrow="Ventas simuladas" title="Órdenes y boletas" />
      <div className="table-responsive">
        <table className="table table-hover align-middle admin-table">
          <thead><tr><th>Orden</th><th>Fecha</th><th>Cliente</th><th>Estado</th><th>Total</th><th /></tr></thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{new Date(order.fecha).toLocaleDateString('es-CL')}</td>
                <td>{order.cliente.nombre} {order.cliente.apellidos}</td>
                <td>{order.estado}</td>
                <td>{money(order.total)}</td>
                <td><Link to={`/admin/ordenes/${order.id}`}>Detalle</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!orders.length && <p className="empty-state">Aún no hay órdenes registradas.</p>}
    </>
  );
}

export function AdminOrderDetail() {
  const { id } = useParams();
  const { orders } = useStore();
  const order = orders.find((item) => item.id === id);

  if (!order) {
    return <><PageTitle title="Orden no encontrada" /><Link to="/admin/ordenes">Volver a órdenes</Link></>;
  }

  return (
    <>
      <PageTitle eyebrow={order.id} title="Detalle de orden" />
      <section className="summary-panel">
        <p><strong>Estado:</strong> {order.estado}</p>
        <p><strong>Cliente:</strong> {order.cliente.nombre} {order.cliente.apellidos} · {order.cliente.correo}</p>
        <p><strong>Dirección:</strong> {order.cliente.direccion}, {order.cliente.comuna}</p>
        <div className="table-responsive">
          <table className="table">
            <thead><tr><th>Producto</th><th>Cantidad</th><th>Subtotal</th></tr></thead>
            <tbody>
              {order.productos.map((item) => (
                <tr key={item.id}><td>{item.nombre}</td><td>{item.cantidad}</td><td>{money(item.subtotal)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <h2 className="h5">Total: {money(order.total)}</h2>
      </section>
    </>
  );
}

export function AdminUsers() {
  const { users, orders, run } = useStore();
  return (
    <>
      <PageTitle eyebrow="Cuentas locales" title="Usuarios">
        <Link to="/admin/usuarios/nuevo" className="btn btn-success">Nuevo usuario</Link>
      </PageTitle>
      <div className="table-responsive">
        <table className="table table-hover align-middle admin-table">
          <thead><tr><th>RUN</th><th>Nombre</th><th>Correo</th><th>Tipo</th><th>Compras</th><th>Acciones</th></tr></thead>
          <tbody>
            {users.map((user) => {
              const purchases = orders.filter((order) => order.cliente.correo === user.correo
                && order.estado.startsWith('Pagada')).length;
              return (
                <tr key={user.run}>
                  <td>{user.run}</td>
                  <td><Link to={`/admin/usuarios/${encodeURIComponent(user.run)}`}>{user.nombre} {user.apellidos}</Link></td>
                  <td>{user.correo}</td>
                  <td>{user.tipo || 'Cliente'}</td>
                  <td>{purchases}</td>
                  <td><button className="btn btn-sm btn-outline-danger" onClick={() => run(() => deleteUser(user.run))}>Eliminar</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function AdminUserForm() {
  const { run, users, orders } = useStore();
  const { run: routeRun } = useParams();
  const current = users.find((user) => user.run === routeRun);
  const navigate = useNavigate();

  if (routeRun && !current) {
    return <><PageTitle title="Usuario no encontrado" /><Link to="/admin/usuarios">Volver a usuarios</Link></>;
  }

  function saveUser(form) {
    const saved = run(() => {
      if (current) return updateUser(current.run, form);
      return createUser(form);
    });
    if (saved) navigate('/admin/usuarios');
    return saved;
  }

  const userOrders = current
    ? orders.filter((order) => order.cliente.correo === current.correo)
    : [];

  return (
    <>
      <PageTitle eyebrow="Administración" title={current ? 'Editar usuario' : 'Nuevo usuario'} />
      {current && (
        <section className="summary-panel mb-4">
          <h2 className="h5">Historial de compras</h2>
          {userOrders.map((order) => (
            <p key={order.id}>
              <Link to={`/admin/ordenes/${order.id}`}>{order.id}</Link> · {order.estado} · {money(order.total)}
            </p>
          ))}
          {!userOrders.length && <p>Este usuario aún no tiene compras.</p>}
        </section>
      )}
      <AccountForm initial={current} withRole
        submitLabel={current ? 'Guardar cambios' : 'Crear usuario'} onSubmit={saveUser} />
    </>
  );
}

export function AdminReports() {
  const { products, orders } = useStore();
  const successfulOrders = orders.filter((order) => order.estado.startsWith('Pagada'));
  const total = successfulOrders.reduce((sum, order) => sum + order.total, 0);
  const unitsSold = successfulOrders.reduce((sum, order) => {
    const orderUnits = order.productos.reduce((subtotal, item) => subtotal + item.cantidad, 0);
    return sum + orderUnits;
  }, 0);
  const criticalProducts = products.filter((product) => product.stock <= product.critico);

  return (
    <>
      <PageTitle eyebrow="Cifras guardadas en este navegador" title="Reportes" />
      <div className="row row-cols-1 row-cols-md-3 g-3 mb-4">
        <div className="col"><div className="stat-tile"><span>Órdenes exitosas simuladas</span><strong>{successfulOrders.length}</strong></div></div>
        <div className="col"><div className="stat-tile"><span>Unidades vendidas simuladas</span><strong>{unitsSold}</strong></div></div>
        <div className="col"><div className="stat-tile"><span>Total registrado</span><strong>{money(total)}</strong></div></div>
      </div>
      <h2 className="h5">Productos con stock crítico</h2>
      <div className="table-responsive">
        <table className="table admin-table">
          <thead><tr><th>Producto</th><th>Stock</th><th>Umbral</th></tr></thead>
          <tbody>
            {criticalProducts.map((product) => (
              <tr key={product.id}><td>{product.nombre}</td><td>{product.stock}</td><td>{product.critico}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-secondary">Las cifras corresponden únicamente a órdenes guardadas en esta simulación local.</p>
    </>
  );
}

export function AdminProfile() {
  const { session, run, refresh } = useStore();
  const [saved, setSaved] = useState(false);

  function saveProfile(form) {
    const updatedUser = run(() => updateUser(session.run, form));
    if (updatedUser) {
      window.localStorage.setItem('minimarket.sesion', JSON.stringify(updatedUser));
      refresh();
      setSaved(true);
    }
    return updatedUser;
  }

  return (
    <>
      <PageTitle eyebrow="Sesión actual" title="Perfil del administrador" />
      {saved && <div role="status" className="alert alert-success">Perfil actualizado.</div>}
      <AccountForm initial={session} includeRun={false} submitLabel="Actualizar perfil" onSubmit={saveProfile} />
    </>
  );
}
