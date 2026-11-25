import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AccountForm, ContactForm, LoginForm, RegionFields } from '../components/Forms.jsx';
import { money, PageTitle, ProductGrid } from '../components/Layout.jsx';
import { useStore } from '../components/StoreContext.jsx';
import { getSession, REGIONES, cartSummary, validateEmail, validateEmailDomain } from '../data/tiendaData.js';

const articles = [
  { id: 'compras-hogar', title: 'Cómo organizar las compras del hogar', image: 'alimentos.svg', excerpt: 'Algunos consejos sencillos para comprar lo necesario y aprovechar mejor el presupuesto.', paragraphs: ['Antes de comprar, revisa la despensa y prepara una lista. Ordena los productos por categoría, como alimentos, bebidas y limpieza.', 'También es útil comparar los tamaños y elegir solo lo que realmente utilizarás. En Minimarket La Esquina encuentras productos para resolver tus compras diarias cerca de tu hogar.'] },
  { id: 'limpieza-hogar', title: 'Productos útiles para la limpieza', image: 'compra-hogar.svg', excerpt: 'Conoce productos básicos que pueden ayudarte a mantener tu hogar ordenado.', paragraphs: ['Para una limpieza básica puedes tener detergente para la ropa, productos para las superficies y artículos para lavar loza.', 'Recuerda leer las indicaciones de cada envase y guardar los productos de limpieza fuera del alcance de los niños. Visita nuestra sección de productos para conocer lo disponible.'] },
];

export function Home() {
  const { products, add } = useStore();
  return <>
    <section className="hero-band">
      <div className="hero-copy"><p className="eyebrow">Tu compra de todos los días</p><h1>Lo esencial, <em>a la vuelta</em> de tu casa.</h1><p>Alimentos, bebidas y productos para el hogar en un minimarket de barrio, cercano y sencillo.</p><div className="d-flex flex-wrap gap-2"><Link className="btn btn-success" to="/productos">Explorar productos</Link><Link className="btn btn-outline-success" to="/nosotros">Conócenos</Link></div></div>
      <div className="hero-visual"><img className="hero-image" src="/img/minimarket.svg" alt="Ilustración de Minimarket La Esquina" /></div>
    </section>
    <section className="content-section"><div className="section-heading"><div><p className="eyebrow">La selección de la casa</p><h2>Productos destacados</h2></div><Link to="/productos">Ver todo <span aria-hidden="true">→</span></Link></div><ProductGrid products={products.slice(0, 4)} onAdd={add} /></section>
    <section className="home-links row g-3"><div className="col-md-4"><Link to="/categorias"><span>01</span><strong>Compra por categoría</strong><small>Encuentra cada cosa en su lugar</small></Link></div><div className="col-md-4"><Link to="/ofertas"><span>02</span><strong>Productos en oferta</strong><small>Precios marcados en el catálogo</small></Link></div><div className="col-md-4"><Link to="/blogs"><span>03</span><strong>Consejos del barrio</strong><small>Ideas simples para el hogar</small></Link></div></section>
  </>;
}

