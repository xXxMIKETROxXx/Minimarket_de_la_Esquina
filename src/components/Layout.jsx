import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useStore } from './StoreContext.jsx';

const money = (value) => `$${Number(value).toLocaleString('es-CL')}`;

export function Header({ admin = false }) {
  const { cart, session, logout } = useStore();
  const location = useLocation();
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const publicLinks = [
    ['/productos', 'Productos'], ['/categorias', 'Categorías'], ['/ofertas', 'Ofertas'], ['/blogs', 'Blogs'], ['/nosotros', 'Nosotros'], ['/contacto', 'Contacto'], ['/registro', 'Registro'],
  ];
  const adminLinks = [
    ['/admin', 'Panel'], ['/admin/productos', 'Productos'], ['/admin/categorias', 'Categorías'], ['/admin/ordenes', 'Órdenes'], ['/admin/usuarios', 'Usuarios'], ['/admin/reportes', 'Reportes'], ['/admin/perfil', 'Perfil'],
  ];

  return (
    <header className="site-header">
      <nav className="navbar navbar-expand-lg container-xl" aria-label="Navegación principal">
        <Link className="navbar-brand brand-lockup" to={admin ? '/admin' : '/'}>
          <img src="/img/minimarket.svg" alt="" />
          <span>Minimarket <strong>La Esquina</strong></span>
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#siteNav" aria-controls="siteNav" aria-expanded="false" aria-label="Abrir navegación"><span className="navbar-toggler-icon" /></button>
        <div className="collapse navbar-collapse" id="siteNav">
          <div className="navbar-nav ms-lg-auto align-items-lg-center gap-lg-1">
            {(admin ? adminLinks : publicLinks).map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/admin'} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>{label}</NavLink>
            ))}
            {!admin && <NavLink to="/carrito" className={`nav-link cart-link${location.pathname === '/carrito' ? ' active' : ''}`}>Carrito <span className="cart-count">{count}</span></NavLink>}
            {!admin && (session ? <button className="btn btn-sm btn-outline-light ms-lg-2" onClick={logout}>Cerrar sesión</button> : <NavLink to="/login" className="btn btn-sm btn-outline-light ms-lg-2">Ingresar</NavLink>)}
            {admin && <><NavLink to="/" className="nav-link">Ir a la tienda</NavLink><span className="nav-session">{session?.nombre}</span><button className="btn btn-sm btn-outline-light ms-lg-2" onClick={logout}>Cerrar sesión</button></>}
          </div>
        </div>
      </nav>
    </header>
  );
}

export function Footer() {
  return <footer className="site-footer"><div className="container-xl d-flex flex-column flex-md-row justify-content-between gap-2"><span>Minimarket La Esquina · Una sucursal, cerca de ti.</span><span>© 2026 Minimarket La Esquina</span></div></footer>;
}

export function Notice() {
  const { notice, setNotice } = useStore();
  if (!notice) return null;
  return <div className="toast-note" role="status">{notice}<button type="button" aria-label="Cerrar aviso" onClick={() => setNotice('')}>×</button></div>;
}

export function StoreLayout() {
  return <><Header /><Notice /><main className="page-shell"><Outlet /></main><Footer /></>;
}

export function AdminLayout() {
  return <><Header admin /><Notice /><main className="page-shell"><Outlet /></main><Footer /></>;
}

export function PageTitle({ eyebrow, title, children }) {
  return <div className="page-title"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{children}</div></div>;
}

export function ProductCard({ product, onAdd }) {
  return (
    <article className="product-card h-100">
      <Link to={`/productos/${product.id}`} className="product-image"><img src={`/img/${product.imagen}`} alt={product.nombre} loading="lazy" /></Link>
      <div className="product-card-body">
        <div className="d-flex justify-content-between align-items-start gap-2"><span className="category-label">{product.categoria}</span>{product.oferta && <span className="offer-label">Oferta</span>}</div>
        <h2><Link to={`/productos/${product.id}`}>{product.nombre}</Link></h2>
        <div className="product-card-bottom"><strong>{money(product.precio)}</strong><button className="btn btn-sm btn-success" onClick={() => onAdd(product.id)} disabled={!product.stock}>Agregar</button></div>
      </div>
    </article>
  );
}

export function ProductGrid({ products, onAdd }) {
  if (!products.length) return <p className="empty-state">No encontramos productos para esta selección.</p>;
  return <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-3">{products.map((product) => <div className="col" key={product.id}><ProductCard product={product} onAdd={onAdd} /></div>)}</div>;
}

export { money };