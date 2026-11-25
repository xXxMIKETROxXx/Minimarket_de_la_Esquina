import { Navigate, Route, Routes } from 'react-router-dom';
import { StoreProvider, useStore } from './components/StoreContext.jsx';
import { AdminLayout, StoreLayout } from './components/Layout.jsx';
import { Home, Products, ProductDetail, Categories, Offers, Register, Login, About, Blogs, BlogDetail, Contact, Cart, Checkout, PurchaseResult } from './pages/PublicPages.jsx';
import { AdminDashboard, AdminProducts, AdminProductDetail, AdminProductForm, AdminCategories, AdminOrders, AdminOrderDetail, AdminUsers, AdminUserForm, AdminReports, AdminProfile } from './pages/AdminPages.jsx';

function Guard({ children }) {
  const { session } = useStore();
  const allowed = session?.tipo === 'Administrador' || session?.tipo === 'Vendedor';
  return allowed ? children : <Navigate to="/login" replace />;
}

function AdminOnly({ children }) {
  const { session } = useStore();
  return session?.tipo === 'Administrador' ? children : <Navigate to="/admin" replace />;
}

function RoutesView() {
  return <Routes>
    <Route element={<StoreLayout />}>
      <Route index element={<Home />} />
      <Route path="productos" element={<Products />} />
      <Route path="productos/:id" element={<ProductDetail />} />
      <Route path="categorias" element={<Categories />} />
      <Route path="ofertas" element={<Offers />} />
      <Route path="registro" element={<Register />} />
      <Route path="login" element={<Login />} />
      <Route path="nosotros" element={<About />} />
      <Route path="blogs" element={<Blogs />} />
      <Route path="blogs/:id" element={<BlogDetail />} />
      <Route path="contacto" element={<Contact />} />
      <Route path="carrito" element={<Cart />} />
      <Route path="checkout" element={<Checkout />} />
      <Route path="compra/:result/:id" element={<PurchaseResult />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
    <Route path="admin" element={<Guard><AdminLayout /></Guard>}>
      <Route index element={<AdminDashboard />} />
      <Route path="productos" element={<AdminProducts />} />
      <Route path="productos/nuevo" element={<AdminOnly><AdminProductForm /></AdminOnly>} />
      <Route path="productos/:id" element={<AdminProductDetail />} />
      <Route path="productos/:id/editar" element={<AdminOnly><AdminProductForm /></AdminOnly>} />
      <Route path="categorias" element={<AdminOnly><AdminCategories /></AdminOnly>} />
      <Route path="ordenes" element={<AdminOrders />} />
      <Route path="ordenes/:id" element={<AdminOrderDetail />} />
      <Route path="usuarios" element={<AdminOnly><AdminUsers /></AdminOnly>} />
      <Route path="usuarios/nuevo" element={<AdminOnly><AdminUserForm /></AdminOnly>} />
      <Route path="usuarios/:run" element={<AdminOnly><AdminUserForm /></AdminOnly>} />
      <Route path="reportes" element={<AdminOnly><AdminReports /></AdminOnly>} />
      <Route path="perfil" element={<AdminProfile />} />
    </Route>
  </Routes>;
}

export default function App() {
  return <StoreProvider><RoutesView /></StoreProvider>;
}