export function ProductFilters({ products, category = '' }) {
  const { categories, add } = useStore();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(category);
  const filtered = products.filter((product) => {
    const matchesCategory = !selected || product.categoria === selected;
    const text = `${product.nombre} ${product.categoria}`.toLowerCase();
    const matchesSearch = text.includes(query.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  return <>
    <div className="filter-bar row g-2 mb-4"><div className="col-md-7"><label className="visually-hidden" htmlFor="product-search">Buscar productos</label><input id="product-search" className="form-control" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre o categoría" /></div><div className="col-md-5"><label className="visually-hidden" htmlFor="product-category">Filtrar por categoría</label><select id="product-category" className="form-select" value={selected} onChange={(event) => setSelected(event.target.value)}><option value="">Todas las categorías</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></div></div>
    <ProductGrid products={filtered} onAdd={add} />
  </>;
}

export function Products() {
  const { products } = useStore();
  return <><PageTitle eyebrow="Del minimarket a tu mesa" title="Nuestros productos" /><ProductFilters products={products} /></>;
}

export function ProductDetail() {
  const { id } = useParams();
  const { products, add } = useStore();
  const product = products.find((item) => item.id === id);
  if (!product) return <><PageTitle title="Producto no encontrado" /><Link to="/productos" className="btn btn-success">Volver al catálogo</Link></>;
  return <section className="detail-layout"><div className="detail-image"><img src={`/img/${product.imagen}`} alt={product.nombre} /></div><div className="detail-copy"><p className="eyebrow">{product.categoria}</p><h1>{product.nombre}</h1><p>{product.descripcion}</p><p className="detail-price">{money(product.precio)}</p><p className={product.stock <= product.critico ? 'text-danger' : 'text-secondary'}>{product.stock} unidades disponibles</p>{product.oferta && <span className="offer-label">En oferta</span>}<div className="d-flex gap-2 mt-3"><button className="btn btn-success" onClick={() => add(product.id)} disabled={!product.stock}>Agregar al carrito</button><Link className="btn btn-outline-success" to="/productos">Seguir comprando</Link></div></div></section>;
}

export function Categories() {
  const { categories, products, add } = useStore();
  const [params, setParams] = useSearchParams();
  const selected = params.get('categoria') || '';
  const visible = selected ? products.filter((product) => product.categoria === selected) : [];
  return <><PageTitle eyebrow="Compra a tu manera" title={selected || 'Categorías'}><p>Elige una sección para ver lo disponible.</p></PageTitle><div className="category-tiles">{categories.map((category, index) => <button className={`category-tile${selected === category ? ' selected' : ''}`} key={category} onClick={() => setParams(selected === category ? {} : { categoria: category })}><span>0{index + 1}</span><strong>{category}</strong><small>{products.filter((item) => item.categoria === category).length} productos</small></button>)}</div>{selected && <section className="content-section"><div className="section-heading"><h2>{selected}</h2><button className="btn btn-sm btn-outline-secondary" onClick={() => setParams({})}>Ver todas</button></div><ProductGrid products={visible} onAdd={add} /></section>}</>;
}

export function Offers() {
  const { products, add } = useStore();
  return <><PageTitle eyebrow="Precio especial" title="Ofertas del minimarket"><p>Artículos identificados como oferta en nuestro catálogo.</p></PageTitle><ProductGrid products={products.filter((product) => product.oferta)} onAdd={add} /></>;
}

export function Register() {
  const { register } = useStore();
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();
  function submit(user) {
    const result = register({ ...user, tipo: 'Cliente' });
    if (result) { setSaved(true); window.setTimeout(() => navigate('/login'), 900); }
    return result;
  }
  return <><PageTitle eyebrow="Una cuenta para tus compras" title="Crear cuenta" />{saved && <div role="status" className="alert alert-success">Registro correcto. Ya puedes iniciar sesión.</div>}<AccountForm submitLabel="Registrarme" onSubmit={submit} /></>;
}

export function Login() {
  const { login } = useStore();
  const navigate = useNavigate();
  function submit(email, password) {
    const ok = login(email, password);
    if (ok) navigate(getSession()?.tipo === 'Administrador' ? '/admin' : '/productos');
    return ok;
  }
  return <><PageTitle eyebrow="Bienvenido de vuelta" title="Iniciar sesión" /><div className="login-note"><strong>Acceso administrador de demostración</strong><span>admin@duoc.cl · admin1</span></div><LoginForm onLogin={submit} /><p className="mt-3">¿Aún no tienes cuenta? <Link to="/registro">Regístrate</Link></p></>;
}

export function About() {
  return <><PageTitle eyebrow="Un negocio de barrio" title="Sobre Minimarket La Esquina" /><section className="editorial-copy"><h2>Nuestra historia</h2><p>Minimarket La Esquina nació como un negocio de barrio para acercar las compras diarias a las familias de nuestra comunidad.</p><h2>Nuestro objetivo</h2><p>Queremos ofrecer productos básicos, atención cercana y una compra sencilla desde una sola sucursal.</p><h2>Información general</h2><p>Contamos con alimentos, bebidas, snacks y productos de limpieza para las necesidades del hogar.</p><h2>Desarrolladores</h2><p>Este proyecto fue desarrollado por estudiantes como parte de su aprendizaje de HTML, CSS y JavaScript, y continúa creciendo con React.</p></section></>;
}

export function Blogs() {
  return <><PageTitle eyebrow="Ideas para el día a día" title="Consejos para nuestros clientes" /><div className="row row-cols-1 row-cols-md-2 g-3">{articles.map((article) => <div className="col" key={article.id}><article className="article-card"><img src={`/img/${article.image}`} alt="" /><div><p className="eyebrow">Consejo del minimarket</p><h2>{article.title}</h2><p>{article.excerpt}</p><Link to={`/blogs/${article.id}`} className="text-success fw-semibold">Leer artículo →</Link></div></article></div>)}</div></>;
}

export function BlogDetail() {
  const { id } = useParams();
  const article = articles.find((item) => item.id === id);
  if (!article) return <Navigate to="/blogs" replace />;
  return <article className="editorial-copy article-detail"><img src={`/img/${article.image}`} alt="" /><p className="eyebrow">Consejo del minimarket</p><h1>{article.title}</h1>{article.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<Link to="/blogs">← Volver a los blogs</Link></article>;
}

export function Contact() {
  return <><PageTitle eyebrow="Estamos para ayudarte" title="Contacto"><p>Cuéntanos en qué podemos ayudarte.</p></PageTitle><ContactForm /></>;
}

export function Cart() {
  const { cart, changeQuantity, remove, emptyCart } = useStore();
  const summary = cartSummary(cart);
  return <><PageTitle eyebrow="Tu selección" title="Carrito de compras" />{!summary.lines.length ? <div className="empty-state"><p>Tu carrito está vacío.</p><Link className="btn btn-success" to="/productos">Ver productos</Link></div> : <div className="row g-4"><div className="col-lg-8"><div className="cart-list">{summary.lines.map((item) => <article className="cart-row" key={item.id}><img src={`/img/${item.imagen}`} alt="" /><div className="cart-product"><strong>{item.nombre}</strong><span>{money(item.precio)} · Stock {item.stock}</span></div><div className="quantity-control"><button aria-label={`Disminuir ${item.nombre}`} onClick={() => changeQuantity(item.id, item.cantidad - 1)}>−</button><span>{item.cantidad}</span><button aria-label={`Aumentar ${item.nombre}`} onClick={() => changeQuantity(item.id, item.cantidad + 1)}>+</button></div><strong>{money(item.subtotal)}</strong><button className="remove-button" aria-label={`Eliminar ${item.nombre}`} onClick={() => remove(item.id)}>×</button></article>)}</div><button className="btn btn-link text-danger px-0 mt-2" onClick={emptyCart}>Vaciar carrito</button></div><div className="col-lg-4"><aside className="summary-panel"><h2>Resumen</h2><div><span>{summary.count} artículo(s)</span><strong>{money(summary.total)}</strong></div><hr /><div className="summary-total"><span>Total</span><strong>{money(summary.total)}</strong></div><Link className="btn btn-success w-100 mt-3" to="/checkout">Continuar con la compra</Link></aside></div></div>}</>;
}

export function Checkout() {
  const { cart, session, checkout } = useStore();
  const summary = cartSummary(cart);
  const navigate = useNavigate();
  const [form, setForm] = useState(() => ({ nombre: session?.nombre || '', apellidos: session?.apellidos || '', correo: session?.correo || '', direccion: session?.direccion || '', region: session?.region || 'metropolitana', comuna: session?.comuna || 'Santiago', departamento: '', indicaciones: '' }));
  const [outcome, setOutcome] = useState('success');
  const [error, setError] = useState('');
  if (!summary.lines.length) return <><PageTitle title="No hay productos para comprar" /><Link className="btn btn-success" to="/productos">Volver a productos</Link></>;
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  function submit(event) {
    event.preventDefault();
    if (!form.nombre.trim() || !form.apellidos.trim() || !form.direccion.trim() || !validateEmail(form.correo) || !validateEmailDomain(form.correo)) { setError('Completa nombre, apellidos, dirección y un correo permitido.'); return; }
    const order = checkout(form, outcome);
    if (!order) { setError('No fue posible crear el pedido. Revisa el carrito y el stock.'); return; }
    navigate(`/compra/${outcome}/${order.id}`);
  }
  return <><PageTitle eyebrow="Último paso" title="Datos de entrega"><p>Pago simulado. No ingreses datos bancarios.</p></PageTitle><div className="row g-4"><div className="col-lg-7"><form className="form-panel" onSubmit={submit} noValidate>{error && <div className="alert alert-danger" role="alert">{error}</div>}<div className="row g-3"><div className="col-md-6"><label className="form-label" htmlFor="checkout-name">Nombre</label><input className="form-control" id="checkout-name" value={form.nombre} onChange={(event) => update('nombre', event.target.value)} required /></div><div className="col-md-6"><label className="form-label" htmlFor="checkout-surname">Apellidos</label><input className="form-control" id="checkout-surname" value={form.apellidos} onChange={(event) => update('apellidos', event.target.value)} required /></div></div><label className="form-label mt-3" htmlFor="checkout-email">Correo</label><input className="form-control mb-3" id="checkout-email" type="email" value={form.correo} onChange={(event) => update('correo', event.target.value)} required /><RegionFields region={form.region} comuna={form.comuna} onRegion={(region) => setForm((current) => ({ ...current, region, comuna: REGIONES[region].comunas[0] }))} onComuna={(comuna) => update('comuna', comuna)} prefix="checkout-" /><label className="form-label" htmlFor="checkout-address">Calle y dirección</label><input className="form-control mb-3" id="checkout-address" value={form.direccion} onChange={(event) => update('direccion', event.target.value)} required /><label className="form-label" htmlFor="checkout-extra">Departamento u otra información (opcional)</label><input className="form-control mb-3" id="checkout-extra" value={form.departamento} onChange={(event) => update('departamento', event.target.value)} /><label className="form-label" htmlFor="checkout-notes">Indicaciones de entrega (opcional)</label><textarea className="form-control mb-3" id="checkout-notes" value={form.indicaciones} onChange={(event) => update('indicaciones', event.target.value)} /><fieldset className="mb-3"><legend className="form-label">Resultado del pago simulado</legend><div className="form-check"><input className="form-check-input" type="radio" name="outcome" id="pay-success" checked={outcome === 'success'} onChange={() => setOutcome('success')} /><label className="form-check-label" htmlFor="pay-success">Aprobado</label></div><div className="form-check"><input className="form-check-input" type="radio" name="outcome" id="pay-error" checked={outcome === 'error'} onChange={() => setOutcome('error')} /><label className="form-check-label" htmlFor="pay-error">Rechazado para probar el error</label></div></fieldset><button className="btn btn-success" type="submit">Continuar con pago simulado</button></form></div><div className="col-lg-5"><aside className="summary-panel"><h2>Tu pedido</h2>{summary.lines.map((item) => <div className="checkout-line" key={item.id}><span>{item.nombre} × {item.cantidad}</span><strong>{money(item.subtotal)}</strong></div>)}<hr /><div className="summary-total"><span>Total</span><strong>{money(summary.total)}</strong></div></aside></div></div></>;
}

export function PurchaseResult() {
  const { result, id } = useParams();
  const { orders } = useStore();
  const order = orders.find((item) => item.id === id);
  if (!order || !['success', 'error'].includes(result)) return <Navigate to="/productos" replace />;
  const success = result === 'success';
  return <section className={`result-panel ${success ? 'result-success' : 'result-error'}`}><p className="eyebrow">Compra simulada</p><h1>{success ? 'Pedido confirmado' : 'No se pudo completar el pago'}</h1><p>{success ? 'Tu compra quedó registrada. Gracias por preferir el comercio de tu barrio.' : 'La orden se conserva y el carrito sigue disponible para que puedas intentar nuevamente.'}</p><dl className="result-order"><div><dt>Número de orden</dt><dd>{order.id}</dd></div><div><dt>Estado</dt><dd>{order.estado}</dd></div><div><dt>Cliente</dt><dd>{order.cliente.nombre} {order.cliente.apellidos}</dd></div><div><dt>Total</dt><dd>{money(order.total)}</dd></div></dl><ul className="list-unstyled">{order.productos.map((item) => <li key={item.id}>{item.nombre} × {item.cantidad} <strong>{money(item.subtotal)}</strong></li>)}</ul><div className="d-flex gap-2 flex-wrap"><Link className="btn btn-success" to={success ? '/productos' : '/checkout'}>{success ? 'Volver a la tienda' : 'Intentar nuevamente'}</Link>{!success && <Link className="btn btn-outline-success" to="/carrito">Revisar carrito</Link>}</div></section>;
}

export { articles